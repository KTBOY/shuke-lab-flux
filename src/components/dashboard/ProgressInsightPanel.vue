<!--
 * @Author: zlc
 * @Description: 工时解读栏 —— 结论句 + 本周合计与环比 + 工时构成，挂在工时卡图表右侧
-->
<template>
  <aside class="insight">
    <h3 class="insight__title">{{ PROGRESS_INSIGHT.title }}</h3>

    <p class="insight__headline">{{ PROGRESS_INSIGHT.headline }}</p>

    <div class="insight__figures">
      <div class="figure">
        <span class="figure__label">{{ PROGRESS_INSIGHT.totalLabel }}</span>
        <strong class="figure__value tnum">
          {{ PROGRESS_INSIGHT.total }}<i>{{ PROGRESS_INSIGHT.unit }}</i>
        </strong>
      </div>

      <div class="figure">
        <span class="figure__label">{{ PROGRESS_DELTA.label }}</span>
        <strong class="figure__delta" :class="`figure__delta--${PROGRESS_DELTA.dir}`">
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

    <p class="insight__detail">{{ PROGRESS_INSIGHT.detail }}</p>
  </aside>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { PROGRESS_DELTA, PROGRESS_INSIGHT } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-ProgressInsightPanel' })
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

.insight__headline {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: 500;
  line-height: 1.45;
  color: var(--c-ink);
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

/* 朝向由箭头给出、不靠颜色单独表意；降调只做描边不上色，暖底上没有第二个品牌色可用 */
.figure__delta--up {
  background: var(--c-accent);
  color: var(--c-ink);
}

.figure__delta--down {
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

.insight__detail {
  margin: 0;
  font-size: var(--fs-label);
  line-height: 1.6;
  color: var(--c-ink-2);
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
