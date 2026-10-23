import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite 配置 - 多页面应用 (MPA)
 *
 * base 路径规则：
 *   开发时用 '/'（本地 localhost 根）
 *   构建时用 '/ancient-architecture-viz/'（GitHub Pages 仓库子路径）
 *   通过 defineConfig 的函数形式根据 command 自动判断
 */
export default defineConfig(({ command }) => {
  // command = 'serve'（npm run dev）或 'build'（npm run build）
  const base = command === 'serve' ? '/' : '/ancient-architecture-viz/';

  return {
    base,

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
      // 每个入口独立输出 CSS，确保各页面 <link> 正确注入（MPA 下 false 会导致部分页面丢样式）
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          home: resolve(__dirname, 'src/view/home/index.html'),
          achievement: resolve(__dirname, 'src/view/achievement/index.html'),
          scientist: resolve(__dirname, 'src/view/scientist/index.html'),
          literature: resolve(__dirname, 'src/view/literature/index.html'),
          culture: resolve(__dirname, 'src/view/culture/index.html'),
          atlas: resolve(__dirname, 'src/view/atlas/index.html')
        },
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          manualChunks(id) {
            if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender')) {
              return 'echarts';
            }
            if (id.includes('node_modules/gsap')) {
              return 'gsap';
            }
          },
          assetFileNames: (assetInfo) => {
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return 'images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800
    },

    // 开发服务器配置
    server: {
      port: 5173,
      open: true,
      cors: true,
      proxy: {}
    },

    // CSS 配置
    css: {
      devSourcemap: false
    },

    // 优化依赖
    optimizeDeps: {
      include: ['echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers', 'gsap']
    }
  };
});
