/**
 * 建筑著作大屏 - 增强版
 * 添加图表点击交互、著作详情、数据洞察
 */
import * as echarts from 'echarts';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML } from '../../js/common/infoModal.js';
import { literatureInsights, generateInsightHTML } from '../../js/common/insights.js';

// 著作详细数据
const bookDetailData = {
  '考工记': {
    dynasty: '春秋战国',
    year: '约公元前5世纪',
    type: '官书',
    author: '齐国工匠',
    content: '记载百工之事，包括木工、金工、皮革、染色、刮磨、陶埴等六大类三十个工种的技术规范',
    significance: '中国最早的手工艺技术汇编，被收入《周礼》',
    desc: '《考工记》是中国现存最早的关于手工业技术的文献，详细记载了春秋战国时期齐国官营手工业的各个工种及其技术规范，是研究中国古代建筑技术的重要史料。'
  },
  '木经': {
    dynasty: '北宋',
    year: '约1000年',
    type: '民间',
    author: '喻皓',
    content: '总结木结构建筑技术，包括屋宇尺度、梁柱比例、斗拱构造等',
    significance: '中国最早的木结构建筑专著，已失传',
    desc: '《木经》是北宋工匠喻皓所著，是中国历史上第一部专门论述木结构建筑技术的专著。虽然原书已失传，但其内容通过沈括《梦溪笔谈》等文献得以部分保存。'
  },
  '营造法式': {
    dynasty: '北宋',
    year: '1103年（崇宁二年）',
    type: '官书',
    author: '李诫',
    content: '系统总结建筑设计、施工、材料、工限等方面的规范，共34卷',
    significance: '中国第一部系统的建筑技术专著，世界建筑史上的瑰宝',
    desc: '《营造法式》是北宋李诫奉敕编修的建筑技术专著，全书34卷，系统总结了北宋及以前的建筑技术成就，是中国古代建筑技术的集大成之作，也是世界建筑史上的珍贵文献。'
  },
  '梓人遗制': {
    dynasty: '元代',
    year: '1264年',
    type: '民间',
    author: '薛景石',
    content: '记载车、船、农具等木制器具的制造工艺',
    significance: '元代重要的木工技术文献',
    desc: '《梓人遗制》是元代薛景石所著，详细记载了车、船、农具等木制器具的制造工艺，是研究元代木工技术的重要文献。'
  },
  '鲁班经': {
    dynasty: '明代',
    year: '约15世纪',
    type: '民间',
    author: '民间工匠',
    content: '记载民间建筑技术、风水禁忌、工匠行规等',
    significance: '民间建筑技术的集大成之作',
    desc: '《鲁班经》是明代民间流传的建筑技术书籍，内容涵盖建筑技术、风水禁忌、工匠行规等，反映了民间建筑技术的实际水平，是研究民间建筑文化的重要资料。'
  },
  '园冶': {
    dynasty: '明代',
    year: '1634年（崇祯七年）',
    type: '专著',
    author: '计成',
    content: '系统论述园林规划设计理论，包括相地、立基、屋宇、装折、门窗、墙垣、铺地、掇山、选石、借景等',
    significance: '中国第一部园林艺术专著，世界园林史上的最早著作',
    desc: '《园冶》是明代计成所著，是中国历史上第一部系统的园林艺术专著，也是世界园林史上最早的专著。全书三卷，系统论述了园林规划设计的理论和实践，对后世园林艺术产生了深远影响。'
  },
  '长物志': {
    dynasty: '明代',
    year: '1621年',
    type: '专著',
    author: '文震亨',
    content: '论述居室、花木、水石、禽鱼、书画、几榻、器具等生活美学',
    significance: '明代文人生活美学的代表作',
    desc: '《长物志》是明代文震亨所著，全书十二卷，系统论述了明代文人的居室环境、园林布置、器物陈设等生活美学内容，是研究明代建筑文化和文人生活的重要文献。'
  },
  '工程做法': {
    dynasty: '清代',
    year: '1734年（雍正十二年）',
    type: '官书',
    author: '工部',
    content: '规定清代官式建筑的做法，包括大木作、小木作、石作、瓦作、土作等',
    significance: '清代官式建筑的标准规范',
    desc: '《工程做法》是清代工部颁布的建筑技术规范，全书74卷，详细规定了清代官式建筑的设计、施工、材料、工限等标准，是研究清代建筑技术的重要文献。'
  }
};

// 关键词详细解释
const keywordDetailData = {
  '斗拱': { category: '结构构件', desc: '中国建筑特有的结构构件，位于柱顶与梁枋之间，兼具承重与装饰功能。' },
  '榫卯': { category: '连接技术', desc: '木构件之间的凹凸连接方式，不用钉子即可牢固连接，体现了中国建筑的独特智慧。' },
  '台基': { category: '建筑基础', desc: '建筑的基座部分，具有防潮、承重、彰显等级等功能。' },
  '梁架': { category: '结构体系', desc: '由柱、梁、枋等构件组成的承重骨架，是中国木结构建筑的核心。' },
  '园林': { category: '建筑类型', desc: '将自然山水融入人工环境的建筑形式，体现了"虽由人作，宛自天开"的造园理念。' },
  '风水': { category: '选址理论', desc: '中国古代建筑选址的理论体系，强调人与自然的和谐共生。' }
};

async function init() {
  pageEnterAnimation();
  
  await initTimelineChart();
  await initSunburstChart();
  await initWordCloudChart();
  
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
    literatureInsights.timeline,
    literatureInsights.category
  ];

  insights.forEach(insight => {
    const insightDiv = document.createElement('div');
    insightDiv.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightDiv.innerHTML = generateInsightHTML(insight);
    container.appendChild(insightDiv);
  });
}

/**
 * 水平时间轴 - 建筑著作
 */
async function initTimelineChart() {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const books = [
    { name: '考工记', year: -400, dynasty: '春秋战国', type: '官书' },
    { name: '木经', year: 1000, dynasty: '北宋', type: '民间' },
    { name: '营造法式', year: 1103, dynasty: '北宋', type: '官书' },
    { name: '梓人遗制', year: 1264, dynasty: '元代', type: '民间' },
    { name: '鲁班经', year: 1400, dynasty: '明代', type: '民间' },
    { name: '园冶', year: 1634, dynasty: '明代', type: '专著' },
    { name: '长物志', year: 1621, dynasty: '明代', type: '专著' },
    { name: '工程做法', year: 1734, dynasty: '清代', type: '官书' }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = books[params[0].dataIndex];
        return `${d.name}<br/>年代: ${d.dynasty}<br/>类型: ${d.type}<br/>点击查看详情`;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: books.map(b => b.name),
      axisLabel: {
        color: 'rgba(255,255,255,0.8)',
        rotate: 30
      },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'scatter',
      data: books.map((b, i) => ({
        value: i + 1,
        name: b.name
      })),
      symbolSize: 40,
      itemStyle: {
        color: (params) => {
          const colors = ['#C8A96E', '#4ECDC4', '#E07B54', '#9B59B6'];
          return colors[params.dataIndex % colors.length];
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => books[params.dataIndex].dynasty,
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件 - 显示著作详情
  chart.on('click', (params) => {
    const name = books[params.dataIndex].name;
    const detail = bookDetailData[name];
    if (detail) {
      showInfoModal({
        title: `《${name}》详情`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">朝代：</strong>${detail.dynasty}</p>
            <p><strong style="color: #4ECDC4;">成书时间：</strong>${detail.year}</p>
            <p><strong style="color: #4ECDC4;">类型：</strong>${detail.type}</p>
            <p><strong style="color: #4ECDC4;">作者：</strong>${detail.author}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px; margin-bottom: 0.15rem;">
            <p style="line-height: 1.8;"><strong>内容概要：</strong>${detail.content}</p>
          </div>
          <div style="background: rgba(200, 169, 110, 0.1); padding: 0.15rem; border-radius: 6px;">
            <p style="line-height: 1.8;"><strong style="color: #C8A96E;">历史意义：</strong>${detail.significance}</p>
          </div>
          <div style="margin-top: 0.15rem;">
            <p style="font-size: 0.12rem; color: rgba(255,255,255,0.6); line-height: 1.6;">${detail.desc}</p>
          </div>
        `
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 旭日图 - 著作分类
 */
async function initSunburstChart() {
  const chartDom = document.getElementById('sunburst-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const data = [
    {
      name: '官书',
      itemStyle: { color: '#C8A96E' },
      children: [
        { name: '考工记', value: 1, desc: '春秋战国时期官营手工业技术规范' },
        { name: '营造法式', value: 1, desc: '北宋建筑技术专著，34卷' },
        { name: '工程做法', value: 1, desc: '清代官式建筑标准规范' }
      ]
    },
    {
      name: '民间',
      itemStyle: { color: '#4ECDC4' },
      children: [
        { name: '木经', value: 1, desc: '北宋木结构建筑专著，已失传' },
        { name: '梓人遗制', value: 1, desc: '元代木工技术文献' },
        { name: '鲁班经', value: 1, desc: '明代民间建筑技术汇编' }
      ]
    },
    {
      name: '专著',
      itemStyle: { color: '#E07B54' },
      children: [
        { name: '园冶', value: 1, desc: '中国第一部园林艺术专著' },
        { name: '长物志', value: 1, desc: '明代文人生活美学代表作' },
        { name: '一家言', value: 1, desc: '清代李渔所著，论述居室器玩' }
      ]
    },
    {
      name: '方志',
      itemStyle: { color: '#9B59B6' },
      children: [
        { name: '洛阳伽蓝记', value: 1, desc: '北魏杨衒之著，记述洛阳佛寺' },
        { name: '帝京景物略', value: 1, desc: '明代刘侗著，记述北京风物' },
        { name: '扬州画舫录', value: 1, desc: '清代李斗著，记述扬州园林' }
      ]
    }
  ];
  
  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      formatter: (params) => {
        if (params.data.desc) {
          return `${params.name}<br/>${params.data.desc}`;
        }
        return params.name;
      }
    },
    series: [{
      type: 'sunburst',
      data: data,
      radius: [0, '90%'],
      label: {
        rotate: 'radial',
        color: 'rgba(255,255,255,0.9)'
      },
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#0d1117'
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件
  chart.on('click', (params) => {
    const name = params.name;
    const detail = bookDetailData[name];
    if (detail) {
      showInfoModal({
        title: `《${name}》详情`,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">朝代：</strong>${detail.dynasty}</p>
            <p><strong style="color: #4ECDC4;">类型：</strong>${detail.type}</p>
            <p><strong style="color: #4ECDC4;">作者：</strong>${detail.author}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
        `
      });
    } else if (params.data.desc) {
      showInfoModal({
        title: name,
        content: `<p style="line-height: 1.8;">${params.data.desc}</p>`
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 词云 - 核心内容关键词（使用散点图模拟）
 */
async function initWordCloudChart() {
  const chartDom = document.getElementById('wordcloud-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const keywords = [
    { name: '斗拱', value: 95 },
    { name: '榫卯', value: 90 },
    { name: '台基', value: 75 },
    { name: '梁架', value: 80 },
    { name: '园林', value: 85 },
    { name: '风水', value: 70 },
    { name: '材分', value: 65 },
    { name: '举折', value: 60 },
    { name: '彩画', value: 55 },
    { name: '琉璃', value: 50 },
    { name: '飞檐', value: 70 },
    { name: '藻井', value: 45 },
    { name: '影壁', value: 40 },
    { name: '照壁', value: 40 },
    { name: '月台', value: 35 }
  ];
  
  // 使用固定位置避免随机跳动
  const positions = [
    [20, 30], [50, 50], [80, 20], [30, 70], [70, 60],
    [10, 50], [40, 20], [60, 80], [90, 40], [25, 85],
    [75, 30], [45, 60], [85, 70], [15, 80], [55, 40]
  ];
  
  const data = keywords.map((kw, i) => ({
    name: kw.name,
    value: positions[i],
    symbolSize: kw.value / 3,
    itemStyle: {
      color: COLORS.chart[i % COLORS.chart.length]
    }
  }));
  
  const option = {
    ...ECHARTS_THEME,
    grid: { top: '5%', bottom: '5%', left: '5%', right: '5%' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{
      type: 'scatter',
      data: data,
      label: {
        show: true,
        formatter: (params) => params.name,
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12
      },
      emphasis: {
        scale: 1.5
      }
    }]
  };
  
  chart.setOption(option);
  
  // 点击事件
  chart.on('click', (params) => {
    const detail = keywordDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: params.name,
        content: `
          <div style="margin-bottom: 0.15rem;">
            <p><strong style="color: #4ECDC4;">类别：</strong>${detail.category}</p>
            <p><strong style="color: #4ECDC4;">重要程度：</strong>${params.data.symbolSize * 3}分</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
          <div style="margin-top: 0.15rem; text-align: center;">
            <a href="../achievement/index.html" 
               style="display: inline-block; padding: 0.08rem 0.2rem; background: rgba(200, 169, 110, 0.2); 
                      color: #C8A96E; text-decoration: none; border-radius: 6px; border: 1px solid rgba(200, 169, 110, 0.3);
                      font-size: 0.12rem;"
               onmouseover="this.style.background='rgba(200, 169, 110, 0.3)'"
               onmouseout="this.style.background='rgba(200, 169, 110, 0.2)'">
              查看相关建筑成就 →
            </a>
          </div>
        `
      });
    }
  });
  
  window.addEventListener('resize', () => chart.resize());
}

// 启动
init();
