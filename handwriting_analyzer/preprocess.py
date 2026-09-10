import cv2
import numpy as np
import sys
import os

# Enforce UTF-8 encoding across Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def detect_skew_angle(gray_image, min_lines=8, max_std=3.5, max_angle=15.0):
    """
    Estimates dominant document skew angle using Hough line detection.
    Returns (angle_in_degrees, is_confident).
    If angle estimation is uncertain, returns (0.0, False) to prevent forced distortion.
    """
    edges = cv2.Canny(gray_image, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=80, maxLineGap=20)
    
    if lines is None:
        return 0.0, False
        
    angles = []
    for l in lines:
        x1, y1, x2, y2 = l[0] if len(l.shape) > 1 else l
        deg = float(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
        if abs(deg) <= max_angle:
            angles.append(deg)
            
    if len(angles) < min_lines:
        return 0.0, False
        
    std_dev = float(np.std(angles))
    if std_dev > max_std:
        # High angular dispersion -> uncertain rotation
        return 0.0, False
        
    median_angle = float(np.median(angles))
    if abs(median_angle) < 0.4:
        # Already reasonably straight
        return 0.0, True
        
    return median_angle, True


def assess_document_quality(image, skew_angle=0.0):
    """
    Measures objective document quality metrics:
    - Blur estimate via Laplacian variance
    - RMS contrast
    - Mean brightness
    - Skew angle in degrees
    - Generates user-facing warnings for quality defects
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Laplacian variance for focus / blur
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if laplacian_var >= 200.0:
        blur_status = "SHARP"
    elif laplacian_var >= 80.0:
        blur_status = "MODERATE"
    else:
        blur_status = "BLURRY"

    # Contrast via standard deviation of luminance
    contrast_val = float(np.std(gray))
    if contrast_val >= 35.0:
        contrast_status = "GOOD"
    elif contrast_val >= 20.0:
        contrast_status = "MODERATE"
    else:
        contrast_status = "LOW"

    # Brightness via mean luminance
    brightness_val = float(np.mean(gray))
    if 110.0 <= brightness_val <= 215.0:
        brightness_status = "NORMAL"
    elif brightness_val > 215.0:
        brightness_status = "BRIGHT"
    else:
        brightness_status = "DARK"

    # Warnings generation
    warnings = []
    if blur_status == "BLURRY":
        warnings.append("Image may be too blurry for reliable OCR (low Laplacian variance).")
    if contrast_status == "LOW":
        warnings.append("Low contrast detected; faint handwriting strokes may be missed.")
    if abs(skew_angle) > 5.0:
        warnings.append(f"Noticeable page rotation detected ({skew_angle:+.1f}°).")
    if brightness_status == "DARK":
        warnings.append("Image is underexposed/dark; shadows may interfere with line detection.")

    return {
        "blur": f"{blur_status} (variance: {laplacian_var:.1f})",
        "contrast": f"{contrast_status} (rms: {contrast_val:.1f})",
        "brightness": f"{brightness_status} (mean: {brightness_val:.1f})",
        "skew_angle": f"{skew_angle:+.2f}°",
        "raw_metrics": {
            "laplacian_variance": round(laplacian_var, 2),
            "contrast_rms": round(contrast_val, 2),
            "mean_brightness": round(brightness_val, 2),
            "skew_degrees": round(skew_angle, 2),
            "blur_status": blur_status,
            "contrast_status": contrast_status,
            "brightness_status": brightness_status,
        },
        "warnings": warnings,
    }


def deskew_image(image, angle):
    """Rotates image around center to correct skew without cropping corners."""
    if abs(angle) < 0.4:
        return image
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated


def preprocess_document(image_path, output_path="preprocessed.png", debug_path=None, debug_dir=None):
    """
    Complete robust document preprocessing pipeline:
    1. Loads input image and validates format
    2. Performs gentle noise reduction
    3. Detects skew and deskews only when confident
    4. Computes objective document quality metrics
    5. Normalizes non-uniform illumination and enhances contrast via CLAHE
    6. Saves preprocessed image, debug montage, and debug artifacts (original.png, grayscale.png)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Input image not found: {image_path}")

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not decode image: {image_path}")

    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image.copy()

    # 1. Gentle noise reduction before orientation detection
    smoothed = cv2.GaussianBlur(gray, (3, 3), 0)

    # 2. Skew detection
    skew_angle, confident = detect_skew_angle(smoothed)
    if confident and abs(skew_angle) >= 0.4:
        working_img = deskew_image(image, skew_angle)
        working_gray = cv2.cvtColor(working_img, cv2.COLOR_BGR2GRAY) if len(working_img.shape) == 3 else working_img.copy()
    else:
        skew_angle = 0.0
        working_img = image.copy()
        working_gray = gray.copy()

    # 3. Assess document quality
    quality_report = assess_document_quality(working_gray, skew_angle)

    # 4. Illumination normalization & contrast enhancement
    bg = cv2.morphologyEx(working_gray, cv2.MORPH_DILATE, np.ones((15, 15), np.uint8))
    bg = cv2.medianBlur(bg, 21)
    norm = np.clip(
        (working_gray.astype(np.float32) / np.maximum(bg.astype(np.float32), 1.0)) * 255.0,
        0,
        255,
    ).astype(np.uint8)

    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    preprocessed = clahe.apply(norm)

    # Save output
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    cv2.imwrite(output_path, preprocessed)

    # 5. Debug outputs
    if debug_dir:
        os.makedirs(debug_dir, exist_ok=True)
        cv2.imwrite(os.path.join(debug_dir, "original.png"), working_img)
        cv2.imwrite(os.path.join(debug_dir, "grayscale.png"), preprocessed)

    if debug_path:
        dbg_dir = os.path.dirname(os.path.abspath(debug_path))
        if dbg_dir:
            os.makedirs(dbg_dir, exist_ok=True)
        orig_small = cv2.resize(gray, (w // 2, h // 2))
        norm_small = cv2.resize(norm, (w // 2, h // 2))
        prep_small = cv2.resize(preprocessed, (w // 2, h // 2))
        bg_small = cv2.resize(bg, (w // 2, h // 2))
        top_row = np.hstack([orig_small, bg_small])
        bot_row = np.hstack([norm_small, prep_small])
        debug_montage = np.vstack([top_row, bot_row])
        cv2.imwrite(debug_path, debug_montage)

    return working_img, preprocessed, quality_report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python preprocess.py <image_path> [--debug]")
        sys.exit(1)

    img_arg = sys.argv[1]
    is_debug = "--debug" in sys.argv
    dbg_file = "preprocessing_debug.png" if is_debug else None

    try:
        _, prep_img, q_info = preprocess_document(img_arg, "preprocessed.png", dbg_file)
        print(f"Pre-processing document: {img_arg} ({prep_img.shape[1]}x{prep_img.shape[0]})")
        print(f"Quality: Blur={q_info['blur']}, Contrast={q_info['contrast']}, Skew={q_info['skew_angle']}")
        if q_info["warnings"]:
            print(f"Warnings: {len(q_info['warnings'])} detected")
        print("Preprocessing complete -> preprocessed.png")
        if dbg_file:
            print(f"Debug montage saved -> {dbg_file}")
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        sys.exit(1)