/**
 * @Author: zlc
 * @Description: Vitest 配置 —— jsdom 环境，测试与被测代码同层放在 __tests__ 下
 */
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    /* jsdom 不实现 matchMedia，动效降级路径需要它才能被断言 */
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/__tests__/*.spec.ts'],
    coverage: {
      provider: 'v8',
      /* 只统计有逻辑的层：组件与样式靠人工视觉验收，不靠覆盖率数字 */
      include: ['src/composables/**', 'src/data/**'],
      exclude: ['src/**/__tests__/**'],
      reporter: ['text', 'html'],
      thresholds: { lines: 80, statements: 80, branches: 70, functions: 75 },
    },
  },
})
