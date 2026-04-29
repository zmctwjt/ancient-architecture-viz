/**
 * 数据加载器 - 统一加载JSON数据
 */

const DataLoader = {
  // 缓存
  cache: {},

  /**
   * 加载JSON数据
   * @param {string} url - 数据文件路径
   * @returns {Promise<Object>}
   */
  async load(url) {
    // 检查缓存
    if (this.cache[url]) {
      return this.cache[url];
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache[url] = data;
      return data;
    } catch (error) {
      console.error('数据加载失败:', url, error);
      // 返回空数据结构
      return { data: [], meta: {} };
    }
  },

  /**
   * 加载建筑成就数据
   */
  async loadAchievements() {
    return this.load('../../../data/raw/ncha_ancient_buildings.json');
  },

  /**
   * 加载科学家数据
   */
  async loadScientists() {
    return this.load('../../../data/raw/architects.json');
  },

  /**
   * 加载著作数据
   */
  async loadBooks() {
    return this.load('../../../data/raw/books.json');
  },

  /**
   * 加载文化数据
   */
  async loadCulture() {
    return this.load('../../../data/raw/culture.json');
  },

  /**
   * 按朝代筛选数据
   * @param {Array} data - 原始数据
   * @param {string} dynasty - 朝代名称
   */
  filterByDynasty(data, dynasty) {
    if (!dynasty || dynasty === 'all') return data;
    return data.filter(item => {
      const period = item.period || item.dynasty || '';
      return period.includes(dynasty);
    });
  },

  /**
   * 按类型筛选数据
   * @param {Array} data - 原始数据
   * @param {string} type - 类型
   */
  filterByType(data, type) {
    if (!type) return data;
    return data.filter(item => {
      const itemType = item.type || item.category || '';
      return itemType === type;
    });
  },

  /**
   * 统计数据
   * @param {Array} data - 数据数组
   * @param {string} key - 统计字段
   */
  countBy(data, key) {
    const counts = {};
    data.forEach(item => {
      const value = item[key];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache = {};
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
