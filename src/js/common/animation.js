/**
 * 动画效果模块 - 基于 GSAP
 */
import { gsap } from 'gsap';

/**
 * 页面入场动画
 */
export function pageEnterAnimation() {
  const tl = gsap.timeline();
  
  tl.from('.page-title', {
    opacity: 0,
    y: -30,
    duration: 0.8,
    ease: 'power2.out'
  })
  .from('.chart-panel', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    onComplete: function() {
      // 动画完成后确保图表容器可见
      document.querySelectorAll('.chart-panel').forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      });
    }
  }, '-=0.4');
  
  return tl;
}

/**
 * 数字滚动动画
 */
export function countUpAnimation(element, targetValue, duration = 2) {
  const obj = { value: 0 };
  
  gsap.to(obj, {
    value: targetValue,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString();
    }
  });
}

/**
 * 卡片悬停效果
 */
export function cardHoverEffect(selector) {
  const cards = document.querySelectorAll(selector);
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(200, 169, 110, 0.2)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: 'none',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

/**
 * 飘落叶片动画（替代流星效果）
 */
export function fallingLeavesAnimation(container, options = {}) {
  const defaults = {
    count: 20,          // 叶片数量
    interval: 2000,     // 生成间隔(ms)
    colors: ['#C8A96E', '#4ECDC4', '#E07B54', '#8B7355'],
    minSize: 10,
    maxSize: 20
  };
  
  const config = { ...defaults, ...options };
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!containerEl) return;
  
  // 创建叶片
  function createLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    
    const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const startX = Math.random() * 100; // vw
    const duration = Math.random() * 5 + 5; // 5-10s
    const delay = Math.random() * 2;
    
    leaf.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: 0.6;
      border-radius: 0 ${size}px;
      left: ${startX}vw;
      top: -${size}px;
      pointer-events: none;
      z-index: 0;
    `;
    
    containerEl.appendChild(leaf);
    
    // 飘落动画
    gsap.to(leaf, {
      y: '100vh',
      x: `+=${Math.random() * 100 - 50}`,
      rotation: Math.random() * 360,
      duration: duration,
      delay: delay,
      ease: 'none',
      onComplete: () => {
        leaf.remove();
      }
    });
  }
  
  // 初始创建
  for (let i = 0; i < config.count; i++) {
    setTimeout(createLeaf, i * 200);
  }
  
  // 持续生成
  const intervalId = setInterval(createLeaf, config.interval);
  
  // 返回清理函数
  return () => {
    clearInterval(intervalId);
    containerEl.querySelectorAll('.falling-leaf').forEach(leaf => leaf.remove());
  };
}

/**
 * 淡入动画
 */
export function fadeIn(element, duration = 0.6) {
  return gsap.fromTo(element, 
    { opacity: 0 },
    { opacity: 1, duration, ease: 'power2.out' }
  );
}

/**
 * 滑入动画
 */
export function slideIn(element, direction = 'up', duration = 0.6) {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  };
  
  const from = { opacity: 0, ...directions[direction] };
  
  return gsap.fromTo(element,
    from,
    { opacity: 1, x: 0, y: 0, duration, ease: 'power2.out' }
  );
}

/**
 * 脉冲动画（用于强调）
 */
export function pulseAnimation(element, scale = 1.05) {
  return gsap.to(element, {
    scale: scale,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  });
}
