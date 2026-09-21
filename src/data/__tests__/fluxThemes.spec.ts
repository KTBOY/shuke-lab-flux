/**
 * @Author: zlc
 * @Description: FLUX 主题数据单测 —— 结构不变量，以及与旧页内联 CARDS 的一致性对账
 */
import { describe, expect, it } from 'vitest'
// ?raw 由 vite/client 声明，vitest 直接按字符串读入，省掉测试里对 Node 类型的依赖
import legacyHtml from '../../../public/flux/index.html?raw'
import { FLUX_CARD_PRICE, FLUX_THEMES } from '@/data/fluxThemes'

/**
 * 旧版单文件是冻结的，主题数据因此存在两份副本。
 * 这条对账把"两份必须等价"从 README 里的一句话变成会失败的测试。
 */
function readLegacyCards() {
  const start = legacyHtml.indexOf('const CARDS = [')
  const end = legacyHtml.indexOf('];', start)
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)

  return legacyHtml
    .slice(start, end)
    .split('{ id:')
    .slice(1)
    .map((chunk: string) => {
      const id = /'([^']+)'/.exec(chunk)?.[1]
      const paid = /paid:\s*'(#[0-9a-fA-F]{6})'/.exec(chunk)?.[1]
      const colors = /colors:\s*(\[[\s\S]*?\])\s*\}/.exec(chunk)?.[1]
      return { id, paid, colors: colors ? (JSON.parse(colors) as number[][]) : [] }
    })
}

describe('FLUX_THEMES', () => {
  it('六套主题、id 唯一', () => {
    expect(FLUX_THEMES).toHaveLength(6)
    expect(new Set(FLUX_THEMES.map((item) => item.id)).size).toBe(6)
  })

  it('每套主题三个主色，分量都在 0~1', () => {
    FLUX_THEMES.forEach((item) => {
      expect(item.colors).toHaveLength(3)
      item.colors.forEach((rgb) => {
        expect(rgb).toHaveLength(3)
        rgb.forEach((channel) => expect(channel).toBeGreaterThanOrEqual(0))
        rgb.forEach((channel) => expect(channel).toBeLessThanOrEqual(1))
      })
    })
  })

  it('展示字段齐备且 PAID 色是十六进制', () => {
    FLUX_THEMES.forEach((item) => {
      expect(item.en.length).toBeGreaterThan(0)
      expect(item.cn.length).toBeGreaterThan(0)
      expect(item.paid).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('卡片标价为占位常量', () => {
    expect(FLUX_CARD_PRICE).toBe('$128.00')
  })

  it('与旧页内联 CARDS 逐项等价', () => {
    const legacy = readLegacyCards()

    expect(legacy).toHaveLength(FLUX_THEMES.length)
    FLUX_THEMES.forEach((theme, index) => {
      expect(legacy[index]?.id).toBe(theme.id)
      expect(legacy[index]?.paid).toBe(theme.paid)
      expect(legacy[index]?.colors).toEqual(theme.colors.map((rgb) => rgb.map(Number)))
    })
  })
})
