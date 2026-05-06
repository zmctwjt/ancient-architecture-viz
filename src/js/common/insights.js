/**
 * 数据分析结论模块
 * 为各页面提供数据洞察和分析结论
 * 数据基于115条全国重点文物保护单位（古建筑类）
 */

// 建筑成就页面数据洞察
export const achievementInsights = {
  dynastyDistribution: {
    title: '朝代分布洞察',
    content: '115处古建筑中，明清时期占比最高（约34%），这与该时期建筑技术成熟、木构体系完善、留存条件较好有关。寺庙类建筑（26处）数量居首，反映出佛教文化对中国建筑的深远影响。值得关注的是，先秦至汉代的城址遗址（如汉长安城、赵邯郸故城）虽年代久远，却是研究中国古代城市规划的珍贵实物。',
    keyPoints: ['明清建筑占比34%', '寺庙类26处居首', '先秦城址历史价值极高', '桥梁8座座座是里程碑'],
    data: { total: 115, mingqing: 39, temple: 26, bridge: 8 }
  },
  geoDistribution: {
    title: '地理分布洞察',
    content: '山西省以18处古建筑位居全国之首，被誉为"中国古代建筑博物馆"——从唐代佛光寺到辽代应县木塔，跨越千年。北京（10处）集中了大量皇家建筑和祭祀建筑。江苏（10处）以古典园林闻名，福建则凭借洛阳桥、安平桥等海上丝绸之路桥梁独树一帜。整体呈"黄河流域+政治中心"的集中分布格局。',
    keyPoints: ['山西18处居首', '北京皇家建筑集中', '江苏园林甲天下', '福建海丝桥梁独特'],
    data: { shanxi: 18, beijing: 10, jiangsu: 10, fujian: 5 }
  },
  techCategory: {
    title: '建筑类别洞察',
    content: '11个建筑类别中，寺庙（26处）和园林（20处）合计占40%，体现"宗教+园林"两大文化主线。城址（11处）从殷墟到长城，见证了中国城市的演进。世界遗产26处，占22.6%，其中皇宫（4处）100%为世界遗产，桥梁（8处）中赵州桥、卢沟桥等均具世界级技术意义。民居（6处）虽然数量少，但开平碉楼、乔家大院等体现了极致的地域建筑智慧。',
    keyPoints: ['寺庙园林占40%', '世界遗产26处(22.6%)', '皇宫100%为世界遗产', '民居地域多样性丰富'],
    data: { temple: 26, garden: 20, city: 11, worldHeritage: 26 }
  }
};

// 科学家页面数据洞察
export const scientistInsights = {
  timeline: {
    title: '科学家时空分布',
    content: '20位建筑科学家跨越2500余年，从春秋鲁班到清代样式雷，呈现出"两头少、中间多"的分布特点。宋元时期（李诫、喻皓等）是建筑理论的高峰期，明代（蒯祥、计成等）则以实践创新见长。样式雷家族延续了200余年、8代28人从事皇家建筑设计，是世界建筑史上罕见的建筑世家。',
    keyPoints: ['跨越2500年20人', '宋元理论高峰', '明代实践创新', '样式雷8代28人'],
    data: { total: 20, songYuan: 5, mingQing: 10, yangshilei: 28 }
  },
  influence: {
    title: '影响力深度分析',
    content: '样式雷家族（95分）设计的故宫、颐和园、避暑山庄均列入世界遗产，是中国古典建筑美学的集大成者。鲁班（90分）被尊为木匠祖师，"班门弄斧"成语流传至今。李诫（85分）编修的《营造法式》是世界最早的建筑标准化典籍。蒯祥（85分）设计紫禁城，其"香山帮"工匠体系影响深远。这四位代表了中国建筑"技术-理论-实践-传承"四条主线。',
    keyPoints: ['样式雷：3处世界遗产', '鲁班：木匠祖师2000年', '李诫：世界最早建筑标准', '蒯祥：紫禁城设计者'],
    data: { yangshilei: 95, luban: 90, lijie: 85, kuaixiang: 85 }
  }
};

// 著作页面数据洞察
export const literatureInsights = {
  timeline: {
    title: '著作时间脉络',
    content: '15部建筑著作从春秋《考工记》到清代《工段营造录》，跨越2100余年。北宋是高峰期——《木经》《营造法式》《梦溪笔谈》同期问世，标志着建筑技术从经验传承走向理论总结。明代5部著作数量最多，涵盖园林理论（《园冶》）、工艺百科（《天工开物》）、民间技术（《鲁班经》）等，体现了建筑文化的全面繁荣。',
    keyPoints: ['15部跨越2100年', '北宋：建筑理论高峰', '明代：全面繁荣5部', '官书与民间互补'],
    data: { total: 15, song: 3, ming: 5, qing: 3 }
  },
  category: {
    title: '著作分类洞察',
    content: '15部著作按类型可分为：官书4部（《营造法式》《工程做法》等）、专著6部（《园冶》《天工开物》等）、民间3部（《鲁班经》《工段营造录》等）。《园冶》是世界上第一部园林艺术专著，比西方同类著作早200余年。《营造法式》34卷系统规范了建筑设计施工全流程，被誉为"中国古代建筑百科全书"。',
    keyPoints: ['《园冶》：世界最早园林专著', '《营造法式》：34卷建筑圣经', '《天工开物》：17世纪百科', '官民互补完整体系'],
    data: { official: 4, monograph: 6, folk: 3, local: 2 }
  }
};

// 建筑文化页面数据洞察 - 大幅丰富
export const cultureInsights = {
  residence: {
    title: '民居文化洞察',
    content: '8大民居类型覆盖了中国所有主要气候带和地形——华北四合院的院落保温、西南吊脚楼的防潮架空、黄土高原窑洞的冬暖夏凉、福建土楼的聚族防御、蒙古包的游牧迁徙，每一种都是对当地自然环境的极致适应。遗存数量以四合院最多（42处），体现了北方院落文化的深远影响。6处民居列入全国重点文保，开平碉楼更在2007年入选世界文化遗产。',
    keyPoints: ['8大类型覆盖全气候带', '四合院42处遗存最多', '开平碉楼为世界遗产', '天人合一的生态智慧'],
    data: { types: 8, siheyuan: 42, worldHeritage: 1 }
  },
  official: {
    title: '官府建筑洞察',
    content: '5类官府建筑涵盖了中国古代行政体系的核心——孔庙（文庙）传播儒家教化，县衙管理地方司法，贡院选拔治国人才，城楼防御城市安全，钟鼓楼管理时间秩序。现存以内乡县衙保存最完整，被称为"中国县衙博物馆"。孔庙数量全国约1300余座，是分布最广的官式建筑类型。官府建筑的轴线对称、等级严格、居中为尊等特征，深刻影响了中国人的空间观念。',
    keyPoints: ['5类涵盖行政核心', '孔庙1300座分布最广', '内乡县衙保存最完整', '轴线对称影响深远'],
    data: { types: 5, kongmiao: 1300, bestPreserved: '内乡县衙' }
  },
  palace: {
    title: '皇宫建筑洞察',
    content: '5座皇宫从元大都到沈阳故宫，展现了多民族建筑文化的融合。北京故宫占地72万m²、约9000间房屋，是世界最大的木构建筑群。承德避暑山庄占地564万m²，是面积最大的皇家园林。4座列入世界遗产，占皇宫类80%。建筑布局严格遵循"前朝后寝、左祖右社"制度，黄色琉璃瓦和龙纹装饰象征至高皇权。样式雷家族设计了其中多座，代表了中国古典建筑的最高水准。',
    keyPoints: ['故宫72万m²世界最大', '4/5列入世界遗产', '前朝后寝礼制严格', '样式雷设计多座'],
    data: { forbidden: 72, heritage: 4, total: 5 }
  },
  bridge: {
    title: '桥梁文化洞察',
    content: '8座古桥涵盖了中国桥梁的主要类型：敞肩拱桥（赵州桥）、联拱桥（卢沟桥）、石梁桥（安平桥）、启闭桥（广济桥）、跨海桥（洛阳桥）、廊桥（程阳桥）、铁索桥（泸定桥）、十字桥（鱼沼飞梁）。赵州桥（605年）比欧洲敞肩拱技术早700年。安平桥全长2255米是中国最长古桥。每座桥梁都代表了一项工程技术的突破，8座中有5座入选全国首批重点文保（第一批）。',
    keyPoints: ['8座涵盖7种结构类型', '赵州桥领先欧洲700年', '安平桥2255米中国最长', '5座为首批国保单位'],
    data: { types: 7, oldest: '赵州桥605年', longest: '安平桥2255m', firstBatch: 5 }
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
        <p style="margin-bottom: 0.08rem; line-height: 1.8;">${insight.content}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.05rem; margin-top: 0.08rem;">
          ${insight.keyPoints.map(point => `
            <span style="background: rgba(200, 169, 110, 0.15); color: #C8A96E; padding: 0.03rem 0.08rem; border-radius: 4px; font-size: 0.11rem; border: 1px solid rgba(200, 169, 110, 0.2);">
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
