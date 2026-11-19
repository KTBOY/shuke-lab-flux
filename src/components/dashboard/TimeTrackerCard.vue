<!--
 * @Author: zlc
 * @Description: 工时计时卡片 —— 横排紧凑布局：环形进度 + 读数一侧、基线与播放/暂停控制一侧，不再竖着撑出大半张空卡
-->
<template>
  <section class="panel tracker">
    <header class="panel__head">
      <h2 class="panel__title">{{ TIME_TRACKER_CARD.title }}</h2>
      <button type="button" class="icon-round" aria-label="查看计时详情">
        <AppIcon name="arrow-up-right" :size="14" />
      </button>
    </header>

    <div class="tracker__body">
      <div class="tracker__ring" :class="{ 'is-running': isRunning }" :style="{ '--p': progress }">
        <div class="tracker__ticks" />
        <div class="tracker__center">
          <strong class="tracker__value tnum">{{ display }}</strong>
          <span class="tracker__caption">{{ TIME_TRACKER_CARD.caption }}</span>
        </div>
      </div>

      <div class="tracker__side">
        <p class="tracker__baseline">{{ TIME_TRACKER_CARD.targetLabel }}</p>

        <div class="tracker__controls">
          <div class="tracker__group">
            <button
              type="button"
              class="tracker__btn"
              :class="{ 'is-on': isRunning }"
              :aria-pressed="isRunning"
              aria-label="开始计时"
              @click="start"
            >
              <AppIcon name="play" :size="13" />
            </button>
            <button
              type="button"
              class="tracker__btn"
              :class="{ 'is-on': !isRunning }"
              :aria-pressed="!isRunning"
              aria-label="暂停计时"
              @click="pause"
            >
              <AppIcon name="pause" :size="13" />
            </button>
          </div>
          <button type="button" class="tracker__btn tracker__btn--dark" aria-label="历史记录">
            <AppIcon name="history" :size="14" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTimeTracker } from '@/composables/useTimeTracker'
import { TIME_TRACKER_CARD } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-TimeTrackerCard' })

const { seconds, display, isRunning, start, pause } = useTimeTracker(
  TIME_TRACKER_CARD.initialSeconds,
)

/** 圆环编码真实比例：已计时长 / 全天目标，计时走动环随之生长，不再是写死常数 */
const progress = computed(() =>
  Math.min(100, (seconds.value / TIME_TRACKER_CARD.targetSeconds) * 100),
)
</script>

<style scoped>
.tracker {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

/* 环与控制同行：卡片高度由环（92px）决定，而不是竖排元素的总和 */
.tracker__body {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.tracker__ring {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: 92px;
  aspect-ratio: 1;
}

.tracker__ring::before {
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: conic-gradient(var(--c-accent-deep) calc(var(--p) * 1%), var(--c-line) 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px));
  content: '';
}

.tracker__ring.is-running::before {
  background: conic-gradient(var(--c-accent-deep) calc(var(--p) * 1%), var(--c-line) 0);
  animation: ring-breathe 2.4s ease-in-out infinite;
}

.tracker__ticks {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /*
   * 三层叠出时钟表盘：象限 > 整点 > 分钟。
   * 单层 60 格是 60 阶旋转对称，一秒走过正好一个格距，图案每秒与自身重合，
   * 转了也看不出来；压上 30°/90° 两级重刻度后对称降到 12 阶，扫动才读得出方向。
   */
  /* 刻度色走 --c-tick 三档令牌：随主题翻转，深色下自动换浅色，不再写死墨色 */
  background:
    repeating-conic-gradient(var(--c-tick) 0 1.6deg, transparent 1.6deg 90deg),
    repeating-conic-gradient(var(--c-tick-mid) 0 1.1deg, transparent 1.1deg 30deg),
    repeating-conic-gradient(var(--c-tick-soft) 0 0.7deg, transparent 0.7deg 6deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
  /*
   * 动画常驻、只用 play-state 开关：若按 is-running 挂撤 animation，
   * 暂停那一下会直接跳回 0 度，继续时又从原点重来。
   * 一圈 60s 与表盘的「分钟」语义对齐，慢到只当呼吸用，不抢读数。
   */
  animation: ticks-spin var(--ticks-turn, 60s) linear infinite;
  animation-play-state: paused;
}

.tracker__ring.is-running .tracker__ticks {
  animation-play-state: running;
}

.tracker__center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tracker__value {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.01em;
  line-height: 1;
}

.tracker__caption {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

/* 右侧一列：基线在上、控制在下，整体靠右与详情按钮同侧收尾 */
.tracker__side {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 0;
}

/* 环的一词基线：圆环的分母（目标时长） */
.tracker__baseline {
  margin: 0;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.tracker__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tracker__group {
  display: flex;
  gap: 8px;
}

.tracker__btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-surface);
  color: var(--c-ink);
  box-shadow: 0 4px 10px -8px rgba(23, 23, 26, 0.8);
  transition: transform 0.16s ease;
}

.tracker__btn:hover {
  transform: translateY(-1px);
}

.tracker__btn.is-on {
  color: var(--c-ink-4);
}

.tracker__btn--dark {
  background: var(--c-dark);
  color: var(--c-on-dark);
}

/* 刻度图案 6 度一格、旋转对称，转满 360 度即回到原点，linear 循环没有接缝 */
@keyframes ticks-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ring-breathe {
  50% {
    filter: saturate(1.25) brightness(1.04);
  }
}
</style>
