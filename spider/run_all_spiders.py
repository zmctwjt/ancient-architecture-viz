"""
run_all_spiders.py
==================
一键运行所有爬虫，生成完整数据集
"""
import subprocess
import sys
import os
import json
from datetime import datetime

SPIDER_DIR = os.path.dirname(os.path.abspath(__file__))
SPIDERS = [
    "spider_ncha.py",
    "spider_architect.py",
    "spider_books.py",
    "spider_culture.py",
]

def run_spider(script_name: str) -> bool:
    script_path = os.path.join(SPIDER_DIR, script_name)
    print(f"\n{'='*60}")
    print(f"▶ 运行：{script_name}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=False,
            text=True,
            cwd=SPIDER_DIR
        )
        if result.returncode == 0:
            print(f"[OK] {script_name} 完成")
            return True
        else:
            print(f"[FAIL] {script_name} 异常退出（代码 {result.returncode}）")
            return False
    except Exception as e:
        print(f"[ERR] {script_name} 运行错误：{e}")
        return False


def check_output_files():
    """检查输出文件是否生成"""
    data_dir = os.path.join(SPIDER_DIR, "..", "data", "raw")
    expected_files = [
        "ncha_ancient_buildings.json",
        "architects.json",
        "books.json",
        "culture.json",
    ]
    print(f"\n{'='*60}")
    print("输出文件检查")
    print(f"{'='*60}")
    all_ok = True
    for fname in expected_files:
        fpath = os.path.join(data_dir, fname)
        if os.path.exists(fpath):
            size = os.path.getsize(fpath)
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            total = (
                data.get("meta", {}).get("total") or
                len(data.get("data", data.get("residences", [])))
            )
            print(f"  ✓ {fname:<40} {size//1024:>4} KB  |  条目数：{total}")
        else:
            print(f"  ✗ {fname} 未生成")
            all_ok = False
    return all_ok


if __name__ == "__main__":
    start = datetime.now()
    print(f"[START] 开始运行所有爬虫 [{start.strftime('%H:%M:%S')}]")

    results = {}
    for spider in SPIDERS:
        ok = run_spider(spider)
        results[spider] = "[OK]  成功" if ok else "[FAIL] 失败"

    check_output_files()

    end = datetime.now()
    elapsed = (end - start).seconds

    print(f"\n{'='*60}")
    print(f"[DONE] 全部完成！耗时 {elapsed} 秒")
    print(f"{'='*60}")
    for spider, status in results.items():
        print(f"  {status}  {spider}")
