<!--
 * @Author: zlc
 * @Description: 入职进度概览卡 —— 总完成率、三条分项进度与剩余任务说明
-->
<template>
  <section class="panel onboard">
    <header class="onboard__head">
      <h2 class="panel__title">{{ ONBOARDING_CARD.title }}</h2>
      <strong class="onboard__rate tnum">{{ completionRate }}%</strong>
    </header>

    <ul class="onboard__bars">
      <li v-for="bar in bars" :key="bar.tag" class="onboard__item">
        <span class="onboard__label">
          {{ bar.label }}
          <span v-if="bar.value === 0" class="onboard__chip">{{
            ONBOARDING_CARD.notStartedLabel
          }}</span>
        </span>
        <span
          class="onboard__bar"
          :class="[`onboard__bar--${bar.variant}`, { 'onboard__bar--unstarted': bar.value === 0 }]"
          :style="{ flexGrow: bar.value || 0.28 }"
        >
          <span class="onboard__tag">{{ bar.tag }}</span>
        </span>
      </li>
    </ul>

    <p class="onboard__foot">{{ footerText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOnboardingTasks } from '@/composables/useOnboardingTasks'
import { ONBOARDING_CARD } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-OnboardingCard' })

const { restCount, completionRate } = useOnboardingTasks()

/** 大字与「任务」分项条同源：都读任务清单现算的完成率，数据里的分项只留培训/评估两条独立指标 */
const bars = computed(() =>
  ONBOARDING_CARD.bars.map((bar) =>
    bar.fromTasks
      ? { ...bar, label: `${completionRate.value}%`, value: completionRate.value }
      : bar,
  ),
)

const footerText = computed(() => ONBOARDING_CARD.footer.replace('{rest}', String(restCount.value)))
</script>

<style scoped>
.onboard {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.onboard__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.onboard__rate {
  font-size: 21px;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.onboard__bars {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.onboard__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.onboard__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-label);
  color: var(--c-ink-3);
}

/* 未开始是全卡唯一需要被看见的状态：chip 给文字、虚线给形状，不靠降低亮度表达 */
.onboard__chip {
  padding: 0 5px;
  border: 1px dashed var(--c-line-dash);
  border-radius: var(--r-pill);
  font-size: var(--fs-mini);
  font-weight: 500;
  line-height: 1.5;
  color: var(--c-ink-2);
}

.onboard__bar {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: var(--r-pill);
  transition: flex-grow 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.onboard__bar--accent {
  background: var(--c-accent);
  color: var(--c-ink);
}

.onboard__bar--dark {
  background: var(--c-dark);
  color: var(--c-on-dark);
}

.onboard__bar--plain {
  background: rgba(23, 23, 26, 0.16);
  color: var(--c-ink-2);
}

.onboard__bar--unstarted {
  border: 1px dashed var(--c-line-dash);
  background: transparent;
}

.onboard__tag {
  font-size: var(--fs-mini);
  font-weight: 500;
  white-space: nowrap;
}

.onboard__foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--c-line);
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}
</style>
