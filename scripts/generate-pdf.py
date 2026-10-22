# -*- coding: utf-8 -*-
"""
方案：Markdown → HTML（精美排版）→ Edge无头浏览器 → PDF
"""
import os, markdown, subprocess, tempfile

CWD = os.getcwd()
DOCS_DIR = os.path.join(CWD, "docs")

# ============================================================
# 读取所有文档并转为HTML
# ============================================================
doc_files = [
    ("第一部分  技术文档", [
        "01-作品设计说明书.md",
        "09-设计思路.md",
    ]),
    ("第二部分  使用说明", [
        "02-数据源说明.md",
        "04-开源代码与组件使用说明.md",
        "05-作品简介.md",
    ]),
    ("第三部分  运行手册", [
        "03-安装部署说明.md",
        "06-演示指南.md",
    ]),
]

def read_md(filename):
    fp = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(fp):
        return ""
    with open(fp, "r", encoding="utf-8") as f:
        return f.read()

def md_to_html(md_text):
    """Markdown转HTML，使用Python markdown库"""
    md = markdown.Markdown(extensions=["tables", "fenced_code", "toc", "nl2br"])
    return md.convert(md_text)

# ============================================================
# 构建完整HTML页面（含精美CSS）
# ============================================================

# 封面HTML
cover_html = """
<div class="cover-page">
    <div class="cover-decor-top"></div>
    <h1 class="cover-title">千年营造·华夏砖木</h1>
    <p class="cover-subtitle">中国古代建筑数据可视化平台</p>
    <div class="cover-divider"></div>
    <p class="cover-doc-type">技术文档 · 使用说明 · 运行手册</p>
    
    <table class="cover-info">
        <tr><td class="label">作品编号</td><td>2026036314</td></tr>
        <tr><td class="label">作品类别</td><td>中国古代建筑数据可视化</td></tr>
        <tr><td class="label">技术栈</td><td>Vite 4.5 + ECharts 5.4 + GSAP 3.12</td></tr>
        <tr><td class="label">版本</td><td>v1.0.0</td></tr>
        <tr><td class="label">完成时间</td><td>2026年5月</td></tr>
        <tr><td class="label">在线演示</td><td>http://8.148.80.103</td></tr>
        <tr><td class="label">项目仓库</td><td>https://github.com/zmctwjt/ancient-architecture-viz</td></tr>
    </table>
    <div class="cover-decor-bottom"></div>
</div>
<div class="page-break"></div>
"""

# 目录HTML（从文档标题中提取）
toc_html = '<div class="toc-page"><h1 class="section-title">目  录</h1>'
for section_title, files in doc_files:
    toc_html += f'<div class="toc-section">{section_title}</div>'
    for idx, fn in enumerate(files, 1):
        base = fn.replace(".md","").split("-",1)[-1] if "-" in fn else fn
        toc_html += f'<div class="toc-item">{idx}. {base}</div>'
    toc_html += '<div style="margin-bottom:16px"></div>'
toc_html += '</div><div class="page-break"></div>'

# 正文HTML
content_html = ""
for section_title, files in doc_files:
    content_html += f'<div class="section-header"><h1 class="section-title">{section_title}</h1><div class="section-line"></div></div>'
    for fn in files:
        md_text = read_md(fn)
        if md_text:
            html = md_to_html(md_text)
            content_html += f'<div class="doc-section">{html}</div>'
    content_html += '<div class="page-break"></div>'

# 完整HTML模板
html_template = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
@page {{
    size: A4;
    margin: 2cm 2.2cm 2cm 2.2cm;
}}
* {{ box-sizing: border-box; }}
body {{
    font-family: "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif;
    font-size: 11pt;
    line-height: 1.8;
    color: #333;
    margin: 0;
    padding: 0;
    background: #fff;
}}

/* ========== 封面 ========== */
.cover-page {{
    text-align: center;
    padding-top: 80px;
    page-break-after: always;
}}
.cover-decor-top {{
    width: 120px; height: 3px;
    background: linear-gradient(90deg, #C8A96E, #4ECDC4);
    margin: 0 auto 40px;
}}
.cover-title {{
    font-size: 32pt;
    color: #1a1a2e;
    margin: 0 0 12px;
    letter-spacing: 6px;
    font-weight: 700;
}}
.cover-subtitle {{
    font-size: 16pt;
    color: #C8A96E;
    margin: 0 0 24px;
    letter-spacing: 3px;
}}
.cover-divider {{
    width: 60px; height: 2px;
    background: #C8A96E;
    margin: 0 auto 24px;
}}
.cover-doc-type {{
    font-size: 13pt;
    color: #666;
    margin-bottom: 50px;
    letter-spacing: 2px;
}}
.cover-info {{
    margin: 0 auto;
    width: 420px;
    border-collapse: collapse;
}}
.cover-info td {{
    padding: 8px 12px;
    font-size: 10.5pt;
    border-bottom: 1px solid #eee;
    text-align: left;
}}
.cover-info .label {{
    color: #C8A96E;
    font-weight: 600;
    width: 120px;
}}
.cover-decor-bottom {{
    width: 200px; height: 1px;
    background: linear-gradient(90deg, transparent, #C8A96E, transparent);
    margin: 40px auto 0;
}}

/* ========== 目录 ========== */
.toc-page {{ page-break-after: always; }}
.toc-section {{
    font-size: 14pt;
    font-weight: 700;
    color: #1a1a2e;
    margin: 20px 0 8px 0;
    padding-left: 20px;
    border-left: 4px solid #C8A96E;
}}
.toc-item {{
    font-size: 10.5pt;
    color: #666;
    padding: 3px 0 3px 44px;
}}

/* ========== 章节标题 ========== */
.section-header {{
    margin-bottom: 20px;
    padding-bottom: 10px;
}}
.section-title {{
    font-size: 20pt;
    color: #1a1a2e;
    margin: 0 0 6px;
    padding-left: 16px;
    border-left: 5px solid #C8A96E;
}}
.section-line {{
    height: 2px;
    background: linear-gradient(90deg, #C8A96E, transparent);
    margin-left: 16px;
}}

/* ========== Markdown正文 ========== */
.doc-section {{ margin-bottom: 20px; }}
.doc-section h1 {{
    font-size: 18pt;
    color: #1a1a2e;
    border-bottom: 2px solid #C8A96E;
    padding-bottom: 6px;
    margin: 28px 0 14px;
}}
.doc-section h2 {{
    font-size: 14pt;
    color: #C8A96E;
    margin: 22px 0 10px;
    padding-left: 12px;
    border-left: 4px solid #4ECDC4;
}}
.doc-section h3 {{
    font-size: 12pt;
    color: #4ECDC4;
    margin: 16px 0 8px;
}}
.doc-section p {{
    margin: 8px 0;
    text-align: justify;
}}
.doc-section ul, .doc-section ol {{
    margin: 8px 0 8px 24px;
    padding: 0;
}}
.doc-section li {{
    margin: 4px 0;
}}
.doc-section strong {{
    color: #1a1a2e;
}}
.doc-section code {{
    font-family: "Consolas", "Source Code Pro", monospace;
    background: #f4f4f4;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 9.5pt;
    color: #c7254e;
}}
.doc-section pre {{
    background: #f8f8f8;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px 16px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
}}
.doc-section pre code {{
    background: none;
    padding: 0;
    color: #333;
}}
.doc-section table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10pt;
    page-break-inside: avoid;
}}
.doc-section thead th {{
    background: #1a1a2e;
    color: #fff;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
}}
.doc-section tbody td {{
    padding: 7px 10px;
    border-bottom: 1px solid #e8e8e8;
}}
.doc-section tbody tr:nth-child(even) {{
    background: #fafafa;
}}
.doc-section blockquote {{
    border-left: 4px solid #C8A96E;
    margin: 12px 0;
    padding: 8px 16px;
    background: #fdf8ef;
    color: #555;
}}
.doc-section hr {{
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #C8A96E, transparent);
    margin: 20px 0;
}}

/* ========== 分页 ========== */
.page-break {{
    page-break-after: always;
}}
</style>
</head>
<body>
{cover}
{toc}
{content}
</body>
</html>
""".format(cover=cover_html, toc=toc_html, content=content_html)

# ============================================================
# 写入临时HTML，用Edge无头浏览器转PDF
# ============================================================
html_path = os.path.join(CWD, "千年营造华夏砖木-技术文档与使用说明.html")
pdf_path = os.path.join(CWD, "千年营造华夏砖木-技术文档与使用说明.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"HTML written: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    f"--print-to-pdf={pdf_path}",
    "--print-to-pdf-no-header",
    f"--headless=new",
    html_path,
]
print("Generating PDF with Edge...")
result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
if result.returncode != 0:
    print(f"Edge stderr: {result.stderr}")
else:
    sz = os.path.getsize(pdf_path) / 1024 / 1024
    print(f"PDF generated: {pdf_path} ({sz:.2f} MB)")
