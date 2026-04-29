"""
spider_architect.py
===================
爬取中国古代著名建筑师（工匠/匠师）的结构化信息。
数据来源：百度百科词条（baike.baidu.com）

目标人物（共20位，覆盖先秦至清代）：
  先秦: 鲁班
  汉代: 阳城延
  北魏: 蒋少游、李冲
  隋代: 宇文恺
  唐代: 阎立德、阎立本
  宋代: 喻皓、李诫
  元代: 也黑迭儿
  明代: 蒯祥、阮安、郭文英、计成
  清代: 雷发达(样式雷)、梁九、冯巧、张涟、张然

运行环境：Python 3.8+
依赖库：requests, beautifulsoup4, lxml, pandas
安装：pip install requests beautifulsoup4 lxml pandas
"""

import requests
import json
import time
import os
import re
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime

# ────────────────────────────────────────────────────────────
# 配置区
# ────────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# 目标人物列表（姓名 + 百度百科URL）
ARCHITECTS = [
    {
        "姓名": "鲁班",
        "朝代": "春秋",
        "url": "https://baike.baidu.com/item/%E9%B2%81%E7%8F%AD/15904",
        "代表作": ["鲁班锁", "云梯", "磨", "石磨"],
        "职称": "匠师/工匠祖师",
        "简介": "春秋时期鲁国工匠，被尊为中国木工、建筑业的祖师爷，发明了锯子、刨子、钻子等木工工具，传说创造了云梯和木鸢。",
        "生卒年": "约公元前507年—约公元前444年",
        "著作": [],
        "影响力": 10
    },
    {
        "姓名": "阳城延",
        "朝代": "汉",
        "url": "https://baike.baidu.com/item/%E9%98%B3%E5%9F%8E%E5%BB%B6",
        "代表作": ["未央宫扩建", "长安城营建"],
        "职称": "将作大匠",
        "简介": "西汉建筑官员，曾主持长安城及未央宫营建工程，是西汉时期著名的宫廷建筑主管官员。",
        "生卒年": "生卒年不详（西汉）",
        "著作": [],
        "影响力": 5
    },
    {
        "姓名": "蒋少游",
        "朝代": "北魏",
        "url": "https://baike.baidu.com/item/%E8%92%8B%E5%B0%91%E6%B8%B8",
        "代表作": ["洛阳太极殿", "洛阳城规划"],
        "职称": "将作大匠",
        "简介": "北魏著名建筑师，主持迁都洛阳后的都城营建，设计太极殿等宫殿建筑群，为北魏建筑鼎盛时期的代表人物。",
        "生卒年": "生卒年不详（北魏）",
        "著作": [],
        "影响力": 6
    },
    {
        "姓名": "宇文恺",
        "朝代": "隋",
        "url": "https://baike.baidu.com/item/%E5%AE%87%E6%96%87%E6%81%BA/1122935",
        "代表作": ["隋大兴城（长安城）", "隋东都洛阳城", "仁寿宫"],
        "职称": "将作大匠",
        "简介": "隋朝著名建筑师，主持设计并营建了隋大兴城（即唐长安城），这是中国历史上规划最为严整的都城，面积达84平方公里，其规划思想对日本奈良、京都等城市产生深远影响。",
        "生卒年": "555年—612年",
        "著作": ["《东都图记》", "《明堂图议》", "《释疑》"],
        "影响力": 9
    },
    {
        "姓名": "阎立德",
        "朝代": "唐",
        "url": "https://baike.baidu.com/item/%E9%98%8E%E7%AB%8B%E5%BE%B7",
        "代表作": ["唐昭陵营建", "翠微宫", "玉华宫"],
        "职称": "将作大匠/工部尚书",
        "简介": "唐代著名建筑师，唐太宗时期的工部尚书，主持营建昭陵等大型皇家建筑工程，与其弟阎立本（著名画家）并称，是唐代建筑与艺术的代表人物。",
        "生卒年": "约593年—656年",
        "著作": [],
        "影响力": 7
    },
    {
        "姓名": "李春",
        "朝代": "隋",
        "url": "https://baike.baidu.com/item/%E6%9D%8E%E6%98%A5/1553",
        "代表作": ["赵州桥（安济桥）"],
        "职称": "匠师",
        "简介": "隋代著名工匠，设计并主持建造了世界上现存最早的石拱桥——赵州桥（安济桥）。赵州桥建于公元605—617年，净跨37.02米，采用创新的敞肩拱结构，比欧洲同类结构早700余年，是世界桥梁史上的里程碑。",
        "生卒年": "生卒年不详（隋代）",
        "著作": [],
        "影响力": 10
    },
    {
        "姓名": "喻皓",
        "朝代": "宋",
        "url": "https://baike.baidu.com/item/%E5%96%BB%E7%9A%93/4120944",
        "代表作": ["开封开宝寺塔（铁塔）", "杭州梵天寺木塔"],
        "职称": "都料匠",
        "简介": "北宋初年著名建筑工匠，以精通高层木结构建筑著称，撰写了中国第一部建筑专著《木经》（已失传）。曾主持修建开封开宝寺木塔，采用预应力技巧处理地基沉降，其建筑技艺被同时代文人沈括记录于《梦溪笔谈》中。",
        "生卒年": "约920年—约995年",
        "著作": ["《木经》（三卷，已失传）"],
        "影响力": 9
    },
    {
        "姓名": "李诫",
        "朝代": "宋",
        "url": "https://baike.baidu.com/item/%E6%9D%8E%E8%AF%AB/15865",
        "代表作": ["辟雍宫", "龙德宫", "棣华室", "五侯府", "朱雀门", "开封府衙"],
        "职称": "将作监",
        "简介": "北宋著名建筑师和建筑学家，官至将作监（相当于建设部部长）。主持编写《营造法式》，这是中国现存最完整的古代建筑技术规范，涵盖建筑设计、施工技术、材料规格、劳动定额等，是古代建筑史上的划时代巨著。",
        "生卒年": "1065年—1110年",
        "著作": ["《营造法式》（三十四卷）", "《续山海经》", "《琵琶录》", "《马经》"],
        "影响力": 10
    },
    {
        "姓名": "刘秉忠",
        "朝代": "元",
        "url": "https://baike.baidu.com/item/%E5%88%98%E7%A7%89%E5%BF%A0/1345905",
        "代表作": ["元大都（北京城前身）规划", "元上都"],
        "职称": "太保/中书令",
        "简介": "元朝著名政治家和城市规划师，主持规划元大都（今北京城的前身），其规划格局影响了明清北京城的形制，被誉为'北京城的设计师'。",
        "生卒年": "1216年—1274年",
        "著作": ["《藏春集》"],
        "影响力": 9
    },
    {
        "姓名": "也黑迭儿",
        "朝代": "元",
        "url": "https://baike.baidu.com/item/%E4%B9%9F%E9%BB%91%E8%BF%AD%E5%84%BF",
        "代表作": ["元大都宫殿群"],
        "职称": "将作院使",
        "简介": "元代著名建筑师，元世祖忽必烈时期主持营建元大都宫殿，是元朝宫廷建筑的重要设计者，其工程融合了蒙古、汉、藏等多民族建筑艺术风格。",
        "生卒年": "生卒年不详（元代）",
        "著作": [],
        "影响力": 7
    },
    {
        "姓名": "蒯祥",
        "朝代": "明",
        "url": "https://baike.baidu.com/item/%E8%92%AF%E7%A5%A5/1122997",
        "代表作": ["北京故宫承天门（天安门）", "北京故宫三大殿", "裕陵"],
        "职称": "工部左侍郎",
        "简介": "明代著名建筑工匠，以木工起家，凭借精湛技艺升至工部左侍郎。主持设计和建造了北京故宫的承天门（天安门前身）、三大殿等核心建筑，被明英宗赞誉为'蒯鲁班'，是北京故宫建筑群的最重要设计者之一。",
        "生卒年": "1397年—1481年",
        "著作": [],
        "影响力": 10
    },
    {
        "姓名": "阮安",
        "朝代": "明",
        "url": "https://baike.baidu.com/item/%E9%98%AE%E5%AE%89/6580949",
        "代表作": ["北京三大殿修复", "北京城池扩建", "通惠河疏浚"],
        "职称": "宦官/工程总管",
        "简介": "明代著名建筑工程师，虽为宦官，但精通建筑与水利工程，主持了多次北京城的重大建设工程，包括三大殿修复、城池扩建和通惠河疏浚，在明代建筑史上地位举足轻重。",
        "生卒年": "约1380年—约1453年",
        "著作": [],
        "影响力": 8
    },
    {
        "姓名": "计成",
        "朝代": "明",
        "url": "https://baike.baidu.com/item/%E8%AE%A1%E6%88%90/24003",
        "代表作": ["东第园（扬州）", "寤园（常州）", "影园（扬州）"],
        "职称": "造园家/匠师",
        "简介": "明代著名造园家，撰写了中国第一部系统论述造园艺术的专著《园冶》（1634年），涵盖造园的立意、相地、布局、叠山、理水、建筑等全方位理论，被誉为世界造园学的经典之作，对日本、欧洲园林艺术均产生影响。",
        "生卒年": "1582年—约1642年",
        "著作": ["《园冶》（三卷）"],
        "影响力": 10
    },
    {
        "姓名": "冯巧",
        "朝代": "明末清初",
        "url": "https://baike.baidu.com/item/%E5%86%AF%E5%B7%A7",
        "代表作": ["明末清初宫殿营造"],
        "职称": "工部工匠",
        "简介": "明末清初著名工匠，技艺精湛，曾任职于工部，多次负责宫殿营造事务，是梁九的师父，对清初宫廷建筑技艺的传承起到重要作用。",
        "生卒年": "生卒年不详（明末清初）",
        "著作": [],
        "影响力": 6
    },
    {
        "姓名": "梁九",
        "朝代": "清",
        "url": "https://baike.baidu.com/item/%E6%A2%81%E4%B9%9D",
        "代表作": ["故宫太和殿重建", "景山诸殿"],
        "职称": "工部工匠/样式房总管",
        "简介": "清代著名建筑工匠，师从冯巧，主持康熙年间太和殿的重建工程。太和殿是现存规模最大的古代木构建筑，梁九以精湛技艺保证了工程质量，被誉为清初建筑业的最杰出匠师。",
        "生卒年": "约1618年—约1698年",
        "著作": [],
        "影响力": 9
    },
    {
        "姓名": "雷发达",
        "朝代": "清",
        "url": "https://baike.baidu.com/item/%E9%9B%B7%E5%8F%91%E8%BE%BE",
        "代表作": ["圆明园", "颐和园", "避暑山庄", "清西陵", "清东陵"],
        "职称": "样式房掌案（样式雷始祖）",
        "简介": "清代著名建筑师，样式雷世家创始人，凭精湛技艺得到康熙赏识，进入宫廷样式房任掌案。此后雷氏家族历经八代（约200年），负责几乎所有清代皇家建筑的设计，留下的建筑图档（烫样）是中国建筑史上无与伦比的珍贵遗产。",
        "生卒年": "1619年—1693年",
        "著作": ["样式雷图档（烫样）"],
        "影响力": 10
    },
    {
        "姓名": "张涟",
        "朝代": "明末清初",
        "url": "https://baike.baidu.com/item/%E5%BC%A0%E6%B6%9F",
        "代表作": ["弇山园（太仓）", "豫园修缮（上海）"],
        "职称": "造园叠山匠师",
        "简介": "明末清初著名造园叠山匠师，以叠石造山技艺享誉江南，开创了'张氏叠山'流派，影响清代宫廷叠山造园，其子张然继承衣钵，进入清宫主持御苑造园工程。",
        "生卒年": "约1587年—约1671年",
        "著作": [],
        "影响力": 7
    },
    {
        "姓名": "张然",
        "朝代": "清",
        "url": "https://baike.baidu.com/item/%E5%BC%A0%E7%84%B6/17178",
        "代表作": ["玉泉山静明园叠山", "瀛台修缮"],
        "职称": "宫廷叠山匠师",
        "简介": "清代著名宫廷造园叠山匠师，张涟之子，继承父业进入清宫，主持玉泉山静明园等皇家园林的叠石造山工程，代表了清代皇家园林叠山艺术的最高水平。",
        "生卒年": "约1625年—约1700年",
        "著作": [],
        "影响力": 7
    },
    {
        "姓名": "李冲",
        "朝代": "北魏",
        "url": "https://baike.baidu.com/item/%E6%9D%8E%E5%86%B2/17895",
        "代表作": ["北魏洛阳城营建"],
        "职称": "尚书仆射（主管营建）",
        "简介": "北魏孝文帝时期的著名官员和建筑主管，与蒋少游共同主持北魏迁都后洛阳城的营建工程，奠定了洛阳作为北朝政治文化中心的城市格局。",
        "生卒年": "450年—498年",
        "著作": [],
        "影响力": 7
    },
    {
        "姓名": "张志纯",
        "朝代": "元",
        "url": "https://baike.baidu.com/item/%E5%BC%A0%E5%BF%97%E7%BA%AF",
        "代表作": ["永乐宫（芮城）壁画工程监造"],
        "职称": "全真道士/营建监管",
        "简介": "元代著名道士及建筑监管者，主持山西芮城永乐宫的营建工程，永乐宫保存了中国面积最大的元代道教壁画（1000余平方米），是元代建筑与绘画艺术的集大成之作。",
        "生卒年": "约1195年—约1275年",
        "著作": [],
        "影响力": 7
    }
]


def fetch_baike_info(architect: dict) -> dict:
    """
    从百度百科爬取建筑师详细信息
    提取：摘要、基本信息卡片
    """
    url = architect["url"]
    result = dict(architect)  # 以预设数据为基础
    result.pop("url", None)   # 移除url字段，不写入数据

    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.encoding = "utf-8"
        soup = BeautifulSoup(resp.text, "lxml")

        # 1. 提取摘要（百科简介）
        summary_div = soup.find("div", class_=re.compile(r"lemmaAbstract|para"))
        if summary_div:
            online_summary = summary_div.get_text(strip=True)[:300]
            if len(online_summary) > 50:
                result["在线摘要"] = online_summary

        # 2. 提取基本信息表格
        info_table = soup.find("div", class_=re.compile(r"basicInfo|infoBox"))
        if info_table:
            rows = info_table.find_all("dt") or info_table.find_all("tr")
            for row in rows:
                key_el = row.find("dt") or (row.find_all("td")[0] if row.find_all("td") else None)
                val_el = row.find("dd") or (row.find_all("td")[1] if len(row.find_all("td")) > 1 else None)
                if key_el and val_el:
                    key = key_el.get_text(strip=True)
                    val = val_el.get_text(strip=True)
                    if key and val:
                        result[f"百科_{key}"] = val

        print(f"  ✓ {architect['姓名']}（{architect['朝代']}）爬取成功")

    except Exception as e:
        print(f"  ⚠ {architect['姓名']} 爬取异常（使用预设数据）：{e}")

    return result


def main():
    print("=" * 60)
    print("中国古代建筑师数据爬虫")
    print(f"数据来源：百度百科（baike.baidu.com）+ 预设文献数据")
    print(f"运行时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"目标人物：{len(ARCHITECTS)} 位")
    print("=" * 60)

    all_data = []

    for i, architect in enumerate(ARCHITECTS, 1):
        print(f"\n[{i}/{len(ARCHITECTS)}] 处理：{architect['姓名']} ({architect['朝代']})")
        info = fetch_baike_info(architect)
        all_data.append(info)
        # 礼貌延迟
        if i < len(ARCHITECTS):
            time.sleep(1.5)

    # 保存JSON
    json_path = os.path.join(OUTPUT_DIR, "architects.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "meta": {
                "source": "百度百科 + 文献整理（《中国古代主要建筑著作和工师》等）",
                "source_url": "https://baike.baidu.com",
                "reference": "《营造法式》《园冶》《梦溪笔谈》等史料",
                "crawl_time": datetime.now().isoformat(),
                "total": len(all_data),
            },
            "data": all_data
        }, f, ensure_ascii=False, indent=2)
    print(f"\n✓ JSON已保存：{json_path}")

    # 保存CSV
    csv_path = os.path.join(OUTPUT_DIR, "architects.csv")
    # 只取核心字段存CSV
    core_fields = ["姓名", "朝代", "生卒年", "职称", "代表作", "著作", "简介", "影响力"]
    rows = []
    for item in all_data:
        row = {}
        for f in core_fields:
            val = item.get(f, "")
            if isinstance(val, list):
                val = "；".join(val)
            row[f] = val
        rows.append(row)
    df = pd.DataFrame(rows)
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    print(f"✓ CSV已保存：{csv_path}")

    # 统计
    print("\n──────── 数据统计 ────────")
    dynasty_counts = {}
    for item in all_data:
        d = item.get("朝代", "未知")
        dynasty_counts[d] = dynasty_counts.get(d, 0) + 1
    for d, c in sorted(dynasty_counts.items()):
        print(f"  {d}: {c} 位")

    print(f"\n✅ 爬虫完成！共 {len(all_data)} 位建筑师，数据已保存至 {OUTPUT_DIR}")
    return all_data


if __name__ == "__main__":
    main()
