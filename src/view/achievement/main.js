/**
 * 建筑成就大屏 - 数据驱动版
 * 所有图表数据从 /data/buildings.json 聚合生成
 */
import * as echarts from 'echarts';
import { loadData, COLORS, ECHARTS_THEME, getDataUrl, loadJson, matchDynastyGroup } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML, addChartClickHandler } from '../../js/common/infoModal.js';
import { achievementInsights, generateInsightHTML } from '../../js/common/insights.js';

// 朝代分组函数
function dynastyGroup(d) {
  if (!d) return '其他';
  const s = String(d);
  if (/商|周|夏|春秋|战国|先秦/.test(s)) return '先秦';
  if (/秦|汉/.test(s)) return '秦汉';
  if (/魏|晋|南北朝|曹魏|北魏|东魏|西魏|北齐|北周|前秦|后秦|西秦|北汉|西夏/.test(s)) return '魏晋';
  if (/隋|唐/.test(s)) return '隋唐';
  if (/宋|元|辽|金/.test(s)) return '宋元';
  if (/明|清/.test(s)) return '明清';
  return '其他';
}

// 类别映射
function categoryMap(c) {
  if (!c) return '其他';
  const s = String(c);
  if (/民居|住宅|寨|土楼|窑洞|干栏|吊脚|四合院|蒙古包|碉楼|船型屋|大院|庄园/.test(s)) return '民居';
  if (/官府|县衙|府衙|官署|孔庙|贡院|城楼|总督|衙门|衙署/.test(s)) return '官府';
  if (/皇宫|宫|故宫|避暑山庄|布达拉|宫殿|大明宫|未央/.test(s)) return '皇宫';
  if (/桥/.test(s)) return '桥梁';
  return '其他';
}

// 提取省份
function extractProvince(loc) {
  if (!loc) return '其他';
  const s = String(loc);
  const provinces = ['北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆'];
  for (const p of provinces) { if (s.includes(p)) return p; }
  if (s.includes('西藏')) return '西藏';
  if (s.includes('内蒙古')) return '内蒙古';
  return '其他';
}

function getDynastyFilter() {
  const params = new URLSearchParams(window.location.search);
  const dynasty = params.get('dynasty');
  return dynasty ? dynasty.split(',') : [];
}

// 图表实例追踪
const chartInstances = [];

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
  chartInstances.forEach(chart => { if (chart) chart.dispose(); });
  chartInstances.length = 0;
  const dynasties = dynastyParam ? dynastyParam.split(',') : [];
  await initData(dynasties);
}

function initUI() {
  pageEnterAnimation();
  initDynastyButtons();
}

async function initData(filterDynasties) {
  let buildingData = [];
  try {
    buildingData = await loadJson('buildings.json');
  } catch(e) { console.warn('加载建筑数据失败', e); }

  if (filterDynasties && filterDynasties.length > 0) {
    buildingData = buildingData.filter(b => 
      filterDynasties.some(fd => matchDynastyGroup(b.dynasty, fd))
    );
  }

  await initRoseChart(buildingData);
  await initPolarChart(buildingData);
  await initMapChart(buildingData);
  await initAreaChart(buildingData);
  await initRankChart(buildingData);
  await initProtectionChart(buildingData);
  await initYearChart(buildingData);

  addInsightPanels();
}

async function init() {
  initUI();
  await initData(getDynastyFilter());
}

function addInsightPanels() {
  const grid = document.querySelector('.dashboard-grid');
  if (!grid || grid.querySelector('.insight-panel')) return;

  const insights = [achievementInsights.dynastyDistribution, achievementInsights.geoDistribution, achievementInsights.techCategory];
  insights.forEach(insight => {
    const insightContainer = document.createElement('div');
    insightContainer.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightContainer.innerHTML = generateInsightHTML(insight);
    grid.appendChild(insightContainer);
  });
}

// 南丁格尔玫瑰图 - 按六大朝代聚合
async function initRoseChart(buildingData) {
  const chartDom = document.getElementById('rose-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const dynastyCount = {};
  buildingData.forEach(b => {
    const d = dynastyGroup(b.dynasty);
    dynastyCount[d] = (dynastyCount[d] || 0) + 1;
  });

  const data = Object.entries(dynastyCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const option = {
    ...ECHARTS_THEME,
    tooltip: { trigger: 'item', formatter: '{b}: {c}处 ({d}%)' },
    legend: { type: 'scroll', orient: 'horizontal', bottom: 0, textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 10 } },
    series: [{
      type: 'pie',
      radius: [20, 100],
      center: ['50%', '45%'],
      roseType: 'area',
      itemStyle: { borderRadius: 5 },
      label: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
      data: data.map((d, i) => ({ ...d, itemStyle: { color: COLORS.chart[i % COLORS.chart.length] } }))
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => showDynastyDetail(params.name));
  window.addEventListener('resize', () => chart.resize());
}

// 极坐标柱状图 - 按实际category聚合
async function initPolarChart(buildingData) {
  const chartDom = document.getElementById('polar-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const catCount = {};
  buildingData.forEach(b => {
    const c = b.category || '其他';
    catCount[c] = (catCount[c] || 0) + 1;
  });

  const data = Object.entries(catCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.name}<br/>数量: ${params.value}处`
    },
    polar: { radius: [30, 90] },
    angleAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 }
    },
    radiusAxis: {
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value),
      coordinateSystem: 'polar',
      itemStyle: {
        color: (params) => {
          const colors = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71', '#F38181', '#AA96DA'];
          return colors[params.dataIndex % colors.length];
        }
      }
    }]
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

// 地理分布柱状图 - 按省份聚合
async function initMapChart(buildingData) {
  const chartDom = document.getElementById('map-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const provinceCount = {};
  buildingData.forEach(b => {
    const province = extractProvince(b.location);
    provinceCount[province] = (provinceCount[province] || 0) + 1;
  });

  const data = Object.entries(provinceCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const d = params[0];
        return `${d.name}<br/>古建筑数量: <strong style="color: #C8A96E;">${d.value}</strong>处`;
      }
    },
    grid: { top: '5%', bottom: '15%', left: '8%', right: '5%' },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { color: 'rgba(255,255,255,0.7)', rotate: 30, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]
          }
        }
      })),
      barWidth: '50%'
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const province = params.name;
    const items = buildingData.filter(b => extractProvince(b.location) === province).slice(0, 8);
    const list = items.map(b => `<li style="margin-bottom:0.06rem;">${b.name}（${b.dynasty}·${b.category}）</li>`).join('');
    showInfoModal({
      title: `${province}古建筑（${params.value}处）`,
      content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}${items.length < params.value ? `<li style="color:#888;">...等共${params.value}处</li>` : ''}</ul>`
    });
  });
  window.addEventListener('resize', () => chart.resize());
}

// 堆叠面积图 - 按朝代×实际类别聚合（展示所有主要建筑类型趋势）
async function initAreaChart(buildingData) {
  const chartDom = document.getElementById('area-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const dynasties = ['先秦', '秦汉', '魏晋', '隋唐', '宋元', '明清'];

  // 统计所有实际 category 的出现频次，取前7个主要类别 + 其他
  const catCount = {};
  buildingData.forEach(b => {
    const c = b.category || '其他';
    catCount[c] = (catCount[c] || 0) + 1;
  });
  const topCats = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name]) => name);
  if (!topCats.includes('其他')) topCats.push('其他');

  const matrix = {};
  dynasties.forEach(d => { matrix[d] = {}; topCats.forEach(t => matrix[d][t] = 0); });

  buildingData.forEach(b => {
    const dg = dynastyGroup(b.dynasty);
    const ct = b.category || '其他';
    const catKey = topCats.includes(ct) ? ct : '其他';
    if (matrix[dg]) {
      matrix[dg][catKey] = (matrix[dg][catKey] || 0) + 1;
    }
  });

  const catColors = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71', '#F38181', '#AA96DA'];
  const series = topCats.map((type, i) => ({
    name: type,
    type: 'line',
    stack: 'Total',
    areaStyle: { opacity: 0.25 },
    smooth: true,
    data: dynasties.map(d => matrix[d][type] || 0),
    itemStyle: { color: catColors[i % catColors.length] }
  }));

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        let total = 0;
        params.forEach(p => { if (p.value > 0) { result += `${p.marker} ${p.seriesName}: ${p.value}处<br/>`; total += p.value; } });
        result += `<strong>总计: ${total}处</strong>`;
        return result;
      }
    },
    legend: {
      data: topCats,
      type: 'scroll',
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dynasties,
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: series
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const typeMap = { '民居': 'residence', '官府': 'official', '皇宫': 'palace', '桥梁': 'bridge' };
    const type = typeMap[params.seriesName];
    showInfoModal({
      title: `${params.name}时期${params.seriesName}建筑`,
      content: `
        <p>${params.name}时期共有 <strong style="color: #C8A96E;">${params.value}</strong> 处${params.seriesName}建筑记录。</p>
        <div style="display: flex; gap: 0.1rem; margin-top: 0.15rem;">
          <a href="../culture/index.html${type ? '?tab=' + type : ''}"
             style="flex: 1; text-align: center; padding: 0.1rem; background: rgba(200, 169, 110, 0.2);
                    color: #C8A96E; text-decoration: none; border-radius: 6px; border: 1px solid rgba(200, 169, 110, 0.3);">
            查看建筑文化详情 →
          </a>
        </div>
      `
    });
  });
  window.addEventListener('resize', () => chart.resize());
}

// 排名进度条 - 省份TOP10
async function initRankChart(buildingData) {
  const chartDom = document.getElementById('rank-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const provinceCount = {};
  buildingData.forEach(b => {
    const province = extractProvince(b.location);
    provinceCount[province] = (provinceCount[province] || 0) + 1;
  });

  const data = Object.entries(provinceCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        return `${d.name}<br/>古建筑数量: <strong style="color: #C8A96E;">${d.value}</strong>处`;
      }
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name).reverse(),
      axisLabel: { color: 'rgba(255,255,255,0.8)' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value).reverse(),
      barWidth: '50%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}处',
        color: 'rgba(255,255,255,0.8)'
      }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const province = params.name;
    const items = buildingData.filter(b => extractProvince(b.location) === province).slice(0, 8);
    const list = items.map(b => `<li style="margin-bottom:0.06rem;">${b.name}（${b.dynasty}·${b.category}）</li>`).join('');
    showInfoModal({
      title: `${province}古建筑TOP10（第${params.dataIndex + 1}名，${params.value}处）`,
      content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}${items.length < params.value ? `<li style="color:#888;">...等共${params.value}处</li>` : ''}</ul>`
    });
  });
  window.addEventListener('resize', () => chart.resize());
}

function showDynastyDetail(dynasty) {
  const detailData = {
    '先秦': { period: '约前2070-前221年', count: 0, representative: '殷墟、周原遗址', desc: '中国建筑的萌芽期，奠定了中国建筑的基因。' },
    '秦汉': { period: '前221-220年', count: 0, representative: '长城、未央宫', desc: '大一统帝国的建筑开端，规模宏大，布局严整。' },
    '魏晋': { period: '220-589年', count: 0, representative: '嵩岳寺塔、龙门石窟', desc: '佛教建筑兴盛，砖石塔技术快速发展。' },
    '隋唐': { period: '581-907年', count: 0, representative: '赵州桥、大明宫', desc: '中国建筑的成熟期，城市规划、桥梁技术取得重大突破。' },
    '宋元': { period: '960-1368年', count: 0, representative: '应县木塔、晋祠圣母殿', desc: '建筑技术转型期，木构建筑达到极高水平，出现了《营造法式》等建筑典籍。' },
    '明清': { period: '1368-1911年', count: 0, representative: '故宫、颐和园、天坛', desc: '中国古建筑发展的巅峰时期，建筑技术成熟，规制完善，留存数量最多。' }
  };
  const detail = detailData[dynasty];
  if (detail) {
    showInfoModal({
      title: `${dynasty}时期建筑详情`,
      content: `
        <p><strong style="color: #4ECDC4;">时期：</strong>${detail.period}</p>
        <p><strong style="color: #4ECDC4;">代表建筑：</strong>${detail.representative}</p>
        <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px; margin-top: 0.1rem;">
          <p style="line-height: 1.8;">${detail.desc}</p>
        </div>
      `
    });
  }
}

// 世界遗产分布 - 按建筑类别统计世界遗产占比
async function initProtectionChart(buildingData) {
  const chartDom = document.getElementById('protection-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  // 按类别统计世界遗产和非世界遗产
  const categoryStats = {};
  buildingData.forEach(b => {
    const cat = b.category || '其他';
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, heritage: 0 };
    categoryStats[cat].total++;
    const desc = (b.description || '') + (b.significance || '');
    if (desc.includes('世界文化') || desc.includes('世界遗产')) {
      categoryStats[cat].heritage++;
    }
  });

  // 取前8个类别，生成堆叠柱状图
  const categories = Object.entries(categoryStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const cat = categories[params[0].dataIndex];
        if (!cat) return '';
        const heritage = cat[1].heritage;
        const total = cat[1].total;
        const nonHeritage = total - heritage;
        let result = `<strong>${cat[0]}</strong><br/>`;
        result += `总计: ${total}处<br/>`;
        result += `世界遗产: <strong style="color:#C8A96E;">${heritage}处</strong><br/>`;
        result += `非世界遗产: ${nonHeritage}处`;
        return result;
      }
    },
    legend: {
      data: ['世界遗产', '其他全国重点'],
      top: 0,
      textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 11 }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories.map(([name]) => name),
      axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      name: '数量',
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        name: '世界遗产',
        type: 'bar',
        stack: 'total',
        data: categories.map(([, s]) => s.heritage),
        itemStyle: { color: '#C8A96E', borderRadius: [0, 0, 0, 0] },
        label: {
          show: true,
          position: 'inside',
          formatter: (params) => params.value > 0 ? params.value : '',
          color: '#fff',
          fontSize: 10
        }
      },
      {
        name: '其他全国重点',
        type: 'bar',
        stack: 'total',
        data: categories.map(([, s]) => s.total - s.heritage),
        itemStyle: { color: 'rgba(78, 205, 196, 0.6)', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const cat = categories[params.dataIndex];
    if (!cat) return;
    const isHeritage = params.seriesName === '世界遗产';
    const items = buildingData.filter(b => {
      if ((b.category || '其他') !== cat[0]) return false;
      const desc = (b.description || '') + (b.significance || '');
      const hasHeritage = desc.includes('世界文化') || desc.includes('世界遗产');
      return isHeritage ? hasHeritage : !hasHeritage;
    }).slice(0, 6);
    const list = items.map(b => `<li style="margin-bottom:0.06rem;">${b.name}（${b.dynasty}·${b.location}）${(b.description||'').includes('世界') ? '🌍' : ''}</li>`).join('');
    showInfoModal({
      title: `${cat[0]} - ${params.seriesName}（${params.value}处）`,
      content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}${items.length < params.value ? `<li style="color:#888;">...等共${params.value}处</li>` : ''}</ul>`
    });
  });
  window.addEventListener('resize', () => chart.resize());
}

// 建造年代分布柱状图
async function initYearChart(buildingData) {
  const chartDom = document.getElementById('year-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const yearCount = {};
  buildingData.forEach(b => {
    const year = b.builtYear || '未知';
    // 取 builtYear 的前4位数字作为年代分组
    const match = String(year).match(/(\d{3,4})/);
    const period = match ? `${Math.floor(parseInt(match[1]) / 100) * 100}年代` : '未知';
    yearCount[period] = (yearCount[period] || 0) + 1;
  });

  const data = Object.entries(yearCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const ay = parseInt(a.name) || 0;
      const by = parseInt(b.name) || 0;
      return ay - by;
    });

  const option = {
    ...ECHARTS_THEME,
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const items = buildingData.filter(b => {
      const match = String(b.builtYear || '').match(/(\d{3,4})/);
      const period = match ? `${Math.floor(parseInt(match[1]) / 100) * 100}年代` : '未知';
      return period === params.name;
    }).slice(0, 5);
    const list = items.map(b => `<li style="margin-bottom:0.06rem;">${b.name}（${b.dynasty}·${b.builtYear}）</li>`).join('');
    showInfoModal({
      title: `${params.name}建造的建筑（${params.value}处）`,
      content: `<ul style="padding-left:0.2rem;line-height:1.6;">${list}${items.length < params.value ? `<li style="color:#888;">...等共${params.value}处</li>` : ''}</ul>`
    });
  });
  window.addEventListener('resize', () => chart.resize());
}

init();
