/**
 * 建筑文化页面 - 数据驱动版
 * 从 /data/culture_processed.json 加载数据
 */
import * as echarts from 'echarts';
import { gsap } from 'gsap';
import { showInfoModal } from '../../js/common/infoModal.js';
import { cultureInsights, generateInsightHTML } from '../../js/common/insights.js';
import { getDataUrl, loadJson, matchDynastyGroup } from '../../js/common/utils.js';

const COLORS = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71', '#F38181', '#AA96DA'];

let cultureData = {};
const chartInstances = new Map();
const initializedTabs = new Set();

function safeInitChart(domId, option, onClick) {
  const dom = document.getElementById(domId);
  if (!dom) return null;
  let chart = echarts.getInstanceByDom(dom);
  if (!chart || chart.isDisposed()) {
    dom.removeAttribute('_echarts_instance');
    chart = echarts.init(dom);
    chartInstances.set(domId, chart);
  }
  chart.setOption(option, true);
  if (onClick) {
    chart.off('click');
    chart.on('click', onClick);
  }
  return chart;
}

function showEmptyState(domId, message) {
  const dom = document.getElementById(domId);
  if (!dom) return;
  const chart = echarts.getInstanceByDom(dom);
  if (chart) chart.dispose();
  dom.removeAttribute('_echarts_instance');
  dom.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:0.14rem;flex-direction:column;gap:0.1rem;"><span style="font-size:0.3rem;opacity:0.5;">📭</span><span>${message}</span></div>`;
}

function clearEmptyState(domId) {
  const dom = document.getElementById(domId);
  if (dom) dom.innerHTML = '';
}

// 从detail数组的某字段统计频次
function countByField(detail, field, topN = 10) {
  const map = {};
  detail.forEach(d => {
    const v = d[field] || '未知';
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

// 从detail的"朝代"字段提取朝代分组分布
function extractDynastyDist(detail) {
  const groups = { '先秦': 0, '秦汉': 0, '魏晋': 0, '隋唐': 0, '宋元': 0, '明清': 0 };
  detail.forEach(d => {
    const dynastyField = d['朝代'] || d['dynasty'] || '';
    Object.keys(groups).forEach(g => {
      if (matchDynastyGroup(dynastyField, g)) groups[g]++;
    });
  });
  return Object.entries(groups)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

// 从数组字段中统计元素频次（自动flatten数组）
function countArrayField(detail, field, topN = 10) {
  const map = {};
  detail.forEach(d => {
    const val = d[field];
    if (Array.isArray(val)) {
      val.forEach(v => {
        const key = v || '未知';
        map[key] = (map[key] || 0) + 1;
      });
    } else {
      const key = val || '未知';
      map[key] = (map[key] || 0) + 1;
    }
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

// 从建筑名称/描述中提取建筑元素词频
function extractBuildingElements(detail, field) {
  const elements = ['殿', '堂', '楼', '阁', '亭', '台', '门', '桥', '廊', '舍', '池', '碑', '城', '鼓', '钟', '狱', '库', '庙', '寺', '塔', '宫', '苑', '院', '墙', '城', '坊'];
  const map = {};
  elements.forEach(e => map[e] = 0);
  detail.forEach(d => {
    const arr = d[field] || [];
    if (!Array.isArray(arr)) return;
    arr.forEach(item => {
      elements.forEach(e => {
        if (item && item.includes(e)) map[e]++;
      });
    });
  });
  return Object.entries(map)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// 从文本中提取数字（用于遗存数量等文本字段）
function extractNumberFromText(detail, field) {
  return detail.map(d => {
    const text = d[field] || '';
    const match = text.match(/([\d,]+)\s*(余)?[座处]/);
    let num = 0;
    if (match) {
      num = parseInt(match[1].replace(/,/g, ''));
    } else {
      const m2 = text.match(/([\d,]+)/);
      if (m2) num = parseInt(m2[1].replace(/,/g, ''));
    }
    return { name: d['名称'] || '未知', value: num || 0, text };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
}

// 从字符串中提取关键词命中次数
function extractKeywordFreq(detail, field, keywords) {
  const counts = {};
  keywords.forEach(k => counts[k] = 0);
  detail.forEach(d => {
    const text = (d[field] || '').toLowerCase();
    keywords.forEach(k => {
      if (text.includes(k.toLowerCase())) counts[k]++;
    });
  });
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

// 生成弹窗HTML
function buildDetailHTML(item, category) {
  const rows = [];
  const priority = ['名称', '类型', '朝代', '建造年代', '功能', '规制等级', '规模', '地点', '主要材料', '设计者', '屋顶形式', '布局特征', '建筑特色', '文化内涵', '世界遗产', '全国重点文物', '世界纪录'];
  priority.forEach(key => {
    if (item[key] !== undefined && item[key] !== '' && item[key] !== null) {
      let val = item[key];
      if (Array.isArray(val)) val = val.join('、');
      rows.push(`<div style="display:flex;justify-content:space-between;padding:0.06rem 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#888;">${key}</span><span style="color:#C8A96E;max-width:70%;text-align:right;">${val}</span></div>`);
    }
  });
  // 再补充其他字段
  Object.keys(item).forEach(key => {
    if (priority.includes(key)) return;
    if (['detail', 'type_distribution', 'region_distribution'].includes(key)) return;
    let val = item[key];
    if (val === undefined || val === '' || val === null) return;
    if (Array.isArray(val)) val = val.join('、');
    rows.push(`<div style="display:flex;justify-content:space-between;padding:0.06rem 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#888;">${key}</span><span style="color:#fff;max-width:70%;text-align:right;">${val}</span></div>`);
  });
  return `<div style="max-height:60vh;overflow-y:auto;padding-right:0.1rem;">${rows.join('')}</div>`;
}

function showDetailModal(item, category) {
  const title = item['名称'] || item['类型'] || '详细信息';
  showInfoModal({
    title: `${category} · ${title}`,
    content: buildDetailHTML(item, category)
  });
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.culture-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (btn.classList.contains('active')) return;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');

      if (!initializedTabs.has(tabId)) {
        initializedTabs.add(tabId);
        requestAnimationFrame(() => initChartsForTab(tabId));
      } else {
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
      updateInsightPanel(tabId);
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
  const detail = data.detail || [];
  if (detail.length === 0) {
    ['residenceMap','residenceRadar','residenceType','residenceMaterial','residenceCraft','residenceSymbol']
      .forEach(id => showEmptyState(id, '暂无民居数据'));
    return;
  }
  ['residenceMap','residenceRadar','residenceType','residenceMaterial','residenceCraft','residenceSymbol']
    .forEach(id => clearEmptyState(id));

  const regionData = detail.map(d => ({
    name: d['类型'] || '未知',
    value: parseInt(d['遗存数量_全国重点']) || 1
  }));
  safeInitChart('residenceMap', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处<br/>点击查看详情' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: regionData.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const item = detail.find(d => (d['类型'] || '未知') === params.name);
    if (item) showDetailModal(item, '民居文化');
  });

  // 气候适应特征统计（从气候适应字段提取关键词）
  const climateKeywords = ['保温', '防风', '防潮', '通风', '防虫', '防盗', '防匪', '节能', '迁移', '排水', '防火'];
  const climateDist = extractKeywordFreq(detail, '气候适应', climateKeywords);
  safeInitChart('residenceRadar', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: climateDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, rotate: 20, interval: 0 } },
    yAxis: { type: 'value', name: '提及次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: climateDist.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]) } }]
  }, (params) => {
    const keyword = params.name;
    const items = detail.filter(d => {
      const text = (d['气候适应'] || '').toLowerCase();
      return text.includes(keyword.toLowerCase());
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['类型'] || '未知'}</strong> — ${d['气候适应'] || ''}</li>`).join('');
      showInfoModal({
        title: `气候适应 · ${keyword}（${items.length}种民居）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  const types = detail.map(d => d['类型'] || '未知');
  const typeValues = detail.map(d => parseInt(d['遗存数量_全国重点']) || 1);
  safeInitChart('residenceType', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: types, axisLabel: { color: '#fff', fontSize: 10, rotate: 20, interval: 0 } },
    yAxis: { type: 'value', name: '遗存数量', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: typeValues, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]) } }]
  }, (params) => {
    const item = detail[params.dataIndex];
    if (item) showDetailModal(item, '民居文化');
  });

  const materialMap = {};
  detail.forEach(d => {
    const m = d['主要材料'] || '其他';
    const v = parseInt(d['遗存数量_全国重点']) || 1;
    materialMap[m] = (materialMap[m] || 0) + v;
  });
  safeInitChart('residenceMaterial', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处' },
    series: [{ type: 'pie', radius: ['50%', '70%'],
      data: Object.entries(materialMap).map(([name, value], i) => ({ name, value, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const material = params.name;
    const items = detail.filter(d => (d['主要材料'] || '其他') === material);
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['类型'] || '未知'}</strong> — ${d['主要材料'] || ''}${d['建筑特色'] ? '，' + d['建筑特色'] : ''}</li>`).join('');
      showInfoModal({
        title: `材料构成 · ${material}（${items.length}种民居）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  const heritage = detail.map(d => ({
    name: d['类型'] || '未知',
    value: parseInt(d['遗存数量_全国重点']) || 0
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  safeInitChart('residenceCraft', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '15%', left: '30%', right: '10%' },
    yAxis: { type: 'category', data: heritage.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: heritage.map(d => d.value), itemStyle: { color: '#C8A96E' } }]
  }, (params) => {
    const item = detail.find(d => (d['类型'] || '未知') === params.name);
    if (item) showDetailModal(item, '民居文化');
  });

  // 地区分布饼图（替代无意义的散点图）
  const regionDist = countByField(detail, '地区');
  safeInitChart('residenceSymbol', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}类民居' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: regionDist.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const region = params.name;
    const items = detail.filter(d => (d['地区'] || '') === region);
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['类型'] || '未知'}</strong> — ${d['地区'] || ''}${d['气候适应'] ? '，' + d['气候适应'] : ''}</li>`).join('');
      showInfoModal({
        title: `地区分布 · ${region}（${items.length}种民居）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });
}

// ========== 官府文化 ==========
function initOfficialCharts() {
  const data = cultureData.official || {};
  const detail = data.detail || [];

  if (detail.length === 0) {
    ['officialMap','officialLevel','officialLayout','officialRepresent','officialFeature','officialEvolution']
      .forEach(id => showEmptyState(id, '该朝代暂无官府数据'));
    return;
  }
  ['officialMap','officialLevel','officialLayout','officialRepresent','officialFeature','officialEvolution']
    .forEach(id => clearEmptyState(id));

  // 1. 历代分布 - 从detail的"朝代"字段动态统计
  const dynastyDist = extractDynastyDist(detail);
  safeInitChart('officialMap', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}类官府建筑' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: dynastyDist.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const dynasty = params.name;
    const items = detail.filter(d => {
      const dField = d['朝代'] || d['dynasty'] || '';
      return matchDynastyGroup(dField, dynasty);
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || d['类型'] || '未知'}</strong> — ${d['朝代'] || ''}${d['功能'] ? '，' + d['功能'] : ''}</li>`).join('');
      showInfoModal({
        title: `历代分布 · ${dynasty}（${items.length}类官府建筑）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 2. 主要建筑元素统计（从主要建筑数组提取，替代无意义的名称统计）
  const elementDist = extractBuildingElements(detail, '主要建筑');
  safeInitChart('officialLevel', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: elementDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: elementDist.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#E07B54' }]) } }]
  }, (params) => {
    const element = params.name;
    const items = detail.filter(d => {
      const arr = d['主要建筑'] || [];
      return arr.some(item => item && item.includes(element));
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || d['类型'] || '未知'}</strong> — ${d['主要建筑'] ? d['主要建筑'].join('、') : ''}</li>`).join('');
      showInfoModal({
        title: `建筑元素 · ${element}（${items.length}类官府建筑含此元素）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 3. 文化内涵关键词（替代无意义的功能饼图）
  const cultureKeywords = ['制度', '文化', '防御', '权力', '秩序', '教化', '司法', '礼制', '管理', '城市'];
  const cultureDist = extractKeywordFreq(detail, '文化内涵', cultureKeywords);
  safeInitChart('officialLayout', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: cultureDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: '提及次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: cultureDist.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  }, (params) => {
    const keyword = params.name;
    const items = detail.filter(d => {
      const text = (d['文化内涵'] || '').toLowerCase();
      return text.includes(keyword.toLowerCase());
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || d['类型'] || '未知'}</strong> — ${d['文化内涵'] || ''}</li>`).join('');
      showInfoModal({
        title: `文化内涵 · ${keyword}（${items.length}类官府建筑）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 4. 现存代表 - 从detail真实数据
  const reps = detail.map(d => ({
    name: d['名称'] || '未知',
    value: parseInt((d['总数_全国'] || '').replace(/[^0-9]/g, '')) || 50
  })).sort((a, b) => b.value - a.value);
  safeInitChart('officialRepresent', {
    tooltip: { trigger: 'axis' },
    grid: { left: '30%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: reps.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { show: false } },
    series: [{ type: 'bar', data: reps.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '') === params.name);
    if (item) showDetailModal(item, '官府文化');
  });

  // 5. 建筑特色关键词（替代原来的特征柱状图）
  const featureKeywords = ['轴线', '对称', '等级', '琉璃', '重檐', '歇山', '庑殿', '防御', '封闭', '威严'];
  const featureDist = extractKeywordFreq(detail, '建筑特色', featureKeywords);
  safeInitChart('officialFeature', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: featureDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: '提及次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: featureDist.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#E07B54' }]) } }]
  }, (params) => {
    const keyword = params.name;
    const items = detail.filter(d => {
      const text = (d['建筑特色'] || '').toLowerCase();
      return text.includes(keyword.toLowerCase());
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || d['类型'] || '未知'}</strong> — ${d['建筑特色'] || ''}</li>`).join('');
      showInfoModal({
        title: `建筑特色 · ${keyword}（${items.length}类官府建筑）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 6. 全国遗存数量对比（从总数_全国文本提取数字，替代无意义的规制等级折线）
  const heritageNums = extractNumberFromText(detail, '总数_全国');
  safeInitChart('officialEvolution', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>全国遗存约: ${params[0].value}座` },
    grid: { left: '30%', right: '10%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: heritageNums.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: heritageNums.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]) }, label: { show: true, position: 'right', color: '#fff', fontSize: 10, formatter: '{c}' } }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '') === params.name);
    if (item) showDetailModal(item, '官府文化');
  });
}

// ========== 皇宫文化 ==========
function initPalaceCharts() {
  const data = cultureData.palace || {};
  const detail = data.detail || [];

  if (detail.length === 0) {
    ['palaceScale','palaceLayout','palaceLevel','palaceColor','palaceDecor','palaceExist']
      .forEach(id => showEmptyState(id, '该朝代暂无皇宫数据'));
    return;
  }
  ['palaceScale','palaceLayout','palaceLevel','palaceColor','palaceDecor','palaceExist']
    .forEach(id => clearEmptyState(id));

  const scaleNames = detail.map(d => (d['名称'] || '未知').replace(/（.*）/, ''));
  const scaleValues = detail.map(d => {
    const scale = d['规模'] || '';
    const match = scale.match(/([\d.]+)\s*万/);
    return match ? parseFloat(match[1]) : 0;
  });
  safeInitChart('palaceScale', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>占地: ${params[0].value}万平方米` },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: scaleNames, axisLabel: { color: '#fff', fontSize: 9, rotate: 20, interval: 0 } },
    yAxis: { type: 'value', name: '占地(万m²)', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: scaleValues, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#9B59B6' }]) },
      label: { show: true, position: 'top', formatter: '{c}', color: '#fff', fontSize: 9 } }]
  }, (params) => {
    const item = detail[params.dataIndex];
    if (item) showDetailModal(item, '皇宫文化');
  });

  // 核心建筑类型统计（从核心建筑数组提取，替代无意义的布局饼图）
  const coreTypeDist = extractBuildingElements(detail, '核心建筑');
  safeInitChart('palaceLayout', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: coreTypeDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: '出现次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: coreTypeDist.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  }, (params) => {
    const element = params.name;
    const items = detail.filter(d => {
      const arr = d['核心建筑'] || [];
      return arr.some(item => item && item.includes(element));
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — ${d['核心建筑'] ? d['核心建筑'].join('、') : ''}</li>`).join('');
      showInfoModal({
        title: `核心建筑 · ${element}（${items.length}座皇宫含此建筑）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 世界遗产时间线（从世界遗产字段提取年份，替代无意义的屋顶形式柱状图）
  const whData = detail.map(d => {
    const text = d['世界遗产'] || '';
    const match = text.match(/(\d{4})/);
    return { name: (d['名称'] || '未知').replace(/（.*）/, ''), year: match ? parseInt(match[1]) : 0, text: text || '未申报' };
  }).filter(d => d.year > 0).sort((a, b) => a.year - b.year);
  safeInitChart('palaceLevel', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>${params[0].data.text}` },
    grid: { left: '30%', right: '10%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: whData.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', name: '列入年份', min: 1980, axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: whData.map(d => ({ value: d.year, text: d.text })), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#9B59B6' }, { offset: 1, color: '#C8A96E' }]) }, label: { show: true, position: 'right', color: '#fff', fontSize: 10, formatter: '{c}' } }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '').includes(params.name.replace('…', '')));
    if (item) showDetailModal(item, '皇宫文化');
  });

  // 世界遗产状态（替代原来的色彩象征）
  const worldHeritage = countByField(detail, '世界遗产');
  safeInitChart('palaceColor', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处 ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: worldHeritage.map((d, i) => ({ value: d.value, name: d.name || '未申报', itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const whStatus = params.name;
    const items = detail.filter(d => {
      const text = d['世界遗产'] || '';
      return whStatus === '未申报' ? !text : text.includes(whStatus);
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — ${d['世界遗产'] || '未申报世界遗产'}</li>`).join('');
      showInfoModal({
        title: `世界遗产 · ${whStatus}（${items.length}座皇宫）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 规模vs建筑数量散点图（替代无意义的雷达图）
  const scatterData = detail.map(d => {
    const scale = d['规模'] || '';
    const match = scale.match(/([\d.]+)\s*万/);
    const area = match ? parseFloat(match[1]) : 0;
    const count = parseInt((d['建筑数量'] || '').replace(/[^0-9]/g, '')) || 0;
    const core = (d['核心建筑'] || []).length;
    return { name: (d['名称'] || '未知').replace(/（.*）/, ''), value: [area, count, core] };
  }).filter(d => d.value[0] > 0 || d.value[1] > 0);
  safeInitChart('palaceDecor', {
    tooltip: { trigger: 'item', formatter: (params) => `${params.name}<br/>占地: ${params.value[0]}万m²<br/>建筑: ${params.value[1]}间<br/>核心建筑: ${params.value[2]}座` },
    grid: { top: '15%', bottom: '15%', left: '15%', right: '15%' },
    xAxis: { type: 'value', name: '占地(万m²)', axisLabel: { color: '#fff', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
    yAxis: { type: 'value', name: '建筑数量(间)', axisLabel: { color: '#fff', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
    series: [{ type: 'scatter',
      data: scatterData.map((d, i) => ({ name: d.name, value: d.value, symbolSize: 15 + d.value[2] * 4, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 10, position: 'top' }
    }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '').includes(params.name.replace('…', '')));
    if (item) showDetailModal(item, '皇宫文化');
  });

  const exist = detail.map((d, i) => {
    const scale = d['规模'] || '';
    const match = scale.match(/([\d.]+)\s*万/);
    const area = match ? parseFloat(match[1]) : 0;
    return { name: (d['名称'] || `宫殿${i+1}`).replace(/（.*）/, ''), value: Math.min(100, Math.round(area / 72 * 100)) };
  });
  safeInitChart('palaceExist', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '20%', right: '10%' },
    xAxis: { type: 'category', data: exist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, rotate: 20, interval: 0 } },
    yAxis: { type: 'value', name: '规模指数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: exist.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  }, (params) => {
    const item = detail[params.dataIndex];
    if (item) showDetailModal(item, '皇宫文化');
  });
}

// ========== 桥梁文化 ==========
function initBridgeCharts() {
  const data = cultureData.bridge || {};
  const detail = data.detail || [];

  if (detail.length === 0) {
    ['bridgeMap','bridgeType','bridgeMaterial','bridgeWorld','bridgeCulture','bridgeProtect']
      .forEach(id => showEmptyState(id, '该朝代暂无桥梁数据'));
    return;
  }
  ['bridgeMap','bridgeType','bridgeMaterial','bridgeWorld','bridgeCulture','bridgeProtect']
    .forEach(id => clearEmptyState(id));

  const bridgeTypeData = detail.map(d => ({
    name: d['类型'] || '未知',
    value: parseFloat(d['总长_米']) || 1
  }));
  safeInitChart('bridgeMap', {
    tooltip: { trigger: 'item', formatter: '{b}: 总长{c}m' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: bridgeTypeData.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const bType = params.name;
    const items = detail.filter(d => (d['类型'] || '未知') === bType);
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — 总长${d['总长_米'] || '?'}m，跨度${d['跨度_米'] || '?'}m${d['世界纪录'] ? '，' + d['世界纪录'] : ''}</li>`).join('');
      showInfoModal({
        title: `结构类型 · ${bType}（${items.length}座古桥）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 各桥跨度对比（替代无意义的类型分布，每种类型只有1个）
  const spanData = detail.map(d => ({
    name: d['名称'] || '未知',
    value: parseFloat(d['跨度_米']) || 0
  })).sort((a, b) => b.value - a.value);
  safeInitChart('bridgeType', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>跨度: ${params[0].value}米` },
    grid: { left: '30%', right: '10%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: spanData.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', name: '跨度(米)', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: spanData.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]) }, label: { show: true, position: 'right', color: '#fff', fontSize: 10, formatter: '{c}m' } }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '') === params.name);
    if (item) showDetailModal(item, '桥梁文化');
  });

  // 材料统计 - 从detail统计
  const materialDist = countByField(detail, '主要材料');
  safeInitChart('bridgeMaterial', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: materialDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, rotate: 20, interval: 0 } },
    yAxis: { type: 'value', name: '数量', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: materialDist.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]) } }]
  }, (params) => {
    const material = params.name;
    const items = detail.filter(d => (d['主要材料'] || '') === material);
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — ${d['主要材料'] || ''}${d['技术特色'] ? '，' + d['技术特色'] : ''}</li>`).join('');
      showInfoModal({
        title: `材料演进 · ${material}（${items.length}座古桥）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  const worlds = detail.map((d, i) => {
    const yearStr = d['建造年代'] || '';
    const match = yearStr.match(/(\d{3,4})/);
    return { name: d['名称'] || `古桥${i+1}`, value: match ? parseInt(match[1]) : (600 + i * 200) };
  }).sort((a, b) => a.value - b.value);
  safeInitChart('bridgeWorld', {
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>建造年份: ${params[0].value}年` },
    grid: { left: '30%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: worlds.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', name: '建造年份', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: worlds.map(d => d.value), itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  }, (params) => {
    const item = detail.find(d => (d['名称'] || '') === params.name);
    if (item) showDetailModal(item, '桥梁文化');
  });

  // 技术特色关键词（从技术特色字段提取，替代无意义的文化散点图）
  const techKeywords = ['拱', '梁', '基础', '榫卯', '铁链', '浮桥', '启闭', '联拱', '敞肩', '筏形', '石梁'];
  const techDist = extractKeywordFreq(detail, '技术特色', techKeywords);
  safeInitChart('bridgeCulture', {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '25%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: techDist.map(d => d.name), axisLabel: { color: '#fff', fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', name: '提及次数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: techDist.map(d => d.value), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#E07B54' }, { offset: 1, color: '#C8A96E' }]) } }]
  }, (params) => {
    const keyword = params.name;
    const items = detail.filter(d => {
      const text = (d['技术特色'] || '').toLowerCase();
      return text.includes(keyword.toLowerCase());
    });
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — ${d['技术特色'] || ''}</li>`).join('');
      showInfoModal({
        title: `技术特色 · ${keyword}（${items.length}座古桥）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });

  // 保护现状 - 从"全国重点文物"批次统计
  const protectDist = countByField(detail, '全国重点文物');
  safeInitChart('bridgeProtect', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}处 ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: protectDist.map((d, i) => ({ value: d.value, name: d.name || '其他', itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#fff', fontSize: 10 }
    }]
  }, (params) => {
    const batch = params.name;
    const items = detail.filter(d => (d['全国重点文物'] || '') === batch);
    if (items.length > 0) {
      const list = items.map(d => `<li style="margin-bottom:0.06rem;"><strong style="color:#C8A96E;">${d['名称'] || '未知'}</strong> — ${d['全国重点文物'] || ''}${d['世界遗产'] ? '，' + d['世界遗产'] : ''}</li>`).join('');
      showInfoModal({
        title: `保护现状 · ${batch}（${items.length}座古桥）`,
        content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}</ul>`
      });
    }
  });
}

// ========== 朝代筛选联动 ==========
function getDynastyFilter() {
  const params = new URLSearchParams(window.location.search);
  const dynasty = params.get('dynasty');
  return dynasty ? dynasty.split(',') : [];
}

function initDynastyButtons() {
  const btns = document.querySelectorAll('.dynasty-btn');
  const urlParams = new URLSearchParams(window.location.search);
  const currentDynasties = urlParams.get('dynasty');

  if (currentDynasties) {
    const selected = currentDynasties.split(',');
    btns.forEach(btn => {
      if (selected.includes(btn.dataset.dynasty)) btn.classList.add('active');
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');

      const selected = [];
      btns.forEach(b => {
        if (b.classList.contains('active')) selected.push(b.dataset.dynasty);
      });

      if (selected.length > 0) {
        const param = selected.join(',');
        window.history.replaceState({}, '', window.location.pathname + '?dynasty=' + encodeURIComponent(param));
        reinitWithFilter(param);
      } else {
        window.history.replaceState({}, '', window.location.pathname);
        reinitWithFilter(null);
      }
    });
  });
}

async function reinitWithFilter(dynastyParam) {
  console.log('[reinitWithFilter] 筛选朝代:', dynastyParam);
  chartInstances.forEach((chart, domId) => {
    if (chart && !chart.isDisposed()) chart.dispose();
    const dom = document.getElementById(domId);
    if (dom) dom.removeAttribute('_echarts_instance');
  });
  chartInstances.clear();
  initializedTabs.clear();
  const dynasties = dynastyParam ? dynastyParam.split(',') : [];
  await initData(dynasties);
}

function filterByDynasty(cultureData, dynasties) {
  if (!dynasties || dynasties.length === 0) return cultureData;
  const filtered = {};
  for (const key of Object.keys(cultureData)) {
    const section = cultureData[key];
    if (!section || typeof section !== 'object') { filtered[key] = section; continue; }
    const detail = section.detail;
    if (!Array.isArray(detail)) { filtered[key] = section; continue; }
    filtered[key] = { ...section };
    filtered[key].detail = detail.filter(d => {
      const dynastyField = d['朝代'] || d['dynasty'] || '';
      return dynasties.some(fd => matchDynastyGroup(dynastyField, fd));
    });
    console.log(`[filterByDynasty] ${key}: ${filtered[key].detail.length}/${detail.length} 条匹配 ${dynasties.join(',')}`);
  }
  return filtered;
}

async function initData(filterDynasties) {
  let rawData = {};
  try {
    rawData = await loadJson('culture_processed.json') || {};
  } catch(e) { console.warn('加载文化数据失败', e); }

  cultureData = filterDynasties && filterDynasties.length > 0 ? filterByDynasty(rawData, filterDynasties) : rawData;

  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    initializedTabs.add(tabId);
    initChartsForTab(tabId);
    updateInsightPanel(tabId);
  }
}

// 更新洞察面板
function updateInsightPanel(tabId) {
  const container = document.getElementById('culture-insights');
  if (!container) return;
  const insightMap = {
    residence: cultureInsights.residence,
    official: cultureInsights.official,
    palace: cultureInsights.palace,
    bridge: cultureInsights.bridge
  };
  const insight = insightMap[tabId];
  if (insight) {
    container.innerHTML = generateInsightHTML(insight);
  }
}

// ========== 启动 ==========
async function init() {
  initTabs();
  initDynastyButtons();

  const filterDynasty = getDynastyFilter();
  await initData(filterDynasty);

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

window.addEventListener('resize', () => {
  const activeContent = document.querySelector('.culture-content.active');
  if (!activeContent) return;
  activeContent.querySelectorAll('.chart').forEach(el => {
    const chart = echarts.getInstanceByDom(el);
    if (chart) chart.resize();
  });
});

init();
