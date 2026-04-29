/**
 * 杰出科学家大屏 - 增强版
 * 添加图表点击交互、人物详情、数据洞察
 */
import * as echarts from 'echarts';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML } from '../../js/common/infoModal.js';
import { scientistInsights, generateInsightHTML } from '../../js/common/insights.js';

// 科学家详细数据
const scientistDetailData = {
  '鲁班': {
    period: '春秋时期（约公元前507年）',
    title: '木匠祖师',
    works: '发明锯、刨、墨斗等工具，创立木工技艺体系',
    influence: '被后世尊为木匠祖师，影响延续两千余年',
    desc: '鲁班，姓公输，名般，春秋时期鲁国人。中国古代最著名的建筑工匠和发明家，被后世尊为木匠祖师。传说他发明了锯、刨、墨斗、曲尺等木工工具，极大地推动了建筑技术的发展。'
  },
  '宇文恺': {
    period: '隋代（555-612年）',
    title: '城市规划大师',
    works: '设计大兴城（长安）、洛阳城、隋仁寿宫',
    influence: '开创了中国古代城市规划的典范',
    desc: '宇文恺是隋代最著名的建筑家和城市规划专家。他主持设计的大兴城（唐长安城前身）是中国古代规模最大的城市之一，其规划布局对后世产生了深远影响。'
  },
  '李春': {
    period: '隋代（约570-？）',
    title: '桥梁专家',
    works: '设计建造赵州桥',
    influence: '赵州桥是世界现存最古老的单孔敞肩石拱桥',
    desc: '李春是隋代著名的桥梁工匠，他设计建造的赵州桥（安济桥）建于隋大业年间（605-618年），是世界上现存最古老的单孔敞肩石拱桥，被誉为"世界桥梁史上的奇迹"。'
  },
  '李诫': {
    period: '北宋（1035-1110年）',
    title: '建筑理论家',
    works: '编著《营造法式》',
    influence: '《营造法式》是中国第一部系统的建筑技术专著',
    desc: '李诫是北宋著名的建筑学家，他编著的《营造法式》（1103年刊行）是中国历史上第一部系统的建筑技术专著，标志着中国建筑技术的成熟和系统化。'
  },
  '蒯祥': {
    period: '明代（1398-1481年）',
    title: '故宫设计者',
    works: '主持设计北京紫禁城',
    influence: '紫禁城是中国现存规模最大的皇宫建筑群',
    desc: '蒯祥是明代著名的建筑工匠，被誉为"蒯鲁班"。他主持设计的北京紫禁城（故宫）是中国现存规模最大、保存最完整的皇宫建筑群，代表了中国古代建筑的最高水平。'
  },
  '样式雷': {
    period: '清代（1700-1912年，家族传承）',
    title: '皇家建筑师家族',
    works: '设计圆明园、颐和园、承德避暑山庄等',
    influence: '中国1/5的世界文化遗产出自样式雷之手',
    desc: '样式雷是清代著名的建筑世家，从康熙年间到清末，七代世袭"样式房"掌案。他们设计的圆明园、颐和园、承德避暑山庄等，代表了中国古典园林和皇家建筑的最高成就。'
  }
};

// 作品-人物关联数据
const workPersonData = {
  '赵州桥': { person: '李春', dynasty: '隋', type: '桥梁' },
  '大兴城': { person: '宇文恺', dynasty: '隋', type: '城市' },
  '营造法式': { person: '李诫', dynasty: '北宋', type: '著作' },
  '紫禁城': { person: '蒯祥', dynasty: '明', type: '宫殿' },
  '颐和园': { person: '样式雷', dynasty: '清', type: '园林' }
};

async function init() {
  pageEnterAnimation();
  
  await initTimelineChart();
  await initGraphChart();
  await initBarChart();
  
  // 添加数据洞察
  addInsightPanels();
}

/**
 * 添加数据洞察面板
 */
function addInsightPanels() {
  const container = document.querySelector('.dashboard-grid');
  if (!container) return;
  
  if (container.querySelector('.insight-panel')) return;

  const insights = [
    scientistInsights.timeline,
    scientistInsights.influence
  ];

  insights.forEach(insight => {
    const insightDiv = document.createElement('div');
    insightDiv.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightDiv.innerHTML = generateInsightHTML(insight);
    container.appendChild(insightDiv);
  });
}

/**
 * 垂直时间轴 - 建筑科学家
 */
async function initTimelineChart() {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const scientists = [
    { name: '鲁班', period: '春秋', year: -507, works: 3 },
    { name: '宇文恺', period: '隋', year: 555, works: 5 },
    { name: '李春', period: '隋', year: 570, works: 2 },
    { name: '喻皓', period: '北宋', year: 950, works: 3 },
    { name: '李诫', period: '北宋', year: 1035, works: 4 },
    { name: '蒯祥', period: '明', year: 1398, works: 6 },
    { name: '梁九', period: '明', year: 1500, works: 3 },
    { name: '样式雷', period: '清', year: 1700, works: 8 }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = scientists[params[0].dataIndex];
        return `${d.name}<br/>朝代: ${d.period}<br/>代表作品: ${d.works}项<br/>点击查看详情`;
      }
    },
    grid: {
      left: '20%',
      right: '10%',
      top: '5%',
      bottom: '5%'
    },
    xAxis: {
      type: 'value',
      show: false
    },
    yAxis: {
      type: 'category',
      data: scientists.map(s => s.name),
      axisLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'scatter',
      data: scientists.map((s, i) => ({
        value: [s.works * 10, i],
        name: s.name,
        period: s.period
      })),
      symbolSize: (data) => data[0] * 1.5,
      itemStyle: {
        color: (params) => {
          const colors = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6'];
          return colors[params.dataIndex % colors.length];
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: (params) => scientists[params.dataIndex].period,
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示人物详情
  chart.on('click', (params) => {
    const name = scientists[params.dataIndex].name;
    const detail = scientistDetailData[name];
    if (detail) {
      showInfoModal({
        title: `${name} - ${detail.title}`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">时期：</strong>${detail.period}</p>
            <p><strong style="color: #4ECDC4;">主要成就：</strong>${detail.works}</p>
            <p><strong style="color: #4ECDC4;">历史影响：</strong>${detail.influence}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
          <div style="margin-top: 0.15rem; text-align: center;">
            <a href="../literature/index.html" 
               style="display: inline-block; padding: 0.08rem 0.2rem; background: rgba(200, 169, 110, 0.2); 
                      color: #C8A96E; text-decoration: none; border-radius: 6px; border: 1px solid rgba(200, 169, 110, 0.3);
                      font-size: 0.12rem; transition: all 0.3s;"
               onmouseover="this.style.background='rgba(200, 169, 110, 0.3)'"
               onmouseout="this.style.background='rgba(200, 169, 110, 0.2)'">
              查看相关著作 →
            </a>
          </div>
        `
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 力导向关系图 - 人物-作品-朝代
 */
async function initGraphChart() {
  const chartDom = document.getElementById('graph-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const nodes = [
    { id: '0', name: '鲁班', category: 0, symbolSize: 50 },
    { id: '1', name: '宇文恺', category: 0, symbolSize: 45 },
    { id: '2', name: '李春', category: 0, symbolSize: 40 },
    { id: '3', name: '李诫', category: 0, symbolSize: 45 },
    { id: '4', name: '蒯祥', category: 0, symbolSize: 50 },
    { id: '5', name: '样式雷', category: 0, symbolSize: 55 },
    { id: '6', name: '赵州桥', category: 1, symbolSize: 35 },
    { id: '7', name: '大兴城', category: 1, symbolSize: 35 },
    { id: '8', name: '营造法式', category: 1, symbolSize: 40 },
    { id: '9', name: '紫禁城', category: 1, symbolSize: 50 },
    { id: '10', name: '颐和园', category: 1, symbolSize: 40 },
    { id: '11', name: '春秋', category: 2, symbolSize: 30 },
    { id: '12', name: '隋唐', category: 2, symbolSize: 35 },
    { id: '13', name: '北宋', category: 2, symbolSize: 35 },
    { id: '14', name: '明清', category: 2, symbolSize: 40 }
  ];
  
  const links = [
    { source: '0', target: '11' },
    { source: '1', target: '12' },
    { source: '1', target: '7' },
    { source: '2', target: '12' },
    { source: '2', target: '6' },
    { source: '3', target: '13' },
    { source: '3', target: '8' },
    { source: '4', target: '14' },
    { source: '4', target: '9' },
    { source: '5', target: '14' },
    { source: '5', target: '9' },
    { source: '5', target: '10' }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          const types = ['建筑科学家', '代表作品', '历史时期'];
          return `${params.name}<br/>类型: ${types[params.data.category]}<br/>点击查看详情`;
        }
        return '';
      }
    },
    legend: {
      data: ['建筑科学家', '代表作品', '历史时期'],
      textStyle: { color: 'rgba(255,255,255,0.8)' },
      bottom: 0
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links: links,
      categories: [
        { name: '建筑科学家' },
        { name: '代表作品' },
        { name: '历史时期' }
      ],
      roam: true,
      label: {
        show: true,
        position: 'bottom',
        color: 'rgba(255,255,255,0.8)'
      },
      force: {
        repulsion: 200,
        edgeLength: 100
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3,
        opacity: 0.6
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 4 }
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件
  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      const name = params.name;
      const detail = scientistDetailData[name];
      const workDetail = workPersonData[name];
      
      if (detail) {
        showInfoModal({
          title: `${name} - ${detail.title}`,
          content: `
            <div style="margin-bottom: 0.15rem;">
              <p><strong style="color: #4ECDC4;">时期：</strong>${detail.period}</p>
              <p><strong style="color: #4ECDC4;">主要成就：</strong>${detail.works}</p>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
              <p style="line-height: 1.8;">${detail.desc}</p>
            </div>
          `
        });
      } else if (workDetail) {
        showInfoModal({
          title: `${name}`,
          content: `
            <div style="margin-bottom: 0.15rem;">
              <p><strong style="color: #4ECDC4;">设计者：</strong>${workDetail.person}</p>
              <p><strong style="color: #4ECDC4;">朝代：</strong>${workDetail.dynasty}</p>
              <p><strong style="color: #4ECDC4;">类型：</strong>${workDetail.type}</p>
            </div>
            <div style="margin-top: 0.15rem; text-align: center;">
              <a href="../achievement/index.html" 
                 style="display: inline-block; padding: 0.08rem 0.2rem; background: rgba(200, 169, 110, 0.2); 
                        color: #C8A96E; text-decoration: none; border-radius: 6px; border: 1px solid rgba(200, 169, 110, 0.3);
                        font-size: 0.12rem;"
                 onmouseover="this.style.background='rgba(200, 169, 110, 0.3)'"
                 onmouseout="this.style.background='rgba(200, 169, 110, 0.2)'">
                查看建筑成就 →
              </a>
            </div>
          `
        });
      }
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 条形图 - 人物影响力
 */
async function initBarChart() {
  const chartDom = document.getElementById('bar-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const data = [
    { name: '样式雷', value: 95 },
    { name: '鲁班', value: 90 },
    { name: '蒯祥', value: 85 },
    { name: '李诫', value: 80 },
    { name: '宇文恺', value: 75 },
    { name: '李春', value: 70 },
    { name: '喻皓', value: 65 },
    { name: '梁九', value: 60 }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        return `${d.name}<br/>影响力指数: <strong style="color: #C8A96E;">${d.value}</strong>分<br/>点击查看详情`;
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
      max: 100,
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name).reverse(),
      axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
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
        formatter: '{c}',
        color: 'rgba(255,255,255,0.8)'
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件
  chart.on('click', (params) => {
    const detail = scientistDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: `${params.name} - ${detail.title}`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">影响力指数：</strong>${params.value}分</p>
            <p><strong style="color: #4ECDC4;">时期：</strong>${detail.period}</p>
            <p><strong style="color: #4ECDC4;">主要成就：</strong>${detail.works}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
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
