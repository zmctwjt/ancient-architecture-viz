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
  // 主色调
  primary: '#C8A96E',      // 古铜金
  secondary: '#4ECDC4',    // 青瓦色
  accent: '#E07B54',       // 朱砂红
  
  // 背景色
  bgDark: '#0d1117',       // 深夜墨色
  bgCard: 'rgba(13, 17, 23, 0.8)', // 卡片背景
  
  // 文字色
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  // 图表配色方案
  chart: [
    '#C8A96E',  // 古铜金
    '#4ECDC4',  // 青瓦色
    '#E07B54',  // 朱砂红
    '#9B59B6',  // 紫罗兰
    '#3498DB',  // 天蓝
    '#2ECC71',  // 翠绿
    '#F39C12',  // 琥珀
    '#E74C3C',  // 朱红
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
    backgroundColor: 'rgba(13, 17, 23, 0.9)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    textStyle: {
      color: COLORS.textPrimary
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
