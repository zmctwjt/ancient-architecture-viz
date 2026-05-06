# MEMORY.md - 跨会话长期记忆

## 用户基本信息
- **姓名**：ZMC（大学生）
- **目标**：2026年中国大学生计算机设计大赛（数据可视化赛道）
- **沟通风格**：务实、追求工程落地可行性、重视数据真实性和可溯源性

## 竞赛项目核心信息

### 主题：中国古代建筑数据可视化
- **研究范围**：中国古代建筑（1911年以前）
- **建筑类别**：民居、官府、皇宫、桥梁（四类）
- **研究子方向**：建筑成就、建筑师、相关著作、文化内涵

### 参考项目（已深度分析，2026-04-20）
**项目地址**：https://gitee.com/jieyujun/4-c-web
**项目名称**：4-c-web（千年观天——中国古代天文数据可视化）
**已晋级**：25届全国大学生计算机设计大赛

**技术栈**：
- 构建工具：Vite 6.2.1（MPA多页面）
- 3D：Three.js 0.172.0（粒子系统/星轨）
- 图表：ECharts 5.6.0 + echarts-liquidfill（水波）
- 动画：GSAP 3.12.7 + Tween.js 25.0.0
- 适配：flexible.js（rem）
- 其他：jQuery、ogl、dat.gui、less

**目录结构**：`src/{css,data,js,view}` + `public/image`
- `src/view/dataScreen/` 含5个朝代大屏（先秦/秦汉/晋南北朝/宋唐/元明清）
- `src/view/museum/` 博物馆展厅页
- `src/view/transitionPage/` 朝代过渡动画页
- `src/view/spaceHistoryLine/` 时间轴页

**各朝代大屏图表**：
- 先秦：双系列柱状图、极坐标柱状图、折线图、堆叠面积图、南丁格尔玫瑰图、旭日图(弹窗)
- 秦汉：K线图、Canvas水波球、地图
- 宋唐：标准ECharts组合（200项成就，诗词记载78项最多）
- 元明清：力导向网络关系图、分组柱状图、环形饼图（328项成就）

**关键实现**：
- 旭日图数据：四象→黄道星座→24节气→72候
- 背景：流星动效（每2s随机1-6个meteor div，CSS动画）
- 进度条：以40为最大值动态计算宽度%
- 深色科技风，青蓝色系，白色透明度坐标轴

**可复用到建筑项目的内容**：
- 大屏分区布局方式
- ECharts图表配置模式（尤其关系图、玫瑰图、旭日图）
- flexible.js适配
- 弹窗交互逻辑
- 流星/粒子背景动效

### 当前项目状态（2026-04-29）
**技术栈**：Vite 4.5 + ECharts 5.4 + GSAP 3.12 + flexible.js（rem适配）
**构建配置**：MPA多页面，echarts/gsap单独chunk打包
**flexible.js**：存放于`public/js/`目录，通过`<script src="/js/flexible.js">`引入（非module脚本必须放public目录才能被Vite构建）
**新增模块**：
- `infoModal.js` - 通用信息弹窗（支持ESC/点击背景关闭/动画）
- `insights.js` - 数据分析结论模块（4个页面的洞察数据）
**数据体系**：所有图表数据源统一为 `public/data/*.json`（buildings.json **115条**、architects_processed.json 20人、books_processed.json 14部、culture_processed.json 4类文化）
**交互功能**：
- 所有图表支持点击显示详细信息弹窗
- 首页时间轴/雷达图点击显示朝代/建筑类型详情
- 成就页面积图点击可跳转至文化页面对应标签
- 各子页面底部添加数据洞察面板（含分析结论+关键词标签）
- 首页引导页支持选择不同时代进入并过滤数据
**页面结构**：首页 + 4个子页（achievement/scientist/literature/culture）+ 过渡页

**2026-04-29重大修复**：
- 统一全项目图表数据来源，全部从JSON加载，消除硬编码图表数据
- 首页统计数字、时间轴、雷达图动态计算
- 成就页修复地理分布图空白bug（变量名错误）、玫瑰图合并六大朝代、布局改为可滚动
- 著作页旭日图改为按朝代分类（原数据type全为"其他"）、时间轴改为横向条形图
- 文化页修复图表初始化后消失问题（延迟初始化+移除overflow:hidden）
- 科学家页时间轴改为横向条形图（替代150px超大泡泡）、重点人物改为信息卡片

**2026-05-05重大更新**：
- buildings.json 从88条扩充到**115条**，新增桥梁8条、皇宫3条、官府4条、民居6条、城址4条、寺庙2条
- 首页雷达图修复：维度从虚假公式改为真实数据计算（省份分布、朝代跨度等）
- categoryMap扩展：支持桥梁/民居/大院/庄园/衙门/大明宫/未央等新类别
- CSS视觉增强：多层背景光晕、装饰线、hover动画效果
- 文化页图表全部改为动态数据+有分析意义的内容
- 文化页筛选修复：民居筛选不生效、坐标轴截断、无意义图表替换

## PCB缺陷检测项目
- 软件：VisionMaster 4.3
- 可用模块：快速匹配、灰度匹配、高精度匹配（无"模板匹配"模块）
- 样本：25块（3块OK：PCB6/PCB9/PCB12 + 22块NG）
- 开发环境：PyCharm 2021.1.3 + LeetCode Edit插件

## 用户偏好
- 数据来源：偏好政府网站（如国家文物局），要求真实可溯源
- 代码风格：直接可执行，先验证模块是否存在再推进
- 工程整洁：主动清理冗余文件，定期整理目录
- **Skill优先策略**：遇到问题时，按以下顺序查找解决方案：
  1. 先查本地 `~/.workbuddy/skills/` 和 `~/.workbuddy/skills-marketplace/skills/` 有无对应 skill
  2. 有则直接安装使用（`cp -r` 到 `~/.workbuddy/skills/`）
  3. 没有则通过 SkillHub（`lightmake.site`）或 Vercel Skills / ClawHub 搜索
  4. 找到后下载安装，找不到才告知用户
- **浏览器限制**：未经用户允许，只能使用 Edge 浏览器（`--executable-path "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`），禁止使用 Chrome 或其他浏览器
- **⚠️ 浏览器安全规则（2026-04-29教训）**：
  - **绝对禁止** `taskkill` 杀用户的 Edge/msedge 进程，会丢失 cookie 和会话数据
  - **禁止**强制关闭用户正在使用的浏览器
  - 如需连接已打开的浏览器，使用 `--auto-connect` 或 `--cdp` 端口方式，不要重启浏览器
  - 启动新浏览器实例时使用 `Start-Process` + `--remote-debugging-port`，不要先杀旧进程
