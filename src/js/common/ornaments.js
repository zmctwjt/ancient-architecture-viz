/**
 * 古建筑线描 SVG 素材库
 * 用 stroke 线描风格，颜色继承 currentColor，可直接内联使用
 */

const S = (inner, vb = '0 0 120 80') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

// 唐代风格鸱吻 + 重檐庑殿顶（宫殿）
const palace = S(`
  <path d="M10 66h100"/>
  <path d="M18 66v-8h84v8"/>
  <path d="M14 58h92"/>
  <path d="M24 58l6-14h60l6 14"/>
  <path d="M22 44h76"/>
  <path d="M32 44l8-14h40l8 14"/>
  <path d="M28 30h64"/>
  <path d="M38 30c6-6 38-6 44 0"/>
  <path d="M40 66v-8M56 66v-8M72 66v-8M88 66v-8"/>
  <path d="M24 30c-4-4-2-8 2-9M96 30c4-4 2-8-2-9"/>
`);

// 硬山式民居 + 院墙（民居）
const house = S(`
  <path d="M8 66h104"/>
  <path d="M16 66V48h34v18"/>
  <path d="M12 48l21-16 21 16"/>
  <path d="M50 66V42h34v24"/>
  <path d="M46 42l21-14 21 14"/>
  <path d="M60 66V54h10v12"/>
  <path d="M24 56h8v10h-8z"/>
  <path d="M88 66V34h20v32"/>
  <path d="M84 34h28"/>
`);

// 敞肩石拱桥（桥梁）
const bridge = S(`
  <path d="M6 62h108"/>
  <path d="M12 62c0-22 22-34 48-34s48 12 48 34"/>
  <path d="M12 62c0-14 20-22 48-22s48 8 48 22"/>
  <path d="M28 54c6-9 18-14 32-14s26 5 32 14"/>
  <path d="M36 60V46M60 60V40M84 60V46"/>
  <path d="M6 66h108"/>
`);

// 楼阁式塔（寺庙）
const temple = S(`
  <path d="M14 70h92"/>
  <path d="M26 70V34h68v36"/>
  <path d="M30 34h60"/>
  <path d="M34 34l26-14 26 14"/>
  <path d="M40 46h40M40 58h40"/>
  <path d="M52 20V12h16v8"/>
  <path d="M56 12V6h8v6"/>
  <path d="M26 22h68"/>
`);

// 攒尖顶亭 + 水面（园林）
const garden = S(`
  <path d="M6 66h108"/>
  <path d="M40 66V50M80 66V50"/>
  <path d="M34 50h52"/>
  <path d="M36 50l24-22 24 22"/>
  <path d="M60 28V18"/>
  <path d="M56 18h8"/>
  <path d="M46 66v-8M60 66v-8M74 66v-8"/>
  <path d="M14 72c8 4 16 4 24 0s16-4 24 0 16 4 24 0 16-4 24 0"/>
`);

// 覆斗形封土 + 石阙（墓葬）
const tomb = S(`
  <path d="M8 66h104"/>
  <path d="M30 66l18-30h24l18 30z"/>
  <path d="M40 52h40"/>
  <path d="M52 36h16"/>
  <path d="M18 66V44h10v22M92 66V44h10v22"/>
  <path d="M14 44h18M88 44h18"/>
`);

// 城墙与城楼（城址）
const city = S(`
  <path d="M6 68h108"/>
  <path d="M10 68V46h100v22"/>
  <path d="M10 46v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6"/>
  <path d="M44 68V56h32v12"/>
  <path d="M46 56V44h28v12"/>
  <path d="M48 44l12-8 12 8"/>
`);

// 通用飞檐斗拱（默认装饰）
const defaultOrn = S(`
  <path d="M8 62h104"/>
  <path d="M20 62V50h80v12"/>
  <path d="M16 50h88"/>
  <path d="M26 50l8-12h52l8 12"/>
  <path d="M24 38h72"/>
  <path d="M34 38l10-12h32l10 12"/>
  <path d="M30 26h60"/>
  <path d="M36 26c6-8 42-8 48 0"/>
  <path d="M26 26c-5-3-4-9 1-11M94 26c5-3 4-9-1-11"/>
  <path d="M40 62v-6M60 62v-6M80 62v-6"/>
`);

export const ORNAMENTS = {
  palace, house, bridge, temple, garden, tomb, city,
  default: defaultOrn,
};

/**
 * 建筑类别 -> 装饰图形
 */
export function ornamentByCategory(category = '') {
  const c = String(category);
  if (/皇宫|宫殿|宫/.test(c)) return ORNAMENTS.palace;
  if (/民居|大院|庄园|住宅|四合院/.test(c)) return ORNAMENTS.house;
  if (/桥/.test(c)) return ORNAMENTS.bridge;
  if (/寺|庙|塔|石窟/.test(c)) return ORNAMENTS.temple;
  if (/园林|园/.test(c)) return ORNAMENTS.garden;
  if (/陵|墓/.test(c)) return ORNAMENTS.tomb;
  if (/城址|古城|城墙|城堡/.test(c)) return ORNAMENTS.city;
  return ORNAMENTS.default;
}

/**
 * 生成带装饰的 HTML 片段
 * @param {string} category 建筑类别
 * @param {string} caption 图注（可选）
 */
export function ornamentHTML(category, caption = '') {
  const svg = ornamentByCategory(category);
  const cap = caption
    ? `<figcaption class="ornament-caption">${caption}</figcaption>`
    : '';
  return `<figure class="ornament-figure">${svg}${cap}</figure>`;
}
