/**
 * @Author: zlc
 * @Description: FLUX → 仪表盘主题桥接单测 —— 映射口径（哪色去哪个令牌、混白比例）是这里的契约，
 *               期望值以手算写死为主；深端这类「由另一映射派生」的期望直接用混合函数派生，
 *               不另抄一份结果常数，免得实现与用例两处口径漂移。桥接规则一改就必须先改这份用例说明理由
 */
import { describe, expect, it } from 'vitest'
import { FLUX_THEMES } from '@/data/fluxThemes'
import {
  ACCENT_DEEP_SHADE,
  BRIDGE_TOKEN_NAMES,
  fluxRgbToHex,
  fluxThemeToCssText,
  fluxThemeToJson,
  fluxThemeToTokens,
  mixFluxRgb,
} from '@/data/themeBridge'

const aurora = FLUX_THEMES.find((theme) => theme.id === 'aurora')
if (!aurora) throw new Error('主题数据里没有 aurora，用例前提不成立')

describe('fluxRgbToHex', () => {
  it('0~1 分量四舍五入到 0~255 再转十六进制', () => {
    // ORIGINAL 的 colors[0]：1.0 / 0.31 / 0.62 → 255 / 79 / 158
    expect(fluxRgbToHex([1.0, 0.31, 0.62])).toBe('#ff4f9e')
    expect(fluxRgbToHex([0, 0, 0])).toBe('#000000')
    expect(fluxRgbToHex([1, 1, 1])).toBe('#ffffff')
  })

  it('越界分量先钳制再转换', () => {
    expect(fluxRgbToHex([1.2, -0.1, 0.5])).toBe('#ff0080')
  })
})

describe('mixFluxRgb', () => {
  it('ratio 两端分别等于两色本身', () => {
    expect(mixFluxRgb([0.2, 0.4, 0.6], [1, 1, 1], 0)).toEqual([0.2, 0.4, 0.6])
    expect(mixFluxRgb([0.2, 0.4, 0.6], [1, 1, 1], 1)).toEqual([1, 1, 1])
  })

  it('中点是两色的算术平均', () => {
    const mid = mixFluxRgb([0, 0.2, 0.4], [1, 0.6, 0.8], 0.5)
    expect(mid[0]).toBeCloseTo(0.5)
    expect(mid[1]).toBeCloseTo(0.4)
    expect(mid[2]).toBeCloseTo(0.6)
  })
})

describe('fluxThemeToTokens', () => {
  it('每套主题都产出完整的令牌集合，键与 BRIDGE_TOKEN_NAMES 一致', () => {
    for (const theme of FLUX_THEMES) {
      const tokens = fluxThemeToTokens(theme)
      expect(Object.keys(tokens)).toEqual([...BRIDGE_TOKEN_NAMES])
    }
  })

  it('所有映射值都是六位十六进制（图表层要往其后追加 alpha 后缀）', () => {
    for (const theme of FLUX_THEMES) {
      for (const value of Object.values(fluxThemeToTokens(theme))) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  it('AURORA 按定死口径映射：中间色作主色、主色同色深阶作深端、尾色混白作浅端与星图色', () => {
    const tokens = fluxThemeToTokens(aurora)
    // colors[1] = [0.18, 0.48, 1.0]，手算见 fluxRgbToHex 用例
    expect(tokens['--c-accent']).toBe('#2e7aff')
    // 深端不再取 colors[0]（绿 #14e094），而是 accent 向黑混合 ACCENT_DEEP_SHADE 的同色深阶：
    // [0.18, 0.48, 1.0] × (1 − 0.2) = [0.144, 0.384, 0.8]，期望由混合函数派生而非另抄一份结果
    expect(tokens['--c-accent-deep']).toBe(
      fluxRgbToHex(mixFluxRgb(aurora.colors[1], [0, 0, 0], ACCENT_DEEP_SHADE)),
    )
    // colors[2] = [0.55, 0.25, 0.95] 向白混 88% → [0.946, 0.91, 0.994]
    expect(tokens['--c-accent-soft']).toBe('#f1e8fd')
    expect(tokens['--star-accent']).toBe('#8c40f2')
    expect(tokens['--star-accent-soft']).toBe('#f1e8fd')
    // 向白混 55% → [0.7975, 0.6625, 0.9775]
    expect(tokens['--star-glow']).toBe('#cba9f9')
  })

  it('映射与三色同源：accent 家族分别等于对应主色的转换结果', () => {
    for (const theme of FLUX_THEMES) {
      const tokens = fluxThemeToTokens(theme)
      expect(tokens['--c-accent']).toBe(fluxRgbToHex(theme.colors[1]))
      /* 深端与主色同源同色相：由 colors[1] 向黑混合派生，与 colors[0] 无关 */
      expect(tokens['--c-accent-deep']).toBe(
        fluxRgbToHex(mixFluxRgb(theme.colors[1], [0, 0, 0], ACCENT_DEEP_SHADE)),
      )
      expect(tokens['--star-accent']).toBe(fluxRgbToHex(theme.colors[2]))
    }
  })
})

describe('fluxThemeToCssText / fluxThemeToJson', () => {
  it('CSS 文本是完整的 :root 块，每行一个桥接变量', () => {
    const css = fluxThemeToCssText(aurora)
    expect(css.startsWith(':root {\n')).toBe(true)
    expect(css.endsWith('}\n')).toBe(true)
    for (const name of BRIDGE_TOKEN_NAMES) {
      expect(css).toContain(`  ${name}: ${fluxThemeToTokens(aurora)[name]};`)
    }
  })

  it('JSON 色板可解析，含三色原色与同一份令牌映射', () => {
    const parsed = JSON.parse(fluxThemeToJson(aurora)) as {
      id: string
      colors: string[]
      tokens: Record<string, string>
    }
    expect(parsed.id).toBe('aurora')
    expect(parsed.colors).toEqual(aurora.colors.map((rgb) => fluxRgbToHex(rgb)))
    expect(parsed.tokens).toEqual(fluxThemeToTokens(aurora))
  })
})
