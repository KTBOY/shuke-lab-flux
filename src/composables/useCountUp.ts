import { onScopeDispose, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * @Author: zlc
 * @Description: 数字滚动 —— rAF 驱动从 0 缓动到目标值，格式化（小数位 / 千分位 / 前后缀）在每一帧套用，
 *               保证滚动途中的读数格式与终值一致；减动效时直接落终值，作用域销毁时取消未完成的帧
 */
export interface UseCountUpOptions {
  /** 滚动总时长（毫秒） */
  duration?: number
  /** 固定小数位数：滚动途中也按它定版显示，避免小数点位数乱跳 */
  decimals?: number
  /** 是否给整数部分加千分位分隔符 */
  grouping?: boolean
  /** 数字前的固定文案（如货币符号） */
  prefix?: string
  /** 数字后的固定文案（如单位） */
  suffix?: string
}

export interface UseCountUp {
  /** 当前帧的原始数值（未格式化） */
  value: Ref<number>
  /** 当前帧的展示文案（已格式化） */
  text: Ref<string>
}

/** 格式化所需的定版参数：创建时从可选项收口成必填，逐帧渲染不再判空 */
interface CountUpFormat {
  decimals: number
  grouping: boolean
  prefix: string
  suffix: string
}

const DEFAULT_DURATION = 1000

function formatValue(raw: number, format: CountUpFormat): string {
  const fixed = raw.toFixed(format.decimals)
  const [intPart, decPart] = fixed.split('.')
  const grouped = format.grouping ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : intPart
  return `${format.prefix}${grouped}${decPart ? `.${decPart}` : ''}${format.suffix}`
}

export function useCountUp(target: number, options: UseCountUpOptions = {}): UseCountUp {
  const duration = options.duration ?? DEFAULT_DURATION
  const format: CountUpFormat = {
    decimals: options.decimals ?? 0,
    grouping: options.grouping ?? false,
    prefix: options.prefix ?? '',
    suffix: options.suffix ?? '',
  }
  const value = ref(0)
  const text = ref(formatValue(0, format))
  let rafId: number | null = null
  let startAt: number | null = null

  function render(raw: number): void {
    value.value = raw
    text.value = formatValue(raw, format)
  }

  function cancel(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function tick(now: number): void {
    if (startAt === null) startAt = now
    const progress = duration > 0 ? Math.min((now - startAt) / duration, 1) : 1
    /* easeOutExpo：起步快、末尾稳稳落点，是里程表式滚动的观感来源 */
    const eased = progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    render(target * eased)
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      /* 最后一帧强制落终值，抹掉浮点尾差 */
      render(target)
      rafId = null
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render(target)
  } else {
    rafId = requestAnimationFrame(tick)
  }

  onScopeDispose(cancel)

  return { value, text }
}
