/**
 * 飘落叶片效果 - 古风动效
 * 替代流星效果，更契合古建筑主题
 */

(function() {
  const container = document.getElementById('leafContainer');
  if (!container) return;

  // 叶片SVG图案（银杏叶、枫叶、柳叶等）
  const leafPatterns = [
    // 银杏叶
    `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 6 8 6 13C6 16.5 8.5 20 12 22C15.5 20 18 16.5 18 13C18 8 12 2 12 2Z"/>
    </svg>`,
    // 枫叶
    `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z"/>
    </svg>`,
    // 柳叶
    `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8 6 6 10 6 14C6 18 8 21 12 22C16 21 18 18 18 14C18 10 16 6 12 2Z"/>
    </svg>`
  ];

  // 古风配色
  const colors = [
    '#C8A96E', // 古铜金
    '#D4B896', // 浅金
    '#E07B54', // 朱砂红
    '#4ECDC4', // 青瓦色
    '#95E1D3', // 浅青
    '#F38181', // 淡红
    '#AA96DA', // 紫罗兰
    '#FFD93D'  // 金黄
  ];

  let leafCount = 0;
  const maxLeaves = 30;

  function createLeaf() {
    if (leafCount >= maxLeaves) return;

    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    
    // 随机属性
    const pattern = leafPatterns[Math.floor(Math.random() * leafPatterns.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const size = 15 + Math.random() * 20;
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * 5;
    
    // 设置样式
    leaf.style.left = `${left}%`;
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.color = color;
    leaf.style.animationDuration = `${duration}s`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.innerHTML = pattern;
    
    // 添加摇摆效果
    const sway = Math.random() > 0.5 ? 1 : -1;
    leaf.style.setProperty('--sway', sway);
    
    container.appendChild(leaf);
    leafCount++;

    // 动画结束后移除
    setTimeout(() => {
      if (leaf.parentNode) {
        leaf.parentNode.removeChild(leaf);
        leafCount--;
      }
    }, (duration + delay) * 1000);
  }

  // 初始化创建一些叶片
  for (let i = 0; i < 10; i++) {
    setTimeout(createLeaf, i * 300);
  }

  // 持续创建
  setInterval(createLeaf, 1500);

  // 添加CSS动画关键帧（摇摆效果）
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      0% {
        transform: translateY(-100px) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      25% {
        transform: translateY(25vh) rotate(90deg) translateX(calc(var(--sway, 1) * 30px));
      }
      50% {
        transform: translateY(50vh) rotate(180deg) translateX(calc(var(--sway, 1) * -20px));
      }
      75% {
        transform: translateY(75vh) rotate(270deg) translateX(calc(var(--sway, 1) * 30px));
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(calc(100vh + 100px)) rotate(360deg) translateX(0);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();
