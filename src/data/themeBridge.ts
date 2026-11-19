/**
 * @Author: zlc
 * @Description: FLUX → 仪表盘主题桥接 —— 把实验室主题的三色（0~1 RGB 元组，供 shader uniform）
 *               翻译成仪表盘的设计令牌变量集合。纯函数层：不碰 DOM、不读存储，
 *               应用与持久化归 composables/useDashboardTheme，这里只负责「一套主题该映射成什么」。
 */
import type { FluxRgb, FluxTheme } from '@/data/fluxThemes'

/**
 * 映射口径（定死在此，改口径先改这段注释再改代码）：
 * - colors[1] 是三色里通常最饱和的中间色 → --c-accent 品牌强调主色；
 * - colors[0] 是渐变的起始端 → --c-accent-deep 渐变深端与图表高亮柱，两端同源才不出色族；
 * - colors[2] 向白色混合 88% → --c-accent-soft 渐变浅端与胶囊底色：原色太饱和，
 *   直接当浅底会抢内容，只能留一成色相；
 * - colors[2] 原色 → 星图 --star-accent，--star-accent-soft / --star-glow 取它向白的
 *   88% / 55% 混合，与星图现收口在组件根的三色同构，接管时只需删组件里的本地声明。
 * 映射值一律 6 位十六进制：crestioChartTheme 会给 --c-accent 家族追加 alpha 后缀，
 * rgb() 形态过不了那条路径。
 */

/** 桥接会写到的全部令牌名，恢复默认时按这份清单逐个摘除 */
export const BRIDGE_TOKEN_NAMES: readonly string[] = [
  '--c-accent',
  '--c-accent-deep',
  '--c-accent-soft',
  '--star-accent',
  '--star-accent-soft',
  '--star-glow',
]

/** accent-soft 的混白比例：只留 12% 原色 */
const SOFT_MIX = 0.88
/** 星图光晕的混白比例：比 soft 更亮一档，落在 soft 与原色之间偏亮处 */
const GLOW_MIX = 0.55

const WHITE: FluxRgb = [1, 1, 1]

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** FLUX 的 0~1 RGB 元组 → CSS 六位十六进制（分量先钳制再四舍五入到 0~255） */
export function fluxRgbToHex(rgb: FluxRgb): string {
  const channel = (value: number) =>
    Math.round(clamp01(value) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`
}

/** 两色线性混合，ratio 是向 b 靠拢的比例（0 = 全 a，1 = 全 b），在 0~1 空间算完再转 hex */
export function mixFluxRgb(a: FluxRgb, b: FluxRgb, ratio: number): FluxRgb {
  const t = clamp01(ratio)
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** 一套 FLUX 主题 → 仪表盘令牌映射表（键即 BRIDGE_TOKEN_NAMES，顺序与之一致） */
export function fluxThemeToTokens(theme: FluxTheme): Record<string, string> {
  const [first, second, third] = theme.colors
  return {
    '--c-accent': fluxRgbToHex(second),
    '--c-accent-deep': fluxRgbToHex(first),
    '--c-accent-soft': fluxRgbToHex(mixFluxRgb(third, WHITE, SOFT_MIX)),
    '--star-accent': fluxRgbToHex(third),
    '--star-accent-soft': fluxRgbToHex(mixFluxRgb(third, WHITE, SOFT_MIX)),
    '--star-glow': fluxRgbToHex(mixFluxRgb(third, WHITE, GLOW_MIX)),
  }
}

/** 一套主题 → 可直接贴进任意项目 :root 的 CSS 文本（导出配色用） */
export function fluxThemeToCssText(theme: FluxTheme): string {
  const tokens = fluxThemeToTokens(theme)
  const lines = BRIDGE_TOKEN_NAMES.map((name) => `  ${name}: ${tokens[name]};`)
  return `:root {\n${lines.join('\n')}\n}\n`
}

/** 一套主题 → JSON 色板（三色原色 hex + 派生令牌，导出配色用） */
export function fluxThemeToJson(theme: FluxTheme): string {
  return JSON.stringify(
    {
      id: theme.id,
      name: theme.en,
      colors: theme.colors.map((rgb) => fluxRgbToHex(rgb)),
      tokens: fluxThemeToTokens(theme),
    },
    null,
    2,
  )
}
