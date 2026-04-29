/**
 * 首页 - 总览大屏（增强版）
 * 添加图表点击交互、数据洞察
 */
import * as echarts from 'echarts';
import { gsap } from 'gsap';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { fallingLeavesAnimation, countUpAnimation, pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal } from '../../js/common/infoModal.js';

// 首页核心洞察数据
const homeInsights = [
  {
    title: '时间跨度',
    content: '从商周时期（约公元前1600年）到清代（1911年），跨越3500余年。明清时期古建筑留存数量最多，占比达37%，这与该时期建筑技术成熟、木构建筑工艺达到顶峰密切相关。',
    keyPoints: ['跨越3500年', '明清留存最多', '木构工艺顶峰']
  },
  {
    title: '地域集中',
    content: '山西以8处全国重点文物保护单位位居全国之首，被誉为"中国古代建筑博物馆"。黄河流域和中原地区是古建筑分布的核心区域，与历代政治中心分布高度重合。',
    keyPoints: ['山西居首', '黄河流域核心', '政治中心重合']
  },
  {
    title: '技术特色',
    content: '榫卯工艺（40项）和木结构技术（35项）是最突出的建筑成就，体现了"以木为本"的核心特征。斗拱体系作为东方建筑独有的结构形式，展现了中国建筑的技术高度。',
    keyPoints: ['榫卯最突出', '以木为本', '斗拱独具特色']
  },
  {
    title: '文化价值',
    content: '建筑著作从《考工记》到《工程做法》跨越2100年，北宋是建筑著作高峰期。样式雷家族设计的颐和园、圆明园等代表了中国古典园林的最高水平。',
    keyPoints: ['著作跨越2100年', '北宋高峰期', '样式雷家族']
  }
];

// 朝代详细数据
const dynastyDetailData = {
  '商周': { period: '约前1600-前256年', feature: '夯土技术成熟', desc: '青铜时代建筑以夯土台基和木构架为主，代表：殷墟宫殿、周原遗址。' },
  '秦汉': { period: '前221-220年', feature: '高台建筑兴盛', desc: '阿房宫、长城、未央宫等巨型建筑出现，砖石技术开始发展。' },
  '魏晋': { period: '220-581年', feature: '佛教建筑兴起', desc: '佛塔、石窟寺大量建造，建筑技术受佛教艺术影响。' },
  '隋唐': { period: '581-907年', feature: '都城规划成熟', desc: '长安城（84km²）是世界最大城市，赵州桥（605年）世界最古敞肩石拱桥。' },
  '宋元': { period: '960-1368年', feature: '营造法式颁布', desc: '《营造法式》（1103年）是世界上最早的建筑标准化典籍，应县木塔高67.31米。' },
  '明清': { period: '1368-1911年', feature: '紫禁城/园林艺术', desc: '北京故宫（72万m²）世界最大木构建筑群，江南园林艺术达到顶峰。' }
};

// 建筑类型详细数据
const typeDetailData = {
  '民居': { desc: '中国民居呈现明显的地域特征，北方四合院、南方天井院、西南干栏式、西北窑洞、客家围屋各具特色，体现了"天人合一"的生态智慧。', key: '地域特征明显' },
  '官府': { desc: '严格遵循等级制度，轴线对称和礼仪性最为突出，体现"居中为尊"的礼制思想。内乡县衙保存最完整。', key: '等级制度严格' },
  '皇宫': { desc: '紫禁城是现存规模最大的皇宫建筑群，黄色琉璃瓦象征皇权，龙纹装饰体现至高无上的地位。', key: '规模最宏大' },
  '桥梁': { desc: '以梁桥和拱桥为主，赵州桥是世界现存最古老的单孔敞肩石拱桥，江南地区古桥数量最多。', key: '技术精湛' }
};

// 初始化
async function init() {
  // 页面入场动画
  pageEnterAnimation();
  
  // 启动飘落叶片背景
  fallingLeavesAnimation('.leaves-container', {
    count: 15,
    interval: 2500
  });
  
  // 数字滚动动画
  initCountUp();
  
  // 初始化图表
  await initTimelineChart();
  await initRadarChart();
  
  // 导航项悬停效果
  initNavHover();
  
  // 添加数据洞察面板
  initInsightsPanel();
}

/**
 * 数字滚动动画
 */
function initCountUp() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(el => {
    const target = parseInt(el.dataset.count);
    countUpAnimation(el, target, 2);
  });
}

/**
 * 初始化时间轴图表
 */
async function initTimelineChart() {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const timelineData = [
    { year: '-1600', dynasty: '商周', event: '夯土技术成熟', value: 10 },
    { year: '-221', dynasty: '秦汉', event: '阿房宫/长城', value: 25 },
    { year: '220', dynasty: '魏晋', event: '佛教建筑兴起', value: 15 },
    { year: '581', dynasty: '隋唐', event: '长安城/赵州桥', value: 40 },
    { year: '960', dynasty: '宋元', event: '营造法式/应县木塔', value: 50 },
    { year: '1368', dynasty: '明清', event: '紫禁城/园林艺术', value: 60 }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = timelineData[params[0].dataIndex];
        return `<strong>${data.dynasty}</strong><br/>${data.event}<br/>发展水平: ${data.value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: timelineData.map(d => d.dynasty),
      axisLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12
      },
      axisLine: {
        lineStyle: { color: 'rgba(255,255,255,0.2)' }
      }
    },
    yAxis: {
      type: 'value',
      name: '建筑发展水平',
      nameTextStyle: {
        color: 'rgba(255,255,255,0.6)'
      },
      axisLabel: {
        color: 'rgba(255,255,255,0.6)'
      },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.1)' }
      }
    },
    series: [{
      type: 'line',
      data: timelineData.map(d => d.value),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: {
        color: '#C8A96E',
        width: 3
      },
      itemStyle: {
        color: '#C8A96E',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(200, 169, 110, 0.4)' },
            { offset: 1, color: 'rgba(200, 169, 110, 0)' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => timelineData[params.dataIndex].event,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示朝代详情
  chart.on('click', (params) => {
    const dynasty = timelineData[params.dataIndex].dynasty;
    const detail = dynastyDetailData[dynasty];
    if (detail) {
      showInfoModal({
        title: `${dynasty}时期建筑发展`,
        content: `
          <div style="margin-bottom: 0.1rem;">
            <span style="color: #C8A96E; font-weight: 600;">时间：</span>${detail.period}
          </div>
          <div style="margin-bottom: 0.1rem;">
            <span style="color: #C8A96E; font-weight: 600;">特征：</span>${detail.feature}
          </div>
          <div style="line-height: 1.8;">${detail.desc}</div>
        `
      });
    }
  });
  
  // 响应式
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 初始化雷达图 - 四类建筑特征
 */
async function initRadarChart() {
  const chartDom = document.getElementById('radar-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['民居', '官府', '皇宫', '桥梁'],
      bottom: 0,
      textStyle: {
        color: 'rgba(255,255,255,0.8)'
      }
    },
    radar: {
      indicator: [
        { name: '历史数量', max: 100 },
        { name: '保存完整度', max: 100 },
        { name: '技术复杂度', max: 100 },
        { name: '文化价值', max: 100 },
        { name: '地域分布', max: 100 },
        { name: '工艺传承', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: 'rgba(255,255,255,0.7)'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(200, 169, 110, 0.05)', 'rgba(200, 169, 110, 0.02)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 60, 40, 80, 90, 85],
          name: '民居',
          itemStyle: { color: '#E07B54' },
          areaStyle: { opacity: 0.3 }
        },
        {
          value: [50, 55, 70, 65, 60, 50],
          name: '官府',
          itemStyle: { color: '#3498DB' },
          areaStyle: { opacity: 0.3 }
        },
        {
          value: [30, 80, 95, 95, 40, 75],
          name: '皇宫',
          itemStyle: { color: '#C8A96E' },
          areaStyle: { opacity: 0.3 }
        },
        {
          value: [40, 75, 85, 70, 70, 60],
          name: '桥梁',
          itemStyle: { color: '#4ECDC4' },
          areaStyle: { opacity: 0.3 }
        }
      ]
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示建筑类型详情
  chart.on('click', (params) => {
    const type = params.name;
    const detail = typeDetailData[type];
    if (detail) {
      showInfoModal({
        title: `${type}建筑特征`,
        content: `
          <div style="margin-bottom: 0.1rem;">
            <span style="color: #C8A96E; font-weight: 600;">核心特征：</span>${detail.key}
          </div>
          <div style="line-height: 1.8;">${detail.desc}</div>
        `
      });
    }
  });
  
  // 响应式
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 导航悬停效果
 */
function initNavHover() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        y: -8,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

/**
 * 初始化数据洞察面板
 */
function initInsightsPanel() {
  const container = document.getElementById('home-insights');
  if (!container) return;
  
  homeInsights.forEach(insight => {
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: rgba(13, 17, 23, 0.95);
      border: 1px solid rgba(200, 169, 110, 0.3);
      border-radius: 8px;
      padding: 0.15rem;
      transition: all 0.3s ease;
      cursor: default;
    `;
    panel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.08rem; margin-bottom: 0.1rem;">
        <span style="font-size: 0.2rem;">💡</span>
        <span style="font-size: 0.16rem; color: #C8A96E; font-weight: 600;">${insight.title}</span>
      </div>
      <p style="font-size: 0.12rem; color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 0.1rem;">${insight.content}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.05rem;">
        ${insight.keyPoints.map(point => `
          <span style="background: rgba(200, 169, 110, 0.15); color: #C8A96E; padding: 0.03rem 0.08rem; border-radius: 4px; font-size: 0.11rem;">${point}</span>
        `).join('')}
      </div>
    `;
    panel.addEventListener('mouseenter', () => {
      panel.style.borderColor = 'rgba(200, 169, 110, 0.6)';
      panel.style.boxShadow = '0 0 20px rgba(200, 169, 110, 0.1)';
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.borderColor = 'rgba(200, 169, 110, 0.3)';
      panel.style.boxShadow = 'none';
    });
    container.appendChild(panel);
  });
}

// 启动
init();
