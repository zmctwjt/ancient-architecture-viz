/**
 * 交互效果模块
 * 卡片悬停、按钮效果、图表交互等
 */
import { gsap } from 'gsap';

/**
 * 卡片悬停效果
 * @param {string} selector - 卡片选择器
 */
export function initCardHover(selector = '.chart-panel, .nav-card') {
  const cards = document.querySelectorAll(selector);
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(200, 169, 110, 0.2)',
        borderColor: 'rgba(200, 169, 110, 0.5)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(200, 169, 110, 0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

/**
 * 按钮脉冲效果
 * @param {string} selector - 按钮选择器
 */
export function initButtonPulse(selector = '.nav-btn, .enter-btn') {
  const buttons = document.querySelectorAll(selector);
  
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    // 点击涟漪效果
    btn.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(200, 169, 110, 0.4);
        transform: scale(0);
        pointer-events: none;
      `;
      
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      
      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    });
  });
}

/**
 * 数字滚动动画
 * @param {HTMLElement} element - 目标元素
 * @param {number} targetValue - 目标数值
 * @param {number} duration - 动画时长(秒)
 * @param {string} suffix - 后缀
 */
export function animateNumber(element, targetValue, duration = 2, suffix = '') {
  const obj = { value: 0 };
  
  gsap.to(obj, {
    value: targetValue,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString() + suffix;
    }
  });
}

/**
 * 初始化统计数字动画
 */
export function initStatNumbers() {
  const statElements = document.querySelectorAll('[data-stat-number]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.statNumber);
        const suffix = el.dataset.statSuffix || '';
        animateNumber(el, target, 2, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  statElements.forEach(el => observer.observe(el));
}

/**
 * 图表高亮交互
 * @param {Object} chart - ECharts实例
 * @param {string} highlightColor - 高亮颜色
 */
export function initChartHover(chart, highlightColor = '#C8A96E') {
  if (!chart) return;
  
  chart.on('mouseover', (params) => {
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: params.seriesIndex,
      dataIndex: params.dataIndex
    });
  });
  
  chart.on('mouseout', (params) => {
    chart.dispatchAction({
      type: 'downplay',
      seriesIndex: params.seriesIndex,
      dataIndex: params.dataIndex
    });
  });
}

/**
 * 滚动触发动画
 * @param {string} selector - 元素选择器
 * @param {string} animation - 动画类型
 */
export function initScrollAnimations(selector = '.animate-on-scroll', animation = 'fadeUp') {
  const animations = {
    fadeUp: { opacity: 0, y: 30 },
    fadeLeft: { opacity: 0, x: -30 },
    fadeRight: { opacity: 0, x: 30 },
    scale: { opacity: 0, scale: 0.8 },
    rotate: { opacity: 0, rotation: -10 }
  };
  
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const animType = el.dataset.animation || animation;
        const fromState = animations[animType] || animations.fadeUp;
        
        gsap.fromTo(el, 
          fromState,
          { 
            opacity: 1, 
            x: 0, 
            y: 0, 
            scale: 1, 
            rotation: 0,
            duration: 0.8,
            ease: 'power2.out'
          }
        );
        
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });
  
  elements.forEach(el => observer.observe(el));
}

/**
 * 导航栏滚动效果
 */
export function initNavScroll() {
  const nav = document.querySelector('.nav-bar');
  if (!nav) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.classList.add('nav-scrolled');
      gsap.to(nav, {
        backgroundColor: 'rgba(13, 17, 23, 0.95)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        duration: 0.3
      });
    } else {
      nav.classList.remove('nav-scrolled');
      gsap.to(nav, {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        duration: 0.3
      });
    }
    
    lastScroll = currentScroll;
  });
}

/**
 * 标签页切换动画
 * @param {string} tabSelector - 标签按钮选择器
 * @param {string} contentSelector - 内容选择器
 */
export function initTabAnimations(tabSelector = '.tab-btn', contentSelector = '.tab-content') {
  const tabs = document.querySelectorAll(tabSelector);
  const contents = document.querySelectorAll(contentSelector);
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      const targetContent = document.getElementById(targetId);
      
      if (!targetContent) return;
      
      // 内容切换动画
      contents.forEach(content => {
        if (content.id === targetId) {
          gsap.fromTo(content,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
          );
        }
      });
    });
  });
}

/**
 * 初始化所有交互效果
 */
export function initAllInteractions() {
  initCardHover();
  initButtonPulse();
  initStatNumbers();
  initScrollAnimations();
  initNavScroll();
  initTabAnimations();
}
