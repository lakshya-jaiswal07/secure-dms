import os
import json
import base64


def generate_html_report(result_payload, output_html_path="analysis_report.html", lines_dir="lines"):
    """
    Generates a standalone, dashboard-grade HTML analysis report with embedded
    document quality cards, visual line crops, transcribed text, entity badges,
    and geometric handwriting features.
    """
    inp = result_payload.get("input", {})
    quality = result_payload.get("document_quality", {})
    lines = result_payload.get("lines", [])
    full_text = result_payload.get("full_text", "")
    text_analysis = result_payload.get("text_analysis", {})
    hw_features = result_payload.get("handwriting_features", {})
    warnings = result_payload.get("warnings", [])
    doc_id = result_payload.get("document_id", "DOC-UNKNOWN")
    sha256 = inp.get("sha256", "N/A")
    filename = inp.get("filename", "unknown_image")

    # Status pill calculation
    avg_conf = 0.0
    if lines:
        valid_confs = [l["confidence"] for l in lines if l.get("confidence") is not None]
        avg_conf = (sum(valid_confs) / len(valid_confs)) if valid_confs else 0.0

    review_needed = any(l.get("status") == "NEEDS_REVIEW" for l in lines) or (avg_conf < 0.70)
    status_label = "NEEDS HUMAN REVIEW" if review_needed else "AUTO ACCEPTED"
    status_color = "#e65100" if review_needed else "#2e7d32"
    status_bg = "#fff3e0" if review_needed else "#e8f5e9"

    # Format entity tags
    def render_chips(items, color="#1976d2", bg="#e3f2fd"):
        if not items:
            return '<span class="empty-chip">None detected</span>'
        return "".join([f'<span class="chip" style="color:{color}; background:{bg};">{item}</span>' for item in items])

    # Build line rows with base64 embedded crops or relative links
    line_rows_html = []
    for l in lines:
        l_num = l.get("line_number")
        l_text = l.get("text", "")
        l_conf = l.get("confidence")
        conf_str = f"{l_conf * 100:.1f}%" if l_conf is not None else "N/A"
        bbox = l.get("bounding_box", {})
        bbox_str = f"({bbox.get('x', 0)}, {bbox.get('y', 0)}) {bbox.get('width', 0)}x{bbox.get('height', 0)}"

        # Line crop path
        crop_name = f"line_{l_num:03d}.png"
        crop_path = os.path.join(lines_dir, crop_name)

        img_tag = ""
        if os.path.exists(crop_path):
            try:
                with open(crop_path, "rb") as img_f:
                    b64 = base64.b64encode(img_f.read()).decode("utf-8")
                    img_tag = f'<img src="data:image/png;base64,{b64}" alt="Line {l_num}" class="line-crop-img"/>'
            except Exception:
                img_tag = f'<span class="crop-missing">{crop_name}</span>'
        else:
            img_tag = f'<span class="crop-missing">{crop_name}</span>'

        conf_class = "conf-high" if (l_conf or 0) >= 0.70 else "conf-low"

        line_rows_html.append(f"""
        <tr>
            <td class="line-no">Line {l_num}</td>
            <td class="crop-cell">{img_tag}</td>
            <td class="ocr-text">{l_text}</td>
            <td class="conf-cell"><span class="badge {conf_class}">{conf_str}</span></td>
            <td class="bbox-cell">{bbox_str}</td>
        </tr>
        """)

    lines_table_body = "\n".join(line_rows_html) if line_rows_html else '<tr><td colspan="5">No lines detected</td></tr>'

    warnings_html = ""
    if warnings:
        warn_items = "".join([f"<li>{w}</li>" for w in warnings])
        warnings_html = f"""
        <div class="card warning-card">
            <h3>Document Quality Warnings</h3>
            <ul>{warn_items}</ul>
        </div>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure DMS - Handwriting Analysis Report</title>
    <style>
        :root {{
            --primary: #1e3a8a;
            --primary-dark: #0f172a;
            --secondary: #0284c7;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --success: #16a34a;
            --warning: #d97706;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.5;
            padding: 24px;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        
        /* Header */
        .header {{
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            color: white;
            border-radius: 12px;
            padding: 24px 32px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }}
        .header-title h1 {{ font-size: 24px; font-weight: 700; margin-bottom: 4px; }}
        .header-title p {{ color: #cbd5e1; font-size: 13px; }}
        .hash-code {{ font-family: monospace; background: rgba(0,0,0,0.25); padding: 2px 8px; border-radius: 4px; }}
        .status-pill {{
            padding: 8px 16px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.5px;
            border: 2px solid currentColor;
            color: {status_color};
            background-color: {status_bg};
        }}

        /* Grid */
        .grid-2 {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }}
        .card {{
            background: var(--surface);
            border-radius: 12px;
            padding: 20px 24px;
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        .card h2 {{
            font-size: 16px;
            font-weight: 600;
            color: var(--primary);
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .warning-card {{
            border-left: 4px solid var(--warning);
            background: #fffbeb;
            margin-bottom: 24px;
        }}
        .warning-card h3 {{ color: #b45309; font-size: 15px; margin-bottom: 8px; }}
        .warning-card ul {{ padding-left: 20px; color: #92400e; font-size: 14px; }}

        /* Metrics list */
        .metric-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #f1f5f9;
            font-size: 14px;
        }}
        .metric-row:last-child {{ border-bottom: none; }}
        .metric-label {{ color: var(--text-muted); font-weight: 500; }}
        .metric-value {{ font-weight: 600; color: var(--text-main); }}

        /* Chips */
        .chips-container {{ display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }}
        .chip {{
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 6px;
        }}
        .empty-chip {{ font-size: 13px; color: var(--text-muted); font-style: italic; }}

        /* Table */
        .table-responsive {{ overflow-x: auto; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }}
        th {{
            background-color: #f1f5f9;
            color: var(--text-muted);
            text-align: left;
            padding: 12px;
            font-weight: 600;
            border-bottom: 2px solid var(--border);
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }}
        .line-no {{ font-weight: 700; color: var(--primary); white-space: nowrap; }}
        .crop-cell {{ max-width: 320px; }}
        .line-crop-img {{
            max-width: 100%;
            height: auto;
            max-height: 48px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            display: block;
        }}
        .ocr-text {{ font-weight: 500; color: #1e293b; font-family: monospace; font-size: 14px; }}
        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            font-family: monospace;
        }}
        .conf-high {{ background: #dcfce7; color: #15803d; }}
        .conf-low {{ background: #fee2e2; color: #b91c1c; }}
        .bbox-cell {{ font-family: monospace; font-size: 12px; color: var(--text-muted); white-space: nowrap; }}

        /* Full text block */
        .text-box {{
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 14px;
            white-space: pre-wrap;
            line-height: 1.6;
            color: #0f172a;
            max-height: 280px;
            overflow-y: auto;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-title">
                <h1>SECURE DMS: HANDWRITING ANALYSIS REPORT</h1>
                <p>Document ID: <strong>{doc_id}</strong> | File: <strong>{filename}</strong></p>
                <p>SHA-256: <span class="hash-code">{sha256}</span></p>
            </div>
            <div class="status-pill">{status_label}</div>
        </div>

        {warnings_html}

        <!-- Grid 1: Quality & Features -->
        <div class="grid-2">
            <!-- Quality Card -->
            <div class="card">
                <h2>Document Quality Assessment</h2>
                <div class="metric-row">
                    <span class="metric-label">Resolution</span>
                    <span class="metric-value">{inp.get("width", "N/A")} x {inp.get("height", "N/A")} px</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Blur (Laplacian Focus)</span>
                    <span class="metric-value">{quality.get("blur", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Contrast</span>
                    <span class="metric-value">{quality.get("contrast", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Brightness</span>
                    <span class="metric-value">{quality.get("brightness", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Estimated Skew</span>
                    <span class="metric-value">{quality.get("skew_angle", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Detected Lines</span>
                    <span class="metric-value">{len(lines)} line(s)</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Overall OCR Confidence</span>
                    <span class="metric-value">{avg_conf * 100:.1f}%</span>
                </div>
            </div>

            <!-- Handwriting Features Card -->
            <div class="card">
                <h2>Handwriting Geometric Features</h2>
                <div class="metric-row">
                    <span class="metric-label">Stroke Slant</span>
                    <span class="metric-value">{hw_features.get("slant", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Baseline Trend</span>
                    <span class="metric-value">{hw_features.get("baseline", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Line Spacing</span>
                    <span class="metric-value">{hw_features.get("line_spacing", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Writing Density</span>
                    <span class="metric-value">{hw_features.get("writing_density", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Median Line Height</span>
                    <span class="metric-value">{hw_features.get("average_line_height", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Line Length</span>
                    <span class="metric-value">{hw_features.get("average_line_length", "N/A")}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Writing Consistency</span>
                    <span class="metric-value">{hw_features.get("consistency", "N/A")}</span>
                </div>
            </div>
        </div>

        <!-- Grid 2: Text Analysis & Extracted Entities -->
        <div class="card" style="margin-bottom: 24px;">
            <h2>Text & Entity Analysis (Factual DMS Ingestion)</h2>
            <div class="grid-2" style="margin-bottom: 12px;">
                <div>
                    <div class="metric-row">
                        <span class="metric-label">Word Count:</span>
                        <span class="metric-value">{text_analysis.get("word_count", 0)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Character Count:</span>
                        <span class="metric-value">{text_analysis.get("character_count", 0)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Avg Words / Line:</span>
                        <span class="metric-value">{text_analysis.get("average_words_per_line", 0)}</span>
                    </div>
                </div>
                <div>
                    <div style="margin-bottom: 8px;">
                        <span class="metric-label">Dates / Timelines:</span>
                        <div class="chips-container">{render_chips(text_analysis.get("dates", []), "#7c3aed", "#f5f3ff")}</div>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span class="metric-label">Locations:</span>
                        <div class="chips-container">{render_chips(text_analysis.get("locations", []), "#0284c7", "#e0f2fe")}</div>
                    </div>
                    <div>
                        <span class="metric-label">Identified Names / Titles:</span>
                        <div class="chips-container">{render_chips(text_analysis.get("names", []), "#0d9488", "#ccfbf1")}</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <span class="metric-label">Key Terms / Vocabulary:</span>
                <div class="chips-container">{render_chips(text_analysis.get("keywords", []), "#475569", "#f1f5f9")}</div>
            </div>
        </div>

        <!-- Full Text -->
        <div class="card" style="margin-bottom: 24px;">
            <h2>Reconstructed Full Document Text</h2>
            <div class="text-box">{full_text if full_text else "No text recognized."}</div>
        </div>

        <!-- Line Breakdown Table -->
        <div class="card">
            <h2>Segmented Handwriting Line Breakdown</h2>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Line #</th>
                            <th>Image Crop</th>
                            <th>Transcribed Text (TrOCR)</th>
                            <th>Confidence</th>
                            <th>Bounding Box (x, y, w, h)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines_table_body}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
"""

    out_dir = os.path.dirname(os.path.abspath(output_html_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return output_html_path


def generate_text_report(result_payload, output_txt_path="analysis_report.txt"):
    """Generates a clean monospace textual report suitable for terminal export."""
    inp = result_payload.get("input", {})
    quality = result_payload.get("document_quality", {})
    lines = result_payload.get("lines", [])
    full_text = result_payload.get("full_text", "")
    text_analysis = result_payload.get("text_analysis", {})
    hw_features = result_payload.get("handwriting_features", {})
    warnings = result_payload.get("warnings", [])

    content = []
    content.append("==========================================================")
    content.append(" SECURE DMS: HANDWRITING ANALYSIS REPORT")
    content.append("==========================================================")
    content.append(f"Input Document:     {inp.get('filename', 'N/A')}")
    content.append(f"Resolution:         {inp.get('width', 0)}x{inp.get('height', 0)} px")
    content.append(f"SHA-256 Hash:       {inp.get('sha256', 'N/A')}")
    content.append("")
    content.append("--- DOCUMENT QUALITY ---")
    content.append(f"Blur (Focus):       {quality.get('blur', 'N/A')}")
    content.append(f"Contrast:           {quality.get('contrast', 'N/A')}")
    content.append(f"Brightness:         {quality.get('brightness', 'N/A')}")
    content.append(f"Estimated Skew:     {quality.get('skew_angle', 'N/A')}")
    content.append("")
    if warnings:
        content.append("--- QUALITY WARNINGS ---")
        for w in warnings:
            content.append(f"  * {w}")
        content.append("")
    content.append("--- HANDWRITING FEATURES ---")
    content.append(f"Slant:              {hw_features.get('slant', 'N/A')}")
    content.append(f"Baseline:           {hw_features.get('baseline', 'N/A')}")
    content.append(f"Line Spacing:       {hw_features.get('line_spacing', 'N/A')}")
    content.append(f"Writing Density:    {hw_features.get('writing_density', 'N/A')}")
    content.append(f"Consistency:        {hw_features.get('consistency', 'N/A')}")
    content.append("")
    content.append("--- TEXT & ENTITY ANALYSIS ---")
    content.append(f"Total Lines:        {text_analysis.get('total_lines', len(lines))}")
    content.append(f"Total Words:        {text_analysis.get('word_count', 0)}")
    content.append(f"Total Characters:   {text_analysis.get('character_count', 0)}")
    content.append(f"Dates:              {', '.join(text_analysis.get('dates', [])) or 'None'}")
    content.append(f"Locations:          {', '.join(text_analysis.get('locations', [])) or 'None'}")
    content.append(f"Names:              {', '.join(text_analysis.get('names', [])) or 'None'}")
    content.append(f"Keywords:           {', '.join(text_analysis.get('keywords', [])) or 'None'}")
    content.append("")
    content.append("--- TRANSCRIBED LINES ---")
    for l in lines:
        c = l.get("confidence")
        c_str = f"{c * 100:.1f}%" if c is not None else "N/A"
        content.append(f"Line {l.get('line_number'):02d} [{c_str}]: {l.get('text', '')}")
    content.append("")
    content.append("--- RECONSTRUCTED FULL TEXT ---")
    content.append(full_text)
    content.append("==========================================================")

    out_text = "\n".join(content)
    out_dir = os.path.dirname(os.path.abspath(output_txt_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.write(out_text)

    return output_txt_path
