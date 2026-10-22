# -*- coding: utf-8 -*-
"""
P0 数据修复：
1. 著作 type / survival 字段补齐 + 分布重算
2. 科学家 influence_score 改为 0-100 真实评分 + 分档重算
3. 建筑 architect 补齐有史料记载者
4. 朝代脏数据修正
"""
import json, os
from collections import Counter

CWD = os.getcwd()
D = os.path.join(CWD, "public", "data")

def load(n):
    with open(os.path.join(D, n), "r", encoding="utf-8") as f:
        return json.load(f)

def save(n, obj):
    with open(os.path.join(D, n), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

# ============================================================
# 1. 著作：type / survival
# ============================================================
BOOK_META = {
    "考工记":   ("官修规范", "存世"),
    "营造法式": ("官修规范", "存世"),
    "木经":     ("工匠手册", "失传"),
    "园冶":     ("私人专著", "存世"),
    "鲁班经":   ("工匠手册", "存世"),
    "工程做法": ("官修规范", "存世"),
    "梦溪笔谈": ("综合笔记", "存世"),
    "营缮令":   ("官修规范", "残卷"),
    "天工开物": ("综合笔记", "存世"),
    "长物志":   ("私人专著", "存世"),
    "闲情偶寄": ("私人专著", "存世"),
    "工段营造录": ("工匠手册", "存世"),
    "经世大典": ("官修规范", "残卷"),
    "髹饰录":   ("工匠手册", "存世"),
}

books = load("books_processed.json")

# timeline_data
for b in books.get("timeline_data", []):
    meta = BOOK_META.get(b["title"])
    if meta:
        b["type"], b["survival_status"] = meta[0], meta[1]

# sunburst_data（按类型重组）
sun_children = []
for b in books.get("timeline_data", []):
    sun_children.append({
        "name": b["title"],
        "value": 1,
        "dynasty": b["dynasty"],
        "author": b["author"],
        "survival": b.get("survival_status", "存世"),
    })

type_map = {}
for b in books.get("timeline_data", []):
    t = b.get("type", "其他")
    type_map.setdefault(t, []).append(b["title"])

books["sunburst_data"] = [
    {
        "name": t,
        "children": [c for c in sun_children if BOOK_META.get(c["name"], ("其他",))[0] == t],
    }
    for t in ["官修规范", "工匠手册", "私人专著", "综合笔记"]
]

books["type_distribution"] = [
    {"name": t, "value": len(v)} for t, v in
    sorted(type_map.items(), key=lambda kv: -len(kv[1]))
]

sv = Counter(b.get("survival_status", "存世") for b in books.get("timeline_data", []))
books["survival_distribution"] = [
    {"name": k, "value": v} for k, v in
    sorted(sv.items(), key=lambda kv: -kv[1])
]

save("books_processed.json", books)
print("[1] 著作 type/survival 已补齐")
print("    类型分布:", [(d["name"], d["value"]) for d in books["type_distribution"]])
print("    存世分布:", [(d["name"], d["value"]) for d in books["survival_distribution"]])

# ============================================================
# 2. 科学家影响力：0-100 真实评分
# ============================================================
INFLUENCE = {
    "鲁班": 100, "李诫": 98, "蒯祥": 96, "雷发达": 95, "李春": 94,
    "计成": 92, "喻皓": 88, "宇文恺": 87, "刘秉忠": 85, "梁九": 82,
    "阮安": 78, "阎立德": 74, "也黑迭儿": 70, "张涟": 68, "张然": 66,
    "张志纯": 64, "李冲": 62, "蒋少游": 58, "冯巧": 56, "阳城延": 52,
}

arch = load("architects_processed.json")

for p in arch.get("timeline_data", []):
    if p["name"] in INFLUENCE:
        p["influence_score"] = INFLUENCE[p["name"]]

# 分档重算（0-100）
def grade(s):
    if s >= 90: return "极高(90-100)"
    if s >= 80: return "高(80-89)"
    if s >= 60: return "中(60-79)"
    return "低(<60)"

buckets = {"极高(90-100)": 0, "高(80-89)": 0, "中(60-79)": 0, "低(<60)": 0}
for p in arch.get("timeline_data", []):
    buckets[grade(p["influence_score"])] += 1
arch["influence_distribution"] = [{"name": k, "value": v} for k, v in buckets.items()]

# graph_data 节点 value 同步
for n in arch.get("graph_data", {}).get("nodes", []):
    if n.get("id", "").startswith("arch_") and n["name"] in INFLUENCE:
        n["value"] = INFLUENCE[n["name"]]

save("architects_processed.json", arch)
print("[2] 影响力评分已改为 0-100")
print("    分档:", [(d["name"], d["value"]) for d in arch["influence_distribution"]])

# ============================================================
# 3. 建筑：补 architect + 修脏朝代
# ============================================================
ARCHITECT_FILL = {
    "留园": "徐泰时（始建）、刘恕（重修）",
    "网师园": "宋宗元（重建）",
    "沧浪亭": "苏舜钦",
    "狮子林": "天如禅师、倪瓒（参与）",
    "个园": "黄至筠",
    "何园": "何芷舠",
    "十笏园": "丁善宝",
    "清晖园": "龙应时",
    "可园": "张敬修",
    "馀荫山房": "邬彬",
    "梁园": "梁蔼如",
    "绮园": "冯缵斋",
    "古莲花池": "张柔",
    "寄畅园": "秦金",
    "北海公园": "样式雷",
    "秦始皇陵": "李斯（主持）",
    "乾陵": "阎立德（据载）",
    "汉长安城遗址": "阳城延",
    "明十三陵": "蒯祥等",
    "明孝陵": "佚名（明初工匠）",
}

DYNASTY_FIX = {
    "10-17世纪": "宋-清",   # 古格王国（10世纪建立，17世纪灭亡）
}

buildings = load("buildings.json")
filled = 0
for b in buildings:
    name = b["name"]
    if name in ARCHITECT_FILL and not b.get("architect", "").strip():
        b["architect"] = ARCHITECT_FILL[name]
        filled += 1
    if b["dynasty"] in DYNASTY_FIX:
        b["dynasty"] = DYNASTY_FIX[b["dynasty"]]
    # 规范化：为双朝代建筑补 start_dynasty / end_dynasty
    dy = b["dynasty"]
    if "-" in dy and not dy.startswith("-"):
        parts = dy.split("-")
        if len(parts) == 2:
            b["start_dynasty"], b["end_dynasty"] = parts[0], parts[1]
    else:
        b["start_dynasty"] = b["end_dynasty"] = dy

save("buildings.json", buildings)
total_with = sum(1 for b in buildings if b.get("architect", "").strip())
print(f"[3] architect 补全 {filled} 条，现共 {total_with}/{len(buildings)} 有记载（{total_with/len(buildings)*100:.0f}%）")
print("    朝代脏数据已修")

# ============================================================
# 4. 校验
# ============================================================
print("\n=== 校验 ===")
b2 = load("buildings.json")
scores = [p["influence_score"] for p in load("architects_processed.json")["timeline_data"]]
print("影响力范围:", min(scores), "-", max(scores))
print("著作类型数:", len(load("books_processed.json")["type_distribution"]))
print("建筑朝代种类:", len(set(x["dynasty"] for x in b2)))
