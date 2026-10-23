/**
 * 右侧抽屉 —— 替代居中模态，更接近「翻阅」的体验
 * 用于建筑详情、人物详情等需要展示较多结构化信息的场景
 */

import { glyphByCategory } from './glyphs.js';

let activeOverlay = null;

/**
 * 关闭当前抽屉
 */
export function closeDrawer() {
  if (!activeOverlay) return;
  const overlay = activeOverlay;
  const panel = overlay.querySelector('.drawer__panel');
  overlay.classList.remove('is-open');
  if (panel) panel.style.transform = 'translateX(102%)';
  setTimeout(() => overlay.remove(), 380);
  activeOverlay = null;
}

/**
 * 打开抽屉
 * @param {Object} opts
 * @param {string} opts.title       标题
 * @param {string} [opts.subtitle]  副标题（如「明 · 皇宫」）
 * @param {string} [opts.category]  建筑类别（用于取剪影）
 * @param {string} [opts.glyph]     直接指定剪影 SVG
 * @param {Array}  [opts.fields]    [{ label, value }] 字段列表
 * @param {string} [opts.body]      正文 HTML
 * @param {Array}  [opts.tags]      标签
 */
export function showDrawer(opts) {
  closeDrawer();

  const overlay = document.createElement('div');
  overlay.className = 'drawer';
  overlay.innerHTML = `
    <div class="drawer__mask"></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="${opts.title || '详情'}">
      <button class="drawer__close" aria-label="关闭">✕</button>
      ${(opts.glyph || opts.category)
        ? `<div class="drawer__glyph">${opts.glyph || glyphByCategory(opts.category)}</div>`
        : ''}
      <header class="drawer__head">
        <h2 class="drawer__title">${opts.title || ''}</h2>
        ${opts.subtitle ? `<p class="drawer__subtitle">${opts.subtitle}</p>` : ''}
      </header>
      ${opts.fields && opts.fields.length
        ? `<dl class="drawer__fields">${opts.fields
            .filter((f) => f.value)
            .map(
              (f) => `<div class="drawer__field">
                <dt>${f.label}</dt>
                <dd>${f.value}</dd>
              </div>`
            )
            .join('')}</dl>`
        : ''}
      ${opts.body ? `<div class="drawer__body">${opts.body}</div>` : ''}
      ${opts.tags && opts.tags.length
        ? `<div class="drawer__tags">${opts.tags
            .map((t) => `<span class="drawer__tag">${t}</span>`)
            .join('')}</div>`
        : ''}
    </aside>
  `;

  document.body.appendChild(overlay);
  activeOverlay = overlay;

  const panel = overlay.querySelector('.drawer__panel');

  // 入场
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    panel.style.transform = 'translateX(0)';
  });

  // 关闭交互
  overlay.querySelector('.drawer__mask').addEventListener('click', closeDrawer);
  overlay.querySelector('.drawer__close').addEventListener('click', closeDrawer);

  const onKey = (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  // 焦点移入抽屉
  setTimeout(() => panel.focus?.(), 60);
}

/**
 * 建筑详情抽屉（数据字段固定）
 * @param {Object} b buildings.json 中的一条
 */
export function showBuildingDrawer(b) {
  showDrawer({
    title: b.name,
    subtitle: [b.dynasty, b.category, b.location].filter(Boolean).join(' · '),
    category: b.category,
    fields: [
      { label: '朝代', value: b.dynasty },
      { label: '类别', value: b.category },
      { label: '所在地', value: b.location },
      { label: '始建年代', value: b.builtYear },
      { label: '保护级别', value: b.protectionLevel },
      { label: '主持营造', value: b.architect || '佚名' },
    ],
    body: [
      b.significance ? `<p class="drawer__lead">${b.significance}</p>` : '',
      b.description ? `<p>${b.description}</p>` : '',
    ].join(''),
    tags: [
      String(b.description || '').includes('世界遗产') ||
      String(b.description || '').includes('世界文化')
        ? '世界文化遗产'
        : '',
      String(b.description || '').includes('现存') ? '现存实物' : '',
    ].filter(Boolean),
  });
}
