import { computed, onScopeDispose, ref } from 'vue'

/**
 * @Author: zlc
 * @Description: 工时计时器逻辑 —— 秒级累加 + HH:MM 展示，作用域销毁时自动清理定时器
 */
export function useTimeTracker(initialSeconds: number) {
  const seconds = ref(initialSeconds)
  const isRunning = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const display = computed(() => {
    const hours = Math.floor(seconds.value / 3600)
    const minutes = Math.floor((seconds.value % 3600) / 60)
    return [hours, minutes].map((value) => String(value).padStart(2, '0')).join(':')
  })

  function clearTimer(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function start(): void {
    if (isRunning.value) return
    isRunning.value = true
    timer = setInterval(() => {
      seconds.value += 1
    }, 1000)
  }

  function pause(): void {
    clearTimer()
    isRunning.value = false
  }

  onScopeDispose(clearTimer)

  return { seconds, isRunning, display, start, pause }
}
