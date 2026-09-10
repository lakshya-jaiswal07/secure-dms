import os
import sys
import hashlib
import shutil
import json
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import pypdfium2 as pdfium

# Enforce UTF-8 encoding across Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Import core analyzer pipeline and report generators
from analyze import analyze_handwriting_document
from text_analyzer import analyze_text
from report_generator import generate_html_report, generate_text_report

app = FastAPI(
    title="Secure DMS: Handwriting Analyzer API",
    description="Production REST API for handwriting OCR, ruling suppression, document quality, text analysis, and handwriting biometric feature extraction. Supports single images and multi-page PDFs.",
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup persistent storage directories
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mount outputs directory so frontend can access reports, previews, and line crops
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")


@app.get("/health")
def health_check():
    """Service health and readiness probe."""
    return {
        "status": "healthy",
        "service": "Secure DMS Handwriting Analyzer",
        "version": "1.1.0",
        "pdf_support": True
    }


def process_image_document(
    image_path: str,
    original_filename: str,
    doc_id: str,
    sha256_hash: str,
    file_size: int,
    debug: bool
):
    """Executes the analysis pipeline on a single image document."""
    result = analyze_handwriting_document(
        image_name=image_path,
        is_debug=debug,
        outputs_dir=OUTPUT_DIR
    )

    # Ensure document metadata matches original upload
    result["document_id"] = doc_id
    result["input"] = {
        "original_filename": original_filename,
        "saved_path": image_path,
        "sha256": sha256_hash,
        "size_bytes": file_size,
        "file_type": "image",
        "total_pages": 1
    }
    result["total_pages"] = 1

    # Preserve page numbers on each line
    for l in result.get("lines", []):
        if "page_number" not in l:
            l["page_number"] = 1
        if "page_line_number" not in l:
            l["page_line_number"] = l.get("line_number", 1)

    result["pages"] = [
        {
            "page_number": 1,
            "document_quality": result.get("document_quality", {}),
            "line_count": len(result.get("lines", [])),
            "full_text": result.get("full_text", ""),
            "handwriting_features": result.get("handwriting_features", {})
        }
    ]

    return JSONResponse(status_code=200, content=result)


def process_pdf_document(
    pdf_path: str,
    original_filename: str,
    doc_id: str,
    sha256_hash: str,
    file_size: int,
    debug: bool
):
    """
    Renders every page of a PDF document to an image, executes the analyzer
    pipeline on each page, and merges the results into a unified structured JSON response.
    """
    try:
      pdf = pdfium.PdfDocument(pdf_path)
      num_pages = len(pdf)
    except Exception as e:
      raise HTTPException(
          status_code=400, detail=f"Failed to open PDF document: {str(e)}"
      )

    if num_pages == 0:
      pdf.close()
      raise HTTPException(
          status_code=400, detail="The uploaded PDF document contains no pages."
      )

    all_pages_summary = []
    all_lines = []
    page_texts = []
    all_warnings = []
    global_lines_dir = os.path.join(OUTPUT_DIR, "lines")
    os.makedirs(global_lines_dir, exist_ok=True)
    global_line_counter = 1

    for page_idx in range(num_pages):
      page_num = page_idx + 1
      page = pdf[page_idx]

      # Determine optimal scale factor so rendered page preserves the effective
      # resolution and appearance of standard handwriting documents (max dimension ~1600px).
      # E.g. for a 900x1600 image-embedded page, scale is 1.0 (exact original PNG resolution).
      # For standard A4 (595x842 pt), scale is ~1.9 (1130x1600 px).
      page_w = page.get_width()
      page_h = page.get_height()
      max_page_dim = max(page_w, page_h)
      TARGET_MAX_DIM = 1600.0
      scale = (TARGET_MAX_DIM / max_page_dim) if max_page_dim > 0 else 1.0

      # Render PDF page to PIL Image at calibrated resolution
      page_pil = page.render(scale=scale).to_pil()

      # Save rendered page image into UPLOAD_DIR
      page_img_filename = f"{doc_id}_page_{page_num}.png"
      page_img_path = os.path.join(UPLOAD_DIR, page_img_filename)
      page_pil.save(page_img_path, format="PNG")

      # Page-specific outputs folder
      page_out_dir = (
          os.path.join(OUTPUT_DIR, f"page_{page_num}")
          if num_pages > 1
          else OUTPUT_DIR
      )
      os.makedirs(page_out_dir, exist_ok=True)

      print(
          f"\n[PDF Ingestion] Processing page {page_num}/{num_pages} for"
          f" document {doc_id}..."
      )

      page_result = analyze_handwriting_document(
          image_name=page_img_path, is_debug=debug, outputs_dir=page_out_dir
      )

      page_lines = page_result.get("lines", [])
      page_lines_dir = os.path.join(page_out_dir, "lines")

      for l in page_lines:
        line_entry = dict(l)
        line_entry["page_number"] = page_num
        line_entry["page_line_number"] = l.get("line_number", 0)
        line_entry["line_number"] = global_line_counter

        # Copy line crop to global outputs/lines/ as line_{global_line_counter:03d}.png
        src_crop = os.path.join(
            page_lines_dir, f"line_{l.get('line_number', 0):03d}.png"
        )
        dst_crop = os.path.join(
            global_lines_dir, f"line_{global_line_counter:03d}.png"
        )
        if os.path.exists(src_crop) and src_crop != dst_crop:
          try:
            shutil.copyfile(src_crop, dst_crop)
          except Exception:
            pass

        global_line_counter += 1
        all_lines.append(line_entry)

      p_text = page_result.get("full_text", "").strip()
      if p_text:
        page_texts.append(p_text)

      all_pages_summary.append({
          "page_number": page_num,
          "line_count": len(page_lines),
          "document_quality": page_result.get("document_quality", {}),
          "full_text": p_text,
          "handwriting_features": page_result.get("handwriting_features", {}),
      })

      for w in page_result.get("warnings", []):
        if w not in all_warnings:
          all_warnings.append(w)

    pdf.close()

    # Combine text across all pages
    combined_full_text = "\n\n".join(page_texts)

    # Re-run text analyzer over combined document text
    combined_text_analysis = analyze_text(combined_full_text)

    # Assemble final unified payload
    combined_payload = {
        "success": True,
        "document_id": doc_id,
        "input": {
            "original_filename": original_filename,
            "saved_path": pdf_path,
            "sha256": sha256_hash,
            "size_bytes": file_size,
            "file_type": "pdf",
            "total_pages": num_pages,
        },
        "total_pages": num_pages,
        "pages": all_pages_summary,
        "document_quality": (
            all_pages_summary[0]["document_quality"]
            if all_pages_summary
            else {}
        ),
        "lines": all_lines,
        "full_text": combined_full_text,
        "text_analysis": combined_text_analysis,
        "handwriting_features": (
            all_pages_summary[0]["handwriting_features"]
            if all_pages_summary
            else {}
        ),
        "warnings": all_warnings,
    }

    # Save combined result.json to outputs/
    out_json = os.path.join(OUTPUT_DIR, "result.json")
    with open(out_json, "w", encoding="utf-8") as f:
      json.dump(combined_payload, f, indent=2, ensure_ascii=False)

    # Generate unified HTML and text reports for the multi-page PDF
    try:
      generate_html_report(
          combined_payload,
          output_html_path=os.path.join(OUTPUT_DIR, "analysis_report.html"),
          lines_dir=global_lines_dir,
      )
      generate_text_report(
          combined_payload,
          output_txt_path=os.path.join(OUTPUT_DIR, "analysis_report.txt"),
      )
    except Exception as e:
      print(f"[Warning] Failed to generate combined PDF report: {e}")

    return JSONResponse(status_code=200, content=combined_payload)


@app.post("/analyze-handwriting")
async def analyze_handwriting_endpoint(
    file: UploadFile = File(
        ...,
        description=(
            "Uploaded document image (PNG, JPG, JPEG, TIFF, BMP) or PDF"
            " document"
        ),
    ),
    debug: bool = Query(
        False, description="Enable debug artifact generation"
    ),
):
  """Ingests and analyzes a handwritten document (single image or multi-page

  PDF): 1. Preserves original uploaded file byte-for-byte in secure storage 2.
  Calculates SHA-256 cryptographic digest 3. If PDF, converts each page to image
  and processes sequentially 4. Normalizes illumination and corrects skew 5.
  Detects lines and suppresses notebook ruling lines seamlessly 6. Runs TrOCR
  handwriting recognition with natural chunking 7. Extracts NLP entities,
  readability metrics, and handwriting biometric features 8. Combines all pages
  into one structured JSON response with page-numbered lines
  """
  if not file.filename:
    raise HTTPException(status_code=400, detail="No file uploaded.")

  # 1. Read raw uploaded bytes without modification
  content = await file.read()
  if not content or len(content) == 0:
    raise HTTPException(status_code=400, detail="Uploaded file is empty.")

  # 2. Calculate cryptographic SHA-256 hash of original file
  sha256_hash = hashlib.sha256(content).hexdigest()
  doc_id = f"DOC-{sha256_hash[:8].upper()}"

  # 3. Determine if file is PDF or image
  ext = os.path.splitext(file.filename)[1].lower()
  is_pdf = (
      ext == ".pdf"
      or content.startswith(b"%PDF-")
      or file.content_type == "application/pdf"
  )

  if not ext:
    ext = ".pdf" if is_pdf else ".png"

  safe_filename = f"{doc_id}_{os.path.basename(file.filename)}"
  saved_path = os.path.join(UPLOAD_DIR, safe_filename)

  with open(saved_path, "wb") as f:
    f.write(content)

  # 4. Route to PDF or Image processor
  if is_pdf:
    try:
      return process_pdf_document(
          pdf_path=saved_path,
          original_filename=file.filename,
          doc_id=doc_id,
          sha256_hash=sha256_hash,
          file_size=len(content),
          debug=debug,
      )
    except HTTPException:
      raise
    except Exception as e:
      raise HTTPException(
          status_code=500, detail=f"PDF analysis pipeline error: {str(e)}"
      )
  else:
    try:
      return process_image_document(
          image_path=saved_path,
          original_filename=file.filename,
          doc_id=doc_id,
          sha256_hash=sha256_hash,
          file_size=len(content),
          debug=debug,
      )
    except HTTPException:
      raise
    except Exception as e:
      raise HTTPException(
          status_code=500, detail=f"Analysis pipeline error: {str(e)}"
      )


if __name__ == "__main__":
  import uvicorn

  port = int(os.environ.get("PORT", 8000))
  print(
      f"Starting Secure DMS Handwriting Analyzer API on http://0.0.0.0:{port}..."
  )
  uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
