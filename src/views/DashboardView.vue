<!--
 * @Author: zlc
 * @Description: 仪表盘视图 —— 标题行（欢迎语 + 颜色实验室入口）、指标区、三栏卡片栅格与整行工时图（容器查询三档降级）
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

      <div class="board__stack">
        <TimeTrackerCard />
        <ScheduleCard class="board__schedule" />
      </div>

      <div class="board__col board__col--right">
        <div class="board__pair">
          <OnboardingCard />
          <InsightCard />
        </div>
        <OnboardingTaskCard />
      </div>

      <WorkProgressCard class="board__progress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceAccordion from '@/components/dashboard/DeviceAccordion.vue'
import EmployeeProfileCard from '@/components/dashboard/EmployeeProfileCard.vue'
import InsightCard from '@/components/dashboard/InsightCard.vue'
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

/* —— 栅格：三栏各自独立成列，列高由内容决定 —— */
.board {
  display: grid;
  /* 右栏要并排放下入职进度与洞察卡，宽度从中栏（工时计时 + 日程）让出 */
  grid-template-columns: 1.05fr 1.5fr 1.7fr;
  grid-template-areas:
    'left stack right'
    'progress progress progress';
  gap: 12px;
  align-items: start;
  margin-top: clamp(14px, 2.4cqi, 22px);
}

.board__col,
.board__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.board__col--left {
  grid-area: left;
}

.board__col--right {
  grid-area: right;
}

.board__stack {
  grid-area: stack;
  /*
   * 中栏跟着最高那一栏走，但把多出来的高度只给日程：
   * 它是唯一能靠"多露几格时间"消化高度的模块，计时卡 stretching 只会长出空洞。
   */
  align-self: stretch;
}

/* 工作日工时图独占一行：五列挤在一栏宽里读不出趋势 */
.board__progress {
  grid-area: progress;
}

.board__schedule {
  flex: 1;
  min-height: 0;
}

/* 入职进度与洞察卡并排：两卡同高，洞察卡靠内容把行高顶到 200 以上 */
.board__pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

/* —— 平板：左右两栏在上，中栏与进度图依次整幅落下 —— */
@container stage (max-width: 1080px) {
  .board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'left right'
      'stack stack'
      'progress progress';
  }
}

/* —— 手机：单列纵向堆叠，进度图仍在最后 —— */
@container stage (max-width: 720px) {
  .board {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'left'
      'stack'
      'right'
      'progress';
  }
}

/* 首屏错峰上浮，让各模块依次入场；外壳三件套的节奏由 AppShell 负责 */
.dashboard > *,
.board > *,
.board__stack > * {
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

.board__stack > :nth-child(2) {
  animation-delay: 0.4s;
}
</style>
