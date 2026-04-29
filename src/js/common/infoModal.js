/**
 * 信息弹窗工具 - 用于显示图表点击后的详细信息
 */

/**
 * 创建并显示信息弹窗
 * @param {Object} options - 弹窗配置
 * @param {string} options.title - 标题
 * @param {string} options.content - HTML内容
 * @param {Object} options.data - 数据对象（可选）
 */
export function showInfoModal(options) {
  // 移除已存在的弹窗
  const existingModal = document.getElementById('info-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  // 创建弹窗元素
  const overlay = document.createElement('div');
  overlay.id = 'info-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  `;

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.cssText = `
    background: rgba(20, 25, 35, 0.98);
    border: 1px solid rgba(200, 169, 110, 0.4);
    border-radius: 12px;
    padding: 0.3rem;
    max-width: 6rem;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    transform: scale(0.9);
    transition: transform 0.3s ease;
    position: relative;
  `;

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
    width: 0.3rem;
    height: 0.3rem;
    background: transparent;
    border: 1px solid rgba(200, 169, 110, 0.3);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.14rem;
    transition: all 0.3s ease;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = '#E07B54';
    closeBtn.style.borderColor = '#E07B54';
    closeBtn.style.color = 'white';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = 'transparent';
    closeBtn.style.borderColor = 'rgba(200, 169, 110, 0.3)';
    closeBtn.style.color = 'rgba(255, 255, 255, 0.6)';
  };
  closeBtn.onclick = () => closeModal(overlay);

  // 标题
  const titleEl = document.createElement('h3');
  titleEl.className = 'info-modal-title';
  titleEl.textContent = options.title;
  titleEl.style.cssText = `
    font-size: 0.2rem;
    color: #C8A96E;
    margin-bottom: 0.15rem;
    text-align: center;
    border-bottom: 1px solid rgba(200, 169, 110, 0.2);
    padding-bottom: 0.1rem;
  `;

  // 内容
  const contentEl = document.createElement('div');
  contentEl.className = 'info-modal-body';
  contentEl.style.cssText = `
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  `;
  contentEl.innerHTML = options.content;

  // 组装
  content.appendChild(closeBtn);
  content.appendChild(titleEl);
  content.appendChild(contentEl);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 显示动画
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    content.style.transform = 'scale(1)';
  });

  // 点击背景关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });

  // ESC键关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * 关闭弹窗
 */
function closeModal(overlay) {
  const content = overlay.querySelector('.modal-content');
  overlay.style.opacity = '0';
  overlay.style.visibility = 'hidden';
  if (content) {
    content.style.transform = 'scale(0.9)';
  }
  setTimeout(() => {
    overlay.remove();
  }, 300);
}

/**
 * 生成数据展示HTML
 * @param {Object} data - 数据对象
 * @returns {string} HTML字符串
 */
export function generateDataHTML(data) {
  let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.1rem; margin: 0.15rem 0;">';
  
  for (const [key, value] of Object.entries(data)) {
    html += `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 0.1rem; border-radius: 6px; text-align: center;">
        <div style="font-size: 0.18rem; color: #C8A96E; font-weight: 600;">${value}</div>
        <div style="font-size: 0.11rem; color: rgba(255, 255, 255, 0.5); margin-top: 0.05rem;">${key}</div>
      </div>
    `;
  }
  
  html += '</div>';
  return html;
}

/**
 * 创建图表点击事件处理
 * @param {Object} chart - ECharts实例
 * @param {Function} getInfo - 获取信息的回调函数
 */
export function addChartClickHandler(chart, getInfo) {
  chart.on('click', (params) => {
    const info = getInfo(params);
    if (info) {
      showInfoModal(info);
    }
  });
}
