<!--
 * @Author: zlc
 * @Description: 工时解读栏 —— 只留数字事实：本周合计与环比 + 工时构成，挂在工时卡图表右侧
-->
<template>
  <aside class="insight">
    <h3 class="insight__title">{{ PROGRESS_INSIGHT.title }}</h3>

    <div class="insight__figures">
      <div class="figure">
        <span class="figure__label">{{ PROGRESS_INSIGHT.totalLabel }}</span>
        <strong class="figure__value tnum">
          {{ PROGRESS_INSIGHT.total }}<i>{{ PROGRESS_INSIGHT.unit }}</i>
        </strong>
      </div>

      <div class="figure">
        <span class="figure__label">{{ PROGRESS_DELTA.label }}</span>
        <strong class="figure__delta" :class="`figure__delta--${deltaTone}`">
          <AppIcon :name="PROGRESS_DELTA.dir === 'up' ? 'chevron-up' : 'chevron-down'" :size="12" />
          <span class="tnum">{{ PROGRESS_DELTA.hours }}</span>
          <span class="figure__pct tnum">{{ PROGRESS_DELTA.percent }}</span>
        </strong>
      </div>
    </div>

    <p class="insight__sub">{{ PROGRESS_INSIGHT.compositionTitle }}</p>
    <ul class="comp">
      <li
        v-for="(row, index) in PROGRESS_INSIGHT.composition"
        :key="row.label"
        class="comp__row"
        :style="{ '--i': index }"
      >
        <span class="comp__label">{{ row.label }}</span>
        <span class="comp__value tnum">{{ row.value }}%</span>
        <span class="comp__track" aria-hidden="true">
          <i class="comp__fill" :style="{ width: `${row.value}%` }"></i>
        </span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { PROGRESS_DELTA, PROGRESS_INSIGHT } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-ProgressInsightPanel' })

/** 颜色跟含义走：中性指标走灰，只有定性为正/负且方向与之相符时才上语义色 */
const deltaTone =
  PROGRESS_DELTA.sentiment === 'neutral'
    ? 'neu'
    : (PROGRESS_DELTA.dir === 'up') === (PROGRESS_DELTA.sentiment === 'positive')
      ? 'pos'
      : 'neg'
</script>

<style scoped>
.insight {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid var(--c-line);
}

.insight__title,
.insight__sub {
  margin: 0;
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--c-ink-2);
}

.insight__figures {
  display: flex;
  gap: 18px;
}

.figure {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.figure__label {
  font-size: var(--fs-label);
  color: var(--c-ink-2);
}

.figure__value {
  font-size: var(--fs-title);
  font-weight: 500;
  line-height: 1;
}

.figure__value i {
  margin-left: 2px;
  font-size: var(--fs-label);
  font-style: normal;
  font-weight: 400;
  color: var(--c-ink-2);
}

.figure__delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  align-self: flex-start;
  padding: 2px 7px;
  border-radius: var(--r-pill);
  font-size: var(--fs-label);
  font-weight: 500;
  line-height: 1.2;
}

/* 朝向由箭头给出、不靠颜色单独表意；语义明确才上色，中性一律描边灰 */
.figure__delta--pos {
  background: var(--c-accent);
  color: var(--c-ink);
}

.figure__delta--neg,
.figure__delta--neu {
  border: 1px solid var(--c-line-dash);
  color: var(--c-ink-2);
}

.figure__pct {
  padding-left: 3px;
  border-left: 1px solid currentColor;
  opacity: 0.72;
}

.comp {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.comp__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 3px 8px;
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 70ms + 0.32s);
}

.comp__label {
  font-size: var(--fs-label);
  color: var(--c-ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 条占满整行宽度：夹在标签和百分比之间的短轨看不出占比，只能看出有个条 */
.comp__track {
  display: block;
  grid-column: 1 / -1;
  height: 5px;
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.55);
}

.comp__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--c-accent-deep);
}

.comp__value {
  font-size: var(--fs-label);
  color: var(--c-ink);
  text-align: right;
}

@container stage (max-width: 720px) {
  .insight {
    padding-left: 0;
    padding-top: 12px;
    border-left: none;
    border-top: 1px solid var(--c-line);
  }
}
</style>
