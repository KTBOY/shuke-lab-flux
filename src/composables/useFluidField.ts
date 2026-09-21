/**
 * @Author: zlc
 * @Description: FLUX 流体色彩场 —— 一块画布一个 WebGL 上下文，全部画布共用一条 rAF 时钟
 */
import { computed, onMounted, onScopeDispose, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { FLUX_FRAG, FLUX_VERT } from '@/webgl/fluxShader'
import type { FluxTheme } from '@/data/fluxThemes'

type Frame = (dt: number) => void

/**
 * 模块级时钟：六张画布各起一条 rAF 会让主线程排六次回调，合成器也得等六遍。
 * 收成一条后每帧只遍历一次，且订阅数归零就自动停摆。
 */
const frames = new Set<Frame>()
let rafId = 0
let lastTick = 0

function step(now: number): void {
  /* 上限 0.1 秒：标签页被挂起后回来不会用巨大的 dt 把画面推走 */
  const dt = Math.min((now - lastTick) / 1000, 0.1)
  lastTick = now
  for (const frame of frames) frame(dt)
  rafId = frames.size ? requestAnimationFrame(step) : 0
}

function startClock(): void {
  if (rafId || !frames.size) return
  lastTick = performance.now()
  rafId = requestAnimationFrame(step)
}

function stopClock(): void {
  if (!rafId) return
  cancelAnimationFrame(rafId)
  rafId = 0
}

/* 后台标签页里 rAF 本就不派发，但切回前台会一次性追帧；显式停摆去掉这一下跳变 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopClock()
  else startClock()
})

function subscribe(frame: Frame): () => void {
  frames.add(frame)
  startClock()
  return () => {
    frames.delete(frame)
    if (!frames.size) stopClock()
  }
}

/** 降级或暂停时展示的那一帧流动时间，取花纹已展开又不糊的值 */
const STATIC_FLOW_TIME = 12.8

export interface FluidFieldOptions {
  theme: FluxTheme
  /** 噪声初相位，逐卡不同才不会六张卡跳同一段舞 */
  seed: number
  /** 静止流速 */
  baseSpeed?: number
  /** 悬停满值时的额外流速 */
  hoverBoost?: number
  /** 搅动能量满值时的额外流速 */
  stirBoost?: number
}

export interface FluidFieldApi {
  /** WebGL 可用且着色器编译成功；false 时组件应改渲染静态兜底 */
  supported: Readonly<Ref<boolean>>
  /** 时钟是否真的在跑：暂停、页面隐藏、系统动效降级都会让它为 false */
  running: ComputedRef<boolean>
  setRunning(on: boolean): void
  /** 卡片被筛选隐藏时停掉绘制，上下文与状态都留着，重新显示即续上 */
  setVisible(on: boolean): void
  enter(): void
  leave(): void
  /** 传入指针的视口坐标，内部按位移距离累积搅动能量 */
  trackPointer(clientX: number, clientY: number): void
}

export function useFluidField(
  canvas: Ref<HTMLCanvasElement | null>,
  options: FluidFieldOptions,
): FluidFieldApi {
  const { theme, seed, baseSpeed = 0.22, hoverBoost = 0.08, stirBoost = 0.55 } = options

  const supported = ref(true)
  const enabled = ref(true)
  const visible = ref(true)
  const motionAllowed = ref(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const running = computed(() => enabled.value && motionAllowed.value)

  let gl: WebGLRenderingContext | null = null
  let surface: HTMLCanvasElement | null = null
  let uRes: WebGLUniformLocation | null = null
  let uTime: WebGLUniformLocation | null = null
  let uHover: WebGLUniformLocation | null = null

  /* 悬停与搅动是两条独立来源：前者缓动跟手，后者按移动速度充能再指数衰减 */
  let hover = 0
  let hoverTarget = 0
  let stir = 0
  let flowTime = Math.random() * 100
  let lastX: number | null = null
  let lastY: number | null = null
  let unsubscribe: (() => void) | null = null

  function compile(type: number, source: string): WebGLShader | null {
    if (!gl) return null
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[flux] 着色器编译失败', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  function initWebgl(el: HTMLCanvasElement): boolean {
    /* alpha:false 让浏览器跳过与页面背板的混合，着色器本来就写死不透明 */
    const ctx = el.getContext('webgl', { antialias: true, alpha: false, depth: false })
    if (!ctx) return false
    gl = ctx
    surface = el

    const vert = compile(ctx.VERTEX_SHADER, FLUX_VERT)
    const frag = compile(ctx.FRAGMENT_SHADER, FLUX_FRAG)
    if (!vert || !frag) return false

    const program = ctx.createProgram()
    if (!program) return false
    ctx.attachShader(program, vert)
    ctx.attachShader(program, frag)
    ctx.linkProgram(program)
    ctx.deleteShader(vert)
    ctx.deleteShader(frag)
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      console.error('[flux] 着色器程序链接失败', ctx.getProgramInfoLog(program))
      ctx.deleteProgram(program)
      return false
    }
    ctx.useProgram(program)

    /* 单个全屏三角形：三个顶点覆盖裁剪空间，比两个三角形少一个顶点也不需要索引缓冲 */
    const buffer = ctx.createBuffer()
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW)
    const position = ctx.getAttribLocation(program, 'aPos')
    ctx.enableVertexAttribArray(position)
    ctx.vertexAttribPointer(position, 2, ctx.FLOAT, false, 0, 0)

    const location = (name: string) => ctx.getUniformLocation(program, name)
    /* 主题色与初相位整场不变，只在初始化时上传一次 */
    ctx.uniform3fv(location('uC1'), theme.colors[0])
    ctx.uniform3fv(location('uC2'), theme.colors[1])
    ctx.uniform3fv(location('uC3'), theme.colors[2])
    ctx.uniform1f(location('uSeed'), seed)

    uRes = location('uRes')
    uTime = location('uTime')
    uHover = location('uHover')
    return true
  }

  /** 只在尺寸真的变了时重设 drawingBuffer——赋值本身会清空画布内容 */
  function syncSize(): void {
    if (!gl || !surface) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(surface.clientWidth * dpr)
    const h = Math.round(surface.clientHeight * dpr)
    if (!w || !h || (surface.width === w && surface.height === h)) return
    surface.width = w
    surface.height = h
    gl.viewport(0, 0, w, h)
  }

  function draw(): void {
    if (!gl || !surface) return
    gl.uniform2f(uRes, surface.width, surface.height)
    gl.uniform1f(uTime, flowTime)
    /* smoothstep 曲线：起步慢中段快收尾慢，比线性插值更像有惯性的材质 */
    gl.uniform1f(uHover, hover * hover * (3 - 2 * hover))
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function frame(dt: number): void {
    if (!visible.value) return
    syncSize()

    /* 缓动系数 2.2 ≈ 0.6 秒走完渐变，悬停才有缓冲感而不是开关 */
    hover += (hoverTarget - hover) * Math.min(1, dt * 2.2)
    /* 搅动能量指数衰减，约 1 秒半衰，鼠标停下后流速平滑回落 */
    stir *= Math.exp(-dt * 1.6)
    const eased = hover * hover * (3 - 2 * hover)
    /* 逐帧累积时间而非取绝对时钟：变速时画面连续，不会跳帧 */
    flowTime += dt * (baseSpeed + eased * hoverBoost + stir * stirBoost)

    draw()
  }

  function start(): void {
    unsubscribe ??= subscribe(frame)
  }

  function stop(): void {
    unsubscribe?.()
    unsubscribe = null
  }

  /** 静态出一帧：降级与暂停都走这里，画面停在花纹已展开的位置 */
  function renderStill(): void {
    stop()
    syncSize()
    flowTime = STATIC_FLOW_TIME
    hover = hoverTarget
    draw()
  }

  function setRunning(on: boolean): void {
    enabled.value = on
    /* 暂停时彻底退订：六张卡的开销不在像素上，而在每帧的 uniform 与 draw call */
    if (running.value) start()
    else renderStill()
  }

  function setVisible(on: boolean): void {
    visible.value = on
  }

  function enter(): void {
    hoverTarget = 1
  }

  function leave(): void {
    hoverTarget = 0
    lastX = null
    lastY = null
  }

  function trackPointer(clientX: number, clientY: number): void {
    if (lastX !== null && lastY !== null) {
      const move = Math.hypot(clientX - lastX, clientY - lastY)
      /* 位移转能量并封顶 1，快速划动才会明显提速而不至于失控 */
      stir = Math.min(1, stir + move * 0.012)
    }
    lastX = clientX
    lastY = clientY
  }

  function onContextLost(event: Event): void {
    /* 上下文吃紧时浏览器会回收最早创建的画布，这里落到静态兜底而不是留一张死图 */
    event.preventDefault()
    supported.value = false
    stop()
  }

  const onMotionPrefChange = (event: MediaQueryListEvent): void => {
    motionAllowed.value = !event.matches
    if (running.value) start()
    else renderStill()
  }

  onMounted(() => {
    const el = canvas.value
    if (!el) return
    el.addEventListener('webglcontextlost', onContextLost)

    if (!initWebgl(el)) {
      supported.value = false
      return
    }
    if (running.value) start()
    else renderStill()
  })

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', onMotionPrefChange)

  onScopeDispose(() => {
    stop()
    motionQuery.removeEventListener('change', onMotionPrefChange)
    surface?.removeEventListener('webglcontextlost', onContextLost)
    /* 主动归还上下文：热更新会反复重建组件，等 GC 回收会先撞上浏览器的上下文上限 */
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    gl = null
    surface = null
    uRes = null
    uTime = null
    uHover = null
  })

  return { supported, running, setRunning, setVisible, enter, leave, trackPointer }
}

/** WebGL 不可用时给卡片铺一层同色系静态渐变，避免出现空白框 */
export function fluxFallbackStyle(theme: FluxTheme): string {
  const [a, b, c] = theme.colors.map(([r, g, bl]) => `rgb(${r * 255} ${g * 255} ${bl * 255})`)
  return `linear-gradient(100deg, #fbfbfb 0%, ${a} 42%, ${b} 68%, ${c} 100%)`
}
