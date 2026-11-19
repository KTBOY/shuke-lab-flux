/**
 * @Author: zlc
 * @Description: 演示登录状态单测 —— 契约是「身份只能来自 permissions 演示用户、登录落盘只存 id、
 *               恢复时失效记录会被清掉」，以及守卫判定与回跳消毒这两个纯函数的全矩阵。
 *               状态挂模块作用域，用例之间重置模块并清 localStorage。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION_USERS } from '@/data/permissions'

const STORAGE_KEY = 'crestio-auth-user'

async function useStore() {
  const mod = await import('@/composables/useAuth')
  return { mod, auth: mod.useAuth() }
}

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
})

describe('useAuth', () => {
  it('初始未登录：currentUser 与 id 都是 null', async () => {
    const { auth } = await useStore()

    expect(auth.isLoggedIn.value).toBe(false)
    expect(auth.currentUserId.value).toBeNull()
    expect(auth.currentUser.value).toBeNull()
  })

  it('loginAs 以真实演示用户登录：状态与落盘同步，用户对象从数据层现查', async () => {
    const { auth } = await useStore()
    const target = PERMISSION_USERS[0]
    if (!target) throw new Error('演示用户为空，用例前提不成立')

    expect(auth.loginAs(target.id)).toBe(true)

    expect(auth.isLoggedIn.value).toBe(true)
    expect(auth.currentUserId.value).toBe(target.id)
    /* computed 交出的是响应式代理，与数据层原对象不是同一引用，按字段断言即可 */
    expect(auth.currentUser.value?.id).toBe(target.id)
    expect(auth.currentUser.value?.name).toBe(target.name)
    expect(auth.currentUser.value?.roleIds).toEqual(target.roleIds)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(target.id)
  })

  it('loginAs 拒绝不存在的 id：返回 false 且不改状态、不落盘', async () => {
    const { auth } = await useStore()

    expect(auth.loginAs('no-such-user')).toBe(false)

    expect(auth.isLoggedIn.value).toBe(false)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('logout 清状态并摘掉持久化记录', async () => {
    const { auth } = await useStore()
    auth.loginAs('zhou-mingyuan')

    auth.logout()

    expect(auth.isLoggedIn.value).toBe(false)
    expect(auth.currentUser.value).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('restore：有有效记录时恢复登录', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'lin-xiaolu')
    const { auth } = await useStore()

    expect(auth.restore()).toBe(true)
    expect(auth.currentUser.value?.name).toBe('林小鹿')
  })

  it('restore：记录里的 id 已不存在时不恢复，并清掉失效记录', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'deleted-user')
    const { auth } = await useStore()

    expect(auth.restore()).toBe(false)
    expect(auth.isLoggedIn.value).toBe(false)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('restore：无记录时返回 false', async () => {
    const { auth } = await useStore()

    expect(auth.restore()).toBe(false)
    expect(auth.isLoggedIn.value).toBe(false)
  })

  it('一键体验默认身份是周明远（超级管理员）且真实存在', async () => {
    const { mod } = await useStore()
    const demo = PERMISSION_USERS.find((user) => user.id === mod.DEMO_LOGIN_USER_ID)

    expect(demo?.name).toBe('周明远')
    expect(demo?.roleIds).toContain('super')
  })
})

describe('guardVerdict', () => {
  it('管理区未登录 → 去登录页', async () => {
    const { mod } = await useStore()
    expect(
      mod.guardVerdict({ requiresAuth: true, isLoginRoute: false, isAuthenticated: false }),
    ).toBe('to-login')
  })

  it('管理区已登录 → 放行', async () => {
    const { mod } = await useStore()
    expect(
      mod.guardVerdict({ requiresAuth: true, isLoginRoute: false, isAuthenticated: true }),
    ).toBe('allow')
  })

  it('公开页未登录 → 放行（实验室不挡演示流量）', async () => {
    const { mod } = await useStore()
    expect(
      mod.guardVerdict({ requiresAuth: false, isLoginRoute: false, isAuthenticated: false }),
    ).toBe('allow')
  })

  it('已登录访问登录页 → 回仪表盘', async () => {
    const { mod } = await useStore()
    expect(
      mod.guardVerdict({ requiresAuth: false, isLoginRoute: true, isAuthenticated: true }),
    ).toBe('to-dashboard')
  })

  it('未登录访问登录页 → 放行（不然没人能登录）', async () => {
    const { mod } = await useStore()
    expect(
      mod.guardVerdict({ requiresAuth: false, isLoginRoute: true, isAuthenticated: false }),
    ).toBe('allow')
  })
})

describe('resolvePostLoginTarget', () => {
  it('站内路径原样回跳', async () => {
    const { mod } = await useStore()
    expect(mod.resolvePostLoginTarget('/users')).toBe('/users')
    expect(mod.resolvePostLoginTarget('/permissions')).toBe('/permissions')
  })

  it('缺省、空串与非字符串一律回落仪表盘', async () => {
    const { mod } = await useStore()
    expect(mod.resolvePostLoginTarget(undefined)).toBe('/dashboard')
    expect(mod.resolvePostLoginTarget('')).toBe('/dashboard')
    expect(mod.resolvePostLoginTarget(['/users'])).toBe('/dashboard')
  })

  it('指回登录页与站外地址都被消毒掉，防自跳循环与开放重定向', async () => {
    const { mod } = await useStore()
    expect(mod.resolvePostLoginTarget('/login')).toBe('/dashboard')
    expect(mod.resolvePostLoginTarget('/login?redirect=/users')).toBe('/dashboard')
    expect(mod.resolvePostLoginTarget('https://example.com/users')).toBe('/dashboard')
    expect(mod.resolvePostLoginTarget('//example.com/users')).toBe('/dashboard')
  })
})
