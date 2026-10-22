import PptxGenJS from "pptxgenjs";
import fs from "fs";
import path from "path";

// ============================================================
// 演示PPT生成脚本 - 千年营造·华夏砖木
// ============================================================

const pptx = new PptxGenJS();

// 设置元数据
pptx.author = "ZMC";
pptx.company = "长沙民政职业技术学院";
pptx.subject = "千年营造·华夏砖木 作品演示";
pptx.title = "千年营造·华夏砖木——中国古代建筑数据可视化平台";

// 古风配色
const colors = {
  darkBg: "0F172A",      // 深夜墨
  cardBg: "1E293B",      // 卡片底色
  gold: "D4A853",        // 古铜金
  teal: "5EEAD4",        // 青瓦色
  red: "DC2626",         // 朱砂红
  text: "F1F5F9",        // 主文字
  textSecondary: "94A3B8", // 次要文字
  accent: "38BDF8",      // 强调色
};

// 设置默认字体
pptx.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: colors.darkBg },
  objects: [
    { rect: { x: 0, y: 0, w: "100%", h: "100%", fill: { color: colors.darkBg } } },
    { line: { x: 0.5, y: 6.8, w: "90%", h: 0, line: { color: colors.gold, width: 0.5 } } },
    { text: { text: "千年营造·华夏砖木", options: { x: 0.5, y: 7.0, w: 3, h: 0.3, fontSize: 10, color: colors.textSecondary, fontFace: "Microsoft YaHei" } } },
  ],
});

// ============================================================
// 辅助函数
// ============================================================
function loadJson(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`文件不存在: ${fullPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
}

function addTitleSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.darkBg };
  slide.addText(title, {
    x: 0.5, y: 2.5, w: "90%", h: 1.2,
    fontSize: 44, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
    align: "center",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 3.8, w: "90%", h: 0.6,
      fontSize: 20, color: colors.textSecondary,
      fontFace: "Microsoft YaHei",
      align: "center",
    });
  }
  return slide;
}

function addContentSlide(pptx, title) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.darkBg };
  // 标题栏
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 1.0,
    fill: { color: colors.cardBg },
  });
  slide.addText(title, {
    x: 0.5, y: 0.25, w: "90%", h: 0.5,
    fontSize: 28, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
  });
  // 装饰线
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.85, w: 1.5, h: 0.05,
    fill: { color: colors.teal },
  });
  return slide;
}

// ============================================================
// 加载数据
// ============================================================
const buildings = loadJson("public/data/buildings.json") || [];
const architects = loadJson("public/data/architects_processed.json") || {};
const books = loadJson("public/data/books_processed.json") || {};
const culture = loadJson("public/data/culture_processed.json") || {};

// 数据统计
const totalBuildings = buildings.length;
const totalArchitects = architects.meta?.total || 20;
const totalBooks = books.meta?.total || 14;
const cultureItems = (culture.residence?.total || 0) + (culture.official?.total || 0) + (culture.palace?.total || 0) + (culture.bridge?.total || 0);

// 朝代统计
const dynastyCount = {};
buildings.forEach(b => {
  const d = b.dynasty?.replace(/[（(].*[）)]/g, "").trim() || "未知";
  dynastyCount[d] = (dynastyCount[d] || 0) + 1;
});
const dynastyData = Object.entries(dynastyCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);

// 类别统计
const categoryCount = {};
buildings.forEach(b => {
  const c = b.category || "其他";
  categoryCount[c] = (categoryCount[c] || 0) + 1;
});

// ============================================================
// 第1页：封面
// ============================================================
const cover = pptx.addSlide();
cover.background = { color: colors.darkBg };
// 装饰背景
for (let i = 0; i < 5; i++) {
  cover.addShape(pptx.ShapeType.ellipse, {
    x: 8 + i * 0.5, y: 0.5 + i * 0.3, w: 0.3, h: 0.3,
    fill: { color: colors.gold, transparency: 70 },
  });
}
cover.addText("千年营造", {
  x: 0.5, y: 2.0, w: "90%", h: 1.0,
  fontSize: 56, bold: true, color: colors.gold,
  fontFace: "Microsoft YaHei",
  align: "center",
});
cover.addText("华夏砖木", {
  x: 0.5, y: 2.9, w: "90%", h: 1.0,
  fontSize: 56, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
  align: "center",
});
cover.addText("——中国古代建筑数据可视化平台", {
  x: 0.5, y: 4.0, w: "90%", h: 0.6,
  fontSize: 24, color: colors.textSecondary,
  fontFace: "Microsoft YaHei",
  align: "center",
});
cover.addText("中国古代建筑数据可视化平台\n四大维度 · 二十余种图表 · 全流程数据驱动", {
  x: 0.5, y: 5.0, w: "90%", h: 0.8,
  fontSize: 16, color: colors.textSecondary,
  fontFace: "Microsoft YaHei",
  align: "center",
});
cover.addText("制作者：赵沙滨  |  指导老师：（根据实际情况填写）", {
  x: 0.5, y: 6.2, w: "90%", h: 0.4,
  fontSize: 14, color: colors.textSecondary,
  fontFace: "Microsoft YaHei",
  align: "center",
});

// ============================================================
// 第2页：目录
// ============================================================
const toc = addContentSlide(pptx, "目 录");
const tocItems = [
  { num: "01", title: "项目背景与意义", desc: "弘扬中华优秀传统文化" },
  { num: "02", title: "核心内容总览", desc: "四大维度数据体系" },
  { num: "03", title: "技术架构", desc: "Vite + ECharts + GSAP" },
  { num: "04", title: "页面展示", desc: "五大功能页面详解" },
  { num: "05", title: "创新亮点", desc: "视觉·技术·内容三重创新" },
  { num: "06", title: "项目成果", desc: "部署上线与代码统计" },
];
tocItems.forEach((item, idx) => {
  const y = 1.5 + idx * 0.9;
  toc.addText(item.num, {
    x: 1.0, y, w: 0.6, h: 0.5,
    fontSize: 24, bold: true, color: colors.teal,
    fontFace: "Microsoft YaHei",
  });
  toc.addText(item.title, {
    x: 1.8, y, w: 3, h: 0.35,
    fontSize: 18, bold: true, color: colors.text,
    fontFace: "Microsoft YaHei",
  });
  toc.addText(item.desc, {
    x: 1.8, y: y + 0.35, w: 3, h: 0.25,
    fontSize: 12, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
});

// ============================================================
// 第3页：项目背景
// ============================================================
const bgSlide = addContentSlide(pptx, "01 项目背景与意义");
bgSlide.addText("为什么选择中国古代建筑？", {
  x: 0.5, y: 1.5, w: "90%", h: 0.5,
  fontSize: 20, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
bgSlide.addText([
  { text: "• 建筑是凝固的历史：", options: { bold: true, color: colors.gold } },
  { text: "中国古代建筑承载着2500年的文明记忆，是世界建筑史上独特的木构体系" },
  { text: "\n\n• 数据可视化的价值：", options: { bold: true, color: colors.gold } },
  { text: "将分散的古建筑数据整合为直观的可视化表达，降低认知门槛" },
  { text: "\n\n• 弘扬传统文化：", options: { bold: true, color: colors.gold } },
  { text: "响应国家《弘扬中华优秀传统文化》号召，以现代技术讲好中国故事" },
  { text: "\n\n• 创作契机：", options: { bold: true, color: colors.gold } },
  { text: "面向公众传播中华优秀建筑文化" },
], {
  x: 0.5, y: 2.1, w: "90%", h: 4.5,
  fontSize: 14, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 24,
  bullet: false,
});

// ============================================================
// 第4页：核心内容总览
// ============================================================
const overview = addContentSlide(pptx, "02 核心内容总览");
const stats = [
  { label: "古建筑遗存", value: totalBuildings.toString(), unit: "处", icon: "🏛" },
  { label: "杰出科学家", value: totalArchitects.toString(), unit: "位", icon: "👨‍🔬" },
  { label: "传世著作", value: totalBooks.toString(), unit: "部", icon: "📜" },
  { label: "建筑文化形态", value: "38", unit: "类", icon: "🎨" },
];
stats.forEach((s, idx) => {
  const x = 0.5 + (idx % 2) * 4.8;
  const y = 1.5 + Math.floor(idx / 2) * 2.5;
  // 卡片背景
  overview.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 4.3, h: 2.0,
    fill: { color: colors.cardBg },
    rectRadius: 0.1,
  });
  overview.addText(s.value, {
    x: x + 0.2, y: y + 0.2, w: 2, h: 0.8,
    fontSize: 36, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
  });
  overview.addText(s.unit, {
    x: x + 1.8, y: y + 0.4, w: 0.5, h: 0.4,
    fontSize: 14, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
  overview.addText(s.label, {
    x: x + 0.2, y: y + 1.0, w: 3, h: 0.4,
    fontSize: 14, color: colors.text,
    fontFace: "Microsoft YaHei",
  });
  overview.addText(s.icon, {
    x: x + 3.2, y: y + 0.3, w: 0.8, h: 0.8,
    fontSize: 28,
    fontFace: "Segoe UI Emoji",
  });
});

// ============================================================
// 第5页：数据来源
// ============================================================
const dataSource = addContentSlide(pptx, "02 数据体系与来源");
dataSource.addText("四大维度数据，全部来自权威公开来源", {
  x: 0.5, y: 1.5, w: "90%", h: 0.4,
  fontSize: 16, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const sources = [
  { name: "建筑成就", count: `${totalBuildings}处`, source: "国家文物局全国重点文物保护单位名录", method: "Python爬虫 + 人工校验" },
  { name: "杰出科学家", count: `${totalArchitects}位`, source: "百度百科词条", method: "词条整理 + 影响力评分" },
  { name: "传世著作", count: `${totalBooks}部`, source: "百度百科 + 故宫博物院", method: "文献检索 + 分类整理" },
  { name: "建筑文化", count: "38类", source: "中国非物质文化遗产网 + 学术文献", method: "多源融合 + 结构化处理" },
];
sources.forEach((s, idx) => {
  const y = 2.0 + idx * 1.3;
  dataSource.addShape(pptx.ShapeType.rect, {
    x: 0.5, y, w: 0.15, h: 1.0,
    fill: { color: colors.gold },
  });
  dataSource.addText(s.name, {
    x: 0.8, y: y + 0.1, w: 2, h: 0.35,
    fontSize: 16, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
  });
  dataSource.addText(`${s.count}  |  ${s.source}`, {
    x: 0.8, y: y + 0.45, w: 8, h: 0.3,
    fontSize: 12, color: colors.text,
    fontFace: "Microsoft YaHei",
  });
  dataSource.addText(`采集方法：${s.method}`, {
    x: 0.8, y: y + 0.75, w: 8, h: 0.25,
    fontSize: 11, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
});

// ============================================================
// 第6页：技术架构
// ============================================================
const tech = addContentSlide(pptx, "03 技术架构");
tech.addText("前端技术栈", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const techStack = [
  { name: "Vite 4.5", desc: "构建工具，MPA多页面架构", color: colors.gold },
  { name: "ECharts 5.4", desc: "图表库，20+种图表类型", color: colors.teal },
  { name: "GSAP 3.12", desc: "动画库，页面过渡与交互动效", color: colors.red },
  { name: "Tailwind CSS", desc: "样式框架，响应式布局", color: colors.accent },
];
techStack.forEach((t, idx) => {
  const y = 2.0 + idx * 0.7;
  tech.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y, w: 0.15, h: 0.5,
    fill: { color: t.color },
    rectRadius: 0.05,
  });
  tech.addText(t.name, {
    x: 0.8, y, w: 2, h: 0.3,
    fontSize: 14, bold: true, color: t.color,
    fontFace: "Microsoft YaHei",
  });
  tech.addText(t.desc, {
    x: 0.8, y: y + 0.3, w: 4, h: 0.2,
    fontSize: 11, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
});

tech.addText("项目结构", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
tech.addText([
  { text: "src/\n", options: { color: colors.gold } },
  { text: "  ├─ css/     样式文件（3个）\n" },
  { text: "  ├─ js/      JavaScript（15+文件）\n" },
  { text: "  └─ view/    页面模板（5个）\n\n" },
  { text: "public/\n", options: { color: colors.gold } },
  { text: "  └─ data/    JSON数据（4个）\n\n" },
  { text: "docs/       项目文档（6份）\n" },
  { text: "scripts/    数据处理脚本\n" },
  { text: "spider/     爬虫脚本（4个）" },
], {
  x: 5.5, y: 2.0, w: 4, h: 4,
  fontSize: 11, color: colors.text,
  fontFace: "Consolas",
  lineSpacing: 18,
});

// ============================================================
// 第7页：首页设计
// ============================================================
const home = addContentSlide(pptx, "04 页面展示 — 首页");
home.addText("首页功能", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
home.addText([
  { text: "• 朝代发展折线图：", options: { bold: true, color: colors.gold } },
  { text: "展示从春秋到清代的建筑发展脉络\n\n" },
  { text: "• 建筑特征雷达图：", options: { bold: true, color: colors.gold } },
  { text: "多维度对比不同朝代建筑特色\n\n" },
  { text: "• 统计卡片：", options: { bold: true, color: colors.gold } },
  { text: "四大核心数据一目了然\n\n" },
  { text: "• 飘落叶片动效：", options: { bold: true, color: colors.gold } },
  { text: "银杏、枫叶、竹叶、柳叶四种类型，契合古建筑主题" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 4.5,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 22,
});
home.addText("朝代分布TOP5", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const topDynasties = Object.entries(dynastyCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
topDynasties.forEach(([d, c], idx) => {
  const y = 2.0 + idx * 0.6;
  const pct = Math.round((c / totalBuildings) * 100);
  home.addText(d, {
    x: 5.5, y, w: 1.5, h: 0.3,
    fontSize: 12, color: colors.text,
    fontFace: "Microsoft YaHei",
  });
  home.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: y + 0.05, w: 2.5 * (pct / 40), h: 0.2,
    fill: { color: idx === 0 ? colors.gold : colors.teal },
    rectRadius: 0.05,
  });
  home.addText(`${c}处 (${pct}%)`, {
    x: 9.5, y, w: 1.5, h: 0.3,
    fontSize: 11, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
});

// ============================================================
// 第8页：建筑成就页
// ============================================================
const achieve = addContentSlide(pptx, "04 页面展示 — 建筑成就");
achieve.addText("核心图表", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
achieve.addText([
  { text: "• 南丁格尔玫瑰图：", options: { bold: true, color: colors.gold } },
  { text: "六大朝代建筑数量对比\n\n" },
  { text: "• 省份分布柱状图：", options: { bold: true, color: colors.gold } },
  { text: "古建筑地理分布可视化\n\n" },
  { text: "• 极坐标柱状图：", options: { bold: true, color: colors.gold } },
  { text: "不同类别建筑占比\n\n" },
  { text: "• 堆叠面积图：", options: { bold: true, color: colors.gold } },
  { text: "朝代建筑数量累积趋势" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 4.5,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 22,
});
// 类别饼图数据
const catData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
achieve.addText("建筑类别分布", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
if (catData.length > 0) {
  achieve.addChart(pptx.ChartType.doughnut, [
    {
      name: "建筑类别",
      labels: catData.map(c => c.name),
      values: catData.map(c => c.value),
    }
  ], {
    x: 5.5, y: 2.0, w: 4, h: 3.5,
    chartColors: [colors.gold, colors.teal, colors.red, colors.accent, "A78BFA", "FB923C"],
    showLegend: true,
    legendPos: "b",
    legendFontSize: 10,
    legendColor: colors.text,
    dataLabelColor: colors.text,
    dataLabelFontSize: 10,
    showValue: true,
    holeSize: 50,
  });
}

// ============================================================
// 第9页：杰出科学家页
// ============================================================
const scientist = addContentSlide(pptx, "04 页面展示 — 杰出科学家");
scientist.addText("核心功能", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
scientist.addText([
  { text: "• 力导向关系图：", options: { bold: true, color: colors.gold } },
  { text: "20位科学家与所属朝代的网络关系\n\n" },
  { text: "• 横向时间轴：", options: { bold: true, color: colors.gold } },
  { text: "从春秋到清代的人才脉络\n\n" },
  { text: "• 影响力评分：", options: { bold: true, color: colors.gold } },
  { text: "基于成就的综合评估体系\n\n" },
  { text: "• 重点人物卡片：", options: { bold: true, color: colors.gold } },
  { text: "鲁班、李春、李诫、蒯祥、计成、雷发达等核心人物详情" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 4.5,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 22,
});
scientist.addText("重点人物", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const keyPeople = [
  { name: "鲁班", dynasty: "春秋", tag: "木工祖师" },
  { name: "李春", dynasty: "隋", tag: "赵州桥设计者" },
  { name: "李诫", dynasty: "北宋", tag: "《营造法式》" },
  { name: "蒯祥", dynasty: "明", tag: "故宫设计者" },
  { name: "计成", dynasty: "明", tag: "《园冶》作者" },
  { name: "雷发达", dynasty: "清", tag: "样式雷创始人" },
];
keyPeople.forEach((p, idx) => {
  const y = 2.0 + idx * 0.7;
  scientist.addShape(pptx.ShapeType.roundRect, {
    x: 5.5, y, w: 4, h: 0.6,
    fill: { color: colors.cardBg },
    rectRadius: 0.05,
  });
  scientist.addText(p.name, {
    x: 5.7, y: y + 0.1, w: 1, h: 0.4,
    fontSize: 14, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
  });
  scientist.addText(p.dynasty, {
    x: 6.5, y: y + 0.15, w: 0.8, h: 0.3,
    fontSize: 11, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
  scientist.addText(p.tag, {
    x: 7.2, y: y + 0.15, w: 2, h: 0.3,
    fontSize: 11, color: colors.teal,
    fontFace: "Microsoft YaHei",
  });
});

// ============================================================
// 第10页：传世著作页
// ============================================================
const bookSlide = addContentSlide(pptx, "04 页面展示 — 传世著作");
bookSlide.addText("核心图表", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
bookSlide.addText([
  { text: "• 旭日图：", options: { bold: true, color: colors.gold } },
  { text: "按朝代分类的著作层级关系\n\n" },
  { text: "• 横向时间轴：", options: { bold: true, color: colors.gold } },
  { text: "从春秋《考工记》到清代《工段营造录》\n\n" },
  { text: "• 朝代分布饼图：", options: { bold: true, color: colors.gold } },
  { text: "明代著作最多（5部），北宋和清代各3部" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 4,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 22,
});
const bookDist = books.dynasty_distribution || [];
if (bookDist.length > 0) {
  bookSlide.addText("著作朝代分布", {
    x: 5.5, y: 1.5, w: 4, h: 0.4,
    fontSize: 18, bold: true, color: colors.teal,
    fontFace: "Microsoft YaHei",
  });
  bookSlide.addChart(pptx.ChartType.bar, [
    {
      name: "著作数量",
      labels: bookDist.map(d => d.name),
      values: bookDist.map(d => d.value),
    }
  ], {
    x: 5.5, y: 2.0, w: 4, h: 3.5,
    chartColors: [colors.gold],
    barDir: "bar",
    barGrouping: "clustered",
    showLegend: false,
    catAxisLabelColor: colors.text,
    catAxisLabelFontSize: 10,
    valAxisLabelColor: colors.textSecondary,
    valAxisLabelFontSize: 10,
    dataLabelColor: colors.text,
    dataLabelFontSize: 10,
    showValue: true,
  });
}

// ============================================================
// 第11页：建筑文化页
// ============================================================
const cultureSlide = addContentSlide(pptx, "04 页面展示 — 建筑文化");
cultureSlide.addText("四大文化模块", {
  x: 0.5, y: 1.5, w: "90%", h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const cultureModules = [
  { name: "民居文化", count: 8, desc: "四合院、土楼、徽派民居、吊脚楼、蒙古包、碉楼、干栏式、窑洞", icon: "🏠" },
  { name: "官府文化", count: 5, desc: "孔庙、县衙、贡院、城楼城墙、鼓楼钟楼", icon: "⚖" },
  { name: "皇宫文化", count: 5, desc: "北京故宫、沈阳故宫、颐和园、避暑山庄、元大都", icon: "👑" },
  { name: "桥梁文化", count: 8, desc: "赵州桥、卢沟桥、安平桥、广济桥、洛阳桥、程阳风雨桥、泸定桥、晋祠鱼沼飞梁", icon: "🌉" },
];
cultureModules.forEach((m, idx) => {
  const x = 0.5 + (idx % 2) * 4.8;
  const y = 2.0 + Math.floor(idx / 2) * 2.5;
  cultureSlide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 4.3, h: 2.2,
    fill: { color: colors.cardBg },
    rectRadius: 0.1,
  });
  cultureSlide.addText(m.name, {
    x: x + 0.2, y: y + 0.15, w: 2, h: 0.4,
    fontSize: 16, bold: true, color: colors.gold,
    fontFace: "Microsoft YaHei",
  });
  cultureSlide.addText(`${m.count}类`, {
    x: x + 2.3, y: y + 0.2, w: 1, h: 0.3,
    fontSize: 12, color: colors.teal,
    fontFace: "Microsoft YaHei",
  });
  cultureSlide.addText(m.desc, {
    x: x + 0.2, y: y + 0.6, w: 3.9, h: 1.4,
    fontSize: 10, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
    lineSpacing: 16,
  });
});

// ============================================================
// 第12页：创新亮点
// ============================================================
const innovation = addContentSlide(pptx, "05 创新亮点");
innovation.addText("视觉创新", {
  x: 0.5, y: 1.5, w: 3, h: 0.4,
  fontSize: 18, bold: true, color: colors.gold,
  fontFace: "Microsoft YaHei",
});
innovation.addText([
  { text: "• 古风配色体系：" },
  { text: "古铜金、青瓦色、朱砂红、深夜墨\n", options: { color: colors.textSecondary } },
  { text: "• 飘落叶片动效：" },
  { text: "银杏、枫叶、竹叶、柳叶替代传统粒子\n", options: { color: colors.textSecondary } },
  { text: "• 深色科技风：" },
  { text: "现代数据可视化与传统文化融合", options: { color: colors.textSecondary } },
], {
  x: 0.5, y: 2.0, w: 3, h: 3,
  fontSize: 12, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 18,
});

innovation.addText("技术创新", {
  x: 4, y: 1.5, w: 3, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
innovation.addText([
  { text: "• MPA多页面架构：" },
  { text: "参考4-c-web项目，Vite构建\n", options: { color: colors.textSecondary } },
  { text: "• 数据驱动全流程：" },
  { text: "爬虫 + 清洗 + 可视化\n", options: { color: colors.textSecondary } },
  { text: "• 响应式ECharts：" },
  { text: "5个断点适配，移动端性能降级", options: { color: colors.textSecondary } },
], {
  x: 4, y: 2.0, w: 3, h: 3,
  fontSize: 12, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 18,
});

innovation.addText("内容创新", {
  x: 7.5, y: 1.5, w: 3, h: 0.4,
  fontSize: 18, bold: true, color: colors.red,
  fontFace: "Microsoft YaHei",
});
innovation.addText([
  { text: "• 四大维度全覆盖：" },
  { text: "成就 + 科学家 + 著作 + 文化\n", options: { color: colors.textSecondary } },
  { text: "• 时间跨度大：" },
  { text: "春秋到清代，2500年历史\n", options: { color: colors.textSecondary } },
  { text: "• 图表类型丰富：" },
  { text: "20+种图表类型", options: { color: colors.textSecondary } },
], {
  x: 7.5, y: 2.0, w: 3, h: 3,
  fontSize: 12, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 18,
});

// ============================================================
// 第13页：项目成果
// ============================================================
const result = addContentSlide(pptx, "06 项目成果");
result.addText("部署情况", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
result.addText([
  { text: "GitHub Pages（国内访问较慢）", options: { bold: true, color: colors.gold } },
  { text: "https://zmctwjt.github.io/ancient-architecture-viz/\n\n" },
  { text: "阿里云服务器（国内推荐）", options: { bold: true, color: colors.gold } },
  { text: "http://8.148.80.103\n\n" },
  { text: "项目已开源", options: { bold: true, color: colors.gold } },
  { text: "提供完整的数据爬虫、清洗脚本和文档" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 3.5,
  fontSize: 12, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 20,
});

result.addText("代码统计", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
const codeStats = [
  { label: "HTML", value: 6, color: colors.gold },
  { label: "CSS", value: 3, color: colors.teal },
  { label: "JavaScript", value: 15, color: colors.red },
  { label: "Python", value: 5, color: colors.accent },
  { label: "Markdown", value: 6, color: "A78BFA" },
];
const totalFiles = codeStats.reduce((s, c) => s + c.value, 0);
codeStats.forEach((s, idx) => {
  const y = 2.0 + idx * 0.6;
  result.addText(s.label, {
    x: 5.5, y, w: 1.5, h: 0.3,
    fontSize: 12, color: colors.text,
    fontFace: "Microsoft YaHei",
  });
  result.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: y + 0.05, w: 2.5 * (s.value / 6), h: 0.2,
    fill: { color: s.color },
    rectRadius: 0.05,
  });
  result.addText(`${s.value}个文件`, {
    x: 9.5, y, w: 1.5, h: 0.3,
    fontSize: 11, color: colors.textSecondary,
    fontFace: "Microsoft YaHei",
  });
});
result.addText(`总计：${totalFiles}个文件，约13,000行代码`, {
  x: 5.5, y: 5.5, w: 4, h: 0.3,
  fontSize: 12, bold: true, color: colors.gold,
  fontFace: "Microsoft YaHei",
});

// ============================================================
// 第14页：未来展望
// ============================================================
const future = addContentSlide(pptx, "06 未来展望");
future.addText("功能扩展", {
  x: 0.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.gold,
  fontFace: "Microsoft YaHei",
});
future.addText([
  { text: "□ 增加3D建筑模型展示（Three.js/WebGL）" },
  { text: "\n□ 增加VR/AR沉浸式体验" },
  { text: "\n□ 增加用户交互功能（收藏、分享）" },
  { text: "\n□ 增加多语言支持（英文/日文）" },
], {
  x: 0.5, y: 2.0, w: 4.5, h: 2,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 24,
});

future.addText("数据扩展", {
  x: 5.5, y: 1.5, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.teal,
  fontFace: "Microsoft YaHei",
});
future.addText([
  { text: "□ 增加更多古建筑数据（目标500+处）" },
  { text: "\n□ 增加建筑细节图片与视频资料" },
  { text: "\n□ 增加用户生成内容（UGC）" },
  { text: "\n□ 增加建筑3D扫描模型" },
], {
  x: 5.5, y: 2.0, w: 4.5, h: 2,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 24,
});

future.addText("技术升级", {
  x: 0.5, y: 4.2, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: colors.red,
  fontFace: "Microsoft YaHei",
});
future.addText([
  { text: "□ 升级到Vue 3 + TypeScript" },
  { text: "\n□ 使用WebGL实现3D效果" },
  { text: "\n□ 引入AI数据分析与推荐" },
  { text: "\n□ 部署到云服务平台" },
], {
  x: 0.5, y: 4.7, w: 4.5, h: 2,
  fontSize: 13, color: colors.text,
  fontFace: "Microsoft YaHei",
  lineSpacing: 24,
});

// ============================================================
// 第15页：致谢
// ============================================================
const thanks = pptx.addSlide();
thanks.background = { color: colors.darkBg };
thanks.addText("感谢聆听", {
  x: 0.5, y: 2.5, w: "90%", h: 1.0,
  fontSize: 48, bold: true, color: colors.gold,
  fontFace: "Microsoft YaHei",
  align: "center",
});
thanks.addText("敬请各位批评指正", {
  x: 0.5, y: 3.8, w: "90%", h: 0.5,
  fontSize: 20, color: colors.textSecondary,
  fontFace: "Microsoft YaHei",
  align: "center",
});
thanks.addText("项目地址：https://github.com/zmctwjt/ancient-architecture-viz\n在线演示：http://8.148.80.103", {
  x: 0.5, y: 5.0, w: "90%", h: 0.8,
  fontSize: 12, color: colors.textSecondary,
  fontFace: "Microsoft YaHei",
  align: "center",
});

// ============================================================
// 保存文件
// ============================================================
const outputPath = path.resolve(process.cwd(), "答辩PPT-千年营造华夏砖木.pptx");
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ PPT已生成: ${outputPath}`);
    console.log(`📊 共 ${pptx.slides.length} 页幻灯片`);
  })
  .catch(err => {
    console.error("❌ 生成失败:", err);
    process.exit(1);
  });
