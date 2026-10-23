/**
 * 滚动渐显 —— 元素进入视口时淡入上移
 * 注意：只作用于纯 HTML 卡片，不作用于图表容器，避免影响 ECharts 尺寸计算
 */

const DEFAULT_SELECTOR = '.stat-card, .nav-item, .person-card';

export function initReveal(selector = DEFAULT_SELECTOR, options = {}) {
  // 尊重系统"减少动效"偏好
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = Array.from(document.querySelectorAll(selector)).filter(
    el => !el.classList.contains('reveal')
  );
  if (els.length === 0) return;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach(el => el.classList.add('reveal', 'is-visible'));
    return;
  }

  els.forEach((el, i) => {
    el.classList.add('reveal');
    // 同屏元素错峰入场，最多 320ms，避免拖沓
    el.style.transitionDelay = `${Math.min(i * 55, 320)}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
          // 动画结束后清理 will-change，降低合成层开销
          entry.target.addEventListener(
            'transitionend',
            () => { entry.target.style.willChange = 'auto'; },
            { once: true }
          );
        }
      });
    },
    {
      threshold: options.threshold || 0.08,
      rootMargin: options.rootMargin || '0px 0px -30px 0px',
    }
  );

  els.forEach(el => io.observe(el));
}
