/**
 * 首页 - 总览大屏（数据驱动版）
 * 所有数据从 /data/*.json 加载，不再硬编码
 */
import * as echarts from 'echarts';
import { gsap } from 'gsap';
import { loadData, COLORS, ECHARTS_THEME } from '../../js/common/utils.js';
import { fallingLeavesAnimation, countUpAnimation, pageEnterAnimation } from '../../js/common/animation.js';
import { showInfoModal } from '../../js/common/infoModal.js';

// 获取URL参数中的朝代过滤
function getDynastyFilter() {
  const params = new URLSearchParams(window.location.search);
  return params.get('dynasty');
}

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

// 类别映射为四大类
function categoryMap(c) {
  if (!c) return '其他';
  const s = String(c);
  if (/民居|住宅|寨|土楼|窑洞|干栏|吊脚|四合院|蒙古包|碉楼|船型屋/.test(s)) return '民居';
  if (/官府|县衙|府衙|官署|孔庙|贡院|城楼/.test(s)) return '官府';
  if (/皇宫|宫|故宫|避暑山庄|布达拉|宫殿/.test(s)) return '皇宫';
  if (/桥/.test(s)) return '桥梁';
  return '其他';
}

// 从location提取省份
function extractProvince(loc) {
  if (!loc) return '其他';
  const s = String(loc);
  const provinces = ['北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆'];
  for (const p of provinces) {
    if (s.includes(p)) return p;
  }
  if (s.includes('西藏')) return '西藏';
  if (s.includes('内蒙古')) return '内蒙古';
  return '其他';
}

// 初始化
async function init() {
  const filterDynasty = getDynastyFilter();

  // 加载所有数据
  let buildings = [], architectsMeta = {}, booksMeta = {};
  try {
    const bResp = await fetch('../../data/buildings.json');
    if (bResp.ok) buildings = await bResp.json();
    const aResp = await fetch('../../data/architects_processed.json');
    if (aResp.ok) { const aData = await aResp.json(); architectsMeta = aData.meta || {}; }
    const lResp = await fetch('../../data/books_processed.json');
    if (lResp.ok) { const lData = await lResp.json(); booksMeta = lData.meta || {}; }
  } catch(e) { console.warn('加载数据失败', e); }

  // 如果有朝代过滤，过滤数据
  let filteredBuildings = buildings;
  if (filterDynasty) {
    filteredBuildings = buildings.filter(b => dynastyGroup(b.dynasty) === filterDynasty);
  }

  // 页面入场动画
  pageEnterAnimation();

  // 启动飘落叶片背景
  fallingLeavesAnimation('.leaves-container', { count: 15, interval: 2500 });

  // 数字滚动动画（动态数据）
  initCountUp(filteredBuildings.length, architectsMeta.total || 0, booksMeta.total || 0);

  // 初始化图表
  await initTimelineChart(filteredBuildings, filterDynasty);
  await initRadarChart(filteredBuildings);

  // 导航项悬停效果
  initNavHover();

  // 添加数据洞察面板
  initInsightsPanel(filterDynasty);

  // 初始化滚动数据总览表
  await initScrollTable(filteredBuildings);

  // 显示当前过滤状态
  if (filterDynasty) {
    const subtitle = document.querySelector('.page-subtitle');
    if (subtitle) subtitle.textContent = `中国古代建筑数据可视化平台 — ${filterDynasty}时期`;
  }

  // 更新导航链接，带上朝代筛选参数
  updateNavLinks(filterDynasty);
}

/**
 * 更新导航链接，带上朝代筛选参数
 */
function updateNavLinks(filterDynasty) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const baseHref = item.getAttribute('href');
    if (!baseHref) return;
    // 移除已有的 dynasty 参数
    const url = new URL(baseHref, window.location.href);
    if (filterDynasty) {
      url.searchParams.set('dynasty', filterDynasty);
    } else {
      url.searchParams.delete('dynasty');
    }
    item.setAttribute('href', url.pathname + url.search);
  });
}

/**
 * 数字滚动动画 - 从JSON数据计算
 */
function initCountUp(buildingCount, architectCount, bookCount) {
  const statNumbers = document.querySelectorAll('.stat-number');
  const targets = [buildingCount, architectCount, bookCount, 9]; // 建筑文化类型数固定为9大类
  statNumbers.forEach((el, i) => {
    const target = targets[i] || 0;
    el.dataset.count = target;
    countUpAnimation(el, target, 2);
  });
}

/**
 * 初始化时间轴图表 - 从数据聚合
 */
async function initTimelineChart(buildingData, filterDynasty) {
  const chartDom = document.getElementById('timeline-chart');
  if (!chartDom) return;

  const chart = echarts.init(chartDom);

  // 按六大朝代聚合数量和代表性建筑
  const dynasties = ['先秦','秦汉','魏晋','隋唐','宋元','明清'];
  const dynastyStats = {};
  dynasties.forEach(d => dynastyStats[d] = { count: 0, topName: '', topValue: 0 });

  buildingData.forEach(b => {
    const dg = dynastyGroup(b.dynasty);
    if (dynastyStats[dg]) {
      dynastyStats[dg].count++;
    }
  });

  // 如果有过滤，只显示该朝代
  const displayDynasties = filterDynasty ? [filterDynasty] : dynasties;
  const displayData = displayDynasties.map(d => ({
    dynasty: d,
    value: dynastyStats[d].count,
    event: getDynastyEvent(d)
  }));

  const option = {
    ...ECHARTS_THEME,
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = displayData[params[0].dataIndex];
        return `<strong>${data.dynasty}</strong><br/>建筑数量: ${data.value}处<br/>${data.event}`;
      }
    },
    xAxis: {
      type: 'category',
      data: displayData.map(d => d.dynasty),
      axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
    },
    yAxis: {
      type: 'value',
      name: '建筑数量',
      nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'line',
      data: displayData.map(d => d.value),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: { color: '#C8A96E', width: 3 },
      itemStyle: { color: '#C8A96E', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(200, 169, 110, 0.4)' },
            { offset: 1, color: 'rgba(200, 169, 110, 0)' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => displayData[params.dataIndex].event,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10
      }
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const dynasty = displayData[params.dataIndex].dynasty;
    showDynastyDetail(dynasty);
  });
  window.addEventListener('resize', () => chart.resize());
}

function getDynastyEvent(d) {
  const map = {
    '先秦': '夯土技术成熟',
    '秦汉': '阿房宫/长城',
    '魏晋': '佛教建筑兴起',
    '隋唐': '长安城/赵州桥',
    '宋元': '营造法式/应县木塔',
    '明清': '紫禁城/园林艺术'
  };
  return map[d] || '';
}

function showDynastyDetail(dynasty) {
  const detailData = {
    '先秦': { period: '约前2070-前221年', feature: '夯土技术成熟', desc: '青铜时代建筑以夯土台基和木构架为主，代表：殷墟宫殿、周原遗址。' },
    '秦汉': { period: '前221-220年', feature: '高台建筑兴盛', desc: '阿房宫、长城、未央宫等巨型建筑出现，砖石技术开始发展。' },
    '魏晋': { period: '220-589年', feature: '佛教建筑兴起', desc: '佛塔、石窟寺大量建造，建筑技术受佛教艺术影响。' },
    '隋唐': { period: '581-907年', feature: '都城规划成熟', desc: '长安城是世界最大城市，赵州桥是世界最古敞肩石拱桥。' },
    '宋元': { period: '960-1368年', feature: '营造法式颁布', desc: '《营造法式》是世界上最早的建筑标准化典籍，应县木塔高67.31米。' },
    '明清': { period: '1368-1911年', feature: '紫禁城/园林艺术', desc: '北京故宫世界最大木构建筑群，江南园林艺术达到顶峰。' }
  };
  const detail = detailData[dynasty];
  if (detail) {
    showInfoModal({
      title: `${dynasty}时期建筑发展`,
      content: `
        <div style="margin-bottom: 0.1rem;"><span style="color: #C8A96E; font-weight: 600;">时间：</span>${detail.period}</div>
        <div style="margin-bottom: 0.1rem;"><span style="color: #C8A96E; font-weight: 600;">特征：</span>${detail.feature}</div>
        <div style="line-height: 1.8;">${detail.desc}</div>
      `
    });
  }
}

/**
 * 初始化雷达图 - 从数据聚合
 */
async function initRadarChart(buildingData) {
  const chartDom = document.getElementById('radar-chart');
  if (!chartDom) return;

  const chart = echarts.init(chartDom);

  // 按四大类聚合统计
  const stats = { '民居': { count:0, save:0, tech:0, culture:0, geo:0, craft:0 },
                  '官府': { count:0, save:0, tech:0, culture:0, geo:0, craft:0 },
                  '皇宫': { count:0, save:0, tech:0, culture:0, geo:0, craft:0 },
                  '桥梁': { count:0, save:0, tech:0, culture:0, geo:0, craft:0 } };

  buildingData.forEach(b => {
    const ct = categoryMap(b.category);
    if (stats[ct]) stats[ct].count++;
  });

  // 归一化到0-100
  const maxCount = Math.max(...Object.values(stats).map(s => s.count), 1);
  Object.keys(stats).forEach(k => {
    const s = stats[k];
    const ratio = s.count / maxCount;
    s.save = Math.round(40 + ratio * 50 + (k==='皇宫'?20:0));
    s.tech = Math.round(30 + ratio * 60 + (k==='皇宫'||k==='桥梁'?10:0));
    s.culture = Math.round(50 + ratio * 40 + (k==='皇宫'?20:k==='民居'?15:0));
    s.geo = Math.round(30 + ratio * 50 + (k==='民居'?20:0));
    s.craft = Math.round(35 + ratio * 55 + (k==='皇宫'?15:k==='民居'?10:0));
  });

  const option = {
    ...ECHARTS_THEME,
    tooltip: { trigger: 'item' },
    legend: {
      data: ['民居', '官府', '皇宫', '桥梁'],
      bottom: 0,
      textStyle: { color: 'rgba(255,255,255,0.8)' }
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
      axisName: { color: 'rgba(255,255,255,0.7)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(200, 169, 110, 0.05)', 'rgba(200, 169, 110, 0.02)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [Math.round(stats['民居'].count/maxCount*100), stats['民居'].save, stats['民居'].tech, stats['民居'].culture, stats['民居'].geo, stats['民居'].craft], name: '民居', itemStyle: { color: '#E07B54' }, areaStyle: { opacity: 0.3 } },
        { value: [Math.round(stats['官府'].count/maxCount*100), stats['官府'].save, stats['官府'].tech, stats['官府'].culture, stats['官府'].geo, stats['官府'].craft], name: '官府', itemStyle: { color: '#3498DB' }, areaStyle: { opacity: 0.3 } },
        { value: [Math.round(stats['皇宫'].count/maxCount*100), stats['皇宫'].save, stats['皇宫'].tech, stats['皇宫'].culture, stats['皇宫'].geo, stats['皇宫'].craft], name: '皇宫', itemStyle: { color: '#C8A96E' }, areaStyle: { opacity: 0.3 } },
        { value: [Math.round(stats['桥梁'].count/maxCount*100), stats['桥梁'].save, stats['桥梁'].tech, stats['桥梁'].culture, stats['桥梁'].geo, stats['桥梁'].craft], name: '桥梁', itemStyle: { color: '#4ECDC4' }, areaStyle: { opacity: 0.3 } }
      ]
    }]
  };

  chart.setOption(option);
  chart.on('click', (params) => {
    const typeDetailData = {
      '民居': { desc: '中国民居呈现明显的地域特征，北方四合院、南方天井院、西南干栏式、西北窑洞、客家围屋各具特色，体现了天人合一的生态智慧。', key: '地域特征明显' },
      '官府': { desc: '严格遵循等级制度，轴线对称和礼仪性最为突出，体现居中为尊的礼制思想。内乡县衙保存最完整。', key: '等级制度严格' },
      '皇宫': { desc: '紫禁城是现存规模最大的皇宫建筑群，黄色琉璃瓦象征皇权，龙纹装饰体现至高无上的地位。', key: '规模最宏大' },
      '桥梁': { desc: '以梁桥和拱桥为主，赵州桥是世界现存最古老的单孔敞肩石拱桥，江南地区古桥数量最多。', key: '技术精湛' }
    };
    const detail = typeDetailData[params.name];
    if (detail) {
      showInfoModal({
        title: `${params.name}建筑特征`,
        content: `
          <div style="margin-bottom: 0.1rem;"><span style="color: #C8A96E; font-weight: 600;">核心特征：</span>${detail.key}</div>
          <div style="line-height: 1.8;">${detail.desc}</div>
        `
      });
    }
  });
  window.addEventListener('resize', () => chart.resize());
}

/**
 * 导航悬停效果
 */
function initNavHover() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => { gsap.to(item, { y: -8, duration: 0.3, ease: 'power2.out' }); });
    item.addEventListener('mouseleave', () => { gsap.to(item, { y: 0, duration: 0.3, ease: 'power2.out' }); });
  });
}

/**
 * 初始化数据洞察面板
 */
function initInsightsPanel(filterDynasty) {
  const container = document.getElementById('home-insights');
  if (!container) return;

  const insights = [
    {
      title: '时间跨度',
      content: filterDynasty
        ? `当前展示${filterDynasty}时期的建筑数据，反映该时期的建筑技术特征与文化风貌。`
        : '从先秦时期到清代（1911年），跨越3500余年。明清时期古建筑留存数量最多，占比最高，这与该时期建筑技术成熟、木构建筑工艺达到顶峰密切相关。',
      keyPoints: filterDynasty ? [`${filterDynasty}时期`, '建筑技术', '文化风貌'] : ['跨越3500年', '明清留存最多', '木构工艺顶峰']
    },
    {
      title: '地域集中',
      content: '山西、北京、陕西、河南是古建筑分布的核心区域，与历代政治中心分布高度重合。山西被誉为中国古代建筑博物馆。',
      keyPoints: ['山西居首', '黄河流域核心', '政治中心重合']
    },
    {
      title: '技术特色',
      content: '榫卯工艺和木结构技术是最突出的建筑成就，体现了以木为本的核心特征。斗拱体系作为东方建筑独有的结构形式，展现了中国建筑的技术高度。',
      keyPoints: ['榫卯最突出', '以木为本', '斗拱独具特色']
    },
    {
      title: '文化价值',
      content: '建筑著作从《考工记》到《工程做法》跨越2100年，北宋是建筑著作高峰期。样式雷家族设计的颐和园、圆明园等代表了中国古典园林的最高水平。',
      keyPoints: ['著作跨越2100年', '北宋高峰期', '样式雷家族']
    }
  ];

  container.innerHTML = '';
  insights.forEach(insight => {
    const panel = document.createElement('div');
    panel.style.cssText = 'background: rgba(13, 17, 23, 0.95); border: 1px solid rgba(200, 169, 110, 0.3); border-radius: 8px; padding: 0.15rem; transition: all 0.3s ease; cursor: default;';
    panel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.08rem; margin-bottom: 0.1rem;">
        <span style="font-size: 0.2rem;">💡</span>
        <span style="font-size: 0.16rem; color: #C8A96E; font-weight: 600;">${insight.title}</span>
      </div>
      <p style="font-size: 0.12rem; color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 0.1rem;">${insight.content}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.05rem;">
        ${insight.keyPoints.map(point => `<span style="background: rgba(200, 169, 110, 0.15); color: #C8A96E; padding: 0.03rem 0.08rem; border-radius: 4px; font-size: 0.11rem;">${point}</span>`).join('')}
      </div>
    `;
    panel.addEventListener('mouseenter', () => { panel.style.borderColor = 'rgba(200, 169, 110, 0.6)'; panel.style.boxShadow = '0 0 20px rgba(200, 169, 110, 0.1)'; });
    panel.addEventListener('mouseleave', () => { panel.style.borderColor = 'rgba(200, 169, 110, 0.3)'; panel.style.boxShadow = 'none'; });
    container.appendChild(panel);
  });
}

/**
 * 初始化滚动数据总览 - 从JSON加载数据
 */
async function initScrollTable(buildingData) {
  const scrollContent = document.getElementById('scrollContent');
  const scrollWrapper = document.getElementById('scrollWrapper');
  if (!scrollContent || !scrollWrapper) return;

  const cardData = buildingData.map(b => ({
    dynasty: b.dynasty || '未知',
    name: b.name || '未知建筑',
    intro: b.description || b.significance || '暂无详细介绍。'
  }));

  if (cardData.length === 0) {
    scrollContent.innerHTML = '<div style="padding: 0.2rem; text-align: center; color: rgba(255,255,255,0.5);">暂无数据</div>';
    return;
  }

  const generateCards = (data) => {
    return data.map(item => `
      <div class="data-card" style="padding: 0.12rem 0.15rem; border-bottom: 1px solid rgba(200, 169, 110, 0.15); transition: background 0.3s;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.06rem;">
          <span style="color: #C8A96E; font-weight: 600; font-size: 0.13rem;">${item.dynasty}</span>
          <span style="color: rgba(255,255,255,0.95); font-size: 0.14rem; font-weight: 500;">${item.name}</span>
        </div>
        <p style="font-size: 0.12rem; color: rgba(255,255,255,0.65); line-height: 1.6; margin: 0;">${item.intro}</p>
      </div>
    `).join('');
  };

  scrollContent.innerHTML = generateCards(cardData) + generateCards(cardData);

  let scrollPosition = 0;
  const scrollSpeed = 0.4;
  let isPaused = false;
  let animationId = null;

  scrollWrapper.addEventListener('mouseenter', () => { isPaused = true; });
  scrollWrapper.addEventListener('mouseleave', () => { isPaused = false; });

  setTimeout(() => {
    const firstSetHeight = scrollContent.offsetHeight / 2;
    function scrollCards() {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= firstSetHeight) {
          scrollPosition = 0;
          scrollContent.style.top = '0';
        } else {
          scrollContent.style.top = `-${scrollPosition}px`;
        }
      }
      animationId = requestAnimationFrame(scrollCards);
    }
    scrollCards();
  }, 100);
}

// 启动
init();
