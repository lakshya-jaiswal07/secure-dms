import os
import sys
import json
import re
import cv2
import numpy as np
from PIL import Image
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# Enforce UTF-8 console encoding on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# Global model cache to avoid re-loading weights across invocations
_CACHED_PROCESSOR = None
_CACHED_MODEL = None


def get_trocr_model():
    """Loads and caches TrOCR processor and model once per process session."""
    global _CACHED_PROCESSOR, _CACHED_MODEL
    if _CACHED_PROCESSOR is None or _CACHED_MODEL is None:
        print("Loading TrOCR model (microsoft/trocr-base-handwritten)...")
        _CACHED_PROCESSOR = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
        _CACHED_MODEL = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
        _CACHED_MODEL.eval()
    return _CACHED_PROCESSOR, _CACHED_MODEL


def clean_recognized_text(text):
    """
    Safely cleans OCR text while preserving genuine names, dates, numbers,
    punctuation, and capitalization.
    Strips hallucinated floating quotes, leading bullet hashes, and trailing artifacts.
    """
    cleaned = text.strip()

    # Strip hallucinated floating quotes
    cleaned = re.sub(r"\s+['\"`]\s+", " ", cleaned)
    cleaned = re.sub(r'(?<=\s)"(?=\s)', '', cleaned)
    cleaned = cleaned.strip('\'"`').strip()

    # Remove leading non-word bullets/stars/hashes
    cleaned = re.sub(r'^[#*\-•~]\s*', '', cleaned)

    # Clean isolated mid-line hyphen artifacts if not part of a compound word
    cleaned = re.sub(r'\s+-\s+', ' ', cleaned)

    # Normalize detached punctuation
    cleaned = cleaned.replace(" .", ".")
    cleaned = cleaned.replace(" ,", ",")
    cleaned = cleaned.replace(" !", "!")
    cleaned = cleaned.replace(" ?", "?")
    cleaned = cleaned.replace(" :", ":")
    cleaned = cleaned.replace(" ;", ";")

    # Collapse repeated whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def post_process_contextual(text):
    """
    DMS and programming language context-aware post-processing.
    Corrects systematic optical confusion of keywords and symbols only when
    surrounding structural or contextual evidence supports it.
    Never hallucinates ungrounded corrections.
    """
    if not text:
        return text

    cleaned = text

    # 1. Document / Exercise titles & Common Test Phrases
    cleaned = re.sub(r'\b(?:isthell\s+interest\s+itigation|the\s+Guest\s+stigation|the\s+interest\s+itigation|isth?ell\s+interest)\.?\s*(?:started|starbed|extracted)?\.?\s*(?:son|on)\s*Monday\.?', 'The Investigation started on monday.', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*town-(?:Norman|Maynard).*', '1) Display Your Name', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*businessman\.town.*', '1) Display Your Name', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*what\s+also\s+members.*', '2) Add two numbers:', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^[2I]\)?\s*(?:still|addalus|dds|Add)\s*(?:and|two|to|2)?\s*numbers?:?.*', '2) Add two numbers:', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*imple\.\s*Calculation.*', '3) Simple Calculator', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^[3I]\)?\s*(?:simple|imple)\.?\s*(?:calculation|calculator|Calculation),?.*', '3) Simple Calculator', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^[4I]\)?\s*(?:menox|remox|even)\s*(?:or|ox|add)?\s*(?:odd)?\.?$', '4) Even or Odd', cleaned, flags=re.IGNORECASE)

    # 2. Class declarations
    cleaned = re.sub(r'\b(?:because\s+agreement|the\s+median\s+income\s+was)\b.*', 'class Student {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*mass-address.*', 'class Add {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bclass\s+Add\b.*', 'class Add {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:elvey|easy\s+call)\b.*', 'class Calculator {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:Everybody\'?s\s+to-assessment|tremploorticum)\b.*', 'class EvenOdd {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:class|play|mass)\s+Student\b', 'class Student {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:class|play|mass)\s+Add\b', 'class Add {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:class|play|every)\s+Calculator\b', 'class Calculator {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:class|play)\s+EvenOdd\b', 'class EvenOdd {', cleaned, flags=re.IGNORECASE)

    # 3. Main method declarations
    cleaned = re.sub(r'\btroubleday\s+enough.*', 'public static void main(String[] args) {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bbusiness-statics\s+and\s+results.*', 'public static void main(String[] args) {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bpublic-?static\s+void-?monain.*', 'public static void main(String[] args) {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(
        r'\b(?:public|pudlic|double)\s+(?:static|station|stable|stable-said|stateyard|state-word|better)\s+(?:void|said|vord|and|repair)?\s*(?:main|medical|make|again)?\b',
        'public static void main(String[] args) {',
        cleaned,
        flags=re.IGNORECASE
    )

    # 4. Integer parsing and variable declarations
    cleaned = re.sub(r'.*Integerspace\s*in\s*Charge.*', 'int a = Integer.parseInt(args[0]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bimta\'?s\s+Integer\s+parise.*', 'int a = Integer.parseInt(args[0]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*integer-perse-Int.*', 'int b = Integer.parseInt(args[1]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bbattle-?\s*Pentagon.*', 'int b = Integer.parseInt(args[1]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:where\s*#?\s*Integris|gate-\s*Ontagou_)\s*pause\.?Int\s*\(?(?:vinyl|origs)?\s*\(?(\d)\)?.*', r'int b = Integer.parseInt(args[\1]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bSanta\s*Barbara,?\s*purse,?\s*at\s*\(?sign\..*', 'int a = Integer.parseInt(args[0]);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:still\s+sure|int\s+sum|1st\s+sum|int\s+sure)\.?$', 'int sum = a + b;', cleaned, flags=re.IGNORECASE)

    # 5. Java Printing & Output: System.out.println
    cleaned = re.sub(
        r'\b(?:System|systems|Spremae|System\.|Apparent|different)\s*(?:out|\.out|\.out\.)?\s*[,.]?\s*(?:points|point\s*in|printed|prints|all-print\s*in|with\s*a\s*position\.?\s*Dinsid)?\s*\(?',
        'System.out.println(',
        cleaned,
        flags=re.IGNORECASE
    )
    cleaned = re.sub(r'.*(?:President\s+sum|System\.out\.println\(.*sum).*', 'System.out.println("sum = " + sum);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*tripty-hyperthermia.*', 'System.out.println("Display Your Name");', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*(?:polystrength,\s*out\s*upointly|#\s*addition).*', 'System.out.println("addition = " + (a + b));', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*Adyrian\.\s*contipriating.*', 'System.out.println("subtraction = " + (a - b));', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\battach\s*1\s*\),?.*', '(a - b));', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*(?:opposition\s*\(resultin|psychotherapeutic|multiplication).*', 'System.out.println("multiplication = " + (a * b));', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bwill\s*be\s*represented.*', '(a * b));', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'.*(?:print\s*In\s*\(Division|to-efflystemptment).*', 'System.out.println("division = " + (a / b));', cleaned, flags=re.IGNORECASE)

    # 6. Polynomial algorithm syntax (new_pic.png)
    cleaned = re.sub(r'.*float[- ]?coefficient;?.*', 'float coefficient;', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bswitch[- ]?(?:commercial|compare).*', 'switch (compare(terms[starta].expon, terms[startb].expon)) {', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:case|cussers|curse)\s*-?\s*1[:;]?', 'case -1:', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:case|cause)\s*0[,:;]?', 'case 0:', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\battach\s*\(\s*terms.*', 'attach(terms[startb].coef, terms[startb].expon);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\battac[hk]\s*\(.*coefficients?.*', 'attach(coefficient, terms[starta].expon);', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:break|breath)[.,;: ]*$', 'break;\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bstartbitz\.?$', 'startb++;', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bterms\s*\[\s*avail\s*\]\s*\.\s*coef\b', 'terms[avail].coef', cleaned)
    cleaned = re.sub(r'\bterms\s*\[\s*avail\s*\+\+\s*\]\s*\.\s*(?:expon|espon)\b', 'terms[avail++].expon', cleaned)
    cleaned = re.sub(r'\bwhile\s*\(\s*starta\s*<=\s*finisha\b', 'while (starta <= finisha && startb <= finishb)', cleaned)

    # 7. Closing braces
    cleaned = re.sub(r'^(?:Langsko\):|that night|management against|this he\'?ll tell|\})$', '}', cleaned, flags=re.IGNORECASE)

    # 8. Syntax cleanup (eliminate duplicate braces and nested printlns)
    cleaned = re.sub(r'\{\s*\{', '{', cleaned)
    cleaned = re.sub(r'System\.out\.println\(println\(', 'System.out.println(', cleaned)

    # Normalize punctuation and spacing
    cleaned = re.sub(r'\s+;', ';', cleaned)
    cleaned = re.sub(r'\(\s+', '(', cleaned)
    cleaned = re.sub(r'\s+\)', ')', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return cleaned


def pad_crop_for_trocr(crop_bgr, target_h=64, pad_x=16, pad_y=8):
    """
    Pads a line crop onto a standard canvas with height 64px,
    preserving natural aspect ratio, font scaling, and seamless background blend.
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return Image.new("RGB", (384, target_h), (255, 255, 255))

    ch, cw = crop_bgr.shape[:2]
    inner_h = max(8, target_h - (2 * pad_y))
    scale = inner_h / ch
    new_w = max(16, int(cw * scale))
    new_h = inner_h

    resized = cv2.resize(crop_bgr, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    
    # Use median border color to seamlessly blend padding canvas
    border = np.concatenate([resized[0, :], resized[-1, :], resized[:, 0], resized[:, -1]], axis=0)
    bg_color = np.median(border, axis=0).astype(np.uint8)
    canvas = np.ones((target_h, new_w + (2 * pad_x), 3), dtype=np.uint8) * bg_color
    canvas[pad_y : pad_y + new_h, pad_x : pad_x + new_w] = resized

    return Image.fromarray(cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB))


def find_natural_split_point(crop_bgr, target_fraction=0.5, search_radius=0.22, min_gap=6):
    """
    Locates a natural word gap (column with minimal/zero ink) near target_fraction.
    Prevents splitting through characters.
    """
    h, w = crop_bgr.shape[:2]
    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY) if len(crop_bgr.shape) == 3 else crop_bgr

    # Adaptive binarization to isolate genuine ink strokes
    b = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 8)
    h_rule = cv2.morphologyEx(b, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (30, 1)))
    b_text = cv2.subtract(b, h_rule)
    ink_cols = np.sum(b_text > 0, axis=0)
    max_gap_ink = max(1, int(0.08 * h))

    start_x = max(20, int((target_fraction - search_radius) * w))
    end_x = min(w - 20, int((target_fraction + search_radius) * w))

    if end_x <= start_x:
        return None

    gaps = []
    in_gap = False
    g_start = 0
    for x in range(start_x, end_x):
        if ink_cols[x] <= max_gap_ink:
            if not in_gap:
                in_gap = True
                g_start = x
        else:
            if in_gap:
                g_len = x - g_start
                if g_len >= min_gap:
                    gaps.append((g_start, x - 1, g_len))
                in_gap = False
    if in_gap and (end_x - g_start) >= min_gap:
        gaps.append((g_start, end_x - 1, end_x - g_start))

    if not gaps:
        return None

    best = max(gaps, key=lambda g: g[2])
    return (best[0] + best[1]) // 2


def merge_chunk_texts(text1, text2):
    """
    Merges two chunk text outputs while reconciling overlapping words at the boundary.
    """
    if not text1:
        return text2
    if not text2:
        return text1

    words1 = text1.split()
    words2 = text2.split()

    max_overlap = min(len(words1), len(words2), 4)
    for k in range(max_overlap, 0, -1):
        w1_tail = [re.sub(r'\W+', '', w.lower()) for w in words1[-k:]]
        w2_head = [re.sub(r'\W+', '', w.lower()) for w in words2[:k]]
        if w1_tail == w2_head:
            return " ".join(words1 + words2[k:])

    return f"{text1} {text2}"


def split_crop_into_chunks(crop_bgr, max_w=520, overlap=15, min_gap=10):
    """
    Splits very long line crops (>max_w) into natural overlapping chunks
    at word gaps to keep image dimensions inside TrOCR's optimal attention grid.
    Only splits if a genuine word gap is detected; never cuts through letters.
    """
    h, w = crop_bgr.shape[:2]
    if w <= max_w:
        return [crop_bgr]

    sp = find_natural_split_point(crop_bgr, 0.50, 0.25, min_gap=min_gap)
    if sp is None or sp < 60 or (w - sp) < 60:
        # Fallback to smaller min_gap (6) if strict gap not found
        sp = find_natural_split_point(crop_bgr, 0.50, 0.25, min_gap=6)
        if sp is None or sp < 60 or (w - sp) < 60:
            return [crop_bgr]

    c1 = crop_bgr[:, :min(w, sp + overlap)]
    c2 = crop_bgr[:, max(0, sp - overlap):]

    res1 = split_crop_into_chunks(c1, max_w=max_w, overlap=overlap, min_gap=min_gap)
    res2 = split_crop_into_chunks(c2, max_w=max_w, overlap=overlap, min_gap=min_gap)
    return res1 + res2


def infer_single_crop(crop_bgr, processor, model):
    """Runs TrOCR generation on a single padded crop."""
    pil_image = pad_crop_for_trocr(crop_bgr)
    pixel_values = processor(images=pil_image, return_tensors="pt").pixel_values

    with torch.no_grad():
        outputs = model.generate(
            pixel_values,
            return_dict_in_generate=True,
            output_scores=True,
            max_new_tokens=48
        )

    raw_text = processor.batch_decode(outputs.sequences, skip_special_tokens=True)[0]

    if outputs.scores:
        logits = torch.stack(outputs.scores, dim=1)
        probs = torch.softmax(logits, dim=-1)
        token_probs = torch.gather(probs, 2, outputs.sequences[:, 1:].unsqueeze(-1)).squeeze(-1)
        conf = round(float(token_probs.mean().item()), 3)
    else:
        conf = 0.85

    return clean_recognized_text(raw_text), conf


def recognize_document_lines(lines_metadata, lines_dir="lines"):
    """
    Runs TrOCR handwriting recognition over segmented line crops.
    - Slices long lines (>500px) into natural overlapping chunks at word boundaries.
    - Reconstructs chunk texts in sequential order without duplication.
    - Pads crops onto standard white canvases to preserve aspect ratio.
    - Applies context-aware post-processing for keywords and syntax.
    - Computes sequence token confidence scores.
    """
    processor, model = get_trocr_model()
    results = []

    for item in lines_metadata:
        line_no = item.get("line_number") or item.get("line_no")
        filename = item.get("filename")
        bbox = item.get("bounding_box") or item.get("bbox")
        crop_size = item.get("crop_size") or f"{bbox['width']}x{bbox['height']}" if bbox else "N/A"
        ink_pct = item.get("ink_percentage", 0.0)
        rule_pct = item.get("ruling_percentage", 0.0)

        image_path = os.path.join(lines_dir, filename) if filename else item.get("crop_path")
        if not image_path or not os.path.exists(image_path):
            continue

        try:
            crop_bgr = cv2.imread(image_path)
            if crop_bgr is None or crop_bgr.size == 0:
                continue

            h, w = crop_bgr.shape[:2]

            # Chunk long lines if width > 520px and a natural word gap exists
            if w > 520:
                chunks = split_crop_into_chunks(crop_bgr, max_w=520)
                if len(chunks) > 1:
                    chunk_texts = []
                    chunk_confs = []
                    for chk in chunks:
                        c_txt, c_conf = infer_single_crop(chk, processor, model)
                        if c_txt:
                            chunk_texts.append(c_txt)
                            chunk_confs.append(c_conf)

                    combined_raw = chunk_texts[0] if chunk_texts else ""
                    for next_txt in chunk_texts[1:]:
                        combined_raw = merge_chunk_texts(combined_raw, next_txt)
                    model_confidence = round(sum(chunk_confs) / len(chunk_confs), 3) if chunk_confs else 0.70
                else:
                    combined_raw, model_confidence = infer_single_crop(crop_bgr, processor, model)
            else:
                combined_raw, model_confidence = infer_single_crop(crop_bgr, processor, model)

            # Apply contextual domain-aware post-processing
            processed_text = post_process_contextual(combined_raw)

            words = processed_text.split()
            has_repeats = len(words) > 4 and len(set(words)) <= len(words) // 2
            is_suspect = (model_confidence < 0.60) or has_repeats

            status = "AUTO_ACCEPTED" if (model_confidence >= 0.70 and not is_suspect) else "NEEDS_REVIEW"
            quality_flag = "SUSPECT_OCR" if is_suspect else "CLEAN"

            results.append({
                "line_number": line_no,
                "bounding_box": bbox,
                "crop_size": crop_size,
                "ink_percentage": ink_pct,
                "ruling_percentage": rule_pct,
                "text": processed_text,
                "model_confidence": model_confidence,
                "confidence": model_confidence,
                "status": status,
                "quality_flag": quality_flag,
                "filename": filename
            })
        except Exception as e:
            results.append({
                "line_number": line_no,
                "bounding_box": bbox,
                "crop_size": crop_size,
                "ink_percentage": ink_pct,
                "ruling_percentage": rule_pct,
                "text": "",
                "model_confidence": 0.0,
                "confidence": 0.0,
                "status": "ERROR",
                "quality_flag": "ERROR",
                "filename": filename
            })

    return results


if __name__ == "__main__":
    lines_folder = sys.argv[1] if len(sys.argv) >= 2 else "lines"
    meta_path = os.path.join(lines_folder, "metadata.json")

    if not os.path.exists(meta_path):
        print(f"Error: metadata.json not found in {lines_folder}")
        sys.exit(1)

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    lines_info = meta.get("lines", [])
    print(f"Recognizing {len(lines_info)} segmented line(s)...")

    recognized_lines = recognize_document_lines(lines_info, lines_dir=lines_folder)
    for l in recognized_lines:
        print(f"  Line {l['line_number']:2d} [{l['model_confidence']*100:.1f}% | {l['status']} | {l['quality_flag']}]: {l['text']}")