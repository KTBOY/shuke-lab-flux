/**
 * @Author: zlc
 * @Description: 数字滚动单测 —— 终值落点、滚动途中格式定版、减动效直达与销毁取消
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { EffectScope } from 'vue'
import { useCountUp } from '@/composables/useCountUp'
import type { UseCountUp, UseCountUpOptions } from '@/composables/useCountUp'

/* rAF 手动排队：逐帧喂时间戳，滚动进度完全由测试掌控，不依赖真实时钟 */
let rafQueue = new Map<number, FrameRequestCallback>()
let nextRafId = 1
let realMatchMedia: typeof window.matchMedia

function stepFrames(...times: number[]): void {
  for (const time of times) {
    const callbacks = [...rafQueue.values()]
    rafQueue.clear()
    callbacks.forEach((callback) => callback(time))
  }
}

function withCountUp(target: number, options?: UseCountUpOptions) {
  const scope: EffectScope = effectScope()
  const api: UseCountUp | undefined = scope.run(() => useCountUp(target, options))
  if (!api) throw new Error('effectScope.run 未返回滚动实例')
  return { scope, ...api }
}

beforeEach(() => {
  rafQueue = new Map()
  nextRafId = 1
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
    const id = nextRafId
    nextRafId += 1
    rafQueue.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number): void => {
    rafQueue.delete(id)
  })
  realMatchMedia = window.matchMedia
})

afterEach(() => {
  window.matchMedia = realMatchMedia
  vi.unstubAllGlobals()
})

describe('useCountUp', () => {
  it('从 0 起滚，时长走完后精确落在终值', () => {
    const { value, text, scope } = withCountUp(203, { duration: 1000 })

    expect(text.value).toBe('0')

    stepFrames(0, 500)
    expect(value.value).toBeGreaterThan(0)
    expect(value.value).toBeLessThan(203)

    stepFrames(1000)
    expect(value.value).toBe(203)
    expect(text.value).toBe('203')
    /* 落点后不再排队下一帧 */
    expect(rafQueue.size).toBe(0)
    scope.stop()
  })

  it('滚动途中格式与终值同版：小数位、千分位与后缀都不乱跳', () => {
    const { text, scope } = withCountUp(1234.5, {
      duration: 1000,
      decimals: 2,
      grouping: true,
      suffix: '%',
    })
    const pattern = /^\d{1,3}(,\d{3})*\.\d{2}%$/

    stepFrames(0, 300, 700)
    expect(text.value).toMatch(pattern)
    expect(text.value).not.toBe('1,234.50%')

    stepFrames(1000)
    expect(text.value).toBe('1,234.50%')
    scope.stop()
  })

  it('落定前 finalText 恒为空，落定那一刻一次性写入终值（aria-live 只播报终值）', () => {
    const { text, settled, finalText, scope } = withCountUp(78, { duration: 1000 })

    expect(settled.value).toBe(false)
    expect(finalText.value).toBe('')

    stepFrames(0, 500)
    /* 动画途中展示文案在变，但 live 专用文案不跟着逐帧写 */
    expect(text.value).not.toBe('0')
    expect(settled.value).toBe(false)
    expect(finalText.value).toBe('')

    stepFrames(1000)
    expect(settled.value).toBe(true)
    expect(finalText.value).toBe('78')
    scope.stop()
  })

  it('减动效时不排帧，直接显示终值', () => {
    window.matchMedia = (query: string): MediaQueryList =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList

    const { value, text, settled, finalText, scope } = withCountUp(78)

    expect(value.value).toBe(78)
    expect(text.value).toBe('78')
    /* 减动效直达终值同样算落定，live 区拿到的就是终值 */
    expect(settled.value).toBe(true)
    expect(finalText.value).toBe('78')
    expect(rafQueue.size).toBe(0)
    scope.stop()
  })

  it('作用域销毁即取消未完成的帧，之后推帧不再变化也不报错', () => {
    const { value, text, scope } = withCountUp(56, { duration: 1000 })

    stepFrames(0, 200)
    const frozenValue = value.value
    const frozenText = text.value
    expect(frozenValue).toBeGreaterThan(0)

    scope.stop()
    expect(rafQueue.size).toBe(0)

    stepFrames(500, 1000)
    expect(value.value).toBe(frozenValue)
    expect(text.value).toBe(frozenText)
  })
})
