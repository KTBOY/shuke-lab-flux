<!--
 * @Author: zlc
 * @Description: 线性图标组件，按名称从图标表渲染 SVG，避免引入图标库
-->
<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :stroke-width="strokeWidth"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(shape, index) in shapes" :key="index">
      <circle
        v-if="shape.cx !== undefined"
        :cx="shape.cx"
        :cy="shape.cy"
        :r="shape.r"
        :fill="shape.filled ? 'currentColor' : 'none'"
        :stroke="shape.filled ? 'none' : 'currentColor'"
      />
      <path
        v-else
        :d="shape.d"
        :fill="shape.filled ? 'currentColor' : 'none'"
        :stroke="shape.filled ? 'none' : 'currentColor'"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ICON_SHAPES } from '@/data/icons'
import type { IconName } from '@/data/icons'

defineOptions({ name: 'Ui-AppIcon' })

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    strokeWidth?: number
  }>(),
  { size: 16, strokeWidth: 1.5 },
)

const shapes = computed(() => ICON_SHAPES[props.name])
</script>

<style scoped>
.icon {
  display: block;
  flex: none;
}
</style>
