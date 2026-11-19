import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { USER_BY_ID } from '@/data/permissions'
import type { PermissionUser } from '@/data/permissions'

/**
 * @Author: zlc
 * @Description: 演示登录状态 —— 与 useColorMode / useDashboardTheme 并列的模块级单例。
 *               模板项目没有后端，这里不做真鉴权：身份只能从 permissions.ts 的演示
 *               用户里选，密码任意非空即可（口径在登录页明示）。localStorage 只存
 *               用户 id，用户对象永远从数据层现查，数据改了不会读出陈旧副本。
 */

/** 持久化键：只存用户 id，取值必须是 PERMISSION_USERS 里存在的 id，否则视为无记录 */
export const AUTH_STORAGE_KEY = 'crestio-auth-user'

/** 一键体验的默认身份：平台负责人（超级管理员），登录页与测试共用同一口径 */
export const DEMO_LOGIN_USER_ID = 'zhou-mingyuan'

/** 登录后无回跳目标时的落点：管理区首页 */
export const POST_LOGIN_FALLBACK = '/dashboard'

const currentUserId = ref<string | null>(null)

const currentUser = computed<PermissionUser | null>(() =>
  currentUserId.value ? (USER_BY_ID.get(currentUserId.value) ?? null) : null,
)

const isLoggedIn = computed(() => currentUser.value !== null)

/* localStorage 在个别环境（双击 dist 直开等）会抛错，处理口径与 useDashboardTheme 一致：读写各裹一层 */
function readStoredUserId(): string | null {
  try {
    return window.localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredUserId(id: string | null): void {
  try {
    if (id === null) window.localStorage.removeItem(AUTH_STORAGE_KEY)
    else window.localStorage.setItem(AUTH_STORAGE_KEY, id)
  } catch {
    /* 忽略：持久化失败只意味着刷新不恢复，不能把登录本身拖垮 */
  }
}

/* ---------------- 守卫判定（纯函数，路由只负责执行） ---------------- */

export type GuardVerdict = 'allow' | 'to-login' | 'to-dashboard'

export interface GuardInput {
  /** 目标路由是否落在管理区（meta.requiresAuth 收口在路由表，判定不在守卫里散写路径） */
  requiresAuth: boolean
  /** 目标是否是登录页本身 */
  isLoginRoute: boolean
  /** 当前是否已登录 */
  isAuthenticated: boolean
}

/**
 * 守卫的全部决策：管理区未登录 → 去登录页；已登录还去登录页 → 回仪表盘；其余放行。
 * 公开页（实验室 / 旧版 / 404）requiresAuth 为 false，登录与否都不拦。
 */
export function guardVerdict(input: GuardInput): GuardVerdict {
  if (input.isLoginRoute) return input.isAuthenticated ? 'to-dashboard' : 'allow'
  if (input.requiresAuth && !input.isAuthenticated) return 'to-login'
  return 'allow'
}

/**
 * 登录后回跳目标的消毒：只接受站内绝对路径，且不能指回登录页（防自跳循环），
 * 其余一律回落到管理区首页。query 里的 redirect 是外部可写输入，不消毒就是开放重定向。
 */
export function resolvePostLoginTarget(redirect: unknown): string {
  if (typeof redirect !== 'string') return POST_LOGIN_FALLBACK
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return POST_LOGIN_FALLBACK
  if (redirect === '/login' || redirect.startsWith('/login?')) return POST_LOGIN_FALLBACK
  return redirect
}

export interface UseAuth {
  /** 当前登录用户 id，未登录为 null */
  currentUserId: Ref<string | null>
  /** 当前登录用户对象，与 currentUserId 同步从数据层现查 */
  currentUser: ComputedRef<PermissionUser | null>
  /** 是否已登录（守卫与顶栏用户区共用） */
  isLoggedIn: ComputedRef<boolean>
  /** 以指定演示用户登录：id 不存在返回 false 且不改任何状态；成功后落盘 */
  loginAs: (userId: string) => boolean
  /** 退出登录：清状态并摘掉持久化记录 */
  logout: () => void
  /** 启动时恢复：记录里的 id 仍存在才恢复；记录失效时顺手清掉，返回是否已登录 */
  restore: () => boolean
}

export function useAuth(): UseAuth {
  function loginAs(userId: string): boolean {
    if (!USER_BY_ID.has(userId)) return false
    currentUserId.value = userId
    writeStoredUserId(userId)
    return true
  }

  function logout(): void {
    currentUserId.value = null
    writeStoredUserId(null)
  }

  function restore(): boolean {
    const stored = readStoredUserId()
    if (!stored) return false
    if (!USER_BY_ID.has(stored)) {
      /* 演示数据改过、id 已不存在：留着这条记录每次启动都会白跑一趟，直接清掉 */
      writeStoredUserId(null)
      return false
    }
    currentUserId.value = stored
    return true
  }

  return { currentUserId, currentUser, isLoggedIn, loginAs, logout, restore }
}
