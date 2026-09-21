/**
 * @Author: zlc
 * @Description: 路由表 —— 仪表盘与颜色生成器两个页面，并对外提供路由名常量
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

/** 路由名收口在此，组件只引用常量，不散写字面量路径 */
export const ROUTE_NAME = {
  dashboard: 'dashboard',
  colorLab: 'color-lab',
} as const

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAME.dashboard,
    // 首屏落地视图，静态引入留在入口 chunk，避免多一次网络往返才出画面
    component: DashboardView,
  },
  {
    path: '/color-lab',
    name: ROUTE_NAME.colorLab,
    // 颜色生成器自带 WebGL 页面，独立成 chunk，按需才下载
    component: () => import('@/views/ColorLabView.vue'),
  },
]

export const router = createRouter({
  // 站点是纯静态托管（GitHub Pages / 直接双击 dist/index.html），没有 SPA rewrite，
  // history 模式下刷新 /color-lab 会被服务端判成 404，故用哈希路由
  history: createWebHashHistory(),
  routes,
})
