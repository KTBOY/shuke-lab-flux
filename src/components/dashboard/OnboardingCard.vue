<!--
 * @Author: zlc
 * @Description: 入职进度概览卡 —— 总完成率、三条分项进度与剩余任务说明
-->
<template>
  <section class="panel panel--warm onboard">
    <header class="onboard__head">
      <h2 class="panel__title">{{ ONBOARDING_CARD.title }}</h2>
      <strong class="onboard__rate tnum">{{ ONBOARDING_CARD.rate }}%</strong>
    </header>

    <ul class="onboard__bars">
      <li v-for="bar in ONBOARDING_CARD.bars" :key="bar.tag" class="onboard__item">
        <span class="onboard__label">{{ bar.label }}</span>
        <span
          class="onboard__bar"
          :class="`onboard__bar--${bar.variant}`"
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

const { restCount } = useOnboardingTasks()

const footerText = computed(() => ONBOARDING_CARD.footer.replace('{rest}', String(restCount.value)))
</script>

<style scoped>
.onboard {
  display: flex;
  flex-direction: column;
  padding: 14px;
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
  font-size: 9px;
  color: var(--c-ink-3);
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
  color: #fff;
}

.onboard__bar--plain {
  background: rgba(23, 23, 26, 0.16);
  color: var(--c-ink-2);
}

.onboard__tag {
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
}

.onboard__foot {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--c-line);
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}
</style>
