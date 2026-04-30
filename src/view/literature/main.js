/**
 * 建筑著作大屏 - 数据驱动版
 * 数据来源：/data/books_processed.json
 */
import * as echarts from 'echarts';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML } from '../../js/common/infoModal.js';
import { literatureInsights, generateInsightHTML } from '../../js/common/insights.js';

// 著作详细数据（叙述性内容，保留硬编码，但数量精简到数据文件中实际存在的）
const bookDetailData = {
  '考工记': { dynasty: '春秋战国', year: '约公元前5世纪', type: '官书', author: '齐国工匠', content: '记载百工之事，包括木工、金工、皮革、染色、刮磨、陶埴等六大类三十个工种的技术规范', significance: '中国最早的手工艺技术汇编，被收入《周礼》' },
  '木经': { dynasty: '北宋', year: '约1000年', type: '民间', author: '喻皓', content: '总结木结构建筑技术，包括屋宇尺度、梁柱比例、斗拱构造等', significance: '中国最早的木结构建筑专著，已失传' },
  '营造法式': { dynasty: '北宋', year: '1103年', type: '官书', author: '李诫', content: '系统总结建筑设计、施工、材料、工限等方面的规范，共34卷', significance: '中国第一部系统的建筑技术专著，世界建筑史上的瑰宝' },
  '梓人遗制': { dynasty: '元代', year: '1264年', type: '民间', author: '薛景石', content: '记载车、船、农具等木制器具的制造工艺', significance: '元代重要的木工技术文献' },
  '鲁班经': { dynasty: '明代', year: '约15世纪', type: '民间', author: '午荣（汇编）', content: '记载民间建筑技术、风水禁忌、工匠行规等', significance: '民间建筑技术的集大成之作' },
  '园冶': { dynasty: '明代', year: '1634年', type: '专著', author: '计成', content: '系统论述园林规划设计理论，包括相地、立基、屋宇、装折、门窗、墙垣、铺地、掇山、选石、借景等', significance: '中国第一部园林艺术专著，世界园林史上的最早著作' },
  '长物志': { dynasty: '明代', year: '1621年', type: '专著', author: '文震亨', content: '论述居室、花木、水石、禽鱼、书画、几榻、器具等生活美学', significance: '明代文人生活美学的代表作' },
  '工程做法': { dynasty: '清代', year: '1734年', type: '官书', author: '工部', content: '规定清代官式建筑的做法，包括大木作、小木作、石作、瓦作、土作等', significance: '清代官式建筑的标准规范' },
  '梦溪笔谈': { dynasty: '北宋', year: '1086年', type: '专著', author: '沈括', content: '涉及天文、数学、物理、化学、生物、地质、地理、气象、医药、农学、工程技术、文学、史事、音乐、美术等众多领域', significance: '中国科学史上的里程碑，包含大量建筑技术记载' },
  '营缮令': { dynasty: '唐', year: '唐代', type: '官书', author: '唐朝工部', content: '唐代关于建筑营造的律令规定', significance: '唐代官式建筑规制的重要文献' },
  '天工开物': { dynasty: '明', year: '1637年', type: '专著', author: '宋应星', content: '世界上第一部关于农业和手工业生产的综合性著作，包含建筑、砖瓦、陶瓷、冶炼等内容', significance: '中国17世纪的工艺百科全书' },
  '闲情偶寄': { dynasty: '清', year: '1671年', type: '专著', author: '李渔', content: '论述居室、器玩、饮馔、种植、颐养等生活艺术，其中《居室部》《器玩部》涉及建筑与园林', significance: '清代生活美学与建筑艺术的重要文献' },
  '工段营造录': { dynasty: '清', year: '1790年', type: '民间', author: '李斗', content: '记载扬州建筑营造技术与园林艺术', significance: '江南民间建筑技术的重要记录' },
  '经世大典': { dynasty: '元', year: '1331年', type: '官书', author: '脱脱等', content: '元代官修政书，其中《工典》记载建筑、水利等工程技术', significance: '元代国家工程技术的官方记录' },
  '髹饰录': { dynasty: '明', year: '1625年', type: '专著', author: '黄成', content: '中国现存唯一的漆工专著，记载漆器制造工艺与装饰技法', significance: '中国传统漆艺的集大成之作，与建筑装饰密切相关' }
};

const keywordDetailData = {
  '斗拱': { category: '结构构件', desc: '中国建筑特有的结构构件，位于柱顶与梁枋之间，兼具承重与装饰功能。' },
  '榫卯': { category: '连接技术', desc: '木构件之间的凹凸连接方式，不用钉子即可牢固连接，体现了中国建筑的独特智慧。' },
  '台基': { category: '建筑基础', desc: '建筑的基座部分，具有防潮、承重、彰显等级等功能。' },
  '梁架': { category: '结构体系', desc: '由柱、梁、枋等构件组成的承重骨架，是中国木结构建筑的核心。' },
  '园林': { category: '建筑类型', desc: '将自然山水融入人工环境的建筑形式，体现了虽由人作，宛自天开的造园理念。' },
  '风水': { category: '选址理论', desc: '中国古代建筑选址的理论体系，强调人与自然的和谐共生。' }
};

function getDynastyFilter() {
  const params = new URLSearchParams(window.location.search);
  return params.get('dynasty');
}

function showDynastyFilter(dynasty) {
  const filterEl = document.getElementById('dynasty-filter');
  const labelEl = document.getElementById('dynasty-label');
  if (filterEl && labelEl && dynasty) {
    labelEl.textContent = `当前筛选：${dynasty}`;
    filterEl.style.display = 'block';
  }
}

// 六大朝代映射到著作原始朝代
function mapBookDynasty(filterDynasty) {
  const map = {
    '先秦': ['春秋—战国'],
    '隋唐': ['唐'],
    '宋元': ['北宋', '元'],
    '明清': ['明', '清']
  };
  return map[filterDynasty] || [filterDynasty];
}

async function init() {
  let bookData = { timeline_data: [], dynasty_distribution: [] };
  try {
    const resp = await fetch('../../data/books_processed.json');
    if (resp.ok) bookData = await resp.json();
  } catch(e) { console.warn('加载著作数据失败', e); }

  const filterDynasty = getDynastyFilter();
  showDynastyFilter(filterDynasty);

  // 按朝代过滤著作数据
  if (filterDynasty) {
    const allowed = mapBookDynasty(filterDynasty);
    bookData.timeline_data = (bookData.timeline_data || []).filter(b => allowed.includes(b.dynasty));
    bookData.dynasty_distribution = (bookData.dynasty_distribution || []).filter(d => allowed.includes(d.name));
  }

  pageEnterAnimation();

  await initTimelineChart(bookData);
  await initSunburstChart(bookData);
  await initTypeChart(bookData);
  await initWordCloudChart(bookData);

  addInsightPanels();
}

function addInsightPanels() {
  const container = document.querySelector('.dashboard-grid');
  if (!container || container.querySelector('.insight-panel')) return;

  const insights = [literatureInsights.timeline, literatureInsights.category];
  insights.forEach(insight => {
    const insightDiv = document.createElement('div');
    insightDiv.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightDiv.innerHTML = generateInsightHTML(insight);
    container.appendChild(insightDiv);
  });
}

// 朝代排序权重
const dynastyOrder = { '春秋—战国': 1, '唐': 2, '北宋': 3, '元': 4, '明': 5, '清': 6 };

/**
 * 著作朝代分布柱状图
 */
async function initTimelineChart(data) {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);

  const dynastyDist = data.dynasty_distribution || [];
  const dynasties = dynastyDist.map(d => d.name);
  const values = dynastyDist.map(d => d.value);

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = dynastyDist[params[0].dataIndex];
        if (!d) return '';
        return `<strong>${d.name}</strong><br/>著作数量: ${d.value}部<br/>${(d.books || []).join('、')}`;
      }
    },
    grid: { left: '8%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dynasties,
      axisLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
    },
    yAxis: {
      type: 'value',
      name: '著作数量(部)',
      nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: COLORS.chart[i % COLORS.chart.length] },
              { offset: 1, color: adjustColor(COLORS.chart[i % COLORS.chart.length], 0.3) }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        }
      })),
      barWidth: '40%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}部',
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11
      }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const d = dynastyDist[params.dataIndex];
    if (d) {
      showInfoModal({
        title: `${d.name}时期建筑著作`,
        content: `
          <p><strong style="color: #4ECDC4;">著作数量：</strong>${d.value}部</p>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px; margin-top: 0.1rem;">
            <p style="line-height: 1.8;"><strong>包括：</strong>${(d.books || []).join('、')}</p>
          </div>
        `
      });
    }
  });
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 旭日图 - 按朝代分类（避免"其他"）
 */
async function initSunburstChart(data) {
  const chartDom = document.getElementById('sunburst-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);

  // 按朝代聚合
  const dynastyMap = {};
  (data.timeline_data || []).forEach(b => {
    const d = b.dynasty || '其他';
    if (!dynastyMap[d]) dynastyMap[d] = [];
    dynastyMap[d].push({ name: b.title, value: 1, author: b.author });
  });

  const sunburstData = Object.entries(dynastyMap).map(([name, children], i) => ({
    name,
    itemStyle: { color: COLORS.chart[i % COLORS.chart.length] },
    children: children.map((child, j) => ({
      ...child,
      itemStyle: { color: adjustColor(COLORS.chart[i % COLORS.chart.length], j * 0.1) }
    }))
  }));

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      formatter: (params) => {
        if (params.data.author) {
          return `${params.name}<br/>作者: ${params.data.author}`;
        }
        return `${params.name}<br/>著作数量: ${params.data.children ? params.data.children.length : 1}部`;
      }
    },
    series: [{
      type: 'sunburst',
      data: sunburstData,
      radius: [0, '90%'],
      label: { rotate: 'radial', color: 'rgba(255,255,255,0.9)', fontSize: 10 },
      itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#0d1117' }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const name = params.name;
    const detail = bookDetailData[name];
    if (detail) {
      showInfoModal({
        title: `《${name}》详情`,
        content: `
          <p><strong style="color: #4ECDC4;">朝代：</strong>${detail.dynasty}</p>
          <p><strong style="color: #4ECDC4;">类型：</strong>${detail.type}</p>
          <p><strong style="color: #4ECDC4;">作者：</strong>${detail.author}</p>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.significance}</p>
          </div>
        `
      });
    }
  });
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 著作类型分布饼图
 */
async function initTypeChart(data) {
  const chartDom = document.getElementById('type-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);

  // 从 bookDetailData 统计类型分布
  const typeCount = {};
  Object.values(bookDetailData).forEach(b => {
    const t = b.type || '其他';
    typeCount[t] = (typeCount[t] || 0) + 1;
  });

  const pieData = Object.entries(typeCount).map(([name, value], i) => ({
    name, value,
    itemStyle: { color: COLORS.chart[i % COLORS.chart.length] }
  }));

  const option = {
    ...ECHARTS_THEME,
    tooltip: { trigger: 'item', formatter: '{b}: {c}部 ({d}%)' },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: pieData,
      label: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount * 255));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount * 255));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount * 255));
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

/**
 * 词云 - 核心关键词（使用散点模拟词云效果）
 */
async function initWordCloudChart(data) {
  const chartDom = document.getElementById('wordcloud-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);

  // 更丰富的关键词库，带权重
  const keywords = [
    { name: '斗拱', value: 95, category: '结构构件' },
    { name: '榫卯', value: 90, category: '连接技术' },
    { name: '营造法式', value: 88, category: '建筑规范' },
    { name: '台基', value: 72, category: '建筑基础' },
    { name: '园林', value: 85, category: '建筑类型' },
    { name: '风水', value: 70, category: '选址理论' },
    { name: '梁架', value: 68, category: '结构体系' },
    { name: '彩画', value: 65, category: '装饰艺术' },
    { name: '琉璃', value: 62, category: '装饰材料' },
    { name: '飞檐', value: 60, category: '屋顶形式' },
    { name: '藻井', value: 55, category: '室内装饰' },
    { name: '影壁', value: 52, category: '建筑构件' },
    { name: '照壁', value: 50, category: '建筑构件' },
    { name: '月台', value: 48, category: '建筑构件' },
    { name: '材分', value: 45, category: '模数制度' },
    { name: '举折', value: 42, category: '屋顶做法' },
    { name: '大木作', value: 58, category: '工种' },
    { name: '小木作', value: 50, category: '工种' },
    { name: '瓦作', value: 40, category: '工种' },
    { name: '石作', value: 38, category: '工种' }
  ];

  // 随机但可控的位置分布
  const positions = [
    [15, 25], [35, 15], [60, 20], [85, 30], [25, 45],
    [50, 40], [75, 50], [10, 60], [40, 65], [65, 70],
    [90, 65], [20, 80], [45, 85], [70, 85], [55, 55],
    [80, 40], [30, 75], [85, 80], [15, 50], [95, 45]
  ];

  const chartData = keywords.map((kw, i) => ({
    name: kw.name,
    value: positions[i] || [50, 50],
    symbolSize: Math.max(20, kw.value * 0.6),
    itemStyle: { color: COLORS.chart[i % COLORS.chart.length] },
    label: {
      show: true,
      formatter: '{b}',
      fontSize: Math.max(10, kw.value * 0.14),
      color: '#fff',
      fontWeight: kw.value > 80 ? 'bold' : 'normal'
    }
  }));

  const option = {
    ...ECHARTS_THEME,
    grid: { top: '5%', bottom: '5%', left: '5%', right: '5%' },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{
      type: 'scatter',
      data: chartData,
      emphasis: {
        scale: 1.8,
        label: { fontSize: 16, fontWeight: 'bold' }
      }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const detail = keywordDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: params.name,
        content: `
          <p><strong style="color: #4ECDC4;">类别：</strong>${detail.category}</p>
          <div style="background: rgba(255,255,255,0.05); padding: 0.1rem; border-radius: 6px;">
            <p style="line-height: 1.8;">${detail.desc}</p>
          </div>
        `
      });
    }
  });
  window.addEventListener('resize', () => chart.resize());
}

init();
