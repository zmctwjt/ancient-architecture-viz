import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite 配置 - 多页面应用 (MPA)
 * 参考 4-c-web 项目结构
 */
export default defineConfig({
  // 基础配置
  base: './',
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@js': resolve(__dirname, 'src/js'),
      '@css': resolve(__dirname, 'src/css'),
      '@data': resolve(__dirname, 'data'),
      '@public': resolve(__dirname, 'public')
    }
  },
  
  // 多页面入口配置
  build: {
    rollupOptions: {
      input: {
        // 首页
        index: resolve(__dirname, 'index.html'),
        // 建筑成就页
        achievement: resolve(__dirname, 'src/view/achievement/index.html'),
        // 杰出科学家页
        scientist: resolve(__dirname, 'src/view/scientist/index.html'),
        // 建筑著作页
        literature: resolve(__dirname, 'src/view/literature/index.html'),
        // 建筑文化页
        culture: resolve(__dirname, 'src/view/culture/index.html'),
        // 过渡动画页
        transition: resolve(__dirname, 'src/view/transition/index.html')
      },
      output: {
        // 输出目录结构
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        manualChunks: {
          echarts: ['echarts'],
          gsap: ['gsap']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // 输出目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true,
    // 启用 source map
    sourcemap: true
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
    cors: true,
    // 代理配置（如需请求外部API）
    proxy: {}
  },
  
  // CSS 配置
  css: {
    devSourcemap: true
  },
  
  // 优化依赖
  optimizeDeps: {
    include: ['echarts', 'gsap']
  }
});
