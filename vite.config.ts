import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成sourcemap
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['echarts', 'echarts-for-react'],
          utils: ['lodash', 'xlsx']
        }
      }
    },
    // 资源大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    open: true
  },
  
  // 预览配置
  preview: {
    port: 4173,
    host: true
  },
  
  // 基础路径配置（支持子路径部署）
  base: './'
})
