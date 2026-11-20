<!--
 * @Author: zlc
 * @Description: 仪表盘视图 —— 标题行（本周基线 + 问候副行、示例数据角标与颜色实验室入口）、指标区、卡片栅格（容器查询降级，超宽屏四列）
-->
<template>
  <div class="dashboard">
    <div class="hero">
      <div class="hero__text">
        <h1 class="hero__title">{{ DASHBOARD_WEEK_LABEL }}</h1>
        <p class="hero__sub">
          {{ WELCOME_TITLE }}
          <SampleBadge />
        </p>
      </div>

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
import SampleBadge from '@/components/dashboard/SampleBadge.vue'
import StatOverview from '@/components/dashboard/StatOverview.vue'
import TimeTrackerCard from '@/components/dashboard/TimeTrackerCard.vue'
import WorkProgressCard from '@/components/dashboard/WorkProgressCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { COLOR_LAB_ENTRY, DASHBOARD_WEEK_LABEL, WELCOME_TITLE } from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Dashboard-View' })
</script>

<style scoped>
.dashboard {
  /* 外壳由 AppShell 提供，这里只作为内容层的根，供入场错峰选择器挂载 */
  min-width: 0;
  /* 卡片弹射入场的缓动与时长收口在根上，错峰延迟由各卡的 --d 单独给 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-pop: 0.55s;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  /* 换行由 wrap 兜底，因此不需要额外断点，尺寸全部走 clamp 流式 */
  gap: clamp(10px, 2cqi, 18px);
  margin: clamp(12px, 2.2cqi, 18px) 0 clamp(8px, 1.6cqi, 12px);
}

.hero__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

/* 标题行先给坐标系（本周是哪一周），问候降为副行小字 */
.hero__title {
  min-width: 0;
  font-size: clamp(22px, 3.6cqi, 30px);
  font-weight: 300;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.hero__sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--fs-body);
  color: var(--c-ink-3);
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
  gap: 10px;
  align-items: start;
  margin-top: clamp(10px, 1.8cqi, 14px);
}

.board__col,
.board__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

/* 入职进度与洞察卡并排：两卡同高，行高由洞察卡的 min-height 顶住 */
.board__pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-items: stretch;
}

/*
 * —— 超宽屏：四列并行，工时图收成第四列 ——
 * 三列等比拉宽只会把空洞放大（照片裁成横幅、计时环更孤单）；
 * 宽度涨上 2560 后改为四列，让多出来的宽度换成密度而不是拉伸。
 */
@container stage (min-width: 2560px) {
  .board {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-areas: 'left stack right progress';
  }
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

  /* 并排的两卡在手机宽下各只剩约 165px，洞察数字与基线互相挤压，改单列纵排 */
  .board__pair {
    grid-template-columns: minmax(0, 1fr);
  }
}

/*
 * 首屏入场：标题行沿用上浮，指标区与栅格里的每张卡片带弹簧逐个弹射归位；
 * 栅格的列只是排版容器、不再整列动，免得列与卡两层动画叠出双倍位移。
 * 外壳三件套的节奏由 AppShell 负责。
 */
.dashboard > :nth-child(1) {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: 0.08s;
}

.dashboard > :nth-child(2) {
  animation: card-pop var(--dur-pop) var(--ease-spring) backwards;
  animation-delay: 0.14s;
}

.board__col > *:not(.board__pair),
.board__stack > *,
.board__pair > *,
.board__progress {
  animation: card-pop var(--dur-pop) var(--ease-spring) backwards;
  animation-delay: var(--d, 0.24s);
}

/* 错峰顺序按阅读流：左栏 → 中栏 → 右栏 → 整行工时图，每步约 90ms */
.board__col--left > :nth-child(1) {
  --d: 0.22s;
}

.board__col--left > :nth-child(2) {
  --d: 0.31s;
}

.board__stack > :nth-child(1) {
  --d: 0.27s;
}

.board__stack > :nth-child(2) {
  --d: 0.36s;
}

.board__pair > :nth-child(1) {
  --d: 0.31s;
}

.board__pair > :nth-child(2) {
  --d: 0.4s;
}

.board__col--right > :nth-child(2) {
  --d: 0.45s;
}

.board__progress {
  --d: 0.5s;
}

/* 弹射：从下方 14px、缩到 97% 处出发，靠过冲曲线越过原位再回落定住 */
@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>
