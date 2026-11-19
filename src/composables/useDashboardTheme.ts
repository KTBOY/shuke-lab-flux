import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { FLUX_THEMES } from '@/data/fluxThemes'
import type { FluxTheme } from '@/data/fluxThemes'
import { BRIDGE_TOKEN_NAMES, fluxThemeToTokens } from '@/data/themeBridge'

/**
 * @Author: zlc
 * @Description: 仪表盘主题状态 —— 实验室选中的 FLUX 主题经 themeBridge 映射后写到 documentElement，
 *               CSS 变量级联让全站立即换肤；状态挂模块级单例（与 useOnboardingTasks 同款，
 *               仓库不用 Pinia），localStorage 只存主题 id，映射值永远现算不落盘。
 */

/** 持久化键：只存主题 id，主题数据以 fluxThemes.ts 为唯一权威 */
export const DASHBOARD_THEME_STORAGE_KEY = 'crestio-theme'

const currentThemeId = ref<string | null>(null)
/** 每次应用/清除自增一，供图表这类「setup 时读一次令牌」的消费者订阅重建 */
const themeVersion = ref(0)

const currentTheme = computed<FluxTheme | null>(
  () => FLUX_THEMES.find((theme) => theme.id === currentThemeId.value) ?? null,
)

/*
 * 站点支持直接双击 dist/index.html 打开，个别环境下 localStorage 访问会抛错；
 * 持久化失败只意味着刷新不恢复，绝不能把换肤本身拖垮，故读写各裹一层。
 */
function readStoredThemeId(): string | null {
  try {
    return window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredThemeId(id: string | null): void {
  try {
    if (id === null) window.localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY)
    else window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, id)
  } catch {
    /* 忽略：见上方注释 */
  }
}

export interface UseDashboardTheme {
  /** 当前应用的主题 id，未应用（默认黄色令牌）时为 null */
  currentThemeId: Ref<string | null>
  /** 当前应用的主题对象，与 currentThemeId 同步 */
  currentTheme: ComputedRef<FluxTheme | null>
  /** 换肤版本号，应用与清除都会自增 */
  themeVersion: Ref<number>
  /** 应用一套 FLUX 主题到全站；id 不存在时返回 false 且不改任何状态 */
  applyTheme: (id: string) => boolean
  /** 摘掉全部桥接变量并清掉持久化，回到 tokens.css 的默认主题 */
  clearTheme: () => void
  /** 启动时恢复上次应用的主题；无记录或记录已失效时返回 false */
  restoreTheme: () => boolean
}

export function useDashboardTheme(): UseDashboardTheme {
  function applyTheme(id: string): boolean {
    const theme = FLUX_THEMES.find((item) => item.id === id)
    if (!theme) return false

    const tokens = fluxThemeToTokens(theme)
    const root = document.documentElement.style
    for (const name of BRIDGE_TOKEN_NAMES) root.setProperty(name, tokens[name])

    currentThemeId.value = id
    writeStoredThemeId(id)
    themeVersion.value += 1
    return true
  }

  function clearTheme(): void {
    const root = document.documentElement.style
    for (const name of BRIDGE_TOKEN_NAMES) root.removeProperty(name)

    currentThemeId.value = null
    writeStoredThemeId(null)
    themeVersion.value += 1
  }

  function restoreTheme(): boolean {
    const stored = readStoredThemeId()
    if (!stored) return false
    return applyTheme(stored)
  }

  return { currentThemeId, currentTheme, themeVersion, applyTheme, clearTheme, restoreTheme }
}
