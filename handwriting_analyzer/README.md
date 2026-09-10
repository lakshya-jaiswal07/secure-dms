# Secure DMS — Handwriting Analyzer Backend

A production-ready, computer-vision and transformer-based handwriting recognition, document analysis, and ingestion backend module developed for the **Secure Digital Document Management System (Secure DMS) / Smart India Hackathon (SIH) 2026**.

This module is designed to run as a **standalone Python backend service** or CLI utility. It provides a RESTful API powered by FastAPI that accepts photographed or scanned handwritten notebook pages (both **single image files** and **multi-page PDF documents**), normalizes illumination, detects and suppresses horizontal notebook ruling lines, segments lines with zero-overlap bounding limits, transcribes handwritten text using Microsoft TrOCR, extracts factual DMS entities, and computes objective geometric handwriting biometric features.

---

## Table of Contents
- [Project Purpose](#project-purpose)
- [Architecture & Pipeline](#architecture--pipeline)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [How to Run the CLI Analyzer](#how-to-run-the-cli-analyzer)
- [How to Start the FastAPI Server](#how-to-start-the-fastapi-server)
- [API Reference](#api-reference)
  - [`GET /health`](#get-health)
  - [`POST /analyze-handwriting`](#post-analyze-handwriting)
- [Example JSON Response (Multi-Page PDF)](#example-json-response-multi-page-pdf)
- [Frontend Integration Guide (React / Next.js / TypeScript)](#frontend-integration-guide-react--nextjs--typescript)
- [Static Output Assets](#static-output-assets)
- [Verification & Testing](#verification--testing)

---

## Project Purpose

Handwritten documents (field notes, logbooks, meeting records, academic notes, multi-page notebook scans, legal filings) present significant challenges for standard OCR engines:
- Non-uniform lighting and shadows from mobile camera captures.
- High-contrast horizontal ruled notebook lines that overlap and intersect character strokes.
- Multi-page documents packaged as PDF files requiring automated per-page extraction and sequential consolidation.
- Irregular line spacing, variable slant angles, and meandering baselines.

The **Secure DMS Handwriting Analyzer** solves these problems by providing:
1. **Universal Ingestion**: Seamlessly accepts image uploads (`PNG`, `JPG`, `JPEG`, `TIFF`, `BMP`) as well as multi-page `PDF` documents.
2. **Adaptive Preprocessing**: Illumination division normalization and skew correction.
3. **Ruling Line Suppression**: Stroke-preserving morphological filtering and inpainting to remove notebook ruling without breaking character strokes.
4. **Robust Multi-Line Segmentation**: Peak-valley profile analysis with dynamic ascender/descender clustering and lateral padding.
5. **TrOCR Recognition**: Microsoft's `microsoft/trocr-base-handwritten` Vision-Encoder-Decoder model with natural gap-based chunking for long lines and DMS vocabulary contextual post-processing.
6. **Multi-Page Preservation**: Retains exact PDF page numbers (`page_number`) and page-relative line numbers (`page_line_number`) on every segmented line.
7. **DMS Metadata & Entity Extraction**: Factual dates, names, keywords, and document statistics without hallucination.
8. **Objective Handwriting Features**: Pure geometric analysis (slant angle, baseline drift, density, line spacing, consistency) for document verification and forensic profiling.

---

## Architecture & Pipeline

The pipeline processes input documents through seven distinct stages:

```
          INPUT DOCUMENT (PNG, JPG, JPEG, TIFF OR MULTI-PAGE PDF)
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 0. PDF Multi-Page Deconstruction (pypdfium2)                  │
     │    - Automatically detects PDF format and extracts all pages  │
     │    - High-fidelity rasterization (scale=2.0, ~144 DPI)        │
     │    - Dispatches each page image through Stages 1-6            │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 1. Preprocessing & Quality Assessment (preprocess.py)         │
     │    - Background division & illumination normalization         │
     │    - Hough transform deskew (±15° safe correction)            │
     │    - Laplacian blur scoring, RMS contrast, brightness stats   │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 2. Ruled-Line Suppression & Line Detection                    │
     │    (multi_line_segment.py)                                    │
     │    - Morphological horizontal line kernel detection           │
     │    - Stroke-preserving mask generation & inpainting           │
     │    - Vertical ink projection profile & valley peak isolation  │
     │    - Dynamic connected-component ascender/descender merging   │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 3. Adaptive Line Crop Extraction                              │
     │    - Zero-overlap midpoint valley boundaries                  │
     │    - Adaptive lateral horizontal padding (18px)               │
     │    - Cleaned stroke crops sent to OCR                         │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 4. Deep Learning Handwriting Recognition (recognizer.py)      │
     │    - Microsoft TrOCR (`microsoft/trocr-base-handwritten`)     │
     │    - Natural word-gap chunking (>500px wide lines)            │
     │    - Softmax token confidence calculation                     │
     │    - Safe context-aware vocabulary post-processing            │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 5. DMS Metadata & Entity Extraction (text_analyzer.py)        │
     │    - Regex & rule-based extraction (dates, names, orgs)       │
     │    - Word count, character count, keyword indexing            │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 6. Geometric Handwriting Feature Extraction                   │
     │    (handwriting_features.py)                                  │
     │    - Slant angle calculation (vertical stroke PCA/moments)    │
     │    - Baseline regression slope & curvature                    │
     │    - Spacing ratios, ink density, handwriting consistency     │
     └───────────────────────────────┬───────────────────────────────┘
                                     │
                                     ▼
     ┌───────────────────────────────────────────────────────────────┐
     │ 7. Multi-Page Aggregation & Output Generation (server.py)     │
     │    - Unified structured JSON with page numbers on each line   │
     │    - Document-wide full text & aggregated DMS entity index    │
     │    - Interactive HTML visual audit report                     │
     │    - Annotated bounding box previews & line crop repository   │
     └───────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
handwriting_analyzer/
├── .gitignore               # Git ignore rules (venv, uploads, outputs, pycache)
├── requirements.txt         # Pinned Python package dependencies (including pypdfium2)
├── README.md                # Complete documentation and developer integration guide
├── example_result.json      # Reference JSON payload for frontend developers
│
├── analyze.py               # Core orchestrator and CLI entry point
├── server.py                # FastAPI REST API application with PDF and Image handling
│
├── preprocess.py            # Phase 1: Illumination normalization, blur scoring, deskew
├── multi_line_segment.py    # Phase 2 & 3: Ruled-line suppression & handwriting segmentation
├── recognizer.py            # Phase 4: TrOCR recognition, line chunking, post-processing
├── text_analyzer.py         # Phase 5: Text statistics & factual entity extraction
├── handwriting_features.py  # Phase 6: Geometric handwriting features & metrics
├── report_generator.py      # Phase 7: Interactive HTML dashboard & text report generation
├── line_segment.py          # Legacy single-line segmenter (fallback)
│
├── handwritten_test.png     # Test sample 1: Single-line document
├── test_multiline.png       # Test sample 2: Multi-line notebook page (Java code)
├── test_multipage.pdf       # Test sample 3: Multi-page handwritten PDF document
├── new_pic.png              # Test sample 4: Multi-line polynomial logic
├── new_pic2.png             # Test sample 5: Supplementary multi-line sample
│
├── uploads/                 # Storage for incoming uploaded documents (.gitkeep)
└── outputs/                 # Storage for generated reports, crops, previews (.gitkeep)
```

---

## Dependencies

The module requires **Python 3.10+** and the following primary libraries:

| Dependency | Minimum Version | Purpose |
| :--- | :--- | :--- |
| `fastapi` | `0.100.0` | High-performance asynchronous REST API framework |
| `uvicorn[standard]` | `0.22.0` | Production ASGI web server |
| `python-multipart` | `0.0.6` | Multipart form-data streaming file uploads |
| `pypdfium2` | `4.0.0` | High-speed PDF page rasterization and rendering (no poppler required) |
| `opencv-python` | `4.8.0` | Image processing, morphological filtering, CLAHE, contours |
| `numpy` | `1.24.0` | Matrix operations, projection profiles, numerical stats |
| `pillow` | `9.5.0` | High-resolution image manipulation and format conversions |
| `torch` | `2.0.0` | PyTorch runtime (supports CPU and CUDA hardware acceleration) |
| `torchvision` | `0.15.0` | Computer vision transformations for deep learning |
| `transformers` | `4.30.0` | Hugging Face Transformers for Microsoft TrOCR inference |
| `requests` | `2.28.0` | Hugging Face weight acquisition and HTTP utilities |

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository_url>
cd handwriting_analyzer
```

### 2. Create a Python Virtual Environment
**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Upgrade Pip and Install Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> **GPU Acceleration (Optional but Recommended)**:
> If an NVIDIA GPU is available, install CUDA-enabled PyTorch by following the instructions at [pytorch.org](https://pytorch.org/get-started/locally/). The codebase automatically detects and uses CUDA if present; otherwise, it runs seamlessly on CPU.

---

## How to Run the CLI Analyzer

The standalone CLI tool processes any image and writes all outputs to `outputs/`:

### Syntax
```bash
python analyze.py <path_to_image> [--debug]
```

### Examples
**Standard Run (Multi-line document):**
```bash
python analyze.py test_multiline.png
```

**Run with Debug Visualizations:**
```bash
python analyze.py test_multiline.png --debug
```

**Single-Line Document:**
```bash
python analyze.py handwritten_test.png
```

---

## How to Start the FastAPI Server

The FastAPI server provides HTTP endpoints for frontend applications with full support for both image files and multi-page PDFs.

### Option 1: Direct Python Execution
```bash
python server.py
```
*Listens on `http://0.0.0.0:8000` by default (or respects `$PORT`).*

### Option 2: Production Uvicorn CLI
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 1
```

### Interactive API Documentation
Once started, open your browser to access interactive OpenAPI documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Reference

### `GET /health`
Liveness and readiness health probe.

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "service": "Secure DMS Handwriting Analyzer",
  "version": "1.1.0",
  "pdf_support": true
}
```

---

### `POST /analyze-handwriting`
Uploads and processes a handwritten document. **Accepts both single image files and multi-page PDF documents.**

#### Request
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `debug` (boolean, optional, default: `false`): Enable generation of debug visualization files in `outputs/debug/`.
- **Form Data Fields**:
  - `file`: Document file (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.tiff`, `.bmp`).

#### PDF Processing Workflow
When a PDF document is uploaded:
1. `pypdfium2` extracts and renders every page as a high-resolution image in memory.
2. The complete 7-stage analyzer pipeline runs on every individual page.
3. Every detected line preserves its `page_number` (1-indexed) and `page_line_number`.
4. All lines are indexed globally in sequential document order (`line_number` 1 to N).
5. The full transcription and DMS entities are unified across the entire document.
6. A single structured JSON response is returned.

---

#### Example 1: Uploading a Multi-Page PDF with cURL
```bash
curl -X POST "http://localhost:8000/analyze-handwriting" \
  -H "accept: application/json" \
  -F "file=@test_multipage.pdf"
```

#### Example 2: Uploading an Image with cURL
```bash
curl -X POST "http://localhost:8000/analyze-handwriting" \
  -H "accept: application/json" \
  -F "file=@handwritten_test.png"
```

#### Example 3: Python `requests` for PDF or Image
```python
import requests

url = "http://localhost:8000/analyze-handwriting"

# Uploading a multi-page PDF
with open("test_multipage.pdf", "rb") as f:
    files = {"file": ("test_multipage.pdf", f, "application/pdf")}
    response = requests.post(url, files=files)

data = response.json()
print("Document ID:", data["document_id"])
print("Total Pages:", data["total_pages"])
print("Total Lines:", len(data["lines"]))
for line in data["lines"][:5]:
    print(f"Page {line['page_number']} | Line {line['line_number']}: {line['text']}")
```

---

## Example JSON Response (Multi-Page PDF)

```json
{
  "success": true,
  "document_id": "DOC-309ACE20",
  "input": {
    "original_filename": "test_multipage.pdf",
    "saved_path": "uploads/DOC-309ACE20_test_multipage.pdf",
    "sha256": "309ace20067fffcba22904cb06ca096ffc70aa90cbb1d701f579340f1a92e104",
    "size_bytes": 213128,
    "file_type": "pdf",
    "total_pages": 2
  },
  "total_pages": 2,
  "pages": [
    {
      "page_number": 1,
      "line_count": 1,
      "document_quality": {
        "blur": "MODERATE (variance: 167.9)",
        "contrast": "MODERATE (rms: 21.1)",
        "brightness": "NORMAL (mean: 180.2)",
        "skew_angle": "-2.98°"
      },
      "full_text": "The Investigation started on monday.",
      "handwriting_features": {
        "slant": "vertical_neutral_slant (+0.0°)",
        "baseline": "relatively_stable_horizontal (slope: 0.014)",
        "line_spacing": "moderate_line_spacing (0.0px, ratio: 1.00)",
        "writing_density": "light_density (8.8% occupied)",
        "average_line_height": "75.0px",
        "average_line_length": "1509.0px (94.3% page width)",
        "consistency": "high_consistency (CV: 0.00)"
      }
    },
    {
      "page_number": 2,
      "line_count": 24,
      "document_quality": {
        "blur": "SHARP (variance: 201.0)",
        "contrast": "MODERATE (rms: 21.7)",
        "brightness": "NORMAL (mean: 172.6)",
        "skew_angle": "+2.94°"
      },
      "full_text": "class Student { ... }",
      "handwriting_features": {
        "slant": "vertical_neutral_slant (+0.0°)",
        "baseline": "relatively_stable_horizontal (slope: 0.000)",
        "line_spacing": "moderate_line_spacing (32.0px, ratio: 0.71)",
        "writing_density": "moderate_density (14.0% occupied)",
        "average_line_height": "45.5px",
        "average_line_length": "680.4px (75.6% page width)",
        "consistency": "variable_spacing_height (CV: 0.91)"
      }
    }
  ],
  "document_quality": {
    "blur": "MODERATE (variance: 167.9)",
    "contrast": "MODERATE (rms: 21.1)",
    "brightness": "NORMAL (mean: 180.2)",
    "skew_angle": "-2.98°"
  },
  "lines": [
    {
      "line_number": 1,
      "page_number": 1,
      "page_line_number": 1,
      "bounding_box": {
        "x": 91,
        "y": 75,
        "width": 1509,
        "height": 75
      },
      "crop_size": "1509x75",
      "ink_percentage": 12.6,
      "ruling_percentage": 0.2,
      "text": "The Investigation started on monday.",
      "model_confidence": 0.705,
      "confidence": 0.705,
      "status": "AUTO_ACCEPTED",
      "quality_flag": "CLEAN"
    },
    {
      "line_number": 2,
      "page_number": 2,
      "page_line_number": 1,
      "bounding_box": {
        "x": 0,
        "y": 217,
        "width": 873,
        "height": 39
      },
      "crop_size": "873x39",
      "ink_percentage": 14.1,
      "ruling_percentage": 0.0,
      "text": "2) Display Your Name",
      "model_confidence": 0.742,
      "confidence": 0.742,
      "status": "AUTO_ACCEPTED",
      "quality_flag": "CLEAN"
    }
  ],
  "full_text": "The Investigation started on monday.\n\n2) Display Your Name\nclass Student\n...",
  "text_analysis": {
    "word_count": 144,
    "character_count": 829,
    "dates": ["Monday"],
    "names": [],
    "locations": [],
    "organizations": [],
    "keywords": ["investigation", "started", "monday", "class", "student"]
  },
  "handwriting_features": {
    "slant": "vertical_neutral_slant (+0.0°)",
    "baseline": "relatively_stable_horizontal (slope: 0.014)",
    "line_spacing": "moderate_line_spacing (0.0px, ratio: 1.00)",
    "writing_density": "light_density (8.8% occupied)",
    "average_line_height": "75.0px",
    "average_line_length": "1509.0px (94.3% page width)",
    "consistency": "high_consistency (CV: 0.00)"
  },
  "warnings": []
}
```

---

## Frontend Integration Guide (React / Next.js / TypeScript)

The backend has CORS enabled (`allow_origins=["*"]`) out-of-the-box, allowing direct HTTP communication from any frontend development server (e.g., Vite on port 5173, Next.js on port 3000, Create-React-App on port 3000).

### 1. TypeScript Interfaces
Save these type definitions in your frontend application (e.g., `src/types/analyzer.ts`):

```typescript
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RecognizedLine {
  line_number: number;
  page_number: number;
  page_line_number: number;
  bounding_box: BoundingBox;
  crop_size: string;
  ink_percentage: number;
  ruling_percentage: number;
  text: string;
  model_confidence: number;
  confidence: number;
  status: 'AUTO_ACCEPTED' | 'NEEDS_REVIEW';
  quality_flag: string;
}

export interface DocumentQuality {
  blur: string;
  contrast: string;
  brightness: string;
  skew_angle: string;
}

export interface PageSummary {
  page_number: number;
  line_count: number;
  document_quality: DocumentQuality;
  full_text: string;
  handwriting_features: HandwritingFeatures;
}

export interface TextAnalysis {
  word_count: number;
  character_count: number;
  dates: string[];
  names: string[];
  locations: string[];
  organizations: string[];
  keywords: string[];
}

export interface HandwritingFeatures {
  slant: string;
  baseline: string;
  line_spacing: string;
  writing_density: string;
  average_line_height: string;
  average_line_length: string;
  consistency: string;
}

export interface AnalysisResponse {
  success: boolean;
  document_id: string;
  input: {
    original_filename: string;
    saved_path: string;
    sha256: string;
    size_bytes: number;
    file_type: 'image' | 'pdf';
    total_pages: number;
  };
  total_pages: number;
  pages: PageSummary[];
  document_quality: DocumentQuality;
  lines: RecognizedLine[];
  full_text: string;
  text_analysis: TextAnalysis;
  handwriting_features: HandwritingFeatures;
  warnings: string[];
}
```

---

### 2. Integration with native `fetch` (Supports PDF and Images)

```typescript
const API_BASE_URL = "http://localhost:8000";

export async function analyzeDocument(file: File, debug: boolean = false): Promise<AnalysisResponse> {
  const formData = new FormData();
  // Accepts image (image/png, image/jpeg) or PDF (application/pdf)
  formData.append("file", file);

  const endpoint = `${API_BASE_URL}/analyze-handwriting${debug ? "?debug=true" : ""}`;

  // IMPORTANT: Do NOT manually set Content-Type header.
  // The browser automatically sets multipart/form-data with the correct boundary.
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
  }

  return await response.json();
}
```

---

### 3. React Example Component Snippet with Multi-Page Filtering

```tsx
import React, { useState } from "react";
import { analyzeDocument, AnalysisResponse } from "./api";

export const HandwritingUploadWidget: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSelectedPage(1);

    try {
      const data = await analyzeDocument(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze document.");
    } finally {
      setLoading(false);
    }
  };

  const displayedLines = result
    ? result.lines.filter((l) => l.page_number === selectedPage)
    : [];

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Secure DMS — Handwriting Upload (Image or PDF)</h2>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        disabled={loading}
      />

      {loading && <p>Processing document (extracting pages, segmenting lines, running TrOCR)...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {result && (
        <div style={{ marginTop: "24px" }}>
          <h3>Document ID: {result.document_id}</h3>
          <p>
            <strong>File:</strong> {result.input.original_filename} ({result.input.file_type.toUpperCase()}) |{" "}
            <strong>Total Pages:</strong> {result.total_pages} |{" "}
            <strong>Total Lines:</strong> {result.lines.length}
          </p>

          {/* Page Selector Tabs for Multi-Page Documents */}
          {result.total_pages > 1 && (
            <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
              {Array.from({ length: result.total_pages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setSelectedPage(pg)}
                  style={{
                    padding: "6px 14px",
                    fontWeight: selectedPage === pg ? "bold" : "normal",
                    background: selectedPage === pg ? "#1976d2" : "#e0e0e0",
                    color: selectedPage === pg ? "#fff" : "#000",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Page {pg} ({result.lines.filter((l) => l.page_number === pg).length} lines)
                </button>
              ))}
            </div>
          )}

          <h4>Detected Lines for Page {selectedPage}:</h4>
          <ul>
            {displayedLines.map((line) => (
              <li key={line.line_number} style={{ marginBottom: "8px" }}>
                <strong>Line {line.line_number} (Page {line.page_number}, Line {line.page_line_number}):</strong>{" "}
                {line.text}{" "}
                <span style={{ fontSize: "12px", color: line.confidence >= 0.7 ? "green" : "orange" }}>
                  ({(line.confidence * 100).toFixed(1)}% conf)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## Static Output Assets

The FastAPI server mounts the `/outputs` directory as a static file server at `http://localhost:8000/outputs/`:

| URL Path | Asset Description |
| :--- | :--- |
| `http://localhost:8000/outputs/all_lines_preview.png` | Annotated image with green bounding boxes and line numbers |
| `http://localhost:8000/outputs/preprocessed.png` | Illumination-normalized and deskewed document |
| `http://localhost:8000/outputs/analysis_report.html` | Full interactive dashboard report |
| `http://localhost:8000/outputs/lines/line_001.png` | Individual cropped line images (globally indexed 1 to N) |
| `http://localhost:8000/outputs/page_1/lines/line_001.png` | Page-specific cropped line images |

Your frontend can directly render these static assets via `<img>` tags or `<iframe>` for embedded reports.

---

## Verification & Testing

Verify that your environment is properly set up by running the automated health and pipeline checks:

```powershell
# 1. Start the server
python server.py

# 2. In another terminal, test health probe
curl http://localhost:8000/health

# 3. Test analysis with single image
curl -X POST "http://localhost:8000/analyze-handwriting" -F "file=@handwritten_test.png"

# 4. Test analysis with multi-page PDF
curl -X POST "http://localhost:8000/analyze-handwriting" -F "file=@test_multipage.pdf"
```
