<!--
 * @Author: zlc
 * @Description: 示例数据角标 —— 静态演示无后端，整屏与日程卡共用同一枚标记，文案只有一个出处
-->
<template>
  <span class="sample-badge">{{ SAMPLE_BADGE_LABEL }}</span>
</template>

<script setup lang="ts">
import { SAMPLE_BADGE_LABEL } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-SampleBadge' })
</script>

<style scoped>
/* 克制优先：虚线描边 + 弱文字，只表明数据性质，不抢任何数字的注意力 */
.sample-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border: 1px dashed var(--c-line-dash);
  border-radius: var(--r-pill);
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
