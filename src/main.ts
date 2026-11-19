/**
 * @Author: zlc
 * @Description: 应用入口 —— 字体、设计令牌、基础样式、路由与根组件挂载
 */
import { createApp } from 'vue'
import '@fontsource-variable/inter'
import '@/styles/tokens.css'
import '@/styles/base.css'
import App from '@/App.vue'
import { useAuth } from '@/composables/useAuth'
import { useColorMode } from '@/composables/useColorMode'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import { router } from '@/router'

/* 挂载前先恢复上次应用的 FLUX 主题：根元素变量赶在首帧之前就位，刷新才不会先闪回默认黄色 */
useDashboardTheme().restoreTheme()
/* 深浅模式同理：data-theme 属性赶在首帧之前落位，深色用户刷新不会先闪一帧白 */
useColorMode().restoreColorMode()
/* 登录态同理：守卫在首次导航就会读它，必须赶在路由装上之前恢复，否则刷新管理区会被误送去登录页 */
useAuth().restore()

createApp(App).use(router).mount('#app')
