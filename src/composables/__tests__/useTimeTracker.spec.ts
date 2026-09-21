/**
 * @Author: zlc
 * @Description: 工时计时器单测 —— 走时、暂停、重复启动与销毁清理
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { EffectScope } from 'vue'
import { useTimeTracker } from '@/composables/useTimeTracker'

const INITIAL = 2 * 3600 + 35 * 60

function withTracker() {
  const scope: EffectScope = effectScope()
  const api = scope.run(() => useTimeTracker(INITIAL))
  if (!api) throw new Error('effectScope.run 未返回计时器实例')
  return { scope, ...api }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTimeTracker', () => {
  it('初始读数按 HH:MM 补零展示', () => {
    const { display, scope } = withTracker()

    expect(display.value).toBe('02:35')
    scope.stop()
  })

  it('start 之后每秒累加，读数只精确到分钟', () => {
    const { seconds, display, start, scope } = withTracker()

    start()
    vi.advanceTimersByTime(3000)
    expect(seconds.value).toBe(INITIAL + 3)
    expect(display.value).toBe('02:35')

    vi.advanceTimersByTime(58000)
    expect(seconds.value).toBe(INITIAL + 61)
    expect(display.value).toBe('02:36')
    scope.stop()
  })

  it('pause 之后时间冻结，再 start 从冻结处续上', () => {
    const { seconds, start, pause, scope } = withTracker()

    start()
    vi.advanceTimersByTime(2000)
    pause()
    vi.advanceTimersByTime(5000)
    expect(seconds.value).toBe(INITIAL + 2)

    start()
    vi.advanceTimersByTime(1000)
    expect(seconds.value).toBe(INITIAL + 3)
    scope.stop()
  })

  it('重复 start 不会叠出第二个计时器', () => {
    const { seconds, start, scope } = withTracker()

    start()
    start()
    start()
    vi.advanceTimersByTime(1000)

    expect(seconds.value).toBe(INITIAL + 1)
    scope.stop()
  })

  it('作用域销毁即摘掉定时器', () => {
    const { seconds, start, scope } = withTracker()

    start()
    scope.stop()
    vi.advanceTimersByTime(5000)

    expect(seconds.value).toBe(INITIAL)
  })
})
