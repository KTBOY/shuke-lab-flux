import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 产物要能落在 GitHub Pages 的项目子路径（/shuke-lab-flux/）下，也可能被本地直接打开，
  // 绝对 base 会让子路径部署时资源全 404，故用相对路径
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
})
