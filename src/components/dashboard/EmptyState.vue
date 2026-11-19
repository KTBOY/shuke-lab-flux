<!--
 * @Author: zlc
 * @Description: 空状态 —— 虚线框 + 一词说明，任务清单与日程共用同一副骨架，接真实数据后可原样复用
-->
<template>
  <p class="empty" :class="`empty--${tone}`">{{ label }}</p>
</template>

<script setup lang="ts">
defineOptions({ name: 'Dashboard-EmptyState' })

interface Props {
  /** 空状态文案，来自 src/data（一词或短语，不写整句） */
  label: string
  /** 所在卡片的明暗：light = 暖灰卡面，dark = 深墨卡面 */
  tone?: 'light' | 'dark'
}

withDefaults(defineProps<Props>(), { tone: 'light' })
</script>

<style scoped>
.empty {
  padding: 14px 12px;
  border: 1px dashed var(--c-line-dash);
  border-radius: var(--r-card);
  color: var(--c-ink-3);
  font-size: var(--fs-label);
  text-align: center;
}

/* 深卡上换深卡自己的描边与弱文字令牌，形状与浅版完全一致 */
.empty--dark {
  border-color: var(--c-hairline-dark);
  color: var(--c-on-dark-soft);
}
</style>
