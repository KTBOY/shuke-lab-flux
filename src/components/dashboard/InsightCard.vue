<!--
 * @Author: zlc
 * @Description: 洞察卡片 —— 深墨展示带上的静态事实块：大数字 + 一词基线，解释只进 tooltip，不上屏成句
-->
<template>
  <section class="panel insight" aria-label="洞察">
    <span class="insight__chip">
      <AppIcon name="bulb" :size="12" />
      {{ INSIGHT_CARD.chip }}
    </span>

    <ul class="insight__facts">
      <li v-for="fact in facts" :key="fact.label" class="fact" :title="fact.hint">
        <p class="fact__value tnum">{{ fact.value }}</p>
        <p class="fact__label">{{ fact.label }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useOnboardingTasks } from '@/composables/useOnboardingTasks'
import { INSIGHT_CARD, PROGRESS_DELTA, PROGRESS_INSIGHT } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-InsightCard' })

const { doneCount, total, completionRate } = useOnboardingTasks()

/** 大数字与基线共用一次填充：占位符缺值就留空，不静默回退成 0 */
function fill(template: string): string {
  const vars: Record<string, string | number> = {
    taskRate: completionRate.value,
    done: doneCount.value,
    total,
    deltaPercent: PROGRESS_DELTA.percent,
    weekTotal: PROGRESS_INSIGHT.total,
    devShare: PROGRESS_INSIGHT.composition[0]?.value ?? 0,
    meetingShare: PROGRESS_INSIGHT.composition[1]?.value ?? 0,
    insertShare: PROGRESS_INSIGHT.composition[2]?.value ?? 0,
  }
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(vars[key] ?? ''))
}

const facts = computed(() =>
  INSIGHT_CARD.facts.map((fact) => ({
    value: fill(fact.value),
    label: fact.label,
    hint: fill(fact.hint),
  })),
)
</script>

<style scoped>
.insight {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  gap: 8px;
  min-height: 164px;
  padding: 12px;
  color: var(--c-on-dark);
  /* 深墨展示带：与入职任务卡同一档暗面，强调色只落在大数字上 */
  background: var(--c-dark);
  border-color: var(--c-hairline-dark);
}

/* 颗粒用内联 SVG 的 feTurbulence 生成，不为一层噪点加依赖或加文件 */
.insight::after {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  content: '';
  opacity: 0.22;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* 定位元素会盖在普通流之上，噪点层因此要求内容抬一层 */
.insight > * {
  position: relative;
  z-index: 1;
}

.insight__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  background: var(--c-dark-2);
  color: var(--c-on-dark-soft);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.insight__facts {
  display: flex;
  flex: 1;
  align-items: flex-end;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fact {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.fact__value {
  margin: 0;
  color: var(--c-accent);
  font-size: var(--fs-metric);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;
}

.fact__label {
  margin: 0;
  color: var(--c-on-dark-soft);
  font-size: var(--fs-label);
  white-space: nowrap;
}
</style>
