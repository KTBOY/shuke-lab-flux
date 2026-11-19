/**
 * @Author: zlc
 * @Description: 仪表盘主题状态单测 —— 契约是「应用即写根元素变量 + 落盘、清除即摘干净、启动能恢复」，
 *               状态挂模块作用域，用例之间重置模块并清掉根元素内联变量与 localStorage
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIDGE_TOKEN_NAMES, fluxThemeToTokens } from '@/data/themeBridge'
import { FLUX_THEMES } from '@/data/fluxThemes'

const STORAGE_KEY = 'crestio-theme'

async function useStore() {
  const mod = await import('@/composables/useDashboardTheme')
  return mod.useDashboardTheme()
}

function rootStyle(): CSSStyleDeclaration {
  return document.documentElement.style
}

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
  for (const name of BRIDGE_TOKEN_NAMES) rootStyle().removeProperty(name)
})

describe('useDashboardTheme', () => {
  it('初始为默认主题：无当前主题、根元素无桥接变量', async () => {
    const { currentThemeId, currentTheme, themeVersion } = await useStore()

    expect(currentThemeId.value).toBeNull()
    expect(currentTheme.value).toBeNull()
    expect(themeVersion.value).toBe(0)
    for (const name of BRIDGE_TOKEN_NAMES) expect(rootStyle().getPropertyValue(name)).toBe('')
  })

  it('应用主题把桥接变量逐个写到根元素，并持久化主题 id', async () => {
    const store = await useStore()
    const aurora = FLUX_THEMES.find((theme) => theme.id === 'aurora')
    if (!aurora) throw new Error('主题数据里没有 aurora，用例前提不成立')

    expect(store.applyTheme('aurora')).toBe(true)

    const tokens = fluxThemeToTokens(aurora)
    for (const name of BRIDGE_TOKEN_NAMES) {
      expect(rootStyle().getPropertyValue(name)).toBe(tokens[name])
    }
    expect(store.currentThemeId.value).toBe('aurora')
    expect(store.currentTheme.value?.en).toBe('AURORA')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('aurora')
    expect(store.themeVersion.value).toBe(1)
  })

  it('应用不存在的主题返回 false 且不改任何状态', async () => {
    const store = await useStore()

    expect(store.applyTheme('no-such-theme')).toBe(false)

    expect(store.currentThemeId.value).toBeNull()
    expect(store.themeVersion.value).toBe(0)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    for (const name of BRIDGE_TOKEN_NAMES) expect(rootStyle().getPropertyValue(name)).toBe('')
  })

  it('切换主题时变量整套换成新主题的映射', async () => {
    const store = await useStore()
    const klein = FLUX_THEMES.find((theme) => theme.id === 'klein')
    if (!klein) throw new Error('主题数据里没有 klein，用例前提不成立')

    store.applyTheme('aurora')
    store.applyTheme('klein')

    expect(rootStyle().getPropertyValue('--c-accent')).toBe(fluxThemeToTokens(klein)['--c-accent'])
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('klein')
    expect(store.themeVersion.value).toBe(2)
  })

  it('恢复默认摘掉全部桥接变量并清掉持久化', async () => {
    const store = await useStore()
    store.applyTheme('aurora')

    store.clearTheme()

    for (const name of BRIDGE_TOKEN_NAMES) expect(rootStyle().getPropertyValue(name)).toBe('')
    expect(store.currentThemeId.value).toBeNull()
    expect(store.currentTheme.value).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(store.themeVersion.value).toBe(2)
  })

  it('启动恢复：localStorage 里有有效 id 时重新应用', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'sunset')
    const store = await useStore()
    const sunset = FLUX_THEMES.find((theme) => theme.id === 'sunset')
    if (!sunset) throw new Error('主题数据里没有 sunset，用例前提不成立')

    expect(store.restoreTheme()).toBe(true)

    expect(store.currentThemeId.value).toBe('sunset')
    expect(rootStyle().getPropertyValue('--c-accent')).toBe(fluxThemeToTokens(sunset)['--c-accent'])
  })

  it('启动恢复：无记录或记录已失效时不动任何状态', async () => {
    const empty = await useStore()
    expect(empty.restoreTheme()).toBe(false)
    expect(empty.currentThemeId.value).toBeNull()

    window.localStorage.setItem(STORAGE_KEY, 'deleted-theme')
    const stale = await useStore()
    expect(stale.restoreTheme()).toBe(false)
    expect(stale.currentThemeId.value).toBeNull()
    for (const name of BRIDGE_TOKEN_NAMES) expect(rootStyle().getPropertyValue(name)).toBe('')
  })
})
