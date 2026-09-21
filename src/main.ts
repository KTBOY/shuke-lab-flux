/**
 * @Author: zlc
 * @Description: 应用入口 —— 字体、设计令牌、基础样式、路由与根组件挂载
 */
import { createApp } from 'vue'
import '@fontsource-variable/inter'
import '@/styles/tokens.css'
import '@/styles/base.css'
import App from '@/App.vue'
import { router } from '@/router'

createApp(App).use(router).mount('#app')
