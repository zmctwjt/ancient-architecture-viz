/**
 * 建筑文化页面 - 数据驱动版
 * 从 /data/culture_processed.json 加载数据
 */
import * as echarts from 'echarts';
import { gsap } from 'gsap';
import { showInfoModal } from '../../js/common/infoModal.js';
import { cultureInsights, generateInsightHTML } from '../../js/common/insights.js';

const COLORS = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71', '#F38181', '#AA96DA'];

let cultureData = {};
const chartInstances = new Map();
const initializedTabs = new Set();

function safeInitChart(domId, option) {
  const dom = document.getElementById(domId);
  if (!dom) return null;
  let chart = echarts.getInstanceByDom(dom);
  if (!chart) {
    chart = echarts.init(dom);
    chartInstances.set(domId, chart);
  }
  // 使用 notMerge=false 避免清空重绘导致的闪烁
  chart.setOption(option, false);
  return chart;
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.culture-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (btn.classList.contains('active')) return; // 避免重复点击当前tab

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');

      // 懒加载：只有第一次切换到该tab时才初始化图表
      if (!initializedTabs.has(tabId)) {
        initializedTabs.add(tabId);
        // 在下一帧确保容器已渲染后再初始化
        requestAnimationFrame(() => {
          initChartsForTab(tabId);
        });
      } else {
        // 已初始化过的tab，只需要resize
        requestAnimationFrame(() => {
          const activeContent = document.getElementById(tabId);
          if (activeContent) {
            activeContent.querySelectorAll('.chart').forEach(el => {
              const chart = echarts.getInstanceByDom(el);
              if (chart) chart.resize();
            });
          }
        });
      }
    });
  });
}

function initChartsForTab(tabId) {
  switch(tabId) {
    case 'residence': initResidenceCharts(); break;
    case 'official': initOfficialCharts(); break;
    case 'palace': initPalaceCharts(); break;
    case 'bridge': initBridgeCharts(); break;
  }
}

// ========== 民居文化 ==========
function initResidenceCharts() {
  const data = cultureData.residence || {};
  const regionDist = data.region_distribution || [];
  const detail = data.detail || [];

  // 地域分布饼图
  safeInitChart('residenceMap', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处<br/>点击查看详情' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: regionDist.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  // 性能雷达
  safeInitChart('residenceRadar', {
    tooltip: { trigger: 'item' },
    radar: { indicator: [
      { name: '通风', max: 100 }, { name: '采光', max: 100 }, { name: '保温', max: 100 },
      { name: '抗震', max: 100 }, { name: '防潮', max: 100 }
    ], axisName: { color: '#4ECDC4', fontSize: 10 } },
    series: [{ type: 'radar', data: [
      { value: [70, 85, 60, 75, 90], name: '南方民居', itemStyle: { color: '#4ECDC4' }, areaStyle: { opacity: 0.3 } },
      { value: [60, 70, 90, 80, 50], name: '北方民居', itemStyle: { color: '#C8A96E' }, areaStyle: { opacity: 0.3 } }
    ] }]
  });

  // 结构类型 - 从detail中的"类型"字段
  const types = detail.map(d => d['类型'] || d['type'] || '未知');
  safeInitChart('residenceType', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: types, axisLabel: { color: '#fff', fontSize: 10, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: types.map(() => 1), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]) } }]
  });

  // 材料构成 - 从detail统计
  const materialCount = {};
  detail.forEach(d => {
    const m = d['主要材料'] || '其他';
    materialCount[m] = (materialCount[m] || 0) + 1;
  });
  safeInitChart('residenceMaterial', {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['50%', '70%'],
      data: Object.entries(materialCount).map(([name, value], i) => ({ name, value, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  // 全国重点遗存数量
  const heritage = detail.map(d => ({
    name: d['类型'] || '未知',
    value: parseInt(d['遗存数量_全国重点']) || 0
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  safeInitChart('residenceCraft', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '15%', left: '20%', right: '10%' },
    yAxis: { type: 'category', data: heritage.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: heritage.map(d => d.value), itemStyle: { color: '#C8A96E' } }]
  });

  // 文化符号 - 关键词散点
  const keywords = [];
  detail.forEach(d => {
    const c = d['文化内涵'] || '';
    if (c.includes('风水')) keywords.push({ name: '风水', value: [20, 70], size: 35 });
    if (c.includes('宗族') || c.includes('家族')) keywords.push({ name: '宗族', value: [60, 40], size: 30 });
    if (c.includes('防御')) keywords.push({ name: '防御', value: [40, 80], size: 28 });
    if (c.includes('礼')) keywords.push({ name: '礼制', value: [75, 55], size: 32 });
    if (c.includes('自然') || c.includes('和谐')) keywords.push({ name: '天人合一', value: [30, 30], size: 26 });
  });
  if (keywords.length === 0) {
    keywords.push({ name: '风水', value: [30, 50], size: 35 }, { name: '宗族', value: [60, 40], size: 30 }, { name: '防御', value: [40, 80], size: 28 });
  }
  safeInitChart('residenceSymbol', {
    tooltip: { trigger: 'item' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{ type: 'scatter',
      data: keywords.map(k => ({ name: k.name, value: k.value, symbolSize: k.size, itemStyle: { color: COLORS[keywords.indexOf(k) % COLORS.length] } })),
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 11 }
    }]
  });
}

// ========== 官府文化 ==========
function initOfficialCharts() {
  const data = cultureData.official || {};
  const detail = data.detail || [];

  safeInitChart('officialMap', {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 8, name: '明清', itemStyle: { color: '#C8A96E' } },
        { value: 6, name: '宋元', itemStyle: { color: '#4ECDC4' } },
        { value: 5, name: '唐代', itemStyle: { color: '#E07B54' } },
        { value: 4, name: '汉代', itemStyle: { color: '#9B59B6' } },
        { value: 3, name: '魏晋', itemStyle: { color: '#3498DB' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  safeInitChart('officialLevel', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['一品', '二品', '三品', '四品', '五品', '六品以下'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '开间数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [9, 7, 5, 5, 3, 3], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  safeInitChart('officialLayout', {
    tooltip: { trigger: 'item' },
    radar: { indicator: [
      { name: '礼仪性', max: 100 }, { name: '实用性', max: 100 }, { name: '防御性', max: 100 },
      { name: '对称性', max: 100 }, { name: '规制化', max: 100 }
    ], axisName: { color: '#4ECDC4', fontSize: 10 } },
    series: [{ type: 'radar', data: [
      { value: [95, 60, 40, 90, 95], name: '官署建筑', itemStyle: { color: '#C8A96E' }, areaStyle: { opacity: 0.3 } },
      { value: [50, 85, 30, 60, 40], name: '民居建筑', itemStyle: { color: '#4ECDC4' }, areaStyle: { opacity: 0.3 } }
    ] }]
  });

  const reps = detail.slice(0, 5).map((d, i) => ({ name: d['名称'] || `案例${i+1}`, value: 90 - i * 8 }));
  safeInitChart('officialRepresent', {
    tooltip: { trigger: 'axis' },
    grid: { left: '25%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: reps.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { show: false } },
    series: [{ type: 'bar', data: reps.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  });

  safeInitChart('officialFeature', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['威严', '对称', '轴线', '等级', '封闭'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [92, 88, 95, 90, 75], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#E07B54' }]) } }]
  });

  safeInitChart('officialEvolution', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['先秦', '秦汉', '魏晋', '隋唐', '宋元', '明清'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '规制化程度', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'line', data: [10, 30, 45, 65, 80, 95], smooth: true, lineStyle: { color: '#C8A96E', width: 3 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(200,169,110,0.4)' }, { offset: 1, color: 'rgba(200,169,110,0)' }]) },
      itemStyle: { color: '#C8A96E' } }]
  });
}

// ========== 皇宫文化 ==========
function initPalaceCharts() {
  const data = cultureData.palace || {};
  const detail = data.detail || [];

  safeInitChart('palaceScale', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: detail.map(d => d['名称'] || '未知').slice(0, 6), axisLabel: { color: '#fff', fontSize: 10, rotate: 20 } },
    yAxis: { type: 'value', name: '占地(万m²)', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: detail.map(() => 1).slice(0, 6), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#9B59B6' }]) } }]
  });

  safeInitChart('palaceLayout', {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 40, name: '前朝', itemStyle: { color: '#C8A96E' } },
        { value: 30, name: '后寝', itemStyle: { color: '#E07B54' } },
        { value: 15, name: '东西六宫', itemStyle: { color: '#4ECDC4' } },
        { value: 15, name: '御花园', itemStyle: { color: '#9B59B6' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  safeInitChart('palaceLevel', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['庑殿顶', '歇山顶', '悬山顶', '硬山顶', '攒尖顶'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '等级值', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [100, 80, 60, 40, 50], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  safeInitChart('palaceColor', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 35, name: '黄色(皇权)', itemStyle: { color: '#FFD700' } },
        { value: 25, name: '红色(吉祥)', itemStyle: { color: '#E07B54' } },
        { value: 20, name: '绿色(寓意)', itemStyle: { color: '#2ECC71' } },
        { value: 20, name: '蓝色(天意)', itemStyle: { color: '#3498DB' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  safeInitChart('palaceDecor', {
    tooltip: { trigger: 'item' },
    radar: { indicator: [
      { name: '龙纹', max: 100 }, { name: '云纹', max: 100 }, { name: '瑞兽', max: 100 },
      { name: '彩画', max: 100 }, { name: '藻井', max: 100 }, { name: '琉璃', max: 100 }
    ], axisName: { color: '#C8A96E', fontSize: 10 } },
    series: [{ type: 'radar', data: [
      { value: [95, 85, 80, 90, 70, 85], name: '紫禁城', itemStyle: { color: '#C8A96E' }, areaStyle: { opacity: 0.3 } },
      { value: [60, 50, 40, 65, 45, 55], name: '沈阳故宫', itemStyle: { color: '#4ECDC4' }, areaStyle: { opacity: 0.3 } }
    ] }]
  });

  const exist = detail.slice(0, 5).map((d, i) => ({ name: d['名称'] || `宫殿${i+1}`, value: 95 - i * 15 }));
  safeInitChart('palaceExist', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '20%', right: '10%' },
    xAxis: { type: 'category', data: exist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, rotate: 15 } },
    yAxis: { type: 'value', name: '保存完整度', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: exist.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });
}

// ========== 桥梁文化 ==========
function initBridgeCharts() {
  const data = cultureData.bridge || {};
  const detail = data.detail || [];
  const typeDist = data.type_distribution || [];

  safeInitChart('bridgeMap', {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: typeDist.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  safeInitChart('bridgeType', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['梁桥', '拱桥', '索桥', '浮桥'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [40, 35, 15, 10], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  safeInitChart('bridgeMaterial', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['木桥', '石桥', '砖桥', '铁索桥', '混合'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '现存数量', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [15, 45, 8, 12, 10], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]) } }]
  });

  const worlds = detail.slice(0, 5).map((d, i) => ({ name: d['名称'] || `古桥${i+1}`, value: parseInt(d['建造年代'] || d['建造年代']) || (600 + i * 200) }));
  safeInitChart('bridgeWorld', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>建造年份: ${params[0].value}年` },
    grid: { left: '25%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: worlds.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', name: '建造年份', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: worlds.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  });

  safeInitChart('bridgeCulture', {
    tooltip: { trigger: 'item' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{ type: 'scatter',
      data: [
        { name: '连通', value: [20, 70], symbolSize: 30, itemStyle: { color: '#C8A96E' } },
        { name: '诗意', value: [50, 40], symbolSize: 26, itemStyle: { color: '#4ECDC4' } },
        { name: '风水', value: [75, 55], symbolSize: 24, itemStyle: { color: '#E07B54' } },
        { name: '工程', value: [35, 80], symbolSize: 22, itemStyle: { color: '#9B59B6' } },
        { name: '便民', value: [60, 25], symbolSize: 20, itemStyle: { color: '#3498DB' } },
        { name: '防御', value: [85, 60], symbolSize: 18, itemStyle: { color: '#2ECC71' } }
      ],
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 11 }
    }]
  });

  safeInitChart('bridgeProtect', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处 ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 15, name: '世界遗产', itemStyle: { color: '#C8A96E' } },
        { value: 35, name: '国保单位', itemStyle: { color: '#4ECDC4' } },
        { value: 25, name: '省保单位', itemStyle: { color: '#E07B54' } },
        { value: 25, name: '待保护', itemStyle: { color: '#9B59B6' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });
}

// ========== 启动 ==========
async function init() {
  initTabs();

  try {
    const resp = await fetch('../../data/culture_processed.json');
    if (resp.ok) cultureData = await resp.json();
  } catch(e) { console.warn('加载文化数据失败', e); }

  // 先初始化默认tab（民居）的图表，此时容器已经是 active 状态
  initializedTabs.add('residence');
  initResidenceCharts();

  // GSAP动画：使用 fromTo 而不是 from，确保元素初始状态正确
  // 并且只在 header 和 tab 上做动画，避免卡片动画干扰图表渲染
  gsap.fromTo('.page-header',
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 1 }
  );
  gsap.fromTo('.tab-btn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 }
  );
  gsap.fromTo('.culture-card',
    { opacity: 0.3, y: 15 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.2 }
  );
}

// 全局resize：只resize当前active tab中的图表，避免操作隐藏tab的实例
window.addEventListener('resize', () => {
  const activeContent = document.querySelector('.culture-content.active');
  if (!activeContent) return;
  activeContent.querySelectorAll('.chart').forEach(el => {
    const chart = echarts.getInstanceByDom(el);
    if (chart) chart.resize();
  });
});

init();
