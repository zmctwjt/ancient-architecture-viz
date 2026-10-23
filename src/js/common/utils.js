/**
 * 公共工具函数
 */

/**
 * 防抖函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
export function throttle(fn, interval = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 获取URL参数
 */
export function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * 加载JSON数据
 */
export async function loadData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('加载数据失败:', url, error);
    return null;
  }
}

/**
 * 获取数据文件URL（兼容dev和build环境的base路径）
 */
export function getDataUrl(filename) {
  const base = import.meta.env.BASE_URL || '/';
  return base + 'data/' + filename;
}

/**
 * 加载 public/data/ 下的JSON文件
 * @param {string} filename - 文件名，如 'buildings.json'
 * @returns {Promise<object|null>}
 */
export async function loadJson(filename) {
  const url = getDataUrl(filename);
  return loadData(url);
}

/**
 * 创建图表容器
 */
export function createChartContainer(id, className = 'chart-container') {
  const container = document.createElement('div');
  container.id = id;
  container.className = className;
  return container;
}

/**
 * 设置图表响应式
 */
export function makeChartResponsive(chart) {
  const resizeHandler = debounce(() => {
    chart && chart.resize();
  }, 200);
  
  window.addEventListener('resize', resizeHandler);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
}

/**
 * 颜色配置 - 古建筑主题色
 */
export const COLORS = {
  // 主色调（墨 + 朱砂 + 古铜，低饱和文人色系）
  primary: '#C8A96E',      // 古铜金
  secondary: '#7FA8A0',    // 青瓦（降饱和）
  accent: '#C8452F',       // 朱砂

  // 背景色
  bgDark: '#0B0906',       // 暖墨
  bgCard: 'rgba(18, 16, 12, 0.9)', // 卡片背景

  // 文字色（暖白）
  textPrimary: '#F2EBE0',
  textSecondary: 'rgba(242, 235, 224, 0.68)',
  textMuted: 'rgba(242, 235, 224, 0.42)',

  // 图表配色方案（同色系、低饱和，保证可读性前提下统一气质）
  chart: [
    '#C8A96E',  // 古铜金
    '#7FA8A0',  // 青瓦
    '#C8452F',  // 朱砂
    '#8E9B73',  // 苍绿
    '#6E8FA8',  // 黛蓝
    '#A88A5C',  // 土黄
    '#A9644F',  // 砖红
    '#8C7A9E',  // 紫檀
  ]
};

/**
 * 检查某个朝代字符串是否属于目标六大朝代
 * @param {string} dynastyStr - 数据中的朝代字符串（如"隋"、"唐"、"明末清初"）
 * @param {string} targetGroup - 目标六大朝代（如"隋唐"、"明清"）
 * @returns {boolean}
 */
export function matchDynastyGroup(dynastyStr, targetGroup) {
  if (!dynastyStr || !targetGroup) return false;
  const s = String(dynastyStr);
  const map = {
    '先秦': /商|周|夏|春秋|战国|先秦/,
    '秦汉': /秦|汉/,
    '魏晋': /魏|晋|南北朝|曹魏|北魏|东魏|西魏|北齐|北周|前秦|后秦|西秦|北汉|西夏|三国/,
    '隋唐': /隋|唐/,
    '宋元': /宋|元|辽|金/,
    '明清': /明|清/
  };
  const regex = map[targetGroup];
  return regex ? regex.test(s) : s.includes(targetGroup);
}

/**
 * ECharts 主题配置
 */
export const ECHARTS_THEME = {
  color: COLORS.chart,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    color: COLORS.textPrimary
  },
  title: {
    textStyle: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: 'normal'
    },
    subtextStyle: {
      color: COLORS.textSecondary
    }
  },
  legend: {
    textStyle: {
      color: COLORS.textSecondary
    }
  },
  tooltip: {
    backgroundColor: 'rgba(11, 16, 24, 0.94)',
    borderColor: 'rgba(200, 169, 110, 0.55)',
    borderWidth: 1,
    padding: [10, 14],
    extraCssText:
      'border-radius:10px;' +
      'box-shadow:0 12px 34px -10px rgba(0,0,0,.85), 0 0 22px -8px rgba(200,169,110,.35);' +
      'backdrop-filter:blur(10px);' +
      'letter-spacing:.2px;',
    textStyle: {
      color: COLORS.textPrimary,
      fontSize: 12,
      lineHeight: 20
    },
    axisPointer: {
      lineStyle: { color: 'rgba(200, 169, 110, 0.45)', width: 1, type: 'dashed' },
      crossStyle: { color: 'rgba(200, 169, 110, 0.5)' },
      shadowStyle: { color: 'rgba(200, 169, 110, 0.06)' }
    }
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    axisLabel: {
      color: COLORS.textSecondary
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    axisLabel: {
      color: COLORS.textSecondary
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
};
