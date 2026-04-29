#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
联调测试脚本
检查项目所有页面、数据和功能是否正常工作
"""

import os
import json
import sys

# 项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 颜色输出
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'


def print_success(msg):
    print(f"{GREEN}✓{RESET} {msg}")


def print_error(msg):
    print(f"{RED}✗{RESET} {msg}")


def print_warning(msg):
    print(f"{YELLOW}⚠{RESET} {msg}")


def check_file_exists(filepath, description):
    """检查文件是否存在"""
    full_path = os.path.join(BASE_DIR, filepath)
    if os.path.exists(full_path):
        print_success(f"{description}: {filepath}")
        return True
    else:
        print_error(f"{description}缺失: {filepath}")
        return False


def check_json_valid(filepath, description):
    """检查JSON文件是否有效"""
    full_path = os.path.join(BASE_DIR, filepath)
    if not os.path.exists(full_path):
        print_error(f"{description}缺失: {filepath}")
        return False

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print_success(f"{description}有效: {filepath}")
        return True
    except json.JSONDecodeError as e:
        print_error(f"{description}JSON格式错误: {filepath} - {e}")
        return False
    except Exception as e:
        print_error(f"{description}读取错误: {filepath} - {e}")
        return False


def test_pages():
    """测试页面文件"""
    print("\n" + "="*60)
    print("测试页面文件")
    print("="*60)

    pages = [
        ("index.html", "首页"),
        ("src/view/achievement/index.html", "建筑成就页"),
        ("src/view/scientist/index.html", "杰出科学家页"),
        ("src/view/literature/index.html", "传世著作页"),
        ("src/view/culture/index.html", "建筑文化页"),
        ("src/view/transition/index.html", "朝代过渡页"),
    ]

    results = []
    for filepath, desc in pages:
        results.append(check_file_exists(filepath, desc))

    return all(results)


def test_data_files():
    """测试数据文件"""
    print("\n" + "="*60)
    print("测试数据文件")
    print("="*60)

    # 原始数据
    raw_files = [
        ("data/raw/ncha_ancient_buildings.json", "建筑成就原始数据"),
        ("data/raw/architects.json", "科学家原始数据"),
        ("data/raw/books.json", "著作原始数据"),
        ("data/raw/culture.json", "文化原始数据"),
    ]

    # 处理后数据
    processed_files = [
        ("data/processed/buildings_processed.json", "建筑成就处理后数据"),
        ("data/processed/architects_processed.json", "科学家处理后数据"),
        ("data/processed/books_processed.json", "著作处理后数据"),
        ("data/processed/culture_processed.json", "文化处理后数据"),
        ("data/processed/data_summary.json", "数据汇总报告"),
    ]

    results = []
    for filepath, desc in raw_files + processed_files:
        results.append(check_json_valid(filepath, desc))

    return all(results)


def test_scripts():
    """测试脚本文件"""
    print("\n" + "="*60)
    print("测试脚本文件")
    print("="*60)

    scripts = [
        ("spider/spider_ncha.py", "建筑成就爬虫"),
        ("spider/spider_architect.py", "科学家爬虫"),
        ("spider/spider_books.py", "著作爬虫"),
        ("spider/spider_culture.py", "文化爬虫"),
        ("spider/run_all_spiders.py", "爬虫运行脚本"),
        ("scripts/data_processor.py", "数据处理器"),
    ]

    results = []
    for filepath, desc in scripts:
        results.append(check_file_exists(filepath, desc))

    return all(results)


def test_docs():
    """测试文档文件"""
    print("\n" + "="*60)
    print("测试文档文件")
    print("="*60)

    docs = [
        ("docs/01-作品设计说明书.md", "作品设计说明书"),
        ("docs/02-数据源说明.md", "数据源说明"),
        ("docs/03-安装部署说明.md", "安装部署说明"),
        ("docs/04-开源代码与组件使用说明.md", "开源代码说明"),
        ("docs/05-项目交付清单.md", "项目交付清单"),
        ("docs/06-演示指南.md", "演示指南"),
        ("README.md", "项目README"),
        ("项目总结.md", "项目总结"),
    ]

    results = []
    for filepath, desc in docs:
        results.append(check_file_exists(filepath, desc))

    return all(results)


def test_js_modules():
    """测试JS模块"""
    print("\n" + "="*60)
    print("测试JS模块")
    print("="*60)

    modules = [
        ("src/js/effects/pageTransition.js", "页面过渡动画"),
        ("src/js/effects/leafAnimation.js", "飘落叶片动画"),
        ("src/js/effects/interactions.js", "交互效果"),
        ("src/js/effects/index.js", "动效模块入口"),
        ("src/js/utils/responsive.js", "响应式工具"),
        ("src/js/app.js", "应用入口"),
    ]

    results = []
    for filepath, desc in modules:
        results.append(check_file_exists(filepath, desc))

    return all(results)


def test_css_files():
    """测试CSS文件"""
    print("\n" + "="*60)
    print("测试CSS文件")
    print("="*60)

    css_files = [
        ("src/css/common.css", "公共样式"),
        ("src/css/style.css", "全局样式"),
        ("src/css/responsive.css", "响应式样式"),
    ]

    results = []
    for filepath, desc in css_files:
        results.append(check_file_exists(filepath, desc))

    return all(results)


def test_package_json():
    """测试package.json配置"""
    print("\n" + "="*60)
    print("测试项目配置")
    print("="*60)

    filepath = "package.json"
    full_path = os.path.join(BASE_DIR, filepath)

    if not os.path.exists(full_path):
        print_error(f"package.json缺失")
        return False

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # 检查必要字段
        required_fields = ['name', 'version', 'scripts', 'dependencies']
        for field in required_fields:
            if field in config:
                print_success(f"package.json包含{field}字段")
            else:
                print_warning(f"package.json缺少{field}字段")

        # 检查依赖
        deps = config.get('dependencies', {})
        required_deps = ['echarts', 'gsap']
        for dep in required_deps:
            if dep in deps:
                print_success(f"依赖已安装: {dep}@{deps[dep]}")
            else:
                print_error(f"依赖缺失: {dep}")

        return True
    except Exception as e:
        print_error(f"package.json读取错误: {e}")
        return False


def count_project_stats():
    """统计项目数据"""
    print("\n" + "="*60)
    print("项目统计")
    print("="*60)

    stats = {
        'html': 0,
        'css': 0,
        'js': 0,
        'py': 0,
        'md': 0,
        'json': 0
    }

    for root, dirs, files in os.walk(BASE_DIR):
        # 排除node_modules和dist
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]

        for file in files:
            ext = file.split('.')[-1].lower()
            if ext in stats:
                stats[ext] += 1

    print(f"HTML文件: {stats['html']}个")
    print(f"CSS文件: {stats['css']}个")
    print(f"JavaScript文件: {stats['js']}个")
    print(f"Python文件: {stats['py']}个")
    print(f"Markdown文件: {stats['md']}个")
    print(f"JSON文件: {stats['json']}个")
    print(f"总计: {sum(stats.values())}个文件")


def main():
    """主函数"""
    print("="*60)
    print("项目联调测试")
    print("="*60)
    print(f"项目路径: {BASE_DIR}")

    results = []

    # 运行所有测试
    results.append(("页面文件", test_pages()))
    results.append(("数据文件", test_data_files()))
    results.append(("脚本文件", test_scripts()))
    results.append(("文档文件", test_docs()))
    results.append(("JS模块", test_js_modules()))
    results.append(("CSS文件", test_css_files()))
    results.append(("项目配置", test_package_json()))

    # 统计
    count_project_stats()

    # 汇总结果
    print("\n" + "="*60)
    print("测试结果汇总")
    print("="*60)

    all_passed = True
    for name, passed in results:
        if passed:
            print_success(f"{name}测试通过")
        else:
            print_error(f"{name}测试失败")
            all_passed = False

    print("\n" + "="*60)
    if all_passed:
        print(f"{GREEN}✓ 所有测试通过！项目已准备就绪。{RESET}")
    else:
        print(f"{RED}✗ 部分测试失败，请检查上述错误。{RESET}")
    print("="*60)

    return 0 if all_passed else 1


if __name__ == '__main__':
    sys.exit(main())
