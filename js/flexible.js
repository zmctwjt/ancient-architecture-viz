/**
 * flexible.js - 移动端/大屏适配方案
 * 基于 rem 单位，设计稿宽度 1920px
 * 1rem = 100px (当屏幕宽度为1920px时)
 */
(function flexible(window, document) {
  const docEl = document.documentElement;
  const dpr = window.devicePixelRatio || 1;

  // 设置 data-dpr 属性，用于 CSS 根据 dpr 调整
  docEl.setAttribute('data-dpr', dpr);

  function setRemUnit() {
    // 以1920px设计稿为基准
    const designWidth = 1920;
    const baseFontSize = 100; // 1rem = 100px
    const clientWidth = docEl.clientWidth;
    
    // 计算 rem 基准值
    let rem = (clientWidth / designWidth) * baseFontSize;
    
    // 限制最小和最大 rem 值
    rem = Math.max(rem, 50);   // 最小 50px
    rem = Math.min(rem, 150);  // 最大 150px
    
    docEl.style.fontSize = rem + 'px';
  }

  setRemUnit();

  // 窗口大小改变时重新计算
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // 检测是否为移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // 移动端使用更小的基准
    docEl.style.fontSize = '50px';
  }

  // 暴露全局方法
  window.flexible = {
    dpr: dpr,
    rem: function() {
      return parseFloat(docEl.style.fontSize);
    },
    refreshRem: setRemUnit
  };
})(window, document);
