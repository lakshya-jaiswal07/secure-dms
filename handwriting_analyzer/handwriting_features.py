import cv2
import numpy as np
import os


def estimate_line_slant(crop_gray):
    """
    Estimates dominant stroke slant angle using second-order image moments
    on vertical character components.
    Returns slant in degrees (positive = rightward, negative = leftward).
    """
    if len(crop_gray.shape) == 3:
        gray = cv2.cvtColor(crop_gray, cv2.COLOR_BGR2GRAY)
    else:
        gray = crop_gray

    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    angles = []

    for i in range(1, num_labels):
        h = stats[i, cv2.CC_STAT_HEIGHT]
        w = stats[i, cv2.CC_STAT_WIDTH]
        area = stats[i, cv2.CC_STAT_AREA]

        # Select character-like components with vertical aspect ratio
        if h >= 14 and area >= 25 and (h / max(w, 1)) >= 1.1:
            comp_mask = (labels == i).astype(np.uint8)
            moments = cv2.moments(comp_mask)
            mu20 = moments["mu20"]
            mu02 = moments["mu02"]
            mu11 = moments["mu11"]

            diff = mu20 - mu02
            if abs(diff) > 1e-4:
                # Orientation of major axis
                theta = 0.5 * np.arctan2(2 * mu11, diff)
                deg = float(np.degrees(theta))
                # Normalize to deviation from vertical (-45 to +45 deg)
                if -45.0 <= deg <= 45.0:
                    angles.append(deg)

    if angles:
        return float(np.median(angles))
    return 0.0


def estimate_line_baseline(crop_gray):
    """
    Estimates baseline trend across characters in a line using linear regression
    on component bottom centroids.
    Returns slope (negative = rising, positive = falling in image coordinates).
    """
    if len(crop_gray.shape) == 3:
        gray = cv2.cvtColor(crop_gray, cv2.COLOR_BGR2GRAY)
    else:
        gray = crop_gray

    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)

    pts_x = []
    pts_y = []

    for i in range(1, num_labels):
        h = stats[i, cv2.CC_STAT_HEIGHT]
        area = stats[i, cv2.CC_STAT_AREA]
        if h >= 12 and area >= 20:
            cx = centroids[i][0]
            # Bottom of component
            by = stats[i, cv2.CC_STAT_TOP] + h
            pts_x.append(cx)
            pts_y.append(by)

    if len(pts_x) >= 4:
        # Fit line: y = m*x + c
        pts_x = np.array(pts_x)
        pts_y = np.array(pts_y)
        A = np.vstack([pts_x, np.ones(len(pts_x))]).T
        m, _ = np.linalg.lstsq(A, pts_y, rcond=None)[0]
        return float(m)
    return 0.0


def analyze_handwriting_features(image, lines_info, lines_dir="lines"):
    """
    Measures purely objective, geometric, and visual characteristics of handwriting.
    STRICTLY NON-PSYCHOLOGICAL: No behavioral or personality inferences are made.
    """
    if not lines_info:
        return {
            "slant": "not_detectable",
            "baseline": "not_detectable",
            "line_spacing": "not_detectable",
            "writing_density": "not_detectable",
            "average_line_height": "0px",
            "average_line_length": "0px",
            "consistency": "not_detectable",
            "raw_metrics": {}
        }

    img_h, img_w = image.shape[:2]

    slant_angles = []
    baseline_slopes = []
    line_heights = []
    line_widths = []
    left_margins = []
    right_margins = []
    ink_pixels_total = 0
    box_area_total = 0

    char_spacings = []
    word_spacings = []

    for item in lines_info:
        bbox = item.get("bounding_box") or item.get("bbox")
        filename = item.get("filename")
        if not bbox:
            continue

        bw, bh = bbox.get("width") or bbox.get("w"), bbox.get("height") or bbox.get("h")
        bx, by = bbox.get("x"), bbox.get("y")

        line_heights.append(bh)
        line_widths.append(bw)
        left_margins.append(bx)
        right_margins.append(max(0, img_w - (bx + bw)))
        box_area_total += (bw * bh)

        crop_path = os.path.join(lines_dir, filename) if filename else None
        if crop_path and os.path.exists(crop_path):
            crop = cv2.imread(crop_path)
            if crop is not None:
                gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                _, bin_crop = cv2.threshold(gray_crop, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
                
                ink_cnt = int(np.sum(bin_crop > 0))
                ink_pixels_total += ink_cnt

                # Slant
                s = estimate_line_slant(gray_crop)
                slant_angles.append(s)

                # Baseline
                m = estimate_line_baseline(gray_crop)
                baseline_slopes.append(m)

                # Character / Word spacing inside line
                num_l, _, s_stats, _ = cv2.connectedComponentsWithStats(bin_crop, connectivity=8)
                char_boxes = []
                for ci in range(1, num_l):
                    if s_stats[ci, cv2.CC_STAT_AREA] >= 15 and s_stats[ci, cv2.CC_STAT_HEIGHT] >= 10:
                        char_boxes.append((s_stats[ci, cv2.CC_STAT_LEFT], s_stats[ci, cv2.CC_STAT_WIDTH]))

                char_boxes.sort(key=lambda b: b[0])
                for idx in range(len(char_boxes) - 1):
                    gap = char_boxes[idx + 1][0] - (char_boxes[idx][0] + char_boxes[idx][1])
                    if gap > 1:
                        if gap < 20:
                            char_spacings.append(gap)
                        elif gap < 80:
                            word_spacings.append(gap)

    # 1. Slant categorization
    med_slant = float(np.median(slant_angles)) if slant_angles else 0.0
    if med_slant > 4.0:
        slant_desc = f"rightward_slant (+{med_slant:.1f}°)"
    elif med_slant < -4.0:
        slant_desc = f"leftward_slant ({med_slant:.1f}°)"
    else:
        slant_desc = f"vertical_neutral_slant ({med_slant:+.1f}°)"

    # 2. Baseline direction categorization
    med_slope = float(np.median(baseline_slopes)) if baseline_slopes else 0.0
    if med_slope < -0.015:
        baseline_desc = f"rising_baseline (slope: {med_slope:.3f})"
    elif med_slope > 0.015:
        baseline_desc = f"falling_baseline (slope: {med_slope:.3f})"
    else:
        baseline_desc = f"relatively_stable_horizontal (slope: {med_slope:.3f})"

    # 3. Line Spacing
    vertical_gaps = []
    for i in range(1, len(lines_info)):
        prev_b = lines_info[i - 1].get("bounding_box") or lines_info[i - 1].get("bbox")
        curr_b = lines_info[i].get("bounding_box") or lines_info[i].get("bbox")
        gap = curr_b["y"] - (prev_b["y"] + (prev_b.get("height") or prev_b.get("h")))
        if gap > 0:
            vertical_gaps.append(gap)

    med_gap = float(np.median(vertical_gaps)) if vertical_gaps else 0.0
    avg_h = float(np.mean(line_heights)) if line_heights else 30.0
    gap_ratio = (med_gap / max(avg_h, 1.0)) if vertical_gaps else 1.0

    if gap_ratio < 0.6:
        spacing_desc = f"compact_line_spacing ({med_gap:.1f}px, ratio: {gap_ratio:.2f})"
    elif gap_ratio > 1.8:
        spacing_desc = f"wide_line_spacing ({med_gap:.1f}px, ratio: {gap_ratio:.2f})"
    else:
        spacing_desc = f"moderate_line_spacing ({med_gap:.1f}px, ratio: {gap_ratio:.2f})"

    # 4. Writing Density
    density_pct = (ink_pixels_total / max(box_area_total, 1)) * 100.0
    if density_pct > 22.0:
        density_desc = f"high_density ({density_pct:.1f}% occupied)"
    elif density_pct < 10.0:
        density_desc = f"light_density ({density_pct:.1f}% occupied)"
    else:
        density_desc = f"moderate_density ({density_pct:.1f}% occupied)"

    # 5. Letter Height & Line Length
    med_line_h = float(np.median(line_heights)) if line_heights else 0.0
    avg_line_w = float(np.mean(line_widths)) if line_widths else 0.0
    w_pct = (avg_line_w / max(img_w, 1)) * 100.0

    # 6. Margins
    min_left = int(min(left_margins)) if left_margins else 0
    margin_std = float(np.std(left_margins)) if left_margins else 0.0

    # 7. Writing Consistency (CV = std / mean of height, spacing, slant)
    h_cv = (float(np.std(line_heights)) / max(avg_h, 1.0)) if line_heights else 0.0
    gap_cv = (float(np.std(vertical_gaps)) / max(med_gap, 1.0)) if vertical_gaps else 0.0
    combined_cv = (h_cv + gap_cv) / 2.0

    if combined_cv < 0.25:
        consistency_desc = f"high_consistency (CV: {combined_cv:.2f})"
    elif combined_cv < 0.50:
        consistency_desc = f"moderate_consistency (CV: {combined_cv:.2f})"
    else:
        consistency_desc = f"variable_spacing_height (CV: {combined_cv:.2f})"

    med_char_sp = float(np.median(char_spacings)) if char_spacings else 0.0
    med_word_sp = float(np.median(word_spacings)) if word_spacings else 0.0

    return {
        "slant": slant_desc,
        "baseline": baseline_desc,
        "line_spacing": spacing_desc,
        "writing_density": density_desc,
        "average_line_height": f"{med_line_h:.1f}px",
        "average_line_length": f"{avg_line_w:.1f}px ({w_pct:.1f}% page width)",
        "consistency": consistency_desc,
        "raw_metrics": {
            "median_slant_degrees": round(med_slant, 2),
            "median_baseline_slope": round(med_slope, 4),
            "median_line_spacing_px": round(med_gap, 1),
            "writing_density_percent": round(density_pct, 1),
            "median_line_height_px": round(med_line_h, 1),
            "average_line_width_px": round(avg_line_w, 1),
            "median_char_spacing_px": round(med_char_sp, 1),
            "median_word_spacing_px": round(med_word_sp, 1),
            "left_margin_px": min_left,
            "left_margin_variation_std": round(margin_std, 1),
            "consistency_cv": round(combined_cv, 2)
        }
    }
