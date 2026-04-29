/**
 * 建筑成就大屏 - 增强版
 * 添加图表点击交互、数据洞察、页面跳转
 */
import * as echarts from 'echarts';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML, addChartClickHandler } from '../../js/common/infoModal.js';
import { achievementInsights, generateInsightHTML } from '../../js/common/insights.js';

// 中国地图数据（简化版）
const CHINA_GEO_COORD = {
  '北京': [116.4074, 39.9042], '天津': [117.2008, 39.0842],
  '河北': [114.5302, 38.0373], '山西': [112.5624, 37.8734],
  '内蒙古': [111.7656, 43.8416], '辽宁': [123.4294, 41.8357],
  '吉林': [125.3268, 43.8965], '黑龙江': [127.9688, 45.368],
  '上海': [121.4737, 31.2304], '江苏': [118.8062, 31.9208],
  '浙江': [119.5313, 29.8773], '安徽': [117.29, 32.0581],
  '福建': [119.4543, 25.9222], '江西': [116.0046, 28.6633],
  '山东': [117.1582, 36.8701], '河南': [113.4668, 34.6234],
  '湖北': [114.3896, 30.6628], '湖南': [113.0823, 28.2568],
  '广东': [113.1224, 23.0095], '广西': [108.479, 23.1152],
  '海南': [110.3893, 19.8516], '重庆': [108.3844, 30.4397],
  '四川': [104.0657, 30.6595], '贵州': [106.6992, 26.7682],
  '云南': [102.9199, 25.4663], '西藏': [91.11, 29.97],
  '陕西': [109.1162, 34.2004], '甘肃': [103.5901, 36.3043],
  '青海': [101.4038, 36.8207], '宁夏': [106.3586, 38.1775],
  '新疆': [87.9236, 43.5883]
};

// 详细数据
const dynastyDetailData = {
  '明清': { period: '1368-1912年', count: 16, representative: '故宫、颐和园、天坛', desc: '中国古建筑发展的巅峰时期，建筑技术成熟，规制完善，留存数量最多。' },
  '宋元': { period: '960-1368年', count: 11, representative: '应县木塔、晋祠圣母殿', desc: '建筑技术转型期，木构建筑达到极高水平，出现了《营造法式》等建筑典籍。' },
  '隋唐': { period: '581-907年', count: 8, representative: '赵州桥、大明宫', desc: '中国建筑的成熟期，城市规划、桥梁技术取得重大突破。' },
  '魏晋': { period: '220-589年', count: 4, representative: '嵩岳寺塔、龙门石窟', desc: '佛教建筑兴盛，砖石塔技术快速发展。' },
  '秦汉': { period: '前221-220年', count: 3, representative: '长城、未央宫', desc: '大一统帝国的建筑开端，规模宏大，布局严整。' },
  '商周': { period: '前1600-前256年', count: 1, representative: '殷墟、周原遗址', desc: '中国建筑的萌芽期，奠定了中国建筑的基因。' }
};

const provinceDetailData = {
  '山西': { count: 8, cities: '平遥、应县、五台山', feature: '保存最完整的古建筑群', desc: '被誉为"中国古代建筑博物馆"，唐、宋、辽、金建筑遗存丰富。' },
  '北京': { count: 5, cities: '故宫、天坛、颐和园', feature: '皇家建筑集中地', desc: '元明清三代帝都，皇家建筑规制最高、保存最完整。' },
  '陕西': { count: 4, cities: '西安、咸阳', feature: '周秦汉唐古都', desc: '十三朝古都所在地，地下地上文物遗存极为丰富。' },
  '河南': { count: 4, cities: '洛阳、开封、安阳', feature: '中原文化核心', desc: '华夏文明发源地，商周至北宋的历代都城所在地。' }
};

async function init() {
  pageEnterAnimation();
  
  await initRoseChart();
  await initMapChart();
  await initPolarChart();
  await initAreaChart();
  await initRankChart();
  
  // 添加数据洞察面板
  addInsightPanels();
}

/**
 * 添加数据洞察面板
 */
function addInsightPanels() {
  const grid = document.querySelector('.dashboard-grid');
  if (!grid) return;
  
  // 避免重复添加
  if (grid.querySelector('.insight-panel')) return;

  const insights = [
    achievementInsights.dynastyDistribution,
    achievementInsights.geoDistribution,
    achievementInsights.techCategory
  ];

  insights.forEach(insight => {
    const insightContainer = document.createElement('div');
    insightContainer.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightContainer.innerHTML = generateInsightHTML(insight);
    grid.appendChild(insightContainer);
  });
}

/**
 * 南丁格尔玫瑰图 - 朝代分布
 */
async function initRoseChart() {
  const chartDom = document.getElementById('rose-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const data = [
    { value: 16, name: '明清' },
    { value: 11, name: '宋元' },
    { value: 8, name: '隋唐' },
    { value: 4, name: '魏晋' },
    { value: 3, name: '秦汉' },
    { value: 1, name: '商周' }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}处 ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: [20, 80],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5
      },
      label: {
        color: 'rgba(255,255,255,0.8)'
      },
      data: data.map((d, i) => ({
        ...d,
        itemStyle: {
          color: COLORS.chart[i % COLORS.chart.length]
        }
      }))
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示朝代详情
  chart.on('click', (params) => {
    const detail = dynastyDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: `${params.name}时期建筑详情`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">时期：</strong>${detail.period}</p>
            <p><strong style="color: #4ECDC4;">现存数量：</strong>${detail.count}处</p>
            <p><strong style="color: #4ECDC4;">代表建筑：</strong>${detail.representative}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
          ${generateDataHTML({ '现存数量': detail.count + '处', '占全国比例': Math.round(detail.count / 43 * 100) + '%' })}
        `
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 地图 - 古建筑地理分布（使用柱状图替代）
 */
async function initMapChart() {
  const chartDom = document.getElementById('map-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const buildingData = [
    { name: '山西', value: 8 },
    { name: '北京', value: 5 },
    { name: '陕西', value: 4 },
    { name: '河南', value: 4 },
    { name: '江苏', value: 3 },
    { name: '浙江', value: 3 },
    { name: '四川', value: 2 },
    { name: '河北', value: 2 },
    { name: '山东', value: 2 },
    { name: '安徽', value: 2 },
    { name: '福建', value: 2 },
    { name: '云南', value: 2 },
    { name: '湖北', value: 1 },
    { name: '湖南', value: 1 },
    { name: '广东', value: 1 },
    { name: '重庆', value: 1 }
  ];
  
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
    grid: { top: '5%', bottom: '15%', left: '10%', right: '5%' },
    xAxis: {
      type: 'category',
      data: buildingData.map(d => d.name),
      axisLabel: {
        color: 'rgba(255,255,255,0.7)',
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'bar',
      data: buildingData.map(d => ({
        value: d.value,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#C8A96E' },
              { offset: 1, color: '#4ECDC4' }
            ]
          }
        }
      })),
      barWidth: '60%'
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示省份详情
  chart.on('click', (params) => {
    const detail = provinceDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: `${params.name}省古建筑详情`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">现存数量：</strong>${detail.count}处</p>
            <p><strong style="color: #4ECDC4;">主要城市：</strong>${detail.cities}</p>
            <p><strong style="color: #4ECDC4;">特色：</strong>${detail.feature}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
        `
      });
    } else {
      showInfoModal({
        title: `${params.name}省古建筑`,
        content: `<p>该省现存古建筑${params.value}处，是中国古建筑的重要组成部分。</p>`
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 极坐标柱状图 - 技术分类
 */
async function initPolarChart() {
  const chartDom = document.getElementById('polar-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const data = [
    { name: '木结构', value: 35, desc: '以榫卯连接为核心的木构架体系，是中国建筑的根本特征。' },
    { name: '砖石结构', value: 25, desc: '主要用于塔、城墙、墓葬等建筑，魏晋以后发展迅速。' },
    { name: '拱券技术', value: 15, desc: '桥梁和城门建筑的核心技术，赵州桥是世界桥梁史上的杰作。' },
    { name: '榫卯工艺', value: 40, desc: '不用钉子的木构连接技术，体现了中国建筑的独特智慧。' },
    { name: '斗拱体系', value: 30, desc: '中国建筑的标志性构件，兼具结构与装饰功能。' },
    { name: '园林营造', value: 20, desc: '将自然山水融入建筑空间，创造了独特的东方园林美学。' }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const d = data[params.dataIndex];
        return `${d.name}<br/>成就数量: ${d.value}项<br/>${d.desc}`;
      }
    },
    polar: { radius: [30, 80] },
    angleAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10
      }
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
          const colors = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6', '#3498DB', '#2ECC71'];
          return colors[params.dataIndex % colors.length];
        }
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件
  chart.on('click', (params) => {
    const d = data[params.dataIndex];
    showInfoModal({
      title: `${d.name}技术详解`,
      content: `
        <div style="margin-bottom: 0.15rem;">
          <p><strong style="color: #4ECDC4;">成就数量：</strong>${d.value}项</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
          <p style="line-height: 1.8;">${d.desc}</p>
        </div>
        <div style="margin-top: 0.15rem;">
          <p style="font-size: 0.12rem; color: rgba(255,255,255,0.5);">
            💡 点击其他图表可查看更多关联信息
          </p>
        </div>
      `
    });
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 堆叠面积图 - 类型趋势
 */
async function initAreaChart() {
  const chartDom = document.getElementById('area-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const dynasties = ['商周', '秦汉', '魏晋', '隋唐', '宋元', '明清'];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['民居', '官府', '皇宫', '桥梁'],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
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
    series: [
      {
        name: '民居',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.3 },
        data: [2, 5, 8, 12, 15, 18],
        itemStyle: { color: '#E07B54' }
      },
      {
        name: '官府',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.3 },
        data: [1, 3, 4, 6, 8, 10],
        itemStyle: { color: '#3498DB' }
      },
      {
        name: '皇宫',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.3 },
        data: [1, 2, 3, 5, 6, 8],
        itemStyle: { color: '#C8A96E' }
      },
      {
        name: '桥梁',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.3 },
        data: [0, 2, 3, 5, 7, 10],
        itemStyle: { color: '#4ECDC4' }
      }
    ]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 跳转到建筑文化页面
  chart.on('click', (params) => {
    const dynasty = params.name;
    const typeMap = { '民居': 'residence', '官府': 'official', '皇宫': 'palace', '桥梁': 'bridge' };
    const type = typeMap[params.seriesName];
    
    showInfoModal({
      title: `${dynasty}时期${params.seriesName}建筑`,
      content: `
        <div style="margin-bottom: 0.15rem;">
          <p>${dynasty}时期${params.seriesName}建筑发展迅速，反映了当时社会的繁荣程度。</p>
        </div>
        <div style="display: flex; gap: 0.1rem; margin-top: 0.15rem;">
          <a href="../culture/index.html${type ? '?tab=' + type : ''}" 
             style="flex: 1; text-align: center; padding: 0.1rem; background: rgba(200, 169, 110, 0.2); 
                    color: #C8A96E; text-decoration: none; border-radius: 6px; border: 1px solid rgba(200, 169, 110, 0.3);
                    transition: all 0.3s;"
             onmouseover="this.style.background='rgba(200, 169, 110, 0.3)'"
             onmouseout="this.style.background='rgba(200, 169, 110, 0.2)'">
            查看建筑文化详情 →
          </a>
        </div>
      `
    });
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 排名进度条 - 省份TOP10
 */
async function initRankChart() {
  const chartDom = document.getElementById('rank-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const data = [
    { name: '山西', value: 8 },
    { name: '北京', value: 5 },
    { name: '陕西', value: 4 },
    { name: '河南', value: 4 },
    { name: '江苏', value: 3 },
    { name: '浙江', value: 3 },
    { name: '四川', value: 2 },
    { name: '河北', value: 2 },
    { name: '山东', value: 2 },
    { name: '安徽', value: 2 }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        return `${d.name}<br/>古建筑数量: <strong style="color: #C8A96E;">${d.value}</strong>处<br/>排名: 第${data.length - d.dataIndex}名`;
      }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
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
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#4ECDC4' },
            { offset: 1, color: '#C8A96E' }
          ]
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
  
  // 点击事件
  chart.on('click', (params) => {
    const detail = provinceDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: `${params.name}省古建筑详情`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">现存数量：</strong>${detail.count}处</p>
            <p><strong style="color: #4ECDC4;">主要城市：</strong>${detail.cities}</p>
            <p><strong style="color: #4ECDC4;">特色：</strong>${detail.feature}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
        `
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

// 启动
init();
