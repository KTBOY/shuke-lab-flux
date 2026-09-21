/**
 * @Author: zlc
 * @Description: 流体色彩场单测 —— 用假 WebGL 上下文验证共享时钟、暂停/隐藏门控与资源释放
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { fluxFallbackStyle, useFluidField } from '@/composables/useFluidField'
import type { FluidFieldApi } from '@/composables/useFluidField'
import { FLUX_THEMES } from '@/data/fluxThemes'

const theme = FLUX_THEMES[0]

/** 只实现被测代码用到的那部分 WebGL API，并记录调用顺序 */
function createFakeGl() {
  const calls: string[] = []
  const uniformLocation = {}

  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ARRAY_BUFFER: 5,
    STATIC_DRAW: 6,
    FLOAT: 7,
    TRIANGLES: 8,
    createShader: () => ({}),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    getShaderInfoLog: () => '',
    deleteShader: () => {},
    createProgram: () => ({}),
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    getProgramInfoLog: () => '',
    deleteProgram: () => {},
    useProgram: () => {},
    createBuffer: () => ({}),
    bindBuffer: () => {},
    bufferData: () => {},
    getAttribLocation: () => 0,
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    getUniformLocation: () => uniformLocation,
    uniform3fv: (_loc: unknown, value: ArrayLike<number>) =>
      calls.push(`color:${Array.from(value).join(',')}`),
    uniform1f: (_loc: unknown, value: number) => calls.push(`scalar:${value}`),
    uniform2f: () => {},
    viewport: () => {},
    drawArrays: () => calls.push('draw'),
    getExtension: () => ({ loseContext: () => calls.push('loseContext') }),
  }

  return { gl: gl as unknown as WebGLRenderingContext, calls }
}

function mountField(options: { reducedMotion?: boolean } = {}) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  /* setup 里的赋值对调用方的控制流不可见，用 holder 承接而不是写断言 */
  const captured: { field?: FluidFieldApi } = {}

  const Host = defineComponent({
    setup() {
      captured.field = useFluidField(canvas, { theme, seed: 1 })
      return () =>
        h('canvas', {
          ref: (el: unknown) => {
            canvas.value = el as HTMLCanvasElement | null
          },
        })
    },
  })

  if (options.reducedMotion) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
  }

  const wrapper = mount(Host)
  mounted.push(wrapper)
  if (!captured.field) throw new Error('setup 未执行，拿不到色彩场实例')
  return { wrapper, field: captured.field }
}

function drawsOf(calls: string[]): number {
  return calls.filter((call) => call === 'draw').length
}

/**
 * 每帧的上传顺序固定为 uTime、uHover、draw，
 * 所以以 draw 为锚点回取两格才是流动时间，按下标奇偶挑会在切片起点落在帧中间时错位。
 */
function flowTimesOf(calls: string[]): number[] {
  const times: number[] = []
  calls.forEach((call, index) => {
    if (call !== 'draw') return
    const time = calls[index - 2]
    if (time?.startsWith('scalar:')) times.push(Number(time.slice('scalar:'.length)))
  })
  return times
}

/** 时钟是模块级单例：不逐个卸载就会把订阅带进下一个用例，污染帧数与 rafId */
function unmountAll(): void {
  mounted.splice(0).forEach((wrapper) => {
    if (!wrapper.vm.$.isUnmounted) wrapper.unmount()
  })
}

function scalarOf(calls: string[]): number[] {
  return calls
    .filter((call) => call.startsWith('scalar:'))
    .map((call) => Number(call.slice('scalar:'.length)))
}

let fake: ReturnType<typeof createFakeGl>
const mounted: ReturnType<typeof mount>[] = []

beforeEach(() => {
  fake = createFakeGl()
  vi.useFakeTimers()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake.gl)
})

afterEach(() => {
  unmountAll()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useFluidField', () => {
  it('初始化只上传一次三个主色与初相位', () => {
    mountField()

    expect(fake.calls.filter((call) => call.startsWith('color:'))).toEqual(
      theme.colors.map((rgb) => `color:${rgb.join(',')}`),
    )
    /* 初相位 + 每帧的 (uTime, uHover) 成对出现，所以 scalar 的奇数位才是 seed */
    expect(scalarOf(fake.calls)[0]).toBe(1)
  })

  it('运行中每帧推进流动时间并绘制一次', () => {
    mountField()
    const before = fake.calls.length

    vi.advanceTimersByTime(48)
    const times = flowTimesOf(fake.calls.slice(before))

    expect(drawsOf(fake.calls.slice(before))).toBeGreaterThanOrEqual(2)
    expect(times.length).toBeGreaterThanOrEqual(2)
    expect(times.every((value, index) => index === 0 || value > times[index - 1])).toBe(true)
  })

  it('暂停后不再产生绘制，恢复后继续', () => {
    const { field } = mountField()

    field.setRunning(false)
    const frozen = fake.calls.length
    vi.advanceTimersByTime(64)
    expect(fake.calls.length).toBe(frozen)

    field.setRunning(true)
    vi.advanceTimersByTime(64)
    expect(drawsOf(fake.calls.slice(frozen))).toBeGreaterThanOrEqual(1)
  })

  it('被筛选隐藏的卡片跳过绘制但不销毁上下文', () => {
    const { field } = mountField()

    field.setVisible(false)
    const hidden = fake.calls.length
    vi.advanceTimersByTime(64)
    expect(drawsOf(fake.calls.slice(hidden))).toBe(0)

    field.setVisible(true)
    vi.advanceTimersByTime(64)
    expect(drawsOf(fake.calls.slice(hidden))).toBeGreaterThanOrEqual(1)
    expect(fake.calls).not.toContain('loseContext')
  })

  it('减弱动效时只定格渲染一帧，不订阅时钟', () => {
    const { field } = mountField({ reducedMotion: true })

    expect(field.running.value).toBe(false)
    const still = drawsOf(fake.calls)
    vi.advanceTimersByTime(200)
    expect(drawsOf(fake.calls)).toBe(still)
    expect(still).toBe(1)
  })

  it('卸载时归还 WebGL 上下文', () => {
    const { wrapper } = mountField()

    wrapper.unmount()

    expect(fake.calls).toContain('loseContext')
  })

  it('拿不到 WebGL 上下文时标记为不支持而不是抛错', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)

    const { field, wrapper } = mountField()

    expect(field.supported.value).toBe(false)
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it('着色器编译失败时落到不支持分支', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    fake.gl.getShaderParameter = () => false

    const { field } = mountField()

    expect(field.supported.value).toBe(false)
    expect(error).toHaveBeenCalled()
  })

  it('着色器程序链接失败时落到不支持分支', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    fake.gl.getProgramParameter = () => false

    const { field } = mountField()

    expect(field.supported.value).toBe(false)
    expect(error).toHaveBeenCalled()
  })

  it('降级兜底渐变覆盖主题的三个主色', () => {
    const style = fluxFallbackStyle(theme)

    expect(style).toContain('linear-gradient')
    theme.colors.forEach(([r, g, b]) => {
      expect(style).toContain(`rgb(${r * 255} ${g * 255} ${b * 255})`)
    })
  })

  it('指针划动抬高流速，停下后衰减回静止值', () => {
    const { field } = mountField()

    const flowSteps = (): number[] => {
      const marks: number[] = []
      for (let i = 0; i < 3; i++) {
        const before = flowTimesOf(fake.calls).at(-1) ?? 0
        vi.advanceTimersByTime(16)
        marks.push((flowTimesOf(fake.calls).at(-1) ?? 0) - before)
      }
      return marks
    }

    /* 先跑一帧建立基线，否则第一次差值会把随机初相位当成增量 */
    vi.advanceTimersByTime(16)

    const idle = flowSteps()
    /* 第一次只有坐标、没有位移，不该产生能量 */
    field.trackPointer(0, 0)
    field.trackPointer(180, 40)
    field.trackPointer(360, 90)
    const stirred = flowSteps()

    expect(Math.max(...stirred)).toBeGreaterThan(Math.max(...idle) * 2)

    vi.advanceTimersByTime(2000)
    const settled = flowSteps()

    expect(Math.max(...settled)).toBeLessThan(Math.max(...stirred) / 2)
  })
})
