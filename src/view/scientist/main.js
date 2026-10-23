/**
 * 杰出科学家大屏 - 数据驱动版
 * 数据来源：/data/architects_processed.json
 */
import echarts from '../../js/common/echarts.js';
import { loadData, COLORS, ECHARTS_THEME, getDataUrl, loadJson, matchDynastyGroup } from '../../js/common/utils.js';
import { pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal, generateDataHTML } from '../../js/common/infoModal.js';
import { showDrawer } from '../../js/common/drawer.js';
import { scientistInsights, generateInsightHTML } from '../../js/common/insights.js';
import { initReveal } from '../../js/common/reveal.js';

const dynastyOrder = { '春秋': 1, '汉': 2, '隋': 3, '唐': 4, '北魏': 5, '宋': 6, '元': 7, '明': 8, '明末清初': 9, '清': 10 };

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

// 按朝代过滤科学家数据的辅助函数
function filterArchitectData(rawData, filterDynasties) {
  let architectData = JSON.parse(JSON.stringify(rawData));
  if (!filterDynasties || filterDynasties.length === 0) return architectData;

  const allDynasties = architectData.timeline_data || [];
  architectData.timeline_data = allDynasties.filter(s => 
    filterDynasties.some(fd => matchDynastyGroup(s.dynasty, fd))
  );
  const keptNames = new Set(architectData.timeline_data.map(s => s.name));
  architectData.graph_data.nodes = (architectData.graph_data.nodes || []).filter(n => {
    if (n.category === 0) return keptNames.has(n.name);
    return true;
  });
  const keptNodeIds = new Set(architectData.graph_data.nodes.map(n => n.id));
  architectData.graph_data.links = (architectData.graph_data.links || []).filter(l => {
    return keptNodeIds.has(l.source) || keptNodeIds.has(l.target);
  });
  const linkedIds = new Set();
  architectData.graph_data.links.forEach(l => { linkedIds.add(l.source); linkedIds.add(l.target); });
  keptNames.forEach(name => {
    const node = architectData.graph_data.nodes.find(n => n.name === name);
    if (node) linkedIds.add(node.id);
  });
  architectData.graph_data.nodes = architectData.graph_data.nodes.filter(n => linkedIds.has(n.id));
  return architectData;
}

async function initData(filterDynasties) {
  let rawData = { timeline_data: [], graph_data: { nodes: [], links: [] } };
  try {
    rawData = await loadJson('architects_processed.json') || rawData;
  } catch(e) { console.warn('加载科学家数据失败', e); }

  const architectData = filterArchitectData(rawData, filterDynasties);

  await initTimelineChart(architectData);
  await initGraphChart(architectData);
  await initPersonCards(architectData);
  renderLineage(architectData.timeline_data || []);
  await initBarChart(architectData);

  addInsightPanels();
}

async function init() {
  initUI();
  await initData(getDynastyFilter());
}

function addInsightPanels() {
  const container = document.querySelector('.dashboard-grid');
  if (!container || container.querySelector('.insight-panel')) return;

  const insights = [scientistInsights.timeline, scientistInsights.influence];
  insights.forEach(insight => {
    const insightDiv = document.createElement('div');
    insightDiv.style.cssText = 'grid-column: 1 / -1; margin-top: 0.1rem;';
    insightDiv.innerHTML = generateInsightHTML(insight);
    container.appendChild(insightDiv);
  });
}

/**
 * 建筑科学家影响力排行 - 横向条形图
 */
async function initTimelineChart(data) {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const scientists = (data.timeline_data || []).slice().sort((a, b) => {
    const oa = dynastyOrder[a.dynasty] || 99;
    const ob = dynastyOrder[b.dynasty] || 99;
    return oa - ob;
  });

  const option = {
    ...ECHARTS_THEME,
    title: {
      text: '按朝代排序，长度表示综合影响力',
      left: 'center',
      top: 0,
      textStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const s = scientists[params[0].dataIndex];
        return `<strong>${s.name}</strong><br/>朝代: ${s.dynasty}<br/>时期: ${s.period}<br/>代表作: ${(s.major_works || []).slice(0, 2).join('、')}<br/>影响力: ${s.influence_score || 0}分<br/>点击查看详情`;
      }
    },
    grid: { left: '12%', right: '8%', top: '10%', bottom: '5%' },
    xAxis: {
      type: 'value',
      name: '影响力指数',
      nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    yAxis: {
      type: 'category',
      data: scientists.map(s => s.name),
      axisLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: scientists.map((s, i) => ({
        value: s.influence_score || 5,
        itemStyle: { color: COLORS[i % COLORS.chart.length] },
        label: { show: true, position: 'right', formatter: '{c}', color: 'rgba(255,255,255,0.7)', fontSize: 10 }
      })),
      barWidth: '55%',
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => showPersonDetail(scientists[params.dataIndex]));
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 力导向关系图
 * 数据中 category=0 是科学家, category=1 是朝代
 * 动态添加 category=2 代表作品节点（从 timeline_data 的 major_works 提取）
 */
async function initGraphChart(data) {
  const chartDom = document.getElementById('graph-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const graphData = data.graph_data || { nodes: [], links: [] };
  const timelineData = data.timeline_data || [];

  // 深拷贝节点和链接，避免修改原始数据
  const nodes = graphData.nodes.map(n => ({ ...n }));
  const links = graphData.links.map(l => ({ ...l }));

  // 从 timeline_data 中提取代表作品，作为 category=2 节点
  let workId = 0;
  const workNodeMap = {}; // workName -> nodeId
  timelineData.forEach((person, pIdx) => {
    const works = person.major_works || [];
    // 找到该科学家在 nodes 中的 id（arch_0, arch_1, ...）
    const archNode = nodes.find(n => n.name === person.name);
    const archId = archNode ? archNode.id : null;
    works.forEach(work => {
      if (!work) return;
      // 去重：同一作品只创建一个节点
      if (!workNodeMap[work]) {
        const nodeId = `work_${workId++}`;
        workNodeMap[work] = nodeId;
        nodes.push({
          id: nodeId,
          name: work,
          category: 2,
          symbolSize: 18
        });
      }
      // 科学家 -> 作品 链接
      if (archId) {
        links.push({ source: archId, target: workNodeMap[work], value: 1 });
      }
    });
  });

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          const types = ['建筑科学家', '历史时期', '代表作品'];
          return `${params.name}<br/>类型: ${types[params.data.category] || '未知'}`;
        }
        return '';
      }
    },
    legend: {
      data: ['建筑科学家', '历史时期', '代表作品'],
      textStyle: { color: 'rgba(255,255,255,0.8)' },
      bottom: 0
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes.map(n => ({
        ...n,
        // category=0 科学家: 按影响力缩放; category=1 朝代: 固定大小; category=2 作品: 固定大小
        symbolSize: n.category === 0 ? Math.min(35, (n.symbolSize || 1) * 12 + 8)
                  : n.category === 1 ? Math.min(25, n.symbolSize || 20)
                  : 18,
        label: {
          show: true,
          position: n.category === 1 ? 'inside' : 'bottom',
          color: 'rgba(255,255,255,0.8)',
          fontSize: n.category === 1 ? 11 : 10
        }
      })),
      links: links,
      categories: [
        { name: '建筑科学家', itemStyle: { color: '#C8A96E' } },
        { name: '历史时期', itemStyle: { color: '#7FA8A0' } },
        { name: '代表作品', itemStyle: { color: '#C8452F' } }
      ],
      roam: true,
      label: { show: true, position: 'bottom', color: 'rgba(255,255,255,0.8)' },
      force: { repulsion: 150, edgeLength: [40, 100] },
      lineStyle: { color: 'source', curveness: 0.3, opacity: 0.6 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 4 } }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    if (params.dataType === 'node' && params.data.category === 0) {
      const name = params.name;
      const person = timelineData.find(p => p.name === name);
      if (person) showPersonDetail(person);
    }
  });
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 重点人物卡片
 */
async function initPersonCards(data) {
  const container = document.getElementById('person-card');
  if (!container) return;

  const topScientists = (data.timeline_data || [])
    .slice()
    .sort((a, b) => (b.influence_score || 0) - (a.influence_score || 0))
    .slice(0, 5);

  container.innerHTML = topScientists.map(s => `
    <div class="person-card" data-name="${s.name}">
      <div style="display: flex; gap: 0.12rem; align-items: flex-start;">
        <div class="seal-avatar" aria-hidden="true">${s.name.charAt(0)}</div>
        <div style="flex: 1; min-width: 0;">
          <h4>${s.name}</h4>
          <div class="meta">${s.dynasty} · ${s.period}</div>
        </div>
      </div>
      <div class="desc">${s.achievements ? s.achievements.substring(0, 80) + '...' : ''}</div>
    </div>
  `).join('');

  container.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name;
      const person = (data.timeline_data || []).find(p => p.name === name);
      if (person) showPersonDetail(person);
    });
  });
}

/**
 * 影响力条形图
 */
async function initBarChart(data) {
  const chartDom = document.getElementById('bar-chart');
  if (!chartDom) return;
  const chart = echarts.init(chartDom);
  chartInstances.push(chart);

  const scientists = (data.timeline_data || [])
    .slice()
    .sort((a, b) => (b.influence_score || 0) - (a.influence_score || 0));

  const option = {
    ...ECHARTS_THEME,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        return `${d.name}<br/>影响力指数: <strong style="color: #C8A96E;">${d.value}</strong>分<br/>点击查看详情`;
      }
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 12,
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: scientists.map(d => d.name).reverse(),
      axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: scientists.map(d => d.influence_score || 0).reverse(),
      barWidth: '50%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#7FA8A0' }, { offset: 1, color: '#C8A96E' }]
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
  chart.on('click', (params) => {
    const name = scientists[scientists.length - 1 - params.dataIndex].name;
    const person = scientists.find(p => p.name === name);
    if (person) showPersonDetail(person);
  });
  window.addEventListener('resize', () => chart.resize());
}

function showPersonDetail(person) {
  if (!person) return;
  const works = (person.major_works || []).join('、') || '无详细记载';
  showInfoModal({
    title: `${person.name} - ${person.dynasty}时期`,
    content: `
      <div style="display: flex; gap: 0.15rem; align-items: center; margin-bottom: 0.15rem;">
        <div class="seal-avatar seal-lg" aria-hidden="true">${person.name.charAt(0)}</div>
        <div style="flex: 1; min-width: 0;">
          <p><strong style="color: #7FA8A0;">时期：</strong>${person.period}</p>
          <p><strong style="color: #7FA8A0;">影响力指数：</strong>${person.influence_score || 0} / 100</p>
        </div>
      </div>
      <div style="margin-bottom: 0.15rem;">
        <p><strong style="color: #7FA8A0;">代表作品：</strong>${works}</p>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 0.15rem; border-radius: 6px;">
        <p style="line-height: 1.8;">${person.achievements || ''}</p>
      </div>
    `
  });
}


/**
 * 匠师谱系墙：按六大断代分栏，栏内按影响力降序
 */
const LINEAGE_GROUPS = [
  { key: '先秦', label: '先秦', test: /夏|商|周|春秋|战国|先秦/ },
  { key: '秦汉', label: '秦汉', test: /秦|汉/ },
  { key: '魏晋', label: '魏晋', test: /魏|晋|南北朝|三国/ },
  { key: '隋唐', label: '隋唐', test: /隋|唐/ },
  { key: '宋元', label: '宋元', test: /宋|元|辽|金/ },
  { key: '明清', label: '明清', test: /明|清/ },
];

function simplifyPeriod(raw) {
  let s = String(raw || '').trim();
  if (!s) return '生卒不详';
  if (/不详|无考/.test(s)) return '生卒不详';
  s = s.replace(/约/g, '').replace(/年/g, '').replace(/公元/g, '');
  s = s.replace(/前/g, '前');
  // 取「—」或「-」两侧，压缩为 前507—前444
  const parts = s.split(/[—\-–]/).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}—${parts[parts.length - 1]}`;
  return s.length > 14 ? s.slice(0, 14) + '…' : s;
}

function renderLineage(scientists) {
  const box = document.getElementById('lineage-grid');
  if (!box) return;

  const cols = LINEAGE_GROUPS.map((g) => ({
    ...g,
    people: scientists
      .filter((s) => g.test.test(String(s.dynasty || '')))
      .sort((a, b) => (b.influence_score || 0) - (a.influence_score || 0)),
  }));

  box.innerHTML = cols.map((col) => `
    <div class="lineage-col">
      <div class="lineage-col__head">
        <b>${col.label}</b>
        <span>${col.people.length} 人</span>
      </div>
      ${col.people.length
        ? `<div class="lineage-list">${col.people.map((p) => `
            <div class="lineage-person" data-name="${p.name}" role="button" tabindex="0">
              <div class="seal-avatar" aria-hidden="true">${p.name.charAt(0)}</div>
              <div class="lineage-person__info">
                <span class="lineage-person__name">${p.name}</span>
                <span class="lineage-person__period">${simplifyPeriod(p.period)}</span>
              </div>
              <span class="lineage-person__score">${p.influence_score || 0}</span>
            </div>`).join('')}</div>`
        : '<div class="lineage-empty">暂无留名匠师</div>'}
    </div>
  `).join('');

  // 点击 → 抽屉
  const open = (el) => {
    const person = scientists.find((s) => s.name === el.dataset.name);
    if (!person) return;
    showDrawer({
      title: person.name,
      subtitle: [person.dynasty, person.title || '匠师'].filter(Boolean).join(' · '),
      glyph: null,
      category: '官府',
      fields: [
        { label: '朝代', value: person.dynasty },
        { label: '生卒', value: person.period },
        { label: '身份', value: person.title },
        { label: '影响力', value: `${person.influence_score || 0} / 100` },
      ],
      body: person.achievements ? `<p>${person.achievements}</p>` : '',
      tags: (person.major_works || []).slice(0, 4),
    });
  };

  box.querySelectorAll('.lineage-person').forEach((el) => {
    el.addEventListener('click', () => open(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });
}


init();
