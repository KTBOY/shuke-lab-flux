<!--
 * @Author: zlc
 * @Description: 工作进度卡片 —— 本周工时数值与七日柱状图，最高柱带数值气泡
-->
<template>
  <section class="panel panel--warm progress">
    <header class="panel__head">
      <h2 class="panel__title">{{ PROGRESS_CARD.title }}</h2>
      <button type="button" class="icon-round" aria-label="查看工时详情">
        <AppIcon name="arrow-up-right" :size="14" />
      </button>
    </header>

    <div class="progress__metric">
      <p class="progress__value tnum">
        {{ PROGRESS_CARD.value }}<i>{{ PROGRESS_CARD.unit }}</i>
      </p>
      <p class="progress__caption">
        {{ PROGRESS_CARD.caption }}
        <span>{{ PROGRESS_CARD.subCaption }}</span>
      </p>
    </div>

    <ul class="chart">
      <li
        v-for="(day, index) in PROGRESS_DAYS"
        :key="`${day.label}-${index}`"
        class="chart__col"
        :class="{ 'is-active': day.active, 'is-faint': day.faint }"
        :style="{ '--height': day.height, '--i': index }"
        :aria-label="`${day.label} ${day.hours}`"
        tabindex="0"
      >
        <span class="chart__tip">{{ day.hours }}</span>
        <span class="chart__bar" />
        <span class="chart__label">{{ day.label }}</span>
        <span class="chart__dot" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { PROGRESS_CARD, PROGRESS_DAYS } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-WorkProgressCard' })
</script>

<style scoped>
.progress {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  overflow: hidden;
}

.progress__metric {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
}

.progress__value {
  font-size: var(--fs-metric);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
}

.progress__value i {
  margin-left: 2px;
  font-size: 13px;
  font-style: normal;
}

.progress__caption {
  padding-top: 3px;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.progress__caption span {
  display: block;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 96px;
  margin-top: auto;
  padding-top: 16px;
}

.chart__col {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 5px;
  outline: none;
}

.chart__bar {
  width: 3px;
  height: calc(var(--height) * 0.52px);
  border-radius: 2px;
  background: var(--c-ink);
  transform-origin: bottom;
  animation: bar-grow 0.62s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 55ms);
}

.chart__label {
  font-size: 9px;
  color: var(--c-ink-3);
}

.chart__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--c-ink);
}

.chart__col.is-faint .chart__bar {
  background: var(--c-ink-4);
}

.chart__col.is-faint .chart__dot {
  background: transparent;
}

.chart__col.is-active .chart__bar {
  background: var(--c-accent-deep);
}

.chart__col.is-active .chart__dot {
  background: var(--c-accent-deep);
}

.chart__tip {
  position: absolute;
  top: -6px;
  left: 50%;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  background: var(--c-accent);
  color: var(--c-ink);
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 4px);
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.chart__col:hover .chart__tip,
.chart__col:focus-visible .chart__tip,
.chart__col.is-active .chart__tip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.chart__col:focus-visible {
  box-shadow: 0 0 0 2px rgba(248, 217, 124, 0.9);
  border-radius: 8px;
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }
}
</style>
