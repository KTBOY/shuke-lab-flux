<!--
 * @Author: zlc
 * @Description: 工时计时卡片 —— 环形进度 + 工时读数，播放/暂停控制真实计时
-->
<template>
  <section class="panel panel--warm tracker">
    <header class="panel__head">
      <h2 class="panel__title">{{ TIME_TRACKER_CARD.title }}</h2>
      <button type="button" class="icon-round" aria-label="查看计时详情">
        <AppIcon name="arrow-up-right" :size="14" />
      </button>
    </header>

    <div class="tracker__ring" :class="{ 'is-running': isRunning }" :style="{ '--p': progress }">
      <div class="tracker__ticks" />
      <div class="tracker__center">
        <strong class="tracker__value tnum">{{ display }}</strong>
        <span class="tracker__caption">{{ TIME_TRACKER_CARD.caption }}</span>
      </div>
    </div>

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
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTimeTracker } from '@/composables/useTimeTracker'
import { TIME_TRACKER_CARD } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-TimeTrackerCard' })

const { display, isRunning, start, pause } = useTimeTracker(TIME_TRACKER_CARD.initialSeconds)

const progress = TIME_TRACKER_CARD.progress
</script>

<style scoped>
.tracker {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

.tracker__ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 108px;
  aspect-ratio: 1;
  margin: 8px auto 0;
}

.tracker__ring::before {
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: conic-gradient(var(--c-accent-deep) calc(var(--p) * 1%), rgba(23, 23, 26, 0.07) 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px));
  content: '';
}

.tracker__ring.is-running::before {
  background: conic-gradient(var(--c-accent-deep) calc(var(--p) * 1%), rgba(23, 23, 26, 0.07) 0);
  animation: ring-breathe 2.4s ease-in-out infinite;
}

.tracker__ticks {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(rgba(23, 23, 26, 0.5) 0 0.7deg, transparent 0.7deg 6deg);
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
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 0.01em;
  line-height: 1;
}

.tracker__caption {
  font-size: 9px;
  color: var(--c-ink-3);
}

.tracker__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
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
  color: #fff;
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
