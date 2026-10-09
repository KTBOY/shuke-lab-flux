/**
 * @Author: zlc
 * @Description: 路由表 —— 外壳常驻，三个页面（FLUX Vue 版 / 仪表盘 / FLUX 旧版单文件）挂在其下
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import FluxStudioView from '@/views/FluxStudioView.vue'

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
        name: ROUTE_NAME.colorLab,
        // 首页即实验室：静态引入留在入口 chunk，避免落地多一次网络往返才出画面
        component: FluxStudioView,
      },
      {
        // 实验室升为首页前的地址，站点已公开且被 README 链接过，留一条跳转避免死链
        path: 'color-lab',
        redirect: { name: ROUTE_NAME.colorLab },
      },
      {
        path: 'dashboard',
        name: ROUTE_NAME.dashboard,
        // 仪表盘与它的九块卡片只在点进去时才要下载
        component: () => import('@/views/DashboardView.vue'),
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
