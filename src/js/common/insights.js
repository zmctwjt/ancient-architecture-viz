/**
 * 数据分析结论模块
 * 为各页面提供数据洞察和分析结论
 */

// 建筑成就页面数据洞察
export const achievementInsights = {
  dynastyDistribution: {
    title: '朝代分布分析',
    content: '明清时期古建筑数量占比最高（约37%），这与该时期建筑技术成熟、留存条件较好有关。商周时期建筑虽然数量少，但具有极高的历史价值，如河南安阳殷墟、陕西周原遗址等。',
    keyPoints: ['明清建筑占比最高', '商周建筑历史价值极高', '宋元建筑技术转型期'],
    data: { total: 43, mingqing: 16, songyuan: 11, others: 16 }
  },
  geoDistribution: {
    title: '地理分布分析',
    content: '山西以8处古建筑位居全国之首，被誉为"中国古代建筑博物馆"。北京、陕西、河南紧随其后，这与这些地区作为历代政治中心、经济发达密切相关。',
    keyPoints: ['山西居首：8处', '政治中心集中', '黄河流域为核心'],
    data: { shanxi: 8, beijing: 5, shaanxi: 4, henan: 4 }
  },
  techCategory: {
    title: '技术成就分析',
    content: '榫卯工艺（40项）和木结构技术（35项）是最突出的建筑成就，体现了中国古代建筑"以木为本"的核心特征。斗拱体系（30项）作为东方建筑独有的结构形式，展现了中国建筑的技术高度。',
    keyPoints: ['榫卯工艺最突出', '木结构体系成熟', '斗拱体系独具特色'],
    data: { sunmao: 40, wood: 35, dougong: 30, brick: 25 }
  }
};

// 科学家页面数据洞察
export const scientistInsights = {
  timeline: {
    title: '科学家时间分布',
    content: '从春秋时期的鲁班到清代的样式雷，中国建筑科学家跨越2500余年。明清时期科学家数量最多、成就最集中，这与该时期建筑活动频繁、技术总结需求强烈有关。',
    keyPoints: ['跨越2500年', '明清成就最集中', '官匠与民间并重'],
    data: { total: 20, ancient: 3, medieval: 5, modern: 12 }
  },
  influence: {
    title: '影响力分析',
    content: '样式雷家族以95分的影响力位居榜首，其设计的颐和园、圆明园等作品代表了中国古典园林的最高水平。鲁班作为木匠祖师，影响力跨越两千余年。',
    keyPoints: ['样式雷家族居首', '鲁班影响跨越千年', '官匠制度培养人才'],
    data: { yangshilei: 95, luban: 90, kuaixiang: 85, lijie: 80 }
  }
};

// 著作页面数据洞察
export const literatureInsights = {
  timeline: {
    title: '著作时间分布',
    content: '从春秋战国《考工记》到清代《工程做法》，中国建筑著作跨越2100余年。北宋时期是建筑著作的高峰期，《木经》《营造法式》等相继问世，标志着建筑技术的系统化总结。',
    keyPoints: ['跨越2100年', '北宋为高峰期', '官书与民间并重'],
    data: { total: 14, ancient: 1, song: 4, ming: 4, qing: 2 }
  },
  category: {
    title: '著作分类分析',
    content: '官书（3部）与民间著作（3部）数量相当，体现了官方规制与民间经验的互补。专著类（3部）以《园冶》为代表，开创了中国园林理论的先河。',
    keyPoints: ['官民并重', '《营造法式》最系统', '《园冶》开园林理论先河'],
    data: { official: 3, folk: 3, monograph: 3, local: 3 }
  }
};

// 建筑文化页面数据洞察
export const cultureInsights = {
  residence: {
    title: '民居文化分析',
    content: '中国民居呈现明显的地域特征：北方四合院（占比29%）体现宗法礼制，南方天井院（22%）适应湿热气候，西南干栏式（18%）应对山地环境。建筑材料以木材（40%）为主，体现了"天人合一"的生态智慧。',
    keyPoints: ['地域特征明显', '木材为主材', '适应气候环境'],
    data: { siheyuan: 29, tianjing: 22, ganlan: 18, wood: 40 }
  },
  official: {
    title: '官府建筑分析',
    content: '官府建筑严格遵循等级制度，一品官署可达九开间。建筑特征以轴线对称（95分）和礼仪性（95分）最为突出，体现了"居中为尊"的礼制思想。现存代表以内乡县衙保存最完整。',
    keyPoints: ['等级制度严格', '轴线对称突出', '内乡县衙保存最完整'],
    data: { level1: 9, symmetry: 95, ritual: 95 }
  },
  palace: {
    title: '皇宫建筑分析',
    content: '明清紫禁城（7.2万m²）是现存规模最大的皇宫建筑群。建筑布局遵循"前朝后寝"制度，黄色琉璃瓦（35%）象征皇权，龙纹装饰（95分）体现至高无上的地位。',
    keyPoints: ['紫禁城规模最大', '色彩象征等级', '装饰体现皇权'],
    data: { forbidden: 7.2, yellow: 35, dragon: 95 }
  },
  bridge: {
    title: '桥梁文化分析',
    content: '中国古桥以梁桥（40%）和拱桥（35%）为主。赵州桥（605年建）是世界现存最古老的单孔敞肩石拱桥。江南地区古桥数量最多，与水乡环境密切相关。',
    keyPoints: ['梁桥拱桥为主', '赵州桥世界最古', '江南水乡桥多'],
    data: { liang: 40, arch: 35, zhaozhou: 605 }
  }
};

/**
 * 生成洞察面板HTML
 * @param {Object} insight - 洞察数据对象
 * @returns {string} HTML字符串
 */
export function generateInsightHTML(insight) {
  return `
    <div class="insight-panel">
      <div class="insight-title">
        <span>💡</span>
        <span>${insight.title}</span>
      </div>
      <div class="insight-content">
        <p style="margin-bottom: 0.08rem;">${insight.content}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.05rem; margin-top: 0.08rem;">
          ${insight.keyPoints.map(point => `
            <span style="background: rgba(200, 169, 110, 0.15); color: #C8A96E; padding: 0.03rem 0.08rem; border-radius: 4px; font-size: 0.11rem;">
              ${point}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 添加洞察面板到页面
 * @param {string} containerId - 容器ID
 * @param {Object} insight - 洞察数据
 */
export function addInsightPanel(containerId, insight) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const panel = document.createElement('div');
  panel.innerHTML = generateInsightHTML(insight);
  container.appendChild(panel.firstElementChild);
}
