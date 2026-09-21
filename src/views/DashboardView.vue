<!--
 * @Author: zlc
 * @Description: 仪表盘视图 —— 标题行（欢迎语 + 颜色实验室入口）、指标区与四列卡片栅格（容器查询三档降级）
-->
<template>
  <div class="dashboard">
    <div class="hero">
      <h1 class="hero__title">{{ WELCOME_TITLE }}</h1>

      <RouterLink class="hero__entry" :to="{ name: ROUTE_NAME.colorLab }">
        <AppIcon :name="COLOR_LAB_ENTRY.icon" :size="15" class="hero__entry-icon" />
        <span>{{ COLOR_LAB_ENTRY.action }}</span>
        <AppIcon name="arrow-up-right" :size="12" class="hero__entry-arrow" />
      </RouterLink>
    </div>

    <StatOverview />

    <div class="board">
      <div class="board__col board__col--left">
        <EmployeeProfileCard />
        <DeviceAccordion />
      </div>

      <WorkProgressCard class="board__cell board__cell--progress" />
      <TimeTrackerCard class="board__cell board__cell--tracker" />

      <div class="board__col board__col--right">
        <OnboardingCard class="board__onboard" />
        <OnboardingTaskCard class="board__tasks" />
      </div>

      <ScheduleCard class="board__cell board__cell--schedule" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceAccordion from '@/components/dashboard/DeviceAccordion.vue'
import EmployeeProfileCard from '@/components/dashboard/EmployeeProfileCard.vue'
import OnboardingCard from '@/components/dashboard/OnboardingCard.vue'
import OnboardingTaskCard from '@/components/dashboard/OnboardingTaskCard.vue'
import ScheduleCard from '@/components/dashboard/ScheduleCard.vue'
import StatOverview from '@/components/dashboard/StatOverview.vue'
import TimeTrackerCard from '@/components/dashboard/TimeTrackerCard.vue'
import WorkProgressCard from '@/components/dashboard/WorkProgressCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { COLOR_LAB_ENTRY, WELCOME_TITLE } from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Dashboard-View' })
</script>

<style scoped>
.dashboard {
  /* 外壳由 AppShell 提供，这里只作为内容层的根，供入场错峰选择器挂载 */
  min-width: 0;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  /* 换行由 wrap 兜底，因此不需要额外断点，尺寸全部走 clamp 流式 */
  gap: clamp(10px, 2cqi, 18px);
  margin: clamp(14px, 2.6cqi, 24px) 0 clamp(12px, 2.2cqi, 20px);
}

.hero__title {
  min-width: 0;
  font-size: clamp(26px, 5cqi, var(--fs-display));
  font-weight: 300;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.hero__entry {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  padding: clamp(6px, 0.9cqi, 8px) clamp(12px, 1.6cqi, 16px);
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  letter-spacing: 0.01em;
  text-decoration: none;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.18s ease;
}

.hero__entry:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

.hero__entry:active {
  transform: translateY(0);
}

.hero__entry-icon {
  color: var(--c-ink-3);
  transition: color 0.16s ease;
}

.hero__entry-arrow {
  color: var(--c-ink-4);
  transition: color 0.16s ease;
}

.hero__entry:hover .hero__entry-icon {
  color: var(--c-ink);
}

.hero__entry:hover .hero__entry-arrow {
  color: var(--c-accent-deep);
}

/* —— 栅格：桌面四列，命名区域便于逐档重排 —— */
.board {
  display: grid;
  grid-template-columns: 1.08fr 1fr 1fr 1.02fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'left progress tracker right'
    'left schedule schedule right';
  column-gap: 12px;
  row-gap: clamp(24px, 5cqi, 56px);
  margin-top: clamp(14px, 2.4cqi, 22px);
}

.board__col {
  display: flex;
  flex-direction: column;
}

.board__col--left {
  grid-area: left;
  gap: 8px;
  justify-content: space-between;
}

.board__col--right {
  grid-area: right;
}

.board__cell {
  height: 100%;
}

.board__cell--progress {
  grid-area: progress;
}

.board__cell--tracker {
  grid-area: tracker;
}

.board__cell--schedule {
  grid-area: schedule;
}

.board__onboard {
  flex: none;
  height: 200px;
}

.board__tasks {
  flex: 1;
  margin-top: 12px;
}

/* —— 平板：两列，左列保持竖排 —— */
@container stage (max-width: 1080px) {
  .board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    grid-template-areas:
      'left right'
      'progress tracker'
      'schedule schedule';
    row-gap: 20px;
  }

  /* 脱离桌面行的对齐约束后，卡片回到内容高度 */
  .board__onboard {
    height: auto;
    min-height: 150px;
  }
}

/* —— 手机：单列纵向堆叠 —— */
@container stage (max-width: 720px) {
  .board {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'left'
      'progress'
      'tracker'
      'right'
      'schedule';
    row-gap: 16px;
  }

  .board__cell {
    height: auto;
  }

  .board__onboard {
    min-height: 0;
  }
}

/* 首屏错峰上浮，让各模块依次入场；外壳三件套的节奏由 AppShell 负责 */
.dashboard > *,
.board > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.dashboard > :nth-child(1) {
  animation-delay: 0.08s;
}

.dashboard > :nth-child(2) {
  animation-delay: 0.14s;
}

.dashboard > :nth-child(3) {
  animation-delay: 0.2s;
}

.board > :nth-child(1) {
  animation-delay: 0.24s;
}

.board > :nth-child(2) {
  animation-delay: 0.28s;
}

.board > :nth-child(3) {
  animation-delay: 0.32s;
}

.board > :nth-child(4) {
  animation-delay: 0.36s;
}

.board > :nth-child(5) {
  animation-delay: 0.4s;
}
</style>
