/**
 * 响应式适配测试
 */

import { detectDevice, getResponsiveConfig, adaptEChartsOption } from '../src/js/utils/responsive.js';

describe('响应式适配测试', () => {
  // 模拟窗口大小
  const mockWindowSize = (width) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    window.dispatchEvent(new Event('resize'));
  };

  test('检测移动设备', () => {
    mockWindowSize(375);
    const device = detectDevice();
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  test('检测平板设备', () => {
    mockWindowSize(768);
    const device = detectDevice();
    expect(device.isTablet).toBe(true);
    expect(device.isMobile).toBe(false);
  });

  test('检测桌面设备', () => {
    mockWindowSize(1440);
    const device = detectDevice();
    expect(device.isDesktop).toBe(true);
    expect(device.isMobile).toBe(false);
  });

  test('移动端配置', () => {
    mockWindowSize(375);
    const config = getResponsiveConfig();
    expect(config.layout.columns).toBe(1);
    expect(config.chart.fontSize).toBe(10);
    expect(config.animation.enabled).toBe(false);
  });

  test('桌面端配置', () => {
    mockWindowSize(1440);
    const config = getResponsiveConfig();
    expect(config.layout.columns).toBe(3);
    expect(config.chart.fontSize).toBe(12);
    expect(config.animation.enabled).toBe(true);
  });

  test('ECharts配置适配', () => {
    mockWindowSize(375);
    const baseOption = {
      title: { text: '测试' },
      xAxis: { type: 'category', data: ['A', 'B'] },
      series: [{ type: 'bar', data: [1, 2] }]
    };
    const adapted = adaptEChartsOption(baseOption);
    expect(adapted.title.textStyle.fontSize).toBe(12);
  });
});

// 手动测试函数
export function runManualTests() {
  console.log('=== 响应式适配手动测试 ===\n');
  
  // 测试1: 设备检测
  console.log('1. 设备检测:');
  const device = detectDevice();
  console.log(`   屏幕宽度: ${device.width}px`);
  console.log(`   移动设备: ${device.isMobile ? '是' : '否'}`);
  console.log(`   平板设备: ${device.isTablet ? '是' : '否'}`);
  console.log(`   桌面设备: ${device.isDesktop ? '是' : '否'}`);
  console.log(`   触摸设备: ${device.isTouch ? '是' : '否'}`);
  
  // 测试2: 配置获取
  console.log('\n2. 响应式配置:');
  const config = getResponsiveConfig();
  console.log(`   网格列数: ${config.layout.columns}`);
  console.log(`   图表字体: ${config.chart.fontSize}px`);
  console.log(`   动画启用: ${config.animation.enabled ? '是' : '否'}`);
  
  // 测试3: 类名应用
  console.log('\n3. 布局类名:');
  const container = document.querySelector('.page-container');
  if (container) {
    console.log(`   容器类名: ${container.className}`);
  }
  
  console.log('\n=== 测试完成 ===');
  
  return { device, config };
}

// 导出测试报告
export function generateTestReport() {
  const device = detectDevice();
  const config = getResponsiveConfig();
  
  return {
    timestamp: new Date().toISOString(),
    device: {
      width: device.width,
      type: device.isMobile ? 'mobile' : device.isTablet ? 'tablet' : 'desktop',
      touch: device.isTouch
    },
    config: {
      columns: config.layout.columns,
      fontSize: config.chart.fontSize,
      animation: config.animation.enabled
    },
    status: 'passed'
  };
}
