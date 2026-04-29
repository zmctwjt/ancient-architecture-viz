/**
 * 响应式适配工具
 * 处理不同屏幕尺寸下的布局和图表适配
 */

/**
 * 设备类型检测
 */
export function detectDevice() {
  const width = window.innerWidth;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isTouch: isTouch,
    width: width
  };
}

/**
 * 获取响应式配置
 */
export function getResponsiveConfig() {
  const device = detectDevice();
  
  if (device.isMobile) {
    return {
      // 移动端配置
      chart: {
        fontSize: 10,
        labelFontSize: 8,
        titleFontSize: 12,
        grid: { top: 40, right: 10, bottom: 30, left: 40 }
      },
      layout: {
        columns: 1,
        gap: '0.2rem',
        padding: '0.2rem'
      },
      animation: {
        enabled: false,  // 移动端禁用复杂动画
        leafCount: 5     // 减少叶片数量
      }
    };
  } else if (device.isTablet) {
    return {
      // 平板配置
      chart: {
        fontSize: 11,
        labelFontSize: 9,
        titleFontSize: 14,
        grid: { top: 50, right: 20, bottom: 40, left: 50 }
      },
      layout: {
        columns: 2,
        gap: '0.3rem',
        padding: '0.3rem'
      },
      animation: {
        enabled: true,
        leafCount: 8
      }
    };
  } else {
    return {
      // 桌面端配置
      chart: {
        fontSize: 12,
        labelFontSize: 10,
        titleFontSize: 16,
        grid: { top: 60, right: 30, bottom: 50, left: 60 }
      },
      layout: {
        columns: 3,
        gap: '0.4rem',
        padding: '0.4rem'
      },
      animation: {
        enabled: true,
        leafCount: 12
      }
    };
  }
}

/**
 * 应用响应式布局
 */
export function applyResponsiveLayout() {
  const config = getResponsiveConfig();
  const container = document.querySelector('.page-container');
  
  if (container) {
    container.style.setProperty('--grid-columns', config.layout.columns);
    container.style.setProperty('--grid-gap', config.layout.gap);
    container.style.setProperty('--container-padding', config.layout.padding);
  }
  
  // 更新图表容器类名
  const chartPanels = document.querySelectorAll('.chart-panel');
  chartPanels.forEach(panel => {
    panel.classList.remove('col-1', 'col-2', 'col-3');
    panel.classList.add(`col-${config.layout.columns}`);
  });
  
  return config;
}

/**
 * 更新ECharts配置以适应屏幕
 */
export function adaptEChartsOption(baseOption, deviceType = null) {
  const device = deviceType || detectDevice();
  const config = getResponsiveConfig();
  
  const adapted = JSON.parse(JSON.stringify(baseOption));
  
  // 调整字体大小
  if (adapted.title) {
    adapted.title.textStyle = adapted.title.textStyle || {};
    adapted.title.textStyle.fontSize = config.chart.titleFontSize;
  }
  
  // 调整图例
  if (adapted.legend) {
    adapted.legend.textStyle = adapted.legend.textStyle || {};
    adapted.legend.textStyle.fontSize = config.chart.fontSize;
    
    // 移动端图例放底部
    if (device.isMobile) {
      adapted.legend.bottom = 0;
      adapted.legend.top = 'auto';
    }
  }
  
  // 调整坐标轴
  if (adapted.xAxis) {
    const axes = Array.isArray(adapted.xAxis) ? adapted.xAxis : [adapted.xAxis];
    axes.forEach(axis => {
      axis.axisLabel = axis.axisLabel || {};
      axis.axisLabel.fontSize = config.chart.labelFontSize;
      
      // 移动端旋转标签避免重叠
      if (device.isMobile) {
        axis.axisLabel.rotate = 45;
      }
    });
  }
  
  if (adapted.yAxis) {
    const axes = Array.isArray(adapted.yAxis) ? adapted.yAxis : [adapted.yAxis];
    axes.forEach(axis => {
      axis.axisLabel = axis.axisLabel || {};
      axis.axisLabel.fontSize = config.chart.labelFontSize;
    });
  }
  
  // 调整网格
  if (adapted.grid) {
    Object.assign(adapted.grid, config.chart.grid);
  }
  
  // 移动端简化提示框
  if (device.isMobile && adapted.tooltip) {
    adapted.tooltip.confine = true;
    adapted.tooltip.position = function (point) {
      return [point[0], point[1]];
    };
  }
  
  return adapted;
}

/**
 * 初始化响应式监听
 */
export function initResponsive(callback) {
  let resizeTimer = null;
  
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const config = applyResponsiveLayout();
      if (typeof callback === 'function') {
        callback(config);
      }
    }, 250);
  };
  
  window.addEventListener('resize', handleResize);
  
  // 初始应用
  applyResponsiveLayout();
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * 移动端手势支持
 */
export function initTouchGestures(element, callbacks = {}) {
  const { onSwipeLeft, onSwipeRight, onTap } = callbacks;
  
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  
  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    
    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // 点击
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300 && onTap) {
      onTap(e);
    }
  }, { passive: true });
}

/**
 * 图片懒加载
 */
export function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // 降级处理
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

/**
 * 性能优化：根据设备调整动画
 */
export function optimizeForDevice() {
  const device = detectDevice();
  
  // 低性能设备禁用复杂效果
  if (device.isMobile || !device.isDesktop) {
    document.body.classList.add('reduce-motion');
    
    // 禁用叶片动画
    const leavesContainer = document.querySelector('.leaves-container');
    if (leavesContainer) {
      leavesContainer.style.display = 'none';
    }
  }
  
  return device;
}

// 默认导出
export default {
  detectDevice,
  getResponsiveConfig,
  applyResponsiveLayout,
  adaptEChartsOption,
  initResponsive,
  initTouchGestures,
  initLazyLoading,
  optimizeForDevice
};
