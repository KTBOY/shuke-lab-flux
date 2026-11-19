import { ref } from 'vue'
import type { Ref } from 'vue'

/**
 * @Author: zlc
 * @Description: 命令面板开关状态 —— 模块级单例（与 useColorMode / useDashboardTheme 同款）：
 *               面板本体挂在 AppShell 只渲染一次，顶栏搜索胶囊与全局快捷键都经这里开关，
 *               避免为一次跨组件通信引入事件总线或 Pinia。
 */

const isPaletteOpen = ref(false)

export interface UseCommandPalette {
  /** 面板是否打开，组件用它切 is-open 类（常驻挂载 + 类开关，不挂撤） */
  isPaletteOpen: Ref<boolean>
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
}

export function useCommandPalette(): UseCommandPalette {
  function openPalette(): void {
    isPaletteOpen.value = true
  }

  function closePalette(): void {
    isPaletteOpen.value = false
  }

  function togglePalette(): void {
    isPaletteOpen.value = !isPaletteOpen.value
  }

  return { isPaletteOpen, openPalette, closePalette, togglePalette }
}
