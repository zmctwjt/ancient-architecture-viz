/**
 * 页面过渡动画系统
 * 提供统一的页面进入/离开动画效果
 */

import { gsap } from 'gsap';

/**
 * 页面进入动画
 * @param {string} selector - 动画目标选择器
 * @param {Object} options - 动画选项
 */
export function pageEnter(selector = 'body', options = {}) {
  const defaults = {
    duration: 0.6,
    ease: 'power2.out'
  };
  const config = { ...defaults, ...options };

  return gsap.fromTo(selector,
    { opacity: 0 },
    { opacity: 1, duration: config.duration, ease: config.ease }
  );
}

/**
 * 页面离开动画
 * @param {string} selector - 动画目标选择器
 * @param {Object} options - 动画选项
 * @param {Function} callback - 动画完成回调
 */
export function pageLeave(selector = 'body', options = {}, callback = null) {
  const defaults = {
    duration: 0.4,
    ease: 'power2.in'
  };
  const config = { ...defaults, ...options };

  return gsap.to(selector, {
    opacity: 0,
    duration: config.duration,
    ease: config.ease,
    onComplete: callback
  });
}

/**
 * 初始化页面过渡覆盖层
 * 在页面切换时显示过渡动画
 */
export function initTransitionOverlay() {
  // 创建过渡覆盖层
  let overlay = document.getElementById('page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%);
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
    `;
    document.body.appendChild(overlay);
  }

  return overlay;
}

/**
 * 显示过渡动画
 * @param {Function} callback - 动画完成后的回调
 */
export function showTransition(callback = null) {
  const overlay = initTransitionOverlay();

  gsap.to(overlay, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: () => {
      if (callback) callback();
    }
  });
}

/**
 * 隐藏过渡动画
 * @param {Function} callback - 动画完成后的回调
 */
export function hideTransition(callback = null) {
  const overlay = document.getElementById('page-transition-overlay');
  if (!overlay) return;

  gsap.to(overlay, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: () => {
      if (callback) callback();
    }
  });
}

/**
 * 导航到指定页面（带过渡动画）
 * @param {string} url - 目标URL
 * @param {Object} options - 过渡选项
 */
export function navigateTo(url, options = {}) {
  const defaults = {
    transitionDuration: 0.4
  };
  const config = { ...defaults, ...options };

  // 页面离开动画
  pageLeave('body', { duration: config.transitionDuration }, () => {
    window.location.href = url;
  });
}

/**
 * 初始化导航链接过渡
 * 为所有导航链接添加过渡效果
 */
export function initNavTransitions() {
  // 为所有内部链接添加过渡
  document.querySelectorAll('a[href^="./"], a[href^="../"], a[href^="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // 排除锚点链接
      if (href.startsWith('#')) return;

      e.preventDefault();
      navigateTo(href);
    });
  });
}

/**
 * 初始化返回按钮
 * 为返回按钮添加过渡效果
 */
export function initBackButton() {
  const backBtn = document.querySelector('.back-link, .back-btn, [data-action="back"]');
  if (!backBtn) return;

  backBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // 页面离开动画后返回
    pageLeave('body', { duration: 0.3 }, () => {
      history.back();
    });
  });
}

/**
 * 页面加载完成后执行进入动画
 */
export function initPageLoadAnimation() {
  // 页面加载完成后执行进入动画
  window.addEventListener('load', () => {
    pageEnter('body', { duration: 0.5 });
  });
}

/**
 * 初始化所有页面过渡功能
 */
export function initAllTransitions() {
  initTransitionOverlay();
  initNavTransitions();
  initBackButton();
  initPageLoadAnimation();
}
