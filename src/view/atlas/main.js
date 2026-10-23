/**
 * 营造图谱页 —— 四个派生维度的可视化
 * 数据源：public/data/insights.json（由 buildings.json 派生）
 */
import echarts from '../../js/common/echarts.js';
import { COLORS, ECHARTS_THEME, loadJson } from '../../js/common/utils.js';

const chartInstances = [];

/* ============================================================
   指标条
   ============================================================ */
function renderMetrics(data) {
  const total = data.meta.total;
  const mingQing = data.dynasty_density.find(d => d.dynasty === '明清');
  const heritage = data.heritage;
  const cover = data.architect_coverage;

  const set = (id, val, unit) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `${val}<small>${unit}</small>`;
  };

  set('m-total', total, '处');
  set('m-density', mingQing ? mingQing.perCentury : 0, '处/百年');
  set('m-heritage', Math.round(heritage.ratio * 100), '%');
  set('m-architect', Math.round(cover.ratio * 100), '%');
}

/* ============================================================
   1. 朝代营造密度（柱 + 折线双轴）
   ============================================================ */
function initDensityChart(data) {
  const dom = document.getElementById('density-chart');
  if (!dom) return;
  const chart = echarts.init(dom);
  chartInstances.push(chart);

  const rows = data.dynasty_density;

  const option = {
    ...ECHARTS_THEME,
    grid: { top: 50, bottom: 34, left: 52, right: 52 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const r = rows[params[0].dataIndex];
        return `<strong>${r.dynasty}</strong><br/>
          遗存数量：${r.count} 处<br/>
          朝代跨度：${r.span} 年<br/>
          每百年密度：<span style="color:${COLORS.accent};">${r.perCentury}</span> 处/百年`;
      },
    },
    legend: {
      data: ['遗存数量', '每百年密度'],
      top: 4,
      textStyle: { color: COLORS.textSecondary, fontSize: 11 },
      itemWidth: 14,
      itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: rows.map(d => d.dynasty),
      axisLine: { lineStyle: { color: 'rgba(200,169,110,0.3)' } },
      axisLabel: { color: COLORS.textSecondary, fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '遗存数量 / 处',
        nameTextStyle: { color: COLORS.textMuted, fontSize: 10, padding: [0, 0, 6, 0] },
        axisLabel: { color: COLORS.textMuted, fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(200,169,110,0.08)' } },
      },
      {
        type: 'value',
        name: '密度 / 处·百年⁻¹',
        nameTextStyle: { color: COLORS.textMuted, fontSize: 10, padding: [0, 0, 6, 0] },
        axisLabel: { color: COLORS.textMuted, fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '遗存数量',
        type: 'bar',
        barWidth: '40%',
        data: rows.map(d => d.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(200,169,110,0.92)' },
            { offset: 1, color: 'rgba(200,169,110,0.22)' },
          ]),
          borderRadius: [2, 2, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: COLORS.textSecondary,
          fontSize: 11,
        },
      },
      {
        name: '每百年密度',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: rows.map(d => d.perCentury),
        lineStyle: { width: 2, color: COLORS.accent },
        itemStyle: { color: COLORS.accent, borderColor: '#0B0906', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(200,69,47,0.22)' },
            { offset: 1, color: 'rgba(200,69,47,0)' },
          ]),
        },
      },
    ],
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
   2. 世纪分布（横向条形，负世纪朱砂）
   ============================================================ */
function initCenturyChart(data) {
  const dom = document.getElementById('century-chart');
  if (!dom) return;
  const chart = echarts.init(dom);
  chartInstances.push(chart);

  const rows = data.century_distribution.slice().sort((a, b) => a.sortKey - b.sortKey);

  const option = {
    ...ECHARTS_THEME,
    grid: { top: 24, bottom: 30, left: 74, right: 46 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => `${p[0].name}<br/>遗存：<strong>${p[0].value}</strong> 处`,
    },
    xAxis: {
      type: 'value',
      name: '数量 / 处',
      nameTextStyle: { color: COLORS.textMuted, fontSize: 10 },
      axisLabel: { color: COLORS.textMuted, fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(200,169,110,0.07)' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.map(d => d.century),
      axisLine: { lineStyle: { color: 'rgba(200,169,110,0.25)' } },
      axisTick: { show: false },
      axisLabel: {
        color: COLORS.textSecondary,
        fontSize: 10.5,
        fontFamily: 'Songti SC, SimSun, serif',
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: '58%',
        data: rows.map(d => ({
          value: d.value,
          itemStyle: {
            // 公元前用朱砂，公元后用金→青渐变
            color: d.sortKey < 0
              ? 'rgba(200,69,47,0.75)'
              : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: 'rgba(200,169,110,0.28)' },
                  { offset: 1, color: 'rgba(200,169,110,0.9)' },
                ]),
            borderRadius: [0, 2, 2, 0],
          },
        })),
        label: {
          show: true,
          position: 'right',
          color: COLORS.textMuted,
          fontSize: 10,
        },
      },
    ],
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
   3. 省份 × 类别 热力图
   ============================================================ */
function initHeatmapChart(data) {
  const dom = document.getElementById('heatmap-chart');
  if (!dom) return;
  const chart = echarts.init(dom);
  chartInstances.push(chart);

  const m = data.province_matrix;
  const maxVal = Math.max(...m.data.map(d => d[2]));

  const option = {
    ...ECHARTS_THEME,
    grid: { top: 16, bottom: 78, left: 52, right: 30 },
    tooltip: {
      position: 'top',
      formatter: (p) =>
        `${m.provinces[p.value[1]]} · ${m.categories[p.value[0]]}<br/>遗存：<strong>${p.value[2]}</strong> 处`,
    },
    xAxis: {
      type: 'category',
      data: m.categories,
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(200,169,110,0.25)' } },
      axisTick: { show: false },
      axisLabel: {
        color: COLORS.textSecondary,
        fontSize: 10.5,
        interval: 0,
        rotate: 34,
      },
    },
    yAxis: {
      type: 'category',
      data: m.provinces,
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(200,169,110,0.25)' } },
      axisTick: { show: false },
      axisLabel: {
        color: COLORS.textSecondary,
        fontSize: 10.5,
        fontFamily: 'Songti SC, SimSun, serif',
      },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 6,
      itemWidth: 12,
      itemHeight: 90,
      textStyle: { color: COLORS.textMuted, fontSize: 10 },
      inRange: {
        color: ['#161310', '#3A2E1E', '#6E552E', '#A8874C', '#D9BC80'],
      },
      text: ['多', '少'],
    },
    series: [
      {
        type: 'heatmap',
        data: m.data,
        itemStyle: {
          borderColor: 'rgba(11,9,6,0.9)',
          borderWidth: 1.5,
        },
        label: {
          show: true,
          color: 'rgba(255,255,255,0.82)',
          fontSize: 9.5,
          formatter: (p) => (p.value[2] >= 3 ? p.value[2] : ''),
        },
        emphasis: {
          itemStyle: {
            borderColor: COLORS.accent,
            borderWidth: 1.5,
            shadowBlur: 10,
            shadowColor: 'rgba(200,69,47,0.5)',
          },
        },
      },
    ],
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
   4. 朝代 → 类别 桑基图
   ============================================================ */
function initSankeyChart(data) {
  const dom = document.getElementById('sankey-chart');
  if (!dom) return;
  const chart = echarts.init(dom);
  chartInstances.push(chart);

  const dynasties = new Set(data.dynasty_density.map(d => d.dynasty));

  const nodes = data.category_flow.nodes.map((n) => ({
    ...n,
    itemStyle: dynasties.has(n.name)
      ? { color: 'rgba(200,169,110,0.85)', borderColor: 'rgba(200,169,110,0.5)' }
      : { color: 'rgba(127,168,160,0.7)', borderColor: 'rgba(127,168,160,0.4)' },
    label: {
      color: COLORS.textPrimary,
      fontSize: 11,
      fontFamily: dynasties.has(n.name) ? 'Songti SC, SimSun, serif' : undefined,
    },
  }));

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        if (p.dataType === 'edge') {
          return `${p.data.source} → ${p.data.target}<br/>数量：<strong>${p.data.value}</strong> 处`;
        }
        return `${p.name}`;
      },
    },
    series: [
      {
        type: 'sankey',
        left: 12,
        right: 96,
        top: 16,
        bottom: 16,
        nodeWidth: 10,
        nodeGap: 9,
        draggable: false,
        emphasis: { focus: 'adjacency' },
        data: nodes,
        links: data.category_flow.links,
        lineStyle: {
          color: 'gradient',
          opacity: 0.28,
          curveness: 0.5,
        },
        label: { fontSize: 11 },
      },
    ],
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
   初始化
   ============================================================ */
async function init() {
  try {
    const data = await loadJson('insights.json');
    renderMetrics(data);
    initDensityChart(data);
    initCenturyChart(data);
    initHeatmapChart(data);
    initSankeyChart(data);
  } catch (e) {
    console.warn('营造图谱数据加载失败', e);
  }
}

init();
