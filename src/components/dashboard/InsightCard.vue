<!--
 * @Author: zlc
 * @Description: 洞察卡片 —— 冷色渐变轮播块，三条洞察各占一屏，底部进度段兼作切换点
-->
<template>
  <section
    class="panel insight"
    aria-label="洞察"
    @pointerenter="pause"
    @pointerleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <span class="insight__chip">
      <AppIcon name="bulb" :size="12" />
      {{ INSIGHT_CARD.chip }}
    </span>

    <div :key="index" class="insight__stage">
      <p class="insight__rate tnum">{{ slide.rate }}</p>
      <div class="insight__copy">
        <p class="insight__headline">{{ slide.headline }}</p>
        <p class="insight__detail">{{ slide.detail }}</p>
      </div>
    </div>

    <div class="insight__dots">
      <button
        v-for="(item, i) in slides"
        :key="item.headline"
        type="button"
        class="dot"
        :class="{ 'is-on': i === index }"
        :aria-current="i === index ? 'true' : undefined"
        :aria-label="`看第 ${i + 1} 条洞察：${item.headline}`"
        @click="go(i)"
      >
        <span class="dot__track" aria-hidden="true">
          <i class="dot__fill"></i>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useOnboardingTasks } from '@/composables/useOnboardingTasks'
import { INSIGHT_CARD, PROGRESS_DELTA, PROGRESS_INSIGHT } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-InsightCard' })

const { doneCount, total } = useOnboardingTasks()

const taskRate = computed(() => Math.round((doneCount.value / total) * 100))

/** 大数字与文案共用一次填充：占位符缺值就留空，不静默回退成 0 */
function fill(template: string): string {
  const vars: Record<string, string | number> = {
    taskRate: taskRate.value,
    done: doneCount.value,
    total,
    deltaPercent: PROGRESS_DELTA.percent,
    weekTotal: PROGRESS_INSIGHT.total,
    devShare: PROGRESS_INSIGHT.composition[0]?.value ?? 0,
    meetingShare: PROGRESS_INSIGHT.composition[1]?.value ?? 0,
    insertShare: PROGRESS_INSIGHT.composition[2]?.value ?? 0,
  }
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(vars[key] ?? ''))
}

const slides = computed(() =>
  INSIGHT_CARD.slides.map((slide) => ({
    rate: fill(slide.rate),
    headline: fill(slide.headline),
    detail: fill(slide.detail),
  })),
)

const index = ref(0)
const slide = computed(() => slides.value[index.value])

function go(next: number): void {
  index.value = next
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
let hovering = false
let timer: number | undefined

function advance(): void {
  index.value = (index.value + 1) % slides.value.length
}

function start(): void {
  // 降级动效偏好下不自动翻页：CSS 媒体查询管不到 JS 定时器，只能在这里拦
  if (reduced.matches || hovering || timer !== undefined) return
  timer = window.setInterval(advance, INSIGHT_CARD.dwell)
}

function stop(): void {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

function pause(): void {
  hovering = true
  stop()
}

function resume(): void {
  hovering = false
  start()
}

function onMotionChange(): void {
  if (reduced.matches) stop()
  else start()
}

reduced.addEventListener('change', onMotionChange)
start()

onScopeDispose(() => {
  reduced.removeEventListener('change', onMotionChange)
  stop()
})
</script>

<style scoped>
.insight {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
  padding: 14px;
  color: #fff;
  /* 底部先把白字落脚处压回深墨，再让右上高光与冷暖斜切盖上去 */
  background:
    linear-gradient(to top, var(--c-insight-deep) 0%, var(--c-insight-deep-fade) 56%),
    radial-gradient(118% 86% at 90% 4%, var(--c-insight-glow) 0%, var(--c-insight-glow-fade) 46%),
    linear-gradient(
      146deg,
      var(--c-insight-cool) 0%,
      var(--c-insight-teal) 48%,
      var(--c-insight-warm) 100%
    );
}

/* 颗粒用内联 SVG 的 feTurbulence 生成，不为一层噪点加依赖或加文件 */
.insight::after {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  content: '';
  opacity: 0.22;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* 定位元素会盖在普通流之上，噪点层因此要求内容抬一层 */
.insight > * {
  position: relative;
  z-index: 1;
}

.insight__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  background: var(--c-insight-chip);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.insight__stage {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  /* key 换页时重放，让数字与文案一起淡入而不是硬切 */
  animation: insight-in 0.42s cubic-bezier(0.2, 0.7, 0.3, 1);
}

@keyframes insight-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.insight__rate {
  margin: 0;
  font-size: var(--fs-metric);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
}

.insight__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.insight__headline {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: 600;
  line-height: 1.4;
}

.insight__detail {
  margin: 0;
  font-size: var(--fs-label);
  line-height: 1.5;
  opacity: 0.86;
}

.insight__dots {
  display: flex;
  gap: 6px;
}

.dot {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.dot__track {
  display: block;
  height: 4px;
  border-radius: var(--r-pill);
  background: var(--c-insight-track);
  transition: background 0.2s ease;
}

.dot__fill {
  display: block;
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: #fff;
  transition: width 0.32s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.dot.is-on .dot__fill {
  width: 100%;
}

.dot:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: var(--r-pill);
}
</style>
