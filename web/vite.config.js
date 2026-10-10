import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' —— 兼容 GitHub Pages 子路径与 pages.p.diele.me 根域两种部署
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../public-web',
    emptyOutDir: true
  }
})