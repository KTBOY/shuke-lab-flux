<!--
 * @Author: zlc
 * @Description: 仪表盘主视图 —— 外壳渐变、标题行（欢迎语 + 颜色实验室入口）、指标区与四列卡片栅格（容器查询三档降级）
-->
<template>
  <div class="stage">
    <main class="shell">
      <AppNavbar />

      <div class="shell__body">
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

        <footer class="credits">
          <span>© {{ AUTHOR.year }} {{ AUTHOR.name }}</span>
          <span class="credits__links">
            <a
              v-for="link in AUTHOR.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.hint }}
            </a>
          </span>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/dashboard/AppNavbar.vue'
import DeviceAccordion from '@/components/dashboard/DeviceAccordion.vue'
import EmployeeProfileCard from '@/components/dashboard/EmployeeProfileCard.vue'
import OnboardingCard from '@/components/dashboard/OnboardingCard.vue'
import OnboardingTaskCard from '@/components/dashboard/OnboardingTaskCard.vue'
import ScheduleCard from '@/components/dashboard/ScheduleCard.vue'
import StatOverview from '@/components/dashboard/StatOverview.vue'
import TimeTrackerCard from '@/components/dashboard/TimeTrackerCard.vue'
import WorkProgressCard from '@/components/dashboard/WorkProgressCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { AUTHOR, COLOR_LAB_ENTRY, WELCOME_TITLE } from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Dashboard-View' })
</script>

<style scoped>
.stage {
  display: grid;
  /* 不显式声明列的话，隐式 auto 列会按 max-content 撑开，窄屏下整块内容溢出视口 */
  grid-template-columns: minmax(0, 1fr);
  min-height: 100vh;
  background: var(--c-canvas);
  container-type: inline-size;
  container-name: stage;
}

.shell {
  /* 渐变铺满整个视口，不再做「外框卡片」，所以圆角与外投影一并去掉 */
  width: 100%;
  min-width: 0;
  padding: clamp(8px, 1.4cqi, 14px);
  background:
    radial-gradient(115% 135% at 94% 100%, var(--c-shell-to) 0%, rgba(249, 230, 171, 0) 62%),
    radial-gradient(95% 120% at 74% 92%, #f7e9c0 0%, rgba(247, 233, 192, 0) 60%),
    linear-gradient(128deg, var(--c-shell-from) 0%, #f0eee9 42%, #f6ecd2 100%);
}

/* 背景全幅，但内容仍收在原 1180px 版心里，超宽屏下栅格不会被拉散 */
.shell > * {
  max-width: 1180px;
  margin-inline: auto;
}

.shell__body {
  padding: 0 clamp(4px, 1.2cqi, 12px);
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

.credits {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: clamp(12px, 2cqi, 20px);
  padding-top: 10px;
  border-top: 1px solid var(--c-line);
  font-size: 9.5px;
  color: var(--c-ink-3);
}

.credits__links {
  display: flex;
  gap: 14px;
}

.credits a {
  color: inherit;
  text-decoration: none;
  transition: color 0.16s ease;
}

.credits a:hover {
  color: var(--c-ink);
  text-decoration: underline;
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

/* 首屏错峰上浮，让各模块依次入场 */
.shell > *,
.shell__body > *,
.board > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.shell > :nth-child(1) {
  animation-delay: 0.02s;
}

.shell__body > :nth-child(1) {
  animation-delay: 0.08s;
}

.shell__body > :nth-child(2) {
  animation-delay: 0.14s;
}

.shell__body > :nth-child(3) {
  animation-delay: 0.2s;
}

.shell__body > :nth-child(4) {
  animation-delay: 0.46s;
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
