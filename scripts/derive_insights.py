# -*- coding: utf-8 -*-
"""
从现有数据派生多维度分析数据 → public/data/insights.json
所有指标均由 buildings.json 原始字段计算得出，可溯源
"""
import json, os, re
from collections import Counter, defaultdict

CWD = os.getcwd()
PUB = os.path.join(CWD, "public", "data")

buildings = json.load(open(os.path.join(PUB, "buildings.json"), encoding="utf-8"))

# ============================================================
# 朝代跨度（历史学界通用断代）
# ============================================================
DYNASTY_SPAN = {
    "先秦": (-2070, -221),
    "秦汉": (-221, 220),
    "魏晋": (220, 589),
    "隋唐": (581, 907),
    "宋元": (960, 1368),
    "明清": (1368, 1911),
}

DYNASTY_PATTERNS = [
    ("先秦", r"夏|商|周|春秋|战国|先秦"),
    ("秦汉", r"秦|汉"),
    ("魏晋", r"魏|晋|南北朝|三国|北齐|北周|东魏|西魏"),
    ("隋唐", r"隋|唐"),
    ("宋元", r"宋|元|辽|金|西夏"),
    ("明清", r"明|清"),
]

def dynasty_group(s):
    for name, pat in DYNASTY_PATTERNS:
        if re.search(pat, str(s)):
            return name
    return "其他"

# ============================================================
# 年份解析
# ============================================================
DYNASTY_MID = {k: (v[0] + v[1]) // 2 for k, v in DYNASTY_SPAN.items()}

def parse_year(b):
    raw = str(b.get("builtYear", "")).strip()
    m = re.search(r"前\s*(\d{1,4})", raw)
    if m:
        return -int(m.group(1))
    m = re.search(r"(\d{3,4})", raw)
    if m:
        return int(m.group(1))
    # 无数字则用朝代中点
    g = dynasty_group(b.get("dynasty", ""))
    if g in DYNASTY_MID:
        return DYNASTY_MID[g]
    return None

# ============================================================
# 省份提取
# ============================================================
PROVINCES = [
    "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江",
    "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南",
    "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州",
    "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆",
    "香港", "澳门", "台湾",
]

def extract_province(loc):
    loc = str(loc)
    for p in PROVINCES:
        if loc.startswith(p):
            return p
    return "其他"

# ============================================================
# 1. 朝代密度：数量 + 跨度 + 每百年密度
# ============================================================
dyn_counts = Counter()
for b in buildings:
    dyn_counts[dynasty_group(b.get("dynasty", ""))] += 1

density = []
for name, (start, end) in DYNASTY_SPAN.items():
    c = dyn_counts.get(name, 0)
    span = end - start
    density.append({
        "dynasty": name,
        "count": c,
        "start": start,
        "end": end,
        "span": span,
        "perCentury": round(c / (span / 100), 2),
    })

# ============================================================
# 2. 世纪分布（前 21 世纪 — 20 世纪）
# ============================================================
century = Counter()
no_year = 0
for b in buildings:
    y = parse_year(b)
    if y is None:
        no_year += 1
        continue
    if y < 0:
        # 公元前：-2070 → 前21世纪
        c = (-y) // 100 + 1
        century[-c] += 1
    else:
        c = (y - 1) // 100 + 1 if y % 100 == 0 else y // 100 + 1
        century[c] += 1

def century_label(c):
    if c < 0:
        return f"前{(-c)}世纪"
    return f"{c}世纪"

century_series = [
    {"century": century_label(c), "value": v, "sortKey": c}
    for c, v in sorted(century.items())
]

# ============================================================
# 3. 省份 × 类别 矩阵
# ============================================================
prov_counter = Counter()
prov_cat = defaultdict(Counter)
for b in buildings:
    p = extract_province(b.get("location", ""))
    c = b.get("category", "其他")
    prov_counter[p] += 1
    prov_cat[p][c] += 1

top_provinces = [p for p, _ in prov_counter.most_common(12)]
all_cats = [c for c, _ in Counter(b.get("category", "其他") for b in buildings).most_common()]

heatmap = []
for pi, p in enumerate(top_provinces):
    for ci, c in enumerate(all_cats):
        v = prov_cat[p].get(c, 0)
        if v > 0:
            heatmap.append([ci, pi, v])

province_matrix = {
    "provinces": top_provinces,
    "categories": all_cats,
    "data": heatmap,
    "provinceTotals": [{"name": p, "value": prov_counter[p]} for p in top_provinces],
}

# ============================================================
# 4. 朝代 → 类别 流向（桑基）
# ============================================================
flow = defaultdict(Counter)
for b in buildings:
    flow[dynasty_group(b.get("dynasty", ""))][b.get("category", "其他")] += 1

dyn_nodes = [{"name": d} for d in DYNASTY_SPAN if dyn_counts.get(d, 0) > 0]
cat_nodes = [{"name": c} for c in all_cats]
sankey = {
    "nodes": dyn_nodes + cat_nodes,
    "links": [
        {"source": d, "target": c, "value": v}
        for d, cats in flow.items()
        if d in DYNASTY_SPAN
        for c, v in cats.items()
        if v > 0
    ],
}

# ============================================================
# 5. 建筑师记载覆盖率
# ============================================================
with_arch = sum(1 for b in buildings if str(b.get("architect", "")).strip())
coverage = {
    "with": with_arch,
    "without": len(buildings) - with_arch,
    "ratio": round(with_arch / len(buildings), 3),
}

# ============================================================
# 6. 世界遗产占比
# ============================================================
heritage = 0
for b in buildings:
    text = str(b.get("description", "")) + str(b.get("significance", ""))
    if "世界文化遗产" in text or "世界遗产" in text:
        heritage += 1

# ============================================================
# 7. 时间带（用于首页横向朝代带）
# ============================================================
timeline_band = [
    {
        "dynasty": name,
        "start": start,
        "end": end,
        "count": dyn_counts.get(name, 0),
        "perCentury": round(dyn_counts.get(name, 0) / ((end - start) / 100), 2),
    }
    for name, (start, end) in DYNASTY_SPAN.items()
]

# ============================================================
# 输出
# ============================================================
out = {
    "meta": {
        "source": "buildings.json 字段派生计算",
        "total": len(buildings),
        "categories": len(all_cats),
        "provinces": len(prov_counter),
        "unparsedYears": no_year,
    },
    "dynasty_density": density,
    "century_distribution": century_series,
    "province_matrix": province_matrix,
    "category_flow": sankey,
    "architect_coverage": coverage,
    "heritage": {
        "count": heritage,
        "total": len(buildings),
        "ratio": round(heritage / len(buildings), 3),
    },
    "timeline_band": timeline_band,
}

path = os.path.join(PUB, "insights.json")
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("生成 insights.json")
print(f"  朝代密度: {[(d['dynasty'], d['count'], d['perCentury']) for d in density]}")
print(f"  世纪分箱: {len(century_series)} 档，未解析年份 {no_year}")
print(f"  省份矩阵: {len(top_provinces)} 省 × {len(all_cats)} 类 = {len(heatmap)} 个非零格")
print(f"  桑基图: {len(sankey['nodes'])} 节点 / {len(sankey['links'])} 条边")
print(f"  建筑师覆盖率: {with_arch}/{len(buildings)} = {coverage['ratio']}")
print(f"  世界遗产: {heritage}/{len(buildings)} = {out['heritage']['ratio']}")
