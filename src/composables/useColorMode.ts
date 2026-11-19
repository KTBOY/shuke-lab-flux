import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

/**
 * @Author: zlc
 * @Description: 深浅色模式状态 —— 与 useDashboardTheme 并列的模块级单例，两者正交：
 *               桥接主题改 --c-accent 家族（根元素内联变量），本模块只切根元素的
 *               data-theme 属性，深色取值全在 tokens.css 的 [data-theme='dark'] 令牌套里，
 *               这里不写任何色值。localStorage 只存用户手动选过的模式；首次无记录时
 *               按系统偏好决定默认值且不落盘，系统偏好变了下次进来仍跟随。
 */

export type ColorMode = 'light' | 'dark'

/** 持久化键：只存模式字符串，取值口径见 ColorMode */
export const COLOR_MODE_STORAGE_KEY = 'crestio-color-mode'

const colorMode = ref<ColorMode>('light')
/** 每次实际切换自增一，供图表这类「setup 时读一次令牌」的消费者订阅重建（与 themeVersion 同款） */
const colorModeVersion = ref(0)

const isDark = computed(() => colorMode.value === 'dark')

/* localStorage 在个别环境（双击 dist 直开等）会抛错，处理口径与 useDashboardTheme 一致：读写各裹一层 */
function readStoredColorMode(): ColorMode | null {
  try {
    const value = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function writeStoredColorMode(mode: ColorMode): void {
  try {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  } catch {
    /* 忽略：持久化失败只意味着刷新不恢复，不能把切换本身拖垮 */
  }
}

/** 系统偏好只在首次（无持久化记录）时问一次；不做实时监听跟随，也就没有监听要收尾 */
function systemPreferredMode(): ColorMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export interface UseColorMode {
  /** 当前模式，默认浅色（restoreColorMode 跑过后才是恢复/系统决定的值） */
  colorMode: Ref<ColorMode>
  /** 是否深色，模板里判图标与 aria-pressed 用 */
  isDark: ComputedRef<boolean>
  /** 模式版本号，每次实际切换自增 */
  colorModeVersion: Ref<number>
  /** 手动切换到指定模式：写 data-theme 属性 + 落盘 + 版本自增；已是该模式则什么都不做 */
  setColorMode: (mode: ColorMode) => void
  /** 在深浅之间翻转 */
  toggleColorMode: () => void
  /** 启动时恢复：有持久化记录用记录，没有按系统偏好（且不落盘）；返回最终生效的模式 */
  restoreColorMode: () => ColorMode
}

export function useColorMode(): UseColorMode {
  function applyMode(mode: ColorMode, persist: boolean): void {
    colorMode.value = mode
    /* 浅色是 :root 默认套，摘掉属性即可，不留 data-theme='light' 的半吊子状态 */
    if (mode === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    if (persist) writeStoredColorMode(mode)
    colorModeVersion.value += 1
  }

  function setColorMode(mode: ColorMode): void {
    if (mode === colorMode.value && colorModeVersion.value > 0) return
    applyMode(mode, true)
  }

  function toggleColorMode(): void {
    setColorMode(isDark.value ? 'light' : 'dark')
  }

  function restoreColorMode(): ColorMode {
    const stored = readStoredColorMode()
    if (stored) applyMode(stored, true)
    else if (systemPreferredMode() === 'dark') applyMode('dark', false)
    return colorMode.value
  }

  return { colorMode, isDark, colorModeVersion, setColorMode, toggleColorMode, restoreColorMode }
}
