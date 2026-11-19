/**
 * @Author: zlc
 * @Description: 深浅色模式状态单测 —— 契约是「手动切换即写 data-theme + 落盘、恢复时记录优先于系统偏好、
 *               系统回退不落盘」，且与桥接主题（--c-accent 家族内联变量）互不干扰。
 *               状态挂模块作用域，用例之间重置模块并清掉根元素属性与 localStorage。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fluxThemeToTokens } from '@/data/themeBridge'

const STORAGE_KEY = 'crestio-color-mode'

const originalMatchMedia = window.matchMedia

async function useStore() {
  const mod = await import('@/composables/useColorMode')
  return mod.useColorMode()
}

/** 桩掉系统偏好：setup.ts 的默认桩恒为浅色，需要深色系统的用例用这个翻过来 */
function stubSystemDark(dark: boolean): void {
  window.matchMedia = (query: string) =>
    ({
      matches: dark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

function themeAttr(): string | null {
  return document.documentElement.getAttribute('data-theme')
}

beforeEach(() => {
  vi.resetModules()
  window.matchMedia = originalMatchMedia
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('style')
})

describe('useColorMode', () => {
  it('初始为浅色：无 data-theme 属性、无版本变化', async () => {
    const { colorMode, isDark, colorModeVersion } = await useStore()

    expect(colorMode.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(colorModeVersion.value).toBe(0)
    expect(themeAttr()).toBeNull()
  })

  it('恢复：无记录且系统浅色时保持浅色，且不落盘', async () => {
    stubSystemDark(false)
    const store = await useStore()

    expect(store.restoreColorMode()).toBe('light')

    expect(store.colorMode.value).toBe('light')
    expect(themeAttr()).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(store.colorModeVersion.value).toBe(0)
  })

  it('恢复：无记录且系统深色时进入深色，但不落盘（系统偏好变了仍跟随）', async () => {
    stubSystemDark(true)
    const store = await useStore()

    expect(store.restoreColorMode()).toBe('dark')

    expect(store.isDark.value).toBe(true)
    expect(themeAttr()).toBe('dark')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(store.colorModeVersion.value).toBe(1)
  })

  it('恢复：持久化记录优先于系统偏好', async () => {
    stubSystemDark(true)
    window.localStorage.setItem(STORAGE_KEY, 'light')
    const lightStore = await useStore()
    expect(lightStore.restoreColorMode()).toBe('light')
    expect(themeAttr()).toBeNull()

    stubSystemDark(false)
    window.localStorage.setItem(STORAGE_KEY, 'dark')
    const darkStore = await useStore()
    expect(darkStore.restoreColorMode()).toBe('dark')
    expect(themeAttr()).toBe('dark')
  })

  it('恢复：记录已失效（非 light/dark）时按系统偏好回退', async () => {
    stubSystemDark(false)
    window.localStorage.setItem(STORAGE_KEY, 'solarized')
    const store = await useStore()

    expect(store.restoreColorMode()).toBe('light')
    expect(themeAttr()).toBeNull()
  })

  it('手动切换写属性并落盘，重复切到同一模式是幂等的', async () => {
    const store = await useStore()

    store.setColorMode('dark')
    expect(store.isDark.value).toBe(true)
    expect(themeAttr()).toBe('dark')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(store.colorModeVersion.value).toBe(1)

    store.setColorMode('dark')
    expect(store.colorModeVersion.value).toBe(1)
  })

  it('toggle 翻转：切回浅色时摘掉属性并把记录改回 light', async () => {
    const store = await useStore()

    store.toggleColorMode()
    expect(store.colorMode.value).toBe('dark')
    expect(themeAttr()).toBe('dark')

    store.toggleColorMode()
    expect(store.colorMode.value).toBe('light')
    expect(themeAttr()).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light')
    expect(store.colorModeVersion.value).toBe(2)
  })

  it('与桥接主题共存：切深浅不动 --c-accent 家族，恢复默认主题也不动 data-theme', async () => {
    const colorStore = await useStore()
    const themeMod = await import('@/composables/useDashboardTheme')
    const themeStore = themeMod.useDashboardTheme()
    const { FLUX_THEMES } = await import('@/data/fluxThemes')
    const aurora = FLUX_THEMES.find((theme) => theme.id === 'aurora')
    if (!aurora) throw new Error('主题数据里没有 aurora，用例前提不成立')
    const auroraTokens = fluxThemeToTokens(aurora)

    themeStore.applyTheme('aurora')
    colorStore.setColorMode('dark')

    expect(document.documentElement.style.getPropertyValue('--c-accent')).toBe(
      auroraTokens['--c-accent'],
    )
    expect(themeAttr()).toBe('dark')

    colorStore.setColorMode('light')
    expect(document.documentElement.style.getPropertyValue('--c-accent')).toBe(
      auroraTokens['--c-accent'],
    )
    expect(themeAttr()).toBeNull()

    colorStore.setColorMode('dark')
    themeStore.clearTheme()
    expect(document.documentElement.style.getPropertyValue('--c-accent')).toBe('')
    expect(themeAttr()).toBe('dark')
  })
})
