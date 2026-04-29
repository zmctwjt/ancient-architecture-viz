/**
 * 应用主入口
 * 初始化所有动效和交互
 */
import { gsap } from 'gsap';
import * as effects from './effects/index.js';

/**
 * 初始化应用
 */
function initApp() {
  // 页面进入动画
  initPageEnter();
  
  // 飘落叶片效果
  initLeafEffect();
  
  // 交互效果
  effects.initAllInteractions();
  
  // 导航过渡
  effects.initNavTransitions();
  effects.initBackButton();
  
  console.log('🎋 千年营造·华夏砖木 - 应用初始化完成');
}

/**
 * 页面进入动画
 */
function initPageEnter() {
  const tl = gsap.timeline();
  
  // 标题
  tl.from('.page-title', {
    opacity: 0,
    y: -30,
    duration: 0.8,
    ease: 'power2.out'
  });
  
  // 副标题
  tl.from('.page-subtitle', {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4');
  
  // 图表面板
  tl.from('.chart-panel', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  }, '-=0.3');
  
  // 导航卡片
  tl.from('.nav-card', {
    opacity: 0,
    scale: 0.9,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.4');
}

/**
 * 叶片飘落效果
 */
function initLeafEffect() {
  // 检测是否为性能敏感设备
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  if (isMobile || isLowPower) {
    // 移动端/低性能设备使用简化版
    effects.initSimpleLeaves();
  } else {
    // 桌面端使用完整版
    effects.initFallingLeaves({
      count: 12,
      interval: 1000,
      duration: 10
    });
  }
}

// module脚本DOM已就绪，直接初始化
initApp();

// 导出供其他模块使用
export { effects };
