import cv2
import numpy as np


# ==========================================
# 1. LOAD IMAGE
# ==========================================

image = cv2.imread("preprocessed.png")

if image is None:
    print("Could not load preprocessed.png")
    exit()

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


# ==========================================
# 2. CREATE BINARY IMAGE
# ==========================================

# Dark pixels -> white
_, binary = cv2.threshold(
    gray,
    150,
    255,
    cv2.THRESH_BINARY_INV
)


# ==========================================
# 3. DETECT AND REMOVE HORIZONTAL LINES
# ==========================================

horizontal_kernel = cv2.getStructuringElement(
    cv2.MORPH_RECT,
    (150, 5)
)

horizontal_lines = cv2.morphologyEx(
    binary,
    cv2.MORPH_OPEN,
    horizontal_kernel
)

# Remove notebook lines
text_only = cv2.subtract(
    binary,
    horizontal_lines
)


# ==========================================
# 4. REMOVE SMALL NOISE
# ==========================================

kernel = cv2.getStructuringElement(
    cv2.MORPH_RECT,
    (2, 2)
)

text_only = cv2.morphologyEx(
    text_only,
    cv2.MORPH_OPEN,
    kernel
)


# ==========================================
# 5. CALCULATE PIXELS IN EACH ROW
# ==========================================

row_pixels = np.sum(
    text_only > 0,
    axis=1
)


# ==========================================
# 6. FIND ROWS CONTAINING TEXT
# ==========================================

# Ignore rows with only a tiny amount of noise
threshold = 5

text_rows = row_pixels > threshold


# ==========================================
# 7. FIND CONTINUOUS TEXT REGIONS
# ==========================================

regions = []

start = None

for i in range(len(text_rows)):

    if text_rows[i] and start is None:
        start = i

    elif not text_rows[i] and start is not None:

        if i - start >= 5:
            regions.append((start, i))

        start = None


# Handle region reaching bottom
if start is not None:
    regions.append((start, len(text_rows)))


print("Detected regions:")
print(regions)


# ==========================================
# 8. SELECT TEXT REGION
# ==========================================

if not regions:
    print("No handwriting detected.")
    exit()


# Find the largest meaningful region
y1, y2 = max(
    regions,
    key=lambda r: r[1] - r[0]
)


# ==========================================
# 9. FIND LEFT AND RIGHT TEXT BOUNDARIES
# ==========================================

region = text_only[y1:y2, :]

column_pixels = np.sum(
    region > 0,
    axis=0
)

columns = column_pixels > 0

valid_columns = np.where(columns)[0]

if len(valid_columns) == 0:
    print("Could not determine text boundaries.")
    exit()

# Ignore objects very close to the image edges
edge_margin = 30

valid_columns = valid_columns[
    (valid_columns > edge_margin) &
    (valid_columns < image.shape[1] - edge_margin)
]

if len(valid_columns) == 0:
    print("Could not determine text boundaries after edge filtering.")
    exit()


x1 = valid_columns[0]
x2 = valid_columns[-1] + 1


# ==========================================
# 10. ADD VERY SMALL PADDING
# ==========================================

padding_x = 8
padding_y = 8

x1 = max(0, x1 - padding_x)
x2 = min(image.shape[1], x2 + padding_x)

y1 = max(0, y1 - padding_y)
y2 = min(image.shape[0], y2 + padding_y)


# ==========================================
# 11. CROP ONLY HANDWRITING
# ==========================================

cropped = text_only[
    y1:y2,
    x1:x2
]

# ==========================================
# 11A. REMOVE REMAINING HORIZONTAL ARTIFACTS
# ==========================================

# Find horizontal structures inside the cropped image
horizontal_kernel = cv2.getStructuringElement(
    cv2.MORPH_RECT,
    (80, 1)
)

horizontal_artifacts = cv2.morphologyEx(
    cropped,
    cv2.MORPH_OPEN,
    horizontal_kernel
)

cropped = cv2.subtract(
    cropped,
    horizontal_artifacts
)
# ==========================================
# 11A. REMOVE LONG THIN HORIZONTAL LINES
# ==========================================

num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
    cropped,
    connectivity=8
)

cleaned = np.zeros_like(cropped)

for i in range(1, num_labels):

    x, y, w, h, area = stats[i]

    # Keep handwriting
    # Remove very long and very thin components
    if w > 100 and h <= 5:
        continue

    cleaned[labels == i] = 255

cropped = cleaned
# ==========================================
# 11B. TIGHT CROP AROUND HANDWRITING
# ==========================================

points = cv2.findNonZero(cropped)

if points is not None:
    tx, ty, tw, th = cv2.boundingRect(points)

    padding = 10

    tx = max(0, tx - padding)
    ty = max(0, ty - padding)
    tw = min(cropped.shape[1] - tx, tw + 2 * padding)
    th = min(cropped.shape[0] - ty, th + 2 * padding)

    cropped = cropped[
        ty:ty + th,
        tx:tx + tw
    ]

# ==========================================
# 11C. CONVERT TO BLACK TEXT ON WHITE
# ==========================================

cropped = cv2.bitwise_not(cropped)

# ==========================================
# 12. SAVE
# ==========================================

cv2.imwrite(
    "line_001.png",
    cropped
)


print()
print("===================================")
print("HANDWRITING DETECTED")
print("===================================")
print(f"Bounding box: ({x1}, {y1}) -> ({x2}, {y2})")
print("Saved as line_001.png")