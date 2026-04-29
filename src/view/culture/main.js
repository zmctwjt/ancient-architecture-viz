/**
 * 建筑文化页面 - 增强版
 * 包含标签切换、图表交互、数据洞察
 */
import * as echarts from 'echarts';
import { gsap } from 'gsap';
import { showInfoModal } from '../../js/common/infoModal.js';
import { cultureInsights, generateInsightHTML } from '../../js/common/insights.js';

// 图表配色
const COLORS = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71'];

// 详细数据
const cultureDetailData = {
  // 民居
  '北方四合院': { region: '华北地区', feature: '中轴对称，封闭内向', desc: '以北京四合院为代表，体现宗法礼制和家族观念。' },
  '南方天井院': { region: '江南地区', feature: '通风采光，适应湿热', desc: '以安徽、江西民居为代表，天井解决通风采光问题。' },
  '西南干栏式': { region: '云贵地区', feature: '架空防潮，适应山地', desc: '以傣族竹楼、侗族鼓楼为代表，适应湿热环境。' },
  '西北窑洞': { region: '黄土高原', feature: '冬暖夏凉，因地制宜', desc: '利用黄土直立性挖掘而成，是最古老的居住形式之一。' },
  '客家围屋': { region: '闽粤赣交界', feature: '防御性强，聚族而居', desc: '以福建土楼为代表，体现客家人的防御需求和宗族观念。' },
  '徽派民居': { region: '徽州地区', feature: '粉墙黛瓦，马头墙', desc: '以安徽歙县、黟县为代表，是明清民居的精品。' },
  
  // 官府
  '内乡县衙': { dynasty: '清代', location: '河南南阳', desc: '中国保存最完整的县级衙署，被誉为"天下第一衙"。' },
  '南阳府衙': { dynasty: '明清', location: '河南南阳', desc: '中国现存唯一的府级衙署，具有极高的历史价值。' },
  '平遥县衙': { dynasty: '明清', location: '山西平遥', desc: '位于平遥古城内，是研究古代县衙制度的重要实物。' },
  
  // 皇宫
  '北京故宫': { dynasty: '明清', area: '72万m²', desc: '世界现存规模最大、保存最完整的木质结构古建筑群。' },
  '沈阳故宫': { dynasty: '清代', area: '6万m²', desc: '中国现存仅次于北京故宫的皇宫建筑群。' },
  '布达拉宫': { dynasty: '唐代始建', area: '13万m²', desc: '世界上海拔最高的宫殿建筑群，藏式建筑的杰出代表。' },
  
  // 桥梁
  '赵州桥': { dynasty: '隋', location: '河北赵县', desc: '世界现存最古老的单孔敞肩石拱桥，李春设计建造。' },
  '卢沟桥': { dynasty: '金', location: '北京', desc: '以石狮雕刻闻名，是"卢沟桥事变"的发生地。' },
  '广济桥': { dynasty: '宋', location: '广东潮州', desc: '中国四大古桥之一，集梁桥、浮桥、拱桥于一体。' }
};

// 标签页切换
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.culture-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      setTimeout(() => initChartsForTab(tabId), 100);
    });
  });
}

// 图表实例缓存
const chartInstances = new Map();

function disposeChartsInContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.chart').forEach(el => {
    const chart = echarts.getInstanceByDom(el);
    if (chart) {
      chart.dispose();
      chartInstances.delete(el.id);
    }
  });
}

function initChartsForTab(tabId) {
  switch(tabId) {
    case 'residence': disposeChartsInContainer('residence'); initResidenceCharts(); break;
    case 'official': disposeChartsInContainer('official'); initOfficialCharts(); break;
    case 'palace': disposeChartsInContainer('palace'); initPalaceCharts(); break;
    case 'bridge': disposeChartsInContainer('bridge'); initBridgeCharts(); break;
  }
}

// 添加图表点击事件
function addChartClick(chart, dataMap) {
  chart.on('click', (params) => {
    const detail = dataMap[params.name];
    if (detail) {
      showInfoModal({
        title: params.name,
        content: `
          <div style="margin-bottom: 0.15rem;">
            ${detail.region ? `<p><strong style="color: #4ECDC4;">地区：</strong>${detail.region}</p>` : ''}
            ${detail.dynasty ? `<p><strong style="color: #4ECDC4;">朝代：</strong>${detail.dynasty}</p>` : ''}
            ${detail.location ? `<p><strong style="color: #4ECDC4;">位置：</strong>${detail.location}</p>` : ''}
            ${detail.area ? `<p><strong style="color: #4ECDC4;">面积：</strong>${detail.area}</p>` : ''}
            ${detail.feature ? `<p><strong style="color: #4ECDC4;">特色：</strong>${detail.feature}</p>` : ''}
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
        `
      });
    }
  });
}

// 民居文化图表
function initResidenceCharts() {
  const pieChart = echarts.init(document.getElementById('residenceMap'));
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}%<br/>点击查看详情' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 29, name: '北方四合院', itemStyle: { color: '#C8A96E' } },
        { value: 22, name: '南方天井院', itemStyle: { color: '#4ECDC4' } },
        { value: 18, name: '西南干栏式', itemStyle: { color: '#E07B54' } },
        { value: 12, name: '西北窑洞', itemStyle: { color: '#95E1D3' } },
        { value: 10, name: '客家围屋', itemStyle: { color: '#F38181' } },
        { value: 9, name: '徽派民居', itemStyle: { color: '#AA96DA' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });
  addChartClick(pieChart, cultureDetailData);

  const radarChart = echarts.init(document.getElementById('residenceRadar'));
  radarChart.setOption({
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

  const barChart = echarts.init(document.getElementById('residenceType'));
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['抬梁式', '穿斗式', '干栏式', '井干式'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [35, 40, 15, 10], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#4ECDC4' }]) } }]
  });

  const materialChart = echarts.init(document.getElementById('residenceMaterial'));
  materialChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['50%', '70%'],
      data: [
        { value: 40, name: '木材', itemStyle: { color: '#C8A96E' } },
        { value: 25, name: '土坯', itemStyle: { color: '#E07B54' } },
        { value: 20, name: '青砖', itemStyle: { color: '#4ECDC4' } },
        { value: 10, name: '石材', itemStyle: { color: '#95E1D3' } },
        { value: 5, name: '竹材', itemStyle: { color: '#AA96DA' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  const craftChart = echarts.init(document.getElementById('residenceCraft'));
  craftChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '15%', left: '20%', right: '10%' },
    yAxis: { type: 'category', data: ['徽派', '闽南', '窑洞', '北京四合院', '土家族'], axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [5, 4, 3, 3, 2], itemStyle: { color: '#C8A96E' } }]
  });

  const symbolChart = echarts.init(document.getElementById('residenceSymbol'));
  symbolChart.setOption({
    tooltip: { trigger: 'item' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{ type: 'scatter',
      data: [
        { name: '风水', value: [30, 50], symbolSize: 40, itemStyle: { color: '#C8A96E' } },
        { name: '伦理', value: [60, 40], symbolSize: 32, itemStyle: { color: '#4ECDC4' } },
        { name: '吉祥', value: [45, 70], symbolSize: 36, itemStyle: { color: '#E07B54' } },
        { name: '宗族', value: [70, 60], symbolSize: 24, itemStyle: { color: '#9B59B6' } },
        { name: '节气', value: [20, 30], symbolSize: 20, itemStyle: { color: '#3498DB' } }
      ],
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 11 }
    }]
  });

  // 添加洞察面板
  addInsightToTab('residence', cultureInsights.residence);
}

// 官府文化图表
function initOfficialCharts() {
  const pieChart = echarts.init(document.getElementById('officialMap'));
  pieChart.setOption({
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

  const levelChart = echarts.init(document.getElementById('officialLevel'));
  levelChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['一品', '二品', '三品', '四品', '五品', '六品以下'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '开间数', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [9, 7, 5, 5, 3, 3], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  const layoutChart = echarts.init(document.getElementById('officialLayout'));
  layoutChart.setOption({
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

  const representChart = echarts.init(document.getElementById('officialRepresent'));
  representChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '25%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: ['内乡县衙', '南阳府衙', '平遥县衙', '淮安府衙', '保定直隶总督署'], axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', axisLabel: { show: false } },
    series: [{ type: 'bar', data: [95, 85, 70, 65, 60], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  });
  addChartClick(representChart, cultureDetailData);

  const featureChart = echarts.init(document.getElementById('officialFeature'));
  featureChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['威严', '对称', '轴线', '等级', '封闭'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [92, 88, 95, 90, 75], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#E07B54' }]) } }]
  });

  const evolutionChart = echarts.init(document.getElementById('officialEvolution'));
  evolutionChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['先秦', '秦汉', '魏晋', '隋唐', '宋元', '明清'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '规制化程度', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'line', data: [10, 30, 45, 65, 80, 95], smooth: true, lineStyle: { color: '#C8A96E', width: 3 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(200,169,110,0.4)' }, { offset: 1, color: 'rgba(200,169,110,0)' }]) },
      itemStyle: { color: '#C8A96E' } }]
  });

  addInsightToTab('official', cultureInsights.official);
}

// 皇宫文化图表
function initPalaceCharts() {
  const scaleChart = echarts.init(document.getElementById('palaceScale'));
  scaleChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['秦咸阳', '汉未央', '唐太极', '宋汴京', '元大都', '明清紫禁城'], axisLabel: { color: '#fff', fontSize: 10, rotate: 20 } },
    yAxis: { type: 'value', name: '面积(万m²)', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [5, 4.8, 3.2, 2.5, 5, 7.2], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#C8A96E' }, { offset: 1, color: '#9B59B6' }]) } }]
  });

  const layoutChart = echarts.init(document.getElementById('palaceLayout'));
  layoutChart.setOption({
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

  const levelChart = echarts.init(document.getElementById('palaceLevel'));
  levelChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['庑殿顶', '歇山顶', '悬山顶', '硬山顶', '攒尖顶'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '等级值', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [100, 80, 60, 40, 50], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  const colorChart = echarts.init(document.getElementById('palaceColor'));
  colorChart.setOption({
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

  const decorChart = echarts.init(document.getElementById('palaceDecor'));
  decorChart.setOption({
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

  const existChart = echarts.init(document.getElementById('palaceExist'));
  existChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '20%', right: '10%' },
    xAxis: { type: 'category', data: ['北京故宫', '沈阳故宫', '布达拉宫', '故宫(台北)', '大明宫遗址'], axisLabel: { color: '#fff', fontSize: 10, rotate: 15 } },
    yAxis: { type: 'value', name: '保存完整度', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [95, 85, 90, 60, 30], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });
  addChartClick(existChart, cultureDetailData);

  addInsightToTab('palace', cultureInsights.palace);
}

// 桥梁文化图表
function initBridgeCharts() {
  const pieChart = echarts.init(document.getElementById('bridgeMap'));
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 8, name: '江南', itemStyle: { color: '#C8A96E' } },
        { value: 6, name: '华北', itemStyle: { color: '#4ECDC4' } },
        { value: 5, name: '西南', itemStyle: { color: '#E07B54' } },
        { value: 4, name: '西北', itemStyle: { color: '#9B59B6' } },
        { value: 3, name: '华南', itemStyle: { color: '#3498DB' } }
      ],
      label: { color: '#fff', fontSize: 10 }
    }]
  });

  const typeChart = echarts.init(document.getElementById('bridgeType'));
  typeChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['梁桥', '拱桥', '索桥', '浮桥'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [40, 35, 15, 10], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] } }]
  });

  const materialChart = echarts.init(document.getElementById('bridgeMaterial'));
  materialChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
    xAxis: { type: 'category', data: ['木桥', '石桥', '砖桥', '铁索桥', '混合'], axisLabel: { color: '#fff', fontSize: 10 } },
    yAxis: { type: 'value', name: '现存数量', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [15, 45, 8, 12, 10], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#4ECDC4' }, { offset: 1, color: '#C8A96E' }]) } }]
  });

  const worldChart = echarts.init(document.getElementById('bridgeWorld'));
  worldChart.setOption({
    tooltip: { trigger: 'axis', formatter: (params) => `${params[0].name}<br/>建造年份: ${params[0].value}年` },
    grid: { left: '25%', right: '5%', top: '5%', bottom: '5%' },
    yAxis: { type: 'category', data: ['卢沟桥', '广济桥', '安平桥', '泸定桥', '赵州桥'], axisLabel: { color: '#fff', fontSize: 10 } },
    xAxis: { type: 'value', name: '建造年份', axisLabel: { color: '#fff', fontSize: 10 } },
    series: [{ type: 'bar', data: [1189, 1171, 1138, 1706, 605], itemStyle: { color: (p) => COLORS[p.dataIndex % COLORS.length] }, label: { show: true, position: 'right', color: '#fff', fontSize: 10 } }]
  });
  addChartClick(worldChart, cultureDetailData);

  const cultureChart = echarts.init(document.getElementById('bridgeCulture'));
  cultureChart.setOption({
    tooltip: { trigger: 'item' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{ type: 'scatter',
      data: [
        { name: '连通', value: [20, 70], symbolSize: 40, itemStyle: { color: '#C8A96E' } },
        { name: '诗意', value: [50, 40], symbolSize: 36, itemStyle: { color: '#4ECDC4' } },
        { name: '风水', value: [75, 55], symbolSize: 32, itemStyle: { color: '#E07B54' } },
        { name: '工程', value: [35, 80], symbolSize: 30, itemStyle: { color: '#9B59B6' } },
        { name: '便民', value: [60, 25], symbolSize: 28, itemStyle: { color: '#3498DB' } },
        { name: '防御', value: [85, 60], symbolSize: 24, itemStyle: { color: '#2ECC71' } }
      ],
      label: { show: true, formatter: '{b}', color: '#fff', fontSize: 11 }
    }]
  });

  const protectChart = echarts.init(document.getElementById('bridgeProtect'));
  protectChart.setOption({
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

  addInsightToTab('bridge', cultureInsights.bridge);
}

// 添加洞察面板到标签页
function addInsightToTab(tabId, insight) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  
  // 检查是否已存在洞察面板
  if (tab.querySelector('.insight-panel')) return;
  
  const insightDiv = document.createElement('div');
  insightDiv.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
  insightDiv.innerHTML = generateInsightHTML(insight);
  tab.appendChild(insightDiv);
}

// 启动
initTabs();
initResidenceCharts();

// 页面动画
gsap.from('.page-header', { opacity: 0, y: -30, duration: 1 });
gsap.from('.tab-btn', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, delay: 0.3 });
gsap.from('.culture-card', { opacity: 0, y: 30, duration: 0.8, stagger: 0.1, delay: 0.5 });

// 响应式
window.addEventListener('resize', () => {
  document.querySelectorAll('.chart').forEach(el => {
    const chart = echarts.getInstanceByDom(el);
    if (chart) chart.resize();
  });
});
