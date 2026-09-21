/**
 * @Author: zlc
 * @Description: 路由表 —— 外壳常驻，三个页面（仪表盘 / FLUX Vue 版 / FLUX 旧版单文件）挂在其下
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import DashboardView from '@/views/DashboardView.vue'

/** 路由名收口在此，组件只引用常量，不散写字面量路径 */
export const ROUTE_NAME = {
  dashboard: 'dashboard',
  colorLab: 'color-lab',
  colorLabLegacy: 'color-lab-legacy',
} as const

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppShell,
    children: [
      {
        path: '',
        name: ROUTE_NAME.dashboard,
        // 首屏落地视图，静态引入留在入口 chunk，避免多一次网络往返才出画面
        component: DashboardView,
      },
      {
        path: 'color-lab',
        name: ROUTE_NAME.colorLab,
        // WebGL 材质与六张画布的开销只在这一页承担，独立成 chunk 按需下载
        component: () => import('@/views/FluxStudioView.vue'),
      },
      {
        path: 'color-lab/legacy',
        name: ROUTE_NAME.colorLabLegacy,
        // 旧版是 iframe 承载的零依赖单文件，与 Vue 版并列保留
        component: () => import('@/views/ColorLabLegacyView.vue'),
      },
    ],
  },
]

export const router = createRouter({
  // 站点是纯静态托管（GitHub Pages / 直接双击 dist/index.html），没有 SPA rewrite，
  // history 模式下刷新 /color-lab 会被服务端判成 404，故用哈希路由
  history: createWebHashHistory(),
  routes,
})
