/**
 * @Author: zlc
 * @Description: 测试环境补齐 —— jsdom 未实现 matchMedia 与 ResizeObserver，而动效降级与资源收尾都是被测行为
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

/** 回调永不触发即可：被测的是「观察已建立」与「收尾时 disconnect」，不是尺寸变化的分发 */
class ResizeObserverStub {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

if (typeof window !== 'undefined' && typeof window.ResizeObserver !== 'function') {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}
