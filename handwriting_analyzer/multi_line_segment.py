import cv2
import numpy as np
import os
import sys
import json

# Enforce UTF-8 console encoding on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def is_valid_text_line(crop_img):
    """
    Validates whether an image crop contains genuine handwriting words
    versus empty ruled notebook lines, dashed lines, background desk objects, or shadows.
    """
    if len(crop_img.shape) == 3:
        g = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
    else:
        g = crop_img

    if len(np.unique(g)) <= 2:
        b = (g < 128).astype(np.uint8) * 255
    else:
        b = cv2.adaptiveThreshold(
            g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 9
        )

    # Detach horizontal ruling lines so handwriting strokes are evaluated independently
    h_line = cv2.morphologyEx(b, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (35, 1)))
    b_clean = cv2.subtract(b, cv2.dilate(h_line, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3))))

    num_l, _, s, _ = cv2.connectedComponentsWithStats(b_clean, connectivity=8)
    chars = [
        i for i in range(1, num_l)
        if s[i, cv2.CC_STAT_AREA] >= 20 and 10 <= s[i, cv2.CC_STAT_HEIGHT] <= 120 and 5 <= s[i, cv2.CC_STAT_WIDTH] <= 300
    ]

    if len(chars) < 3:
        return False, len(chars), 0.0

    h_list = [s[i, cv2.CC_STAT_HEIGHT] for i in chars]
    total_area = sum(s[i, cv2.CC_STAT_AREA] for i in chars)
    min_x = min(s[i, cv2.CC_STAT_LEFT] for i in chars)
    max_x = max(s[i, cv2.CC_STAT_LEFT] + s[i, cv2.CC_STAT_WIDTH] for i in chars)
    span_w = max_x - min_x
    p90 = float(np.percentile(h_list, 90))

    is_valid = len(chars) >= 3 and total_area >= 350 and span_w >= 50
    return is_valid, len(chars), p90


def detect_paragraphs_and_blocks(line_bboxes, image_h, image_w):
    """
    Groups segmented lines into paragraphs and blocks based on vertical gaps.
    """
    if not line_bboxes:
        return []

    if len(line_bboxes) == 1:
        b = line_bboxes[0]
        return [{
            "block_id": 1,
            "lines": [1],
            "bounding_box": {
                "x": b["x"],
                "y": b["y"],
                "width": b["width"],
                "height": b["height"]
            }
        }]

    spacings = []
    for i in range(1, len(line_bboxes)):
        gap = line_bboxes[i]["y"] - (line_bboxes[i - 1]["y"] + line_bboxes[i - 1]["height"])
        if gap > 0:
            spacings.append(gap)

    median_spacing = float(np.median(spacings)) if spacings else 25.0
    para_thresh = max(35.0, median_spacing * 1.8)

    blocks = []
    current_block = [line_bboxes[0]["line_number"]]

    for i in range(1, len(line_bboxes)):
        gap = line_bboxes[i]["y"] - (line_bboxes[i - 1]["y"] + line_bboxes[i - 1]["height"])
        if gap > para_thresh:
            blocks.append(current_block)
            current_block = [line_bboxes[i]["line_number"]]
        else:
            current_block.append(line_bboxes[i]["line_number"])

    if current_block:
        blocks.append(current_block)

    structured_blocks = []
    for b_idx, line_nums in enumerate(blocks, start=1):
        matching_boxes = [b for b in line_bboxes if b["line_number"] in line_nums]
        min_x = min(b["x"] for b in matching_boxes)
        min_y = min(b["y"] for b in matching_boxes)
        max_x = max(b["x"] + b["width"] for b in matching_boxes)
        max_y = max(b["y"] + b["height"] for b in matching_boxes)
        structured_blocks.append({
            "block_id": b_idx,
            "lines": line_nums,
            "bounding_box": {
                "x": int(min_x),
                "y": int(min_y),
                "width": int(max_x - min_x),
                "height": int(max_y - min_y)
            }
        })

    return structured_blocks


def draw_projection_profile(smoothed, valleys, peaks, img_h, output_path):
    """
    Generates an informative diagnostic visualization of the horizontal projection profile:
    - Left: filled curve of the smoothed projection profile
    - Green lines: detected handwriting peaks
    - Red lines: valley cutoffs (zero-overlap boundaries)
    - Labels: line numbers and peak coordinates
    """
    prof_w = 400
    prof_img = np.full((img_h, prof_w, 3), 245, dtype=np.uint8)
    max_prof = max(float(np.max(smoothed)), 1.0)

    # Background grid lines every 100px
    for y in range(0, img_h, 100):
        cv2.line(prof_img, (0, y), (prof_w, y), (220, 220, 220), 1)

    # Fill curve
    curve_pts = []
    for y in range(img_h):
        curve_x = int((smoothed[y] / max_prof) * (prof_w - 70))
        curve_pts.append((curve_x, y))
        cv2.line(prof_img, (0, y), (curve_x, y), (230, 215, 195), 1)

    for i in range(len(curve_pts) - 1):
        cv2.line(prof_img, curve_pts[i], curve_pts[i + 1], (200, 110, 30), 2)

    # Valleys in red
    for v in valleys[1:-1]:
        cv2.line(prof_img, (0, v), (prof_w, v), (0, 0, 220), 1, cv2.LINE_AA)
        cv2.putText(prof_img, f"v={v}", (prof_w - 60, v - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 200), 1)

    # Peaks in green
    for idx, p in enumerate(peaks):
        cv2.line(prof_img, (0, p), (prof_w, p), (0, 180, 0), 1, cv2.LINE_AA)
        cv2.putText(prof_img, f"L{idx+1} (p={p})", (10, max(12, p - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 130, 0), 1)

    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    cv2.imwrite(output_path, prof_img)


def segment_handwriting_lines(
    original_image,
    preprocessed_image=None,
    output_dir="lines",
    preview_path="all_lines_preview.png",
    debug_dir="outputs/debug",
    debug=False
):
    """
    Core image processing and line segmentation pipeline:
    1. Suppresses horizontal notebook ruled lines using morphological operations.
    2. Isolates genuine handwriting strokes into text mask.
    3. Computes horizontal projection profile to detect continuous handwriting lines.
    4. Determines valley cutoffs between consecutive peaks to guarantee ZERO overlap.
    5. Rejects large blank notebook gaps and empty ruled lines.
    6. Extracts tight horizontal and vertical bounding boxes per line.
    7. Saves intermediate debug images:
       - threshold.png
       - ruling_removed.png
       - handwriting_mask.png
       - projection_profile.png
       - final_boxes.png
    8. Exports line crops to output_dir/line_XXX.png.
    """
    if isinstance(original_image, str):
        if not os.path.exists(original_image):
            raise FileNotFoundError(f"Image not found: {original_image}")
        image = cv2.imread(original_image)
    else:
        image = original_image

    if image is None:
        raise ValueError("Invalid image input for line segmentation")

    orig_h, orig_w = image.shape[:2]

    # Preprocessed image or grayscale conversion
    if preprocessed_image is not None:
        if isinstance(preprocessed_image, str):
            proc_img = cv2.imread(preprocessed_image)
        else:
            proc_img = preprocessed_image
    else:
        proc_img = image

    if len(proc_img.shape) == 3:
        gray = cv2.cvtColor(proc_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = proc_img.copy()

    img_h, img_w = image.shape[:2]

    # Setup directories
    os.makedirs(output_dir, exist_ok=True)
    if debug_dir:
        os.makedirs(debug_dir, exist_ok=True)

    # 1. Adaptive Binarization
    bin_inv = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 35, 10
    )
    if debug_dir:
        cv2.imwrite(os.path.join(debug_dir, "threshold.png"), bin_inv)

    # 2. Suppress horizontal ruled notebook lines
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    ruling_lines = cv2.morphologyEx(bin_inv, cv2.MORPH_OPEN, h_kernel)
    ruling_dilated = cv2.dilate(ruling_lines, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3)))
    no_lines = cv2.subtract(bin_inv, ruling_dilated)
    if debug_dir:
        cv2.imwrite(os.path.join(debug_dir, "ruling_removed.png"), no_lines)

    # 3. Vertical stroke reconnection
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 5))
    no_lines_closed = cv2.morphologyEx(no_lines, cv2.MORPH_CLOSE, v_kernel)

    # 4. Connected components filtering for genuine handwriting strokes
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(no_lines_closed, connectivity=8)
    text_only = np.zeros_like(bin_inv)
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        comp_w = stats[i, cv2.CC_STAT_WIDTH]
        comp_h = stats[i, cv2.CC_STAT_HEIGHT]
        # Reject ruling artifacts and noise
        if area >= 20 and comp_w <= 350 and comp_h >= 10:
            text_only[labels == i] = 255

    if debug_dir:
        cv2.imwrite(os.path.join(debug_dir, "handwriting_mask.png"), text_only)

    # 5. Horizontal projection profile & peak finding
    row_sum = np.sum(text_only > 0, axis=1)
    smoothed = np.convolve(row_sum, np.ones(11) / 11, mode="same")

    # Detect candidate peaks
    raw_peaks = []
    for y in range(10, img_h - 10):
        if smoothed[y] >= 25 and smoothed[y] == np.max(smoothed[y - 6 : y + 7]):
            raw_peaks.append(y)

    # Validate each candidate peak against desk/header and text criteria
    valid_peaks = []
    for p in raw_peaks:
        # Ignore top desk / margin region if not a ruled line page section
        if p < 180 and img_h >= 1200:
            # Check if there is actual handwritten text here
            test_crop = image[max(0, p - 20) : min(img_h, p + 20), :]
            valid, cnt, p90 = is_valid_text_line(test_crop)
            if not valid:
                continue
        else:
            test_crop = image[max(0, p - 20) : min(img_h, p + 20), :]
            valid, cnt, p90 = is_valid_text_line(test_crop)
            if not valid:
                continue
        valid_peaks.append(p)

    # Merge close peaks (< 18px apart) to eliminate ascender/descender splitting
    merged_peaks = []
    for p in valid_peaks:
        if not merged_peaks or (p - merged_peaks[-1]) >= 18:
            merged_peaks.append(p)
        elif smoothed[p] > smoothed[merged_peaks[-1]]:
            merged_peaks[-1] = p

    # Handle zero peaks gracefully
    if not merged_peaks:
        empty_meta = {
            "source_file": original_image if isinstance(original_image, str) else "input_image",
            "image_width": int(orig_w),
            "image_height": int(orig_h),
            "total_lines": 0,
            "lines": [],
            "blocks": [],
            "warnings": ["No valid handwriting lines detected on document."]
        }
        with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(empty_meta, f, indent=2)
        cv2.imwrite(preview_path, image)
        if debug_dir:
            cv2.imwrite(os.path.join(debug_dir, "final_boxes.png"), image)
        return [], empty_meta, image

    # 6. Valley detection between consecutive peaks (Strict Zero Overlap)
    valleys = [max(0, merged_peaks[0] - 35)]
    for i in range(len(merged_peaks) - 1):
        p1 = merged_peaks[i]
        p2 = merged_peaks[i + 1]
        v = p1 + int(np.argmin(smoothed[p1 : p2 + 1]))
        valleys.append(v)
    valleys.append(min(img_h - 1, merged_peaks[-1] + 40))

    # 7. Generate diagnostic projection profile plot
    if debug_dir:
        draw_projection_profile(
            smoothed, valleys, merged_peaks, img_h, os.path.join(debug_dir, "projection_profile.png")
        )

    # Clear previous line crops in output_dir
    for fname in os.listdir(output_dir):
        if fname.lower().endswith((".png", ".jpg", ".jpeg")):
            try:
                os.remove(os.path.join(output_dir, fname))
            except OSError:
                pass

    # 8. Extract tight bounding boxes for each line
    preview_image = image.copy()
    final_boxes_img = image.copy()
    line_metadata = []

    for i, p in enumerate(merged_peaks):
        v_top = valleys[i]
        v_bot = valleys[i + 1]

        # Trace outward from peak within valley interval to prevent engulfing blank notebook gaps
        yt = p
        while yt > v_top and smoothed[yt] > max(12.0, 0.10 * smoothed[p]):
            yt -= 1

        yb = p
        while yb < v_bot and smoothed[yb] > max(12.0, 0.10 * smoothed[p]):
            yb += 1

        # Check active ink rows inside yt..yb
        band = text_only[yt : yb + 1, :]
        ink_rows = np.where(np.sum(band > 0, axis=1) > 0)[0]
        if len(ink_rows) < 5:
            continue

        # Zero-overlap vertical bounds: cy1 >= v_top, cy2 <= v_bot
        cy1 = max(v_top, yt + ink_rows[0] - 2)
        cy2 = min(v_bot, yt + ink_rows[-1] + 3)
        bh = cy2 - cy1
        if bh < 12:
            continue

        # Horizontal analysis: find continuous text segments and reject margin noise
        band_tight = text_only[cy1:cy2, :]
        cols = np.sum(band_tight > 0, axis=0)
        
        MAX_WORD_GAP = 60
        segments = []
        in_seg = False
        start_x = 0
        last_ink_x = 0

        for x in range(len(cols)):
            if cols[x] > 0:
                if not in_seg:
                    in_seg = True
                    start_x = x
                last_ink_x = x
            else:
                if in_seg and (x - last_ink_x) > MAX_WORD_GAP:
                    segments.append((start_x, last_ink_x, int(np.sum(cols[start_x : last_ink_x + 1]))))
                    in_seg = False

        if in_seg:
            segments.append((start_x, last_ink_x, int(np.sum(cols[start_x : last_ink_x + 1]))))

        if not segments:
            continue

        # Cluster segments with intra-line gap <= 110px and select dominant ink cluster
        clusters = []
        cur_cluster = [segments[0]]
        for s in segments[1:]:
            prev_s = cur_cluster[-1]
            if (s[0] - prev_s[1]) <= 110:
                cur_cluster.append(s)
            else:
                clusters.append(cur_cluster)
                cur_cluster = [s]
        clusters.append(cur_cluster)

        # Select dominant cluster with highest ink content
        best_cluster = max(clusters, key=lambda cl: sum(x[2] for x in cl))
        
        # Filter tiny peripheral noise specks (< 2% of dominant cluster ink or < 100px ink)
        if len(best_cluster) > 1:
            tot_ink = sum(x[2] for x in best_cluster)
            filtered = [s for s in best_cluster if s[2] >= max(80, int(0.02 * tot_ink))]
            if filtered:
                best_cluster = filtered

        raw_min_x = min(s[0] for s in best_cluster)
        raw_max_x = max(s[1] for s in best_cluster)

        # Adaptive horizontal padding: 18px padding, snapping to margins only if very close to page edge
        cx1 = max(0, raw_min_x - 18)
        cx2 = min(img_w, raw_max_x + 18)
        if raw_min_x <= 25:
            cx1 = 0
        if raw_max_x >= img_w - 40:
            cx2 = img_w

        bw = cx2 - cx1
        if bw < 25:
            continue

        # Compute ink and ruling metrics
        box_area = bw * bh
        ink_px = int(np.sum(text_only[cy1:cy2, cx1:cx2] > 0))
        rule_px = int(np.sum(ruling_lines[cy1:cy2, cx1:cx2] > 0))
        ink_pct = round((ink_px / box_area) * 100, 1) if box_area > 0 else 0.0
        rule_pct = round((rule_px / box_area) * 100, 1) if box_area > 0 else 0.0

        line_no = len(line_metadata) + 1

        # Generate clean crop with ruled lines suppressed seamlessly for TrOCR and review
        crop_clean = image[cy1:cy2, cx1:cx2].copy()
        crop_bin = bin_inv[cy1:cy2, cx1:cx2]
        h_rule = cv2.morphologyEx(crop_bin, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (35, 1)))
        v_strokes = cv2.morphologyEx(crop_bin, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3)))
        protected_chars = cv2.dilate(v_strokes, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
        pure_ruling = cv2.subtract(h_rule, protected_chars)
        pure_ruling_dil = cv2.dilate(pure_ruling, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 2)))

        if np.sum(pure_ruling_dil > 0) > 10:
            crop_clean = cv2.inpaint(crop_clean, pure_ruling_dil, 2, cv2.INPAINT_TELEA)

        crop_fname = f"line_{line_no:03d}.png"
        crop_path = os.path.join(output_dir, crop_fname)
        cv2.imwrite(crop_path, crop_clean)

        bbox = {
            "x": int(cx1),
            "y": int(cy1),
            "width": int(bw),
            "height": int(bh),
        }

        # Draw green bounding box & label on preview
        cv2.rectangle(preview_image, (cx1, cy1), (cx2, cy2), (0, 200, 0), 2)
        cv2.putText(
            preview_image,
            f"Line {line_no}",
            (cx1, max(18, cy1 - 4)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 180, 0),
            2,
            cv2.LINE_AA,
        )

        cv2.rectangle(final_boxes_img, (cx1, cy1), (cx2, cy2), (0, 220, 0), 2)
        cv2.putText(
            final_boxes_img,
            f"Line {line_no}",
            (cx1, max(18, cy1 - 4)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 180, 0),
            2,
            cv2.LINE_AA,
        )

        line_metadata.append({
            "line_number": line_no,
            "filename": crop_fname,
            "crop_path": crop_path,
            "bounding_box": bbox,
            "crop_size": f"{bw}x{bh}",
            "ink_percentage": ink_pct,
            "ruling_percentage": rule_pct,
        })

    # Save final boxes debug artifact
    if debug_dir:
        cv2.imwrite(os.path.join(debug_dir, "final_boxes.png"), final_boxes_img)

    # Save preview image
    prev_dir = os.path.dirname(os.path.abspath(preview_path))
    if prev_dir:
        os.makedirs(prev_dir, exist_ok=True)
    cv2.imwrite(preview_path, preview_image)

    # Paragraph / block detection
    structured_blocks = detect_paragraphs_and_blocks(
        [{"line_number": l["line_number"], **l["bounding_box"]} for l in line_metadata],
        orig_h,
        orig_w
    )

    metadata_payload = {
        "source_file": original_image if isinstance(original_image, str) else "input_image",
        "image_width": int(orig_w),
        "image_height": int(orig_h),
        "total_lines": len(line_metadata),
        "lines": line_metadata,
        "blocks": structured_blocks,
        "warnings": []
    }

    with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata_payload, f, indent=2)

    return line_metadata, metadata_payload, preview_image


if __name__ == "__main__":
    target_img = sys.argv[1] if len(sys.argv) >= 2 else "preprocessed.png"
    if not os.path.exists(target_img):
        print(f"Error: Target image {target_img} not found.")
        sys.exit(1)

    print(f"Segmenting handwriting lines in: {target_img}")
    lines, meta, preview = segment_handwriting_lines(
        original_image=target_img,
        preprocessed_image="preprocessed.png" if os.path.exists("preprocessed.png") else None,
        output_dir="lines",
        preview_path="all_lines_preview.png",
        debug_dir="outputs/debug"
    )

    print(f"Total verified handwriting lines detected: {len(lines)}")
    for l in lines:
        b = l["bounding_box"]
        print(f"  Line {l['line_number']:2d}: bbox=({b['x']}, {b['y']}, {b['width']}x{b['height']}) -> {l['filename']}")
    print("Metadata saved to lines/metadata.json")
    print("Preview saved to all_lines_preview.png")