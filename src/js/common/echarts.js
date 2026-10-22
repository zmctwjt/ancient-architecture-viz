/**
 * ECharts 按需引入
 * 只注册本项目实际用到的图表与组件，显著减小打包体积
 */
import * as echarts from 'echarts/core';

import {
  BarChart,
  PieChart,
  LineChart,
  RadarChart,
  ScatterChart,
  GraphChart,
  SunburstChart,
} from 'echarts/charts';

import {
  GridComponent,
  PolarComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  RadarComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  GraphicComponent,
  DatasetComponent,
  VisualMapComponent,
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  // 图表
  BarChart, PieChart, LineChart, RadarChart, ScatterChart, GraphChart, SunburstChart,
  // 坐标系与组件
  GridComponent, PolarComponent, RadarComponent,
  TooltipComponent, LegendComponent, TitleComponent,
  DataZoomComponent, ToolboxComponent,
  MarkLineComponent, MarkPointComponent,
  GraphicComponent, DatasetComponent, VisualMapComponent,
  // 布局与过渡
  LabelLayout, UniversalTransition,
  // 渲染器
  CanvasRenderer,
]);

export default echarts;
export { echarts };
