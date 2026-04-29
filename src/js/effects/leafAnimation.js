/**
 * 飘落叶片动画效果
 * 替代流星效果，更契合古建筑主题
 */
import { gsap } from 'gsap';

// 叶片类型配置
const LEAF_TYPES = [
  { name: 'ginkgo', color: '#C8A96E', shape: 'fan' },      // 银杏 - 古铜金
  { name: 'maple', color: '#E07B54', shape: 'palm' },      // 枫叶 - 朱砂红
  { name: 'bamboo', color: '#4ECDC4', shape: 'long' },     // 竹叶 - 青瓦色
  { name: 'willow', color: '#8B7355', shape: 'willow' },   // 柳叶 - 褐色
];

/**
 * 创建叶片元素
 */
function createLeafElement(type) {
  const leaf = document.createElement('div');
  leaf.className = 'falling-leaf';
  
  const size = Math.random() * 15 + 10; // 10-25px
  const rotation = Math.random() * 360;
  
  // 根据叶片类型设置形状
  let borderRadius, transform;
  switch(type.shape) {
    case 'fan': // 银杏扇形
      borderRadius = '50% 50% 0 50%';
      break;
    case 'palm': // 枫叶掌形
      borderRadius = '50% 50% 50% 0';
      break;
    case 'long': // 竹叶长形
      borderRadius = '50% 50% 50% 50% / 80% 80% 20% 20%';
      break;
    case 'willow': // 柳叶细长
      borderRadius = '50% 50% 50% 50% / 90% 90% 10% 10%';
      break;
    default:
      borderRadius = '50%';
  }
  
  leaf.style.cssText = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    background: ${type.color};
    opacity: ${Math.random() * 0.4 + 0.3};
    border-radius: ${borderRadius};
    pointer-events: none;
    z-index: 1;
    left: ${Math.random() * 100}vw;
    top: -${size}px;
    transform: rotate(${rotation}deg);
    box-shadow: 0 0 5px ${type.color}40;
  `;
  
  return leaf;
}

/**
 * 飘落叶片动画
 * @param {Object} options - 配置选项
 */
export function initFallingLeaves(options = {}) {
  const config = {
    count: 15,           // 同时存在的叶片数量
    interval: 800,       // 生成间隔(ms)
    duration: 8,         // 飘落持续时间(s)
    container: document.body,
    ...options
  };
  
  const leaves = [];
  let intervalId = null;
  let isRunning = false;
  
  /**
   * 创建单个叶片动画
   */
  function spawnLeaf() {
    if (!isRunning) return;
    
    const type = LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)];
    const leaf = createLeafElement(type);
    config.container.appendChild(leaf);
    
    // 随机飘落参数
    const duration = config.duration + Math.random() * 4; // 8-12s
    const drift = (Math.random() - 0.5) * 200; // 左右漂移
    const rotation = Math.random() * 720 - 360; // 旋转
    
    // GSAP动画
    gsap.to(leaf, {
      y: '110vh',
      x: `+=${drift}`,
      rotation: `+=${rotation}`,
      duration: duration,
      ease: 'none',
      onComplete: () => {
        leaf.remove();
        const index = leaves.indexOf(leaf);
        if (index > -1) leaves.splice(index, 1);
      }
    });
    
    leaves.push(leaf);
  }
  
  /**
   * 开始动画
   */
  function start() {
    if (isRunning) return;
    isRunning = true;
    
    // 初始生成
    for (let i = 0; i < config.count; i++) {
      setTimeout(spawnLeaf, i * (config.interval / 2));
    }
    
    // 持续生成
    intervalId = setInterval(spawnLeaf, config.interval);
  }
  
  /**
   * 停止动画
   */
  function stop() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    // 清理现有叶片
    leaves.forEach(leaf => {
      gsap.killTweensOf(leaf);
      leaf.remove();
    });
    leaves.length = 0;
  }
  
  /**
   * 暂停/恢复
   */
  function toggle() {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }
  
  // 自动启动
  start();
  
  // 返回控制接口
  return { start, stop, toggle };
}

/**
 * 简化的叶片效果（用于性能敏感场景）
 */
export function initSimpleLeaves(container = document.body) {
  const leafCount = 8;
  
  for (let i = 0; i < leafCount; i++) {
    const type = LEAF_TYPES[i % LEAF_TYPES.length];
    const leaf = createLeafElement(type);
    leaf.style.left = `${(i / leafCount) * 100 + Math.random() * 10}vw`;
    container.appendChild(leaf);
    
    // 循环飘落动画
    const animateLeaf = () => {
      gsap.fromTo(leaf, 
        { 
          y: -30, 
          x: 0, 
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.3 + 0.2
        },
        { 
          y: '110vh', 
          x: (Math.random() - 0.5) * 150,
          rotation: `+=${Math.random() * 360}`,
          duration: 10 + Math.random() * 5,
          ease: 'none',
          onComplete: animateLeaf
        }
      );
    };
    
    // 延迟启动
    setTimeout(animateLeaf, i * 1000);
  }
}
