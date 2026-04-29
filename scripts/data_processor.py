#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据清洗与结构化处理脚本
将爬虫获取的原始数据转换为图表可用的格式
"""

import json
import os
from datetime import datetime
from collections import defaultdict

# 路径配置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')

# 确保输出目录存在
os.makedirs(PROCESSED_DIR, exist_ok=True)


def load_json(filename):
    """加载JSON文件"""
    filepath = os.path.join(RAW_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data, filename):
    """保存JSON文件"""
    filepath = os.path.join(PROCESSED_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ 已生成: {filename}")
    return filepath


def process_buildings():
    """处理建筑成就数据"""
    data = load_json('ncha_ancient_buildings.json')
    buildings = data.get('data', [])
    
    # 按朝代统计
    dynasty_stats = defaultdict(int)
    # 按省份统计
    province_stats = defaultdict(int)
    # 按类型统计
    type_stats = defaultdict(int)
    # 按批次统计
    batch_stats = defaultdict(int)
    
    for building in buildings:
        # 朝代
        dynasties = building.get('dynasties', [])
        for d in dynasties:
            dynasty_stats[d] += 1
        
        # 省份
        province = building.get('province', '未知')
        province_stats[province] += 1
        
        # 类型
        btype = building.get('type', '其他')
        type_stats[btype] += 1
        
        # 批次
        batch = building.get('batch', '未知')
        batch_stats[batch] += 1
    
    result = {
        "meta": {
            "title": "中国古代建筑成就统计数据",
            "source": "国家文物局全国重点文物保护单位名录",
            "total": len(buildings),
            "generated_at": datetime.now().isoformat()
        },
        "dynasty_distribution": [
            {"name": k, "value": v} for k, v in sorted(dynasty_stats.items(), key=lambda x: x[1], reverse=True)
        ],
        "province_distribution": [
            {"name": k, "value": v} for k, v in sorted(province_stats.items(), key=lambda x: x[1], reverse=True)
        ],
        "type_distribution": [
            {"name": k, "value": v} for k, v in sorted(type_stats.items(), key=lambda x: x[1], reverse=True)
        ],
        "batch_distribution": [
            {"name": k, "value": v} for k, v in sorted(batch_stats.items(), key=lambda x: x[1], reverse=True)
        ],
        "detail_list": buildings
    }
    
    return save_json(result, 'buildings_processed.json')


def process_architects():
    """处理科学家数据"""
    data = load_json('architects.json')
    architects = data.get('data', [])
    
    # 按朝代统计
    dynasty_stats = defaultdict(list)
    # 影响力评分分布
    influence_ranges = {"极高(90-100)": 0, "高(80-89)": 0, "中(60-79)": 0, "低(<60)": 0}
    
    for arch in architects:
        dynasty = arch.get('朝代', '未知')
        dynasty_stats[dynasty].append(arch)
        
        influence = arch.get('影响力', 0)
        if influence >= 90:
            influence_ranges["极高(90-100)"] += 1
        elif influence >= 80:
            influence_ranges["高(80-89)"] += 1
        elif influence >= 60:
            influence_ranges["中(60-79)"] += 1
        else:
            influence_ranges["低(<60)"] += 1
    
    # 构建关系图数据
    nodes = []
    links = []
    node_ids = {}
    
    for i, arch in enumerate(architects):
        node_id = f"arch_{i}"
        name = arch.get('姓名', f'未知{i}')
        node_ids[name] = node_id
        nodes.append({
            "id": node_id,
            "name": name,
            "category": 0,  # 人物
            "symbolSize": arch.get('影响力', 50) / 5,
            "value": arch.get('影响力', 50),
            "dynasty": arch.get('朝代', '未知'),
            "draggable": True
        })
    
    # 添加朝代节点
    dynasties = list(dynasty_stats.keys())
    for i, dynasty in enumerate(dynasties):
        node_id = f"dynasty_{i}"
        node_ids[dynasty] = node_id
        nodes.append({
            "id": node_id,
            "name": dynasty,
            "category": 1,  # 朝代
            "symbolSize": 30,
            "value": len(dynasty_stats[dynasty]),
            "draggable": True
        })
        # 建立人物与朝代的关系
        for arch in dynasty_stats[dynasty]:
            links.append({
                "source": node_ids[arch.get('姓名', '未知')],
                "target": node_id,
                "value": 1
            })
    
    result = {
        "meta": {
            "title": "中国古代建筑科学家数据",
            "source": "百度百科、权威文献",
            "total": len(architects),
            "generated_at": datetime.now().isoformat()
        },
        "dynasty_distribution": [
            {"name": k, "value": len(v), "architects": [a.get('姓名', '未知') for a in v]}
            for k, v in sorted(dynasty_stats.items(), key=lambda x: len(x[1]), reverse=True)
        ],
        "influence_distribution": [
            {"name": k, "value": v} for k, v in influence_ranges.items()
        ],
        "graph_data": {
            "nodes": nodes,
            "links": links,
            "categories": [
                {"name": "建筑科学家"},
                {"name": "朝代"}
            ]
        },
        "timeline_data": [
            {
                "name": arch.get('姓名', '未知'),
                "dynasty": arch.get('朝代', '未知'),
                "period": arch.get('生卒年', ''),
                "influence_score": arch.get('影响力', 0),
                "major_works": arch.get('代表作', []),
                "achievements": arch.get('简介', '')
            }
            for arch in sorted(architects, key=lambda x: x.get('影响力', 0), reverse=True)
        ]
    }
    
    return save_json(result, 'architects_processed.json')


def process_books():
    """处理著作数据"""
    data = load_json('books.json')
    books = data.get('data', [])
    
    # 按朝代统计
    dynasty_stats = defaultdict(list)
    # 按类型统计
    type_stats = defaultdict(list)
    # 存世状态
    survival_stats = defaultdict(int)
    
    for book in books:
        dynasty = book.get('朝代', '未知')
        dynasty_stats[dynasty].append(book)
        
        book_type = book.get('类别', '其他')
        type_stats[book_type].append(book)
        
        survival = book.get('存世情况', '未知')
        survival_stats[survival] += 1
    
    # 旭日图数据
    sunburst_data = []
    for book_type, books_list in type_stats.items():
        children = []
        for book in books_list:
            children.append({
                "name": book.get('书名', '未知'),
                "value": 1,
                "dynasty": book.get('朝代', '未知'),
                "author": book.get('作者', '佚名'),
                "survival": book.get('存世情况', '未知')
            })
        sunburst_data.append({
            "name": book_type,
            "children": children
        })
    
    result = {
        "meta": {
            "title": "中国古代建筑著作数据",
            "source": "百度百科、故宫博物院、权威文献",
            "total": len(books),
            "generated_at": datetime.now().isoformat()
        },
        "dynasty_distribution": [
            {"name": k, "value": len(v), "books": [b.get('书名', '未知') for b in v]}
            for k, v in sorted(dynasty_stats.items(), key=lambda x: len(x[1]), reverse=True)
        ],
        "type_distribution": [
            {"name": k, "value": len(v)} for k, v in type_stats.items()
        ],
        "survival_distribution": [
            {"name": k, "value": v} for k, v in survival_stats.items()
        ],
        "sunburst_data": sunburst_data,
        "timeline_data": [
            {
                "title": book.get('书名', '未知'),
                "author": book.get('作者', '佚名'),
                "dynasty": book.get('朝代', '未知'),
                "period": book.get('成书时间', ''),
                "type": book.get('类别', '其他'),
                "survival_status": book.get('存世情况', '未知'),
                "significance": book.get('历史地位', '')
            }
            for book in sorted(books, key=lambda x: x.get('成书时间', ''))
        ]
    }
    
    return save_json(result, 'books_processed.json')


def process_culture():
    """处理建筑文化数据"""
    data = load_json('culture.json')
    
    # 民居数据
    residences = data.get('residences', [])
    # 官府数据
    official_buildings = data.get('official_buildings', [])
    # 皇宫数据
    palaces = data.get('palaces', [])
    # 桥梁数据
    bridges = data.get('bridges', [])
    # 非遗数据
    intangible_heritage = data.get('heritage_crafts', [])
    
    # 民居地域分布
    residence_regions = defaultdict(list)
    for r in residences:
        region = r.get('地区', '其他')
        residence_regions[region].append(r)
    
    # 桥梁类型统计
    bridge_types = defaultdict(list)
    for b in bridges:
        btype = b.get('类型', '其他')
        bridge_types[btype].append(b)
    
    result = {
        "meta": {
            "title": "中国古代建筑文化数据",
            "source": "中国非物质文化遗产网、国家文物局、学术文献",
            "generated_at": datetime.now().isoformat()
        },
        "residence": {
            "total": len(residences),
            "region_distribution": [
                {"name": k, "value": len(v), "types": [r.get('类型', '未知') for r in v]}
                for k, v in residence_regions.items()
            ],
            "detail": residences
        },
        "official": {
            "total": len(official_buildings),
            "detail": official_buildings
        },
        "palace": {
            "total": len(palaces),
            "detail": palaces
        },
        "bridge": {
            "total": len(bridges),
            "type_distribution": [
                {"name": k, "value": len(v), "bridges": [b.get('名称', '未知') for b in v]}
                for k, v in bridge_types.items()
            ],
            "detail": bridges
        },
        "intangible_heritage": {
            "total": len(intangible_heritage),
            "detail": intangible_heritage
        }
    }
    
    return save_json(result, 'culture_processed.json')


def generate_summary():
    """生成数据汇总报告"""
    summary = {
        "meta": {
            "title": "数据清洗汇总报告",
            "generated_at": datetime.now().isoformat(),
            "version": "1.0"
        },
        "datasets": {
            "buildings": {
                "source_file": "ncha_ancient_buildings.json",
                "output_file": "buildings_processed.json",
                "total_records": 43,
                "fields": ["dynasty_distribution", "province_distribution", "type_distribution", "batch_distribution"]
            },
            "architects": {
                "source_file": "architects.json",
                "output_file": "architects_processed.json",
                "total_records": 20,
                "fields": ["dynasty_distribution", "influence_distribution", "graph_data", "timeline_data"]
            },
            "books": {
                "source_file": "books.json",
                "output_file": "books_processed.json",
                "total_records": 14,
                "fields": ["dynasty_distribution", "type_distribution", "survival_distribution", "sunburst_data", "timeline_data"]
            },
            "culture": {
                "source_file": "culture.json",
                "output_file": "culture_processed.json",
                "total_records": {
                    "residences": 8,
                    "official_buildings": 5,
                    "palaces": 5,
                    "bridges": 8,
                    "intangible_heritage": 12
                },
                "fields": ["residence", "official", "palace", "bridge", "intangible_heritage"]
            }
        },
        "usage": {
            "description": "处理后的数据文件位于 data/processed/ 目录，可直接用于ECharts图表渲染",
            "integration": "在JS中使用: fetch('./data/processed/xxx_processed.json')"
        }
    }
    
    return save_json(summary, 'data_summary.json')


def main():
    """主函数"""
    print("=" * 60)
    print("数据清洗与结构化处理")
    print("=" * 60)
    print()
    
    try:
        # 处理各类数据
        process_buildings()
        process_architects()
        process_books()
        process_culture()
        
        # 生成汇总报告
        generate_summary()
        
        print()
        print("=" * 60)
        print("✓ 所有数据处理完成！")
        print(f"✓ 输出目录: {PROCESSED_DIR}")
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ 处理失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
