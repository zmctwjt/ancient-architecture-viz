/**
 * 古建筑图形语言库
 *  - ARCH_GLYPH   ：11 类建筑填充剪影（小尺寸清晰，用于群像/图标）
 *  - ROOF_TYPES   ：6 种中国古建屋顶线描（用于图解）
 *  - STRUCT_NODES ：4 种结构节点线描（斗拱/榫卯/梁架/台基）
 *
 * 全部为手绘路径，无外部图片依赖
 */

const fill = (inner, vb = '0 0 48 48') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">${inner}</svg>`;

const line = (inner, vb = '0 0 120 64') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

/* ============================================================
   11 类建筑填充剪影（48×48）
   ============================================================ */

// 皇宫：重檐 + 台基 + 台阶
const glyphPalace = fill(`
  <path d="M4 41h40v3H4z"/>
  <path d="M8 38h32v3H8z"/>
  <path d="M10 38V28h28v10h-28z"/>
  <path d="M6 28h36l-4-4H10l-4 4z"/>
  <path d="M12 24V16h24v8H12z"/>
  <path d="M8 16h32l-5-5H13l-5 5z"/>
  <path d="M18 11c2-3 10-3 12 0h-12z"/>
  <path d="M22 41v-6h4v6z"/>
`);

// 寺庙：单檐歇山 + 幡杆
const glyphTemple = fill(`
  <path d="M6 42h36v2H6z"/>
  <path d="M10 42V30h28v12H10z"/>
  <path d="M6 30h36l-6-6H12l-6 6z"/>
  <path d="M12 24l12-8 12 8H12z"/>
  <path d="M21 42v-7h6v7z"/>
  <path d="M9 30V20h1.5v10z"/>
  <path d="M8 20h4v3H8z"/>
`);

// 塔 / 楼阁：三层
const glyphPagoda = fill(`
  <path d="M6 43h36v2H6z"/>
  <path d="M12 43V33h24v10H12z"/>
  <path d="M9 33h30l-3-4H12l-3 4z"/>
  <path d="M15 29V21h18v8H15z"/>
  <path d="M12 21h24l-3-4H15l-3 4z"/>
  <path d="M18 17V11h12v6H18z"/>
  <path d="M15 11h18l-3-4H18l-3 4z"/>
  <path d="M22 7V3h4v4z"/>
`);

// 园林：攒尖亭 + 水面
const glyphGarden = fill(`
  <path d="M6 42h36v2H6z"/>
  <path d="M11 42V30h26v12H11z"/>
  <path d="M4 30h40l-20-15L4 30z"/>
  <path d="M22 15V8h4v7z"/>
  <path d="M18 8h12l-6-4-6 4z"/>
  <path d="M16 42v-8h2v8zM30 42v-8h2v8z"/>
  <path d="M8 46c3 2 6 2 9 0s6-2 9 0 6 2 9 0 6-2 9 0v2H8v-2z"/>
`);

// 桥梁：敞肩拱
const glyphBridge = fill(`
  <path d="M2 36h44v3H2z"/>
  <path d="M4 36c0-14 9-22 20-22s20 8 20 22h-3c0-12-7-19-17-19S7 24 7 36H4z"/>
  <path d="M12 36c1-7 5-11 12-11s11 4 12 11h-3c-1-5-4-8-9-8s-8 3-9 8h-3z"/>
  <path d="M2 39h44v2H2z"/>
  <path d="M14 22v14h2V22zM32 22v14h2V22z"/>
`);

// 民居：坡屋顶 + 院墙
const glyphHouse = fill(`
  <path d="M4 42h40v2H4z"/>
  <path d="M8 42V28h14v14H8z"/>
  <path d="M4 28l11-9 11 9H4z"/>
  <path d="M22 42V24h18v18H22z"/>
  <path d="M18 24l13-10 13 10H18z"/>
  <path d="M29 42v-9h5v9z"/>
  <path d="M12 33h5v5h-5z"/>
`);

// 城址：城墙 + 垛口
const glyphCity = fill(`
  <path d="M3 42h42v3H3z"/>
  <path d="M5 42V26h38v16H5z"/>
  <path d="M5 26v-4h5v4h4v-4h5v4h4v-4h5v4h4v-4h5v4H5z"/>
  <path d="M19 42V32h10v10H19z"/>
  <path d="M21 32v-6h6v6h-6z"/>
  <path d="M21 26l3-4 3 4h-6z"/>
`);

// 墓葬：覆斗封土 + 石阙
const glyphTomb = fill(`
  <path d="M3 43h42v2H3z"/>
  <path d="M11 43l10-18h6l10 18H11z"/>
  <path d="M17 33h14v2H17z"/>
  <path d="M6 43V32h4v11H6zM38 43V32h4v11h-4z"/>
  <path d="M4 32h8v2H4zM36 32h8v2h-8z"/>
`);

// 石窟：崖壁 + 佛龛
const glyphCave = fill(`
  <path d="M3 43h42v2H3z"/>
  <path d="M5 43V10h38v33H5z"/>
  <path d="M12 43V26c0-5 4-8 9-8s9 3 9 8v17H12z" fill="#0B0906" stroke="currentColor" stroke-width="1.6"/>
  <path d="M17 43v-8h8v8h-8z" fill="currentColor"/>
  <path d="M20 20c1.5-2 4.5-2 6 0h-6z"/>
  <path d="M33 22v10M33 18v2"/>
`);

// 祭祀建筑：坛台 + 石阶
const glyphAltar = fill(`
  <path d="M3 44h42v2H3z"/>
  <path d="M8 44V38h32v6H8z"/>
  <path d="M11 38V32h26v6H11z"/>
  <path d="M14 32V26h20v6H14z"/>
  <path d="M18 26v-4h12v4H18z"/>
  <path d="M21 22v-3h6v3h-6z"/>
  <path d="M20 44v-4h3v4zM25 44v-4h3v4z"/>
`);

// 官府：门楼 + 鼓
const glyphYamen = fill(`
  <path d="M3 43h42v2H3z"/>
  <path d="M6 43V28h36v15H6z"/>
  <path d="M3 28h42l-6-5H9l-6 5z"/>
  <path d="M12 23l12-7 12 7H12z"/>
  <path d="M19 43V33h10v10H19z"/>
  <path d="M8 33h6v6H8zM34 33h6v6h-6z"/>
`);

export const ARCH_GLYPH = {
  palace: glyphPalace,
  temple: glyphTemple,
  pagoda: glyphPagoda,
  garden: glyphGarden,
  bridge: glyphBridge,
  house: glyphHouse,
  city: glyphCity,
  tomb: glyphTomb,
  cave: glyphCave,
  altar: glyphAltar,
  yamen: glyphYamen,
};

/**
 * 按 category 取剪影
 */
export function glyphByCategory(category = '') {
  const c = String(category);
  if (/皇宫|宫殿|宫/.test(c)) return ARCH_GLYPH.palace;
  if (/寺庙|寺|庙/.test(c)) return ARCH_GLYPH.temple;
  if (/楼阁|塔|阁/.test(c)) return ARCH_GLYPH.pagoda;
  if (/园林|园/.test(c)) return ARCH_GLYPH.garden;
  if (/桥梁|桥/.test(c)) return ARCH_GLYPH.bridge;
  if (/民居|大院|庄园|住宅/.test(c)) return ARCH_GLYPH.house;
  if (/城址|古城|城墙/.test(c)) return ARCH_GLYPH.city;
  if (/墓葬|陵|墓/.test(c)) return ARCH_GLYPH.tomb;
  if (/石窟|窟/.test(c)) return ARCH_GLYPH.cave;
  if (/祭祀|坛|祠/.test(c)) return ARCH_GLYPH.altar;
  if (/官府|衙|衙门/.test(c)) return ARCH_GLYPH.yamen;
  return ARCH_GLYPH.temple;
}

/* ============================================================
   6 种中国古建屋顶（线描，120×72）
   区分逻辑：屋顶宽度与墙身宽度的比例 + 正脊形态 + 山花有无
   ============================================================ */

const vb = '0 0 120 72';

// 庑殿：四面坡，檐口极宽，正脊短，无山墙外露
const roofPalace = line(`
  <path d="M44 66V50h32v16"/>
  <path d="M40 66h40"/>
  <path d="M46 58h6v8h-6zM68 58h6v8h-6z"/>
  <path d="M12 50h96"/>
  <path d="M18 50L46 28h28l28 22"/>
  <path d="M46 28h28"/>
  <path d="M18 50l6-4M102 50l-6-4"/>
  <path d="M14 54h92"/>
`, vb);

// 歇山：上部两坡 + 下部四坡，两侧露出山花三角
const roofXieshan = line(`
  <path d="M44 66V50h32v16"/>
  <path d="M40 66h40"/>
  <path d="M46 58h6v8h-6zM68 58h6v8h-6z"/>
  <path d="M20 50h80"/>
  <path d="M20 50l24-12h32l24 12"/>
  <path d="M44 38h32"/>
  <path d="M44 38l10-12h12l10 12"/>
  <path d="M54 26h12"/>
  <path d="M22 50l22-12v12z" fill="currentColor" fill-opacity="0.16"/>
  <path d="M98 50L76 38v12z" fill="currentColor" fill-opacity="0.16"/>
  <path d="M18 54h84"/>
`, vb);

// 攒尖：四面聚于一点，无正脊，顶部宝顶
const roofCuanjian = line(`
  <path d="M46 66V50h28v16"/>
  <path d="M42 66h36"/>
  <path d="M50 58h5v8h-5zM69 58h5v8h-5z"/>
  <path d="M30 50h60"/>
  <path d="M30 50L60 22l30 28"/>
  <path d="M60 22v-6"/>
  <path d="M56 16h8l-4-6z" fill="currentColor"/>
  <path d="M28 54h64"/>
`, vb);

// 悬山：两坡出檐越过山墙，屋顶明显宽于墙身
const roofXuanshan = line(`
  <path d="M46 66V46h28v20"/>
  <path d="M42 66h36"/>
  <path d="M50 56h5v10h-5zM69 56h5v10h-5z"/>
  <path d="M20 46h80"/>
  <path d="M20 46L60 22l40 24"/>
  <path d="M20 46l-6 6M100 46l6 6"/>
  <path d="M24 46h72"/>
`, vb);

// 硬山：两坡不出山墙，屋顶宽度等于墙身宽度
const roofYingshan = line(`
  <path d="M30 66V46h60v20"/>
  <path d="M28 66h64"/>
  <path d="M38 56h6v10h-6zM76 56h6v10h-6z"/>
  <path d="M30 46h60"/>
  <path d="M30 46L60 22l30 24"/>
  <path d="M30 46v20M90 46v20"/>
`, vb);

// 卷棚：屋脊圆曲无正脊，线条柔和
const roofJuanpeng = line(`
  <path d="M40 66V48h40v18"/>
  <path d="M36 66h48"/>
  <path d="M46 58h6v8h-6zM68 58h6v8h-6z"/>
  <path d="M24 48h72"/>
  <path d="M24 48c8-16 22-22 36-22s28 6 36 22"/>
  <path d="M34 38c8-6 17-9 26-9s18 3 26 9"/>
  <path d="M22 52h76"/>
`, vb);

export const ROOF_TYPES = [
  { key: 'wudian', name: '庑殿顶', level: '最高等级', svg: roofPalace, note: '四面坡、一条正脊四垂脊，檐口最宽。用于宫殿正殿与重要坛庙，是等级最高的屋顶。' },
  { key: 'xieshan', name: '歇山顶', level: '次高等级', svg: roofXieshan, note: '上部两坡、下部四面坡，两侧露出三角形山花（图示浅色区）。等级仅次于庑殿。' },
  { key: 'cuanjian', name: '攒尖顶', level: '集中式', svg: roofCuanjian, note: '四角或八角聚于一点，顶部置宝顶，无正脊。多用于亭、阁与坛。' },
  { key: 'xuanshan', name: '悬山顶', level: '民间常用', svg: roofXuanshan, note: '两坡出檐越过山墙（图示两端出挑），防雨性能好，南北民居广泛使用。' },
  { key: 'yingshan', name: '硬山顶', level: '民间常用', svg: roofYingshan, note: '两坡不出山墙，屋面与山墙齐平。防火性能强，清代北方民居主流。' },
  { key: 'juanpeng', name: '卷棚顶', level: '园林雅制', svg: roofJuanpeng, note: '屋脊圆曲、无正脊，线条柔和。多见于园林与游廊，追求轻盈感。' },
];

/* ============================================================
   结构节点（线描，120×80）
   ============================================================ */

const nodeDougong = line(`
  <path d="M20 60h80"/>
  <path d="M40 60V46h40v14"/>
  <path d="M28 46h64"/>
  <path d="M34 46l6-8h40l6 8"/>
  <path d="M24 38h72"/>
  <path d="M30 38l5-8h50l5 8"/>
  <path d="M20 30h80"/>
  <path d="M36 60V50M60 60V50M84 60V50"/>
  <path d="M46 30v-8M74 30v-8"/>
`, '0 0 120 80');

const nodeMortalise = line(`
  <path d="M20 20h30v14H20z"/>
  <path d="M50 24h16v6H50z"/>
  <path d="M66 18h34v24H66z"/>
  <path d="M70 22v16M80 22v16M90 22v16"/>
  <path d="M20 44h80v10H20z"/>
  <path d="M28 54v10M92 54v10"/>
  <path d="M56 44v-6M60 38h20"/>
`, '0 0 120 80');

const nodeFrame = line(`
  <path d="M14 66h92"/>
  <path d="M22 66V26h76v40"/>
  <path d="M22 26l38-12 38 12"/>
  <path d="M60 14v52"/>
  <path d="M22 42h76"/>
  <path d="M34 42v24M86 42v24"/>
  <path d="M30 26v-6M90 26v-6"/>
`, '0 0 120 80');

const nodeBase = line(`
  <path d="M10 66h100"/>
  <path d="M18 66V58h84v8"/>
  <path d="M24 58V50h72v8"/>
  <path d="M32 50V42h56v8"/>
  <path d="M14 70h92"/>
  <path d="M40 66v-4h6v4M74 66v-4h6v4"/>
`, '0 0 120 80');

export const STRUCT_NODES = [
  { key: 'dougong', name: '斗拱', svg: nodeDougong, note: '承托出檐、传递荷载的构件组合，是木构建筑等级的标志。' },
  { key: 'sunmao', name: '榫卯', svg: nodeMortalise, note: '不用钉子的连接方式，燕尾榫、粽角榫等数百种榫型。' },
  { key: 'liangjia', name: '梁架', svg: nodeFrame, note: '抬梁与穿斗两套体系，决定室内空间与屋顶曲线。' },
  { key: 'taiji', name: '台基', svg: nodeBase, note: '分层夯筑或石砌，既防潮防洪，也是等级秩序的体现。' },
];

/**
 * 小尺寸窗格图（用于群像，48×48，填充）
 */
export const WINDOW_PATTERN = fill(`
  <path d="M8 8h32v32H8V8zm2 2v28h28V10H10z"/>
  <path d="M24 10v28M10 24h28" stroke="currentColor" stroke-width="1.4"/>
`);
