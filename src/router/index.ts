/**
 * @Author: zlc
 * @Description: 路由表 —— 外壳常驻，六个页面（FLUX Vue 版 / 仪表盘 / 用户管理 / 权限星图 / FLUX 旧版单文件 / 404）挂在其下；
 *               登录页是外壳之外的独立顶层页。管理区三页带 meta.requiresAuth，守卫判定收口在 useAuth 的 guardVerdict
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import FluxStudioView from '@/views/FluxStudioView.vue'
import { guardVerdict, useAuth } from '@/composables/useAuth'

/** 路由名收口在此，组件只引用常量，不散写字面量路径 */
export const ROUTE_NAME = {
  dashboard: 'dashboard',
  users: 'users',
  permissions: 'permissions',
  colorLab: 'color-lab',
  colorLabLegacy: 'color-lab-legacy',
  notFound: 'not-found',
  login: 'login',
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
        // 管理区：未登录由守卫送去登录页，判定只认这面 meta 旗，不在守卫里散写路径
        meta: { requiresAuth: true },
        // 仪表盘与它的九块卡片只在点进去时才要下载
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'users',
        name: ROUTE_NAME.users,
        meta: { requiresAuth: true },
        // 用户管理与表格组件只在点进去时才要下载，与仪表盘同一懒加载口径
        component: () => import('@/views/UserManagementView.vue'),
      },
      {
        path: 'permissions',
        name: ROUTE_NAME.permissions,
        meta: { requiresAuth: true },
        // 星图组件只在点进去时才要下载，与仪表盘同一懒加载口径
        component: () => import('@/views/PermissionMapView.vue'),
      },
      {
        path: 'color-lab/legacy',
        name: ROUTE_NAME.colorLabLegacy,
        // 旧版是 iframe 承载的零依赖单文件，与 Vue 版并列保留
        component: () => import('@/views/ColorLabLegacyView.vue'),
      },
      {
        // 兜底必须排在最后：哈希里写了不存在的路径时落到 404 页，而不是外壳里一片空白
        path: ':pathMatch(.*)*',
        name: ROUTE_NAME.notFound,
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  },
  {
    // 登录页不套外壳：它有自己的左右分栏构图，也不该带着顶栏与页脚出现
    path: '/login',
    name: ROUTE_NAME.login,
    component: () => import('@/views/LoginView.vue'),
  },
]

export const router = createRouter({
  // 站点是纯静态托管（GitHub Pages / 直接双击 dist/index.html），没有 SPA rewrite，
  // history 模式下刷新 /color-lab 会被服务端判成 404，故用哈希路由
  history: createWebHashHistory(),
  routes,
})

/*
 * 登录守卫：决策表在 useAuth.guardVerdict（纯函数、有单测），这里只做三件执行动作——
 * 未登录进管理区 → 登录页并带 redirect（登录后原样回跳）；已登录进登录页 → 仪表盘；其余放行。
 * 实验室（含旧版）与 404 没有 requiresAuth，访客直达，不挡演示流量。
 */
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()
  const verdict = guardVerdict({
    requiresAuth: to.matched.some((record) => record.meta.requiresAuth === true),
    isLoginRoute: to.name === ROUTE_NAME.login,
    isAuthenticated: isLoggedIn.value,
  })
  if (verdict === 'to-login') {
    return { name: ROUTE_NAME.login, query: { redirect: to.fullPath } }
  }
  if (verdict === 'to-dashboard') return { name: ROUTE_NAME.dashboard }
  return true
})
