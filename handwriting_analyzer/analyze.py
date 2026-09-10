import sys
import subprocess
import os
import hashlib
import json
import shutil
import io
from datetime import datetime, timezone

# Enforce UTF-8 across Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ==========================================
# 0. AUTO-SWITCH TO VIRTUAL ENVIRONMENT
# ==========================================
script_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(script_dir, "venv", "Scripts", "python.exe")

if os.path.exists(venv_python) and sys.executable.lower() != venv_python.lower():
    try:
        import cv2
        import torch
    except ImportError:
        print("[Notice] Switching to project virtual environment Python...")
        res = subprocess.run([venv_python] + sys.argv)
        sys.exit(res.returncode)

import cv2
from preprocess import preprocess_document
from multi_line_segment import segment_handwriting_lines
from recognizer import recognize_document_lines
from text_analyzer import analyze_text
from handwriting_features import analyze_handwriting_features
from report_generator import generate_html_report, generate_text_report


def print_diagnostic_table(recognized_lines):
    """Prints a clear console table of all segmented lines and OCR metrics."""
    print()
    print("=" * 115)
    print(f"{'Line':<5} | {'Bounding Box':<20} | {'Crop Size':<10} | {'Ink %':<6} | {'Rule %':<6} | {'Model Conf':<11} | {'Status':<14} | {'OCR Text'}")
    print("-" * 115)
    for l in recognized_lines:
        b = l.get("bounding_box", {})
        bbox_str = f"({b.get('x',0)}, {b.get('y',0)}, {b.get('width',0)}, {b.get('height',0)})"
        crop_sz = l.get("crop_size", f"{b.get('width',0)}x{b.get('height',0)}")
        ink_p = f"{l.get('ink_percentage', 0.0):4.1f}%"
        rule_p = f"{l.get('ruling_percentage', 0.0):4.1f}%"
        conf = f"{l.get('model_confidence', 0.0)*100:5.1f}%"
        status = l.get("status", "N/A")
        text_snippet = l.get("text", "")
        if len(text_snippet) > 42:
            text_snippet = text_snippet[:39] + "..."
        print(f"{l['line_number']:<5} | {bbox_str:<20} | {crop_sz:<10} | {ink_p:<6} | {rule_p:<6} | {conf:<11} | {status:<14} | {text_snippet}")
    print("=" * 115)
    print()


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print("Usage:")
        print("  python analyze.py <image_name> [--debug]")
        print("Example:")
        print("  python analyze.py test_multiline.png --debug")
        sys.exit(0)

    image_name = args[0]
    is_debug = "--debug" in args

    try:
        analyze_handwriting_document(image_name, is_debug=is_debug)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)


def analyze_handwriting_document(image_name, is_debug=False, outputs_dir="outputs"):
    """
    Executes the full 7-step Secure DMS handwriting analyzer pipeline:
    1. Preprocessing & illumination normalization
    2. Handwriting line detection & ruling suppression
    3. Line crop extraction with valley bounds
    4. TrOCR recognition with natural chunking & context-aware post-processing
    5. DMS text entity analysis & statistics
    6. Visual handwriting feature extraction
    7. Standardized JSON & interactive HTML report generation

    Returns the complete structured result dictionary.
    """
    if not os.path.exists(image_name):
        raise FileNotFoundError(f"Could not find image '{image_name}'.")

    # Compute SHA-256 hash upfront
    with open(image_name, "rb") as f:
        file_sha256 = hashlib.sha256(f.read()).hexdigest()

    doc_id = f"DOC-{file_sha256[:8].upper()}"

    # Setup directories
    os.makedirs(outputs_dir, exist_ok=True)
    out_lines_dir = os.path.join(outputs_dir, "lines")
    debug_dir = os.path.join(outputs_dir, "debug")
    root_lines_dir = "lines"
    os.makedirs(out_lines_dir, exist_ok=True)
    os.makedirs(debug_dir, exist_ok=True)
    os.makedirs(root_lines_dir, exist_ok=True)

    print()
    print("==========================================================")
    print(" SECURE DMS: HANDWRITING ANALYZER")
    print("==========================================================")
    print(f"Input Document: {image_name}")
    print(f"Document ID:    {doc_id}")
    print(f"SHA-256 Hash:   {file_sha256}")
    if is_debug:
        print("Mode:           DEBUG (saving intermediate artifacts)")
    print("==========================================================")

    # ==========================================
    # [1/7] PREPROCESSING & QUALITY ASSESSMENT
    # ==========================================
    print()
    print("[1/7] Preprocessing image (illumination normalization & deskew)...")
    prep_out_path = os.path.join(outputs_dir, "preprocessed.png")
    dbg_out_path = os.path.join(outputs_dir, "preprocessing_debug.png") if is_debug else None

    try:
        working_img, prep_img, quality_report = preprocess_document(
            image_path=image_name,
            output_path=prep_out_path,
            debug_path=dbg_out_path,
            debug_dir=debug_dir
        )
        # Copy to root for compatibility
        shutil.copyfile(prep_out_path, "preprocessed.png")
        if dbg_out_path and os.path.exists(dbg_out_path):
            shutil.copyfile(dbg_out_path, "preprocessing_debug.png")
    except Exception as e:
        print(f"ERROR: Preprocessing failed: {e}")
        sys.exit(1)

    img_h, img_w = working_img.shape[:2]
    all_warnings = list(quality_report.get("warnings", []))

    # ==========================================
    # [2/7] & [3/7] DETECTING HANDWRITING & LINE CROPS
    # ==========================================
    print("[2/7] Detecting genuine handwriting lines (suppressing ruled lines)...")
    print("[3/7] Extracting tight line crops with zero-overlap valley limits...")

    preview_out_path = os.path.join(outputs_dir, "all_lines_preview.png")

    try:
        lines_info, meta_payload, preview_img = segment_handwriting_lines(
            original_image=working_img,
            preprocessed_image=prep_img,
            output_dir=out_lines_dir,
            preview_path=preview_out_path,
            debug_dir=debug_dir,
            debug=is_debug
        )
        # Mirror to root directory
        shutil.copyfile(preview_out_path, "all_lines_preview.png")
        # Mirror line crops to root lines/
        for fname in os.listdir(out_lines_dir):
            src_f = os.path.join(out_lines_dir, fname)
            dst_f = os.path.join(root_lines_dir, fname)
            if os.path.isfile(src_f):
                shutil.copyfile(src_f, dst_f)
    except Exception as e:
        print(f"ERROR: Line segmentation failed: {e}")
        sys.exit(1)

    line_count = len(lines_info)
    print(f"      Detected {line_count} verified handwriting line(s).")

    if line_count == 0:
        warning_msg = "WARNING: No handwriting regions detected on document."
        print(warning_msg)
        all_warnings.append(warning_msg)

    # ==========================================
    # [4/7] RUNNING TrOCR HANDWRITING RECOGNITION
    # ==========================================
    print("[4/7] Running TrOCR handwriting recognition & model confidence calculation...")

    recognized_lines = []
    full_text = ""

    if line_count > 0:
        try:
            recognized_lines = recognize_document_lines(
                lines_metadata=lines_info,
                lines_dir=out_lines_dir
            )
            full_text = "\n".join(l["text"] for l in recognized_lines if l.get("text"))
            print_diagnostic_table(recognized_lines)
        except Exception as e:
            print(f"ERROR: Handwriting recognition failed: {e}")
            all_warnings.append(f"Handwriting OCR engine error: {str(e)}")

    # ==========================================
    # [5/7] ANALYZING TEXT & EXTRACTING ENTITIES
    # ==========================================
    print("[5/7] Analyzing text for DMS entities & document statistics...")
    try:
        text_analysis = analyze_text(full_text, recognized_lines)
    except Exception as e:
        print(f"WARNING: Text analysis failed: {e}")
        text_analysis = {
            "word_count": 0, "character_count": 0, "total_lines": line_count,
            "average_words_per_line": 0.0, "longest_line": "", "shortest_line": "",
            "dates": [], "times": [], "names": [], "locations": [],
            "organizations": [], "legal_references": [], "phone_numbers": [],
            "email_addresses": [], "amounts": [], "keywords": []
        }

    # ==========================================
    # [6/7] ANALYZING HANDWRITING VISUAL FEATURES
    # ==========================================
    print("[6/7] Analyzing handwriting visual & structural features...")
    try:
        hw_features = analyze_handwriting_features(working_img, lines_info, lines_dir=out_lines_dir)
    except Exception as e:
        print(f"WARNING: Feature analysis failed: {e}")
        hw_features = {
            "slant": "not_detectable", "baseline": "not_detectable",
            "line_spacing": "not_detectable", "writing_density": "not_detectable",
            "average_line_height": "0px", "average_line_length": "0px",
            "consistency": "not_detectable", "raw_metrics": {}
        }

    # ==========================================
    # [7/7] GENERATING STANDARDIZED REPORTS
    # ==========================================
    print("[7/7] Generating structured JSON and interactive HTML report...")

    result_payload = {
        "success": True,
        "document_id": doc_id,
        "input": {
            "filename": os.path.basename(image_name),
            "width": int(img_w),
            "height": int(img_h),
            "sha256": file_sha256
        },
        "document_quality": {
            "blur": quality_report.get("blur", "N/A"),
            "contrast": quality_report.get("contrast", "N/A"),
            "brightness": quality_report.get("brightness", "N/A"),
            "skew_angle": quality_report.get("skew_angle", "0.00°")
        },
        "lines": [
            {
                "line_number": l["line_number"],
                "bounding_box": l["bounding_box"],
                "crop_size": l.get("crop_size", "N/A"),
                "ink_percentage": l.get("ink_percentage", 0.0),
                "ruling_percentage": l.get("ruling_percentage", 0.0),
                "text": l["text"],
                "model_confidence": l.get("model_confidence", 0.0),
                "confidence": l.get("model_confidence", 0.0),
                "status": l.get("status", "UNKNOWN"),
                "quality_flag": l.get("quality_flag", "CLEAN")
            }
            for l in recognized_lines
        ],
        "full_text": full_text,
        "text_analysis": {
            "word_count": text_analysis.get("word_count", 0),
            "character_count": text_analysis.get("character_count", 0),
            "dates": text_analysis.get("dates", []),
            "names": text_analysis.get("names", []),
            "locations": text_analysis.get("locations", []),
            "organizations": text_analysis.get("organizations", []),
            "keywords": text_analysis.get("keywords", [])
        },
        "handwriting_features": {
            "slant": hw_features.get("slant", "N/A"),
            "baseline": hw_features.get("baseline", "N/A"),
            "line_spacing": hw_features.get("line_spacing", "N/A"),
            "writing_density": hw_features.get("writing_density", "N/A"),
            "average_line_height": hw_features.get("average_line_height", "N/A"),
            "average_line_length": hw_features.get("average_line_length", "N/A"),
            "consistency": hw_features.get("consistency", "N/A")
        },
        "warnings": all_warnings
    }

    # Save outputs/result.json and root result.json
    out_json = os.path.join(outputs_dir, "result.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(result_payload, f, indent=2, ensure_ascii=False)
    shutil.copyfile(out_json, "result.json")

    # Generate HTML reports
    out_html = os.path.join(outputs_dir, "analysis_report.html")
    generate_html_report(result_payload, output_html_path=out_html, lines_dir=out_lines_dir)
    shutil.copyfile(out_html, "analysis_report.html")

    # Generate text report
    out_txt = os.path.join(outputs_dir, "analysis_report.txt")
    generate_text_report(result_payload, output_txt_path=out_txt)
    shutil.copyfile(out_txt, "analysis_report.txt")

    # Calculate review status
    avg_conf = 0.0
    if recognized_lines:
        valid_c = [l["model_confidence"] for l in recognized_lines if l.get("model_confidence") is not None]
        avg_conf = (sum(valid_c) / len(valid_c)) if valid_c else 0.0

    review_needed = any(l.get("model_confidence", 1.0) < 0.70 for l in recognized_lines) or (avg_conf < 0.70)
    review_status = "NEEDS_REVIEW" if review_needed else "AUTO_ACCEPTED"

    print("==========================================================")
    print(" ANALYSIS COMPLETE")
    print("==========================================================")
    print(f"Lines detected:    {line_count}")
    print(f"Words recognized:  {text_analysis.get('word_count', 0)}")
    print(f"Quality Focus:     {quality_report.get('blur', 'N/A')}")
    print(f"Review Status:     {review_status} (Avg Model Confidence: {avg_conf * 100:.1f}%)")
    print()
    print("Output Artifacts:")
    print("  - Standardized JSON:    result.json & outputs/result.json")
    print("  - Interactive Report:   analysis_report.html & outputs/analysis_report.html")
    print("  - Console Summary:      analysis_report.txt & outputs/analysis_report.txt")
    print("  - Visual Line Preview:  all_lines_preview.png")
    print("  - Cleaned Preprocessed: preprocessed.png")
    print("  - Segmented Line Crops: lines/ & outputs/lines/")
    print("  - Debug Artifacts:      outputs/debug/ (original, grayscale, threshold, ruling_removed, handwriting_mask, projection_profile, final_boxes)")
    print("==========================================================")
    return result_payload


if __name__ == "__main__":
    main()