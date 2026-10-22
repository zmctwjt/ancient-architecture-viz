# -*- coding: utf-8 -*-
"""统一 5 个页面页脚，并为缺少页脚的页面补上"""
import os, re

CWD = os.getcwd()

FOOTER_SVG = '''<div class="footer-ornament" aria-hidden="true">
          <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 62h104"/><path d="M20 62V50h80v12"/><path d="M16 50h88"/>
            <path d="M26 50l8-12h52l8 12"/><path d="M24 38h72"/>
            <path d="M34 38l10-12h32l10 12"/><path d="M30 26h60"/>
            <path d="M36 26c6-8 42-8 48 0"/><path d="M26 26c-5-3-4-9 1-11M94 26c5-3 4-9-1-11"/>
          </svg>
        </div>'''

def build_footer(indent, source):
    return (
        f'{indent}<footer class="site-footer">\n'
        f'{indent}  {FOOTER_SVG}\n'
        f'{indent}  <p class="footer-brand">千年营造 · 华夏砖木 —— 中国古代建筑数据可视化平台</p>\n'
        f'{indent}  <p class="footer-meta">数据来源：{source}</p>\n'
        f'{indent}</footer>'
    )

PAGES = {
    "src/view/achievement/index.html": ("    ", "国家文物局全国重点文物保护单位名录"),
    "src/view/scientist/index.html":   ("    ", "中国古代建筑史、建筑学家传记资料"),
    "src/view/literature/index.html":  ("    ", "百度百科、故宫博物院、中国古代建筑文献集"),
    "src/view/culture/index.html":     ("      ", "中国非物质文化遗产网、国家文物局、学术文献"),
}

for rel, (indent, source) in PAGES.items():
    fp = os.path.join(CWD, rel)
    if not os.path.exists(fp):
        print("skip", rel); continue
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    new_footer = build_footer(indent, source)
    m = re.search(r'[ \t]*<footer[\s\S]*?</footer>', html)

    if m:
        indent_m = re.match(r'[ \t]*', m.group(0)).group(0)
        new_footer = build_footer(indent_m, source)
        html = html[:m.start()] + new_footer + html[m.end():]
        action = "替换"
    else:
        # 无页脚：插到最后一个 </div> 收尾结构之前（script 标签前）
        m2 = re.search(r'(\n\s*<script type="module")', html)
        if m2:
            html = html[:m2.start()] + "\n\n" + new_footer + html[m2.start():]
            action = "新增"
        else:
            print("!! 无法定位插入点:", rel)
            continue

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{action}页脚: {rel}")
