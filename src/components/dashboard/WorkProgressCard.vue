<!--
 * @Author: zlc
 * @Description: 工作进度卡片 —— 本周日均工时与七日折纸柱状图（sk-chart-duo 渲染）
-->
<template>
  <section class="panel panel--warm progress">
    <header class="panel__head">
      <h2 class="panel__title">{{ PROGRESS_CARD.title }}</h2>
      <button type="button" class="icon-round" aria-label="查看工时详情">
        <AppIcon name="arrow-up-right" :size="14" />
      </button>
    </header>

    <div class="progress__metric">
      <p class="progress__value tnum">
        {{ PROGRESS_WEEK_AVG }}<i>{{ PROGRESS_CARD.unit }}</i>
      </p>
      <p class="progress__caption">
        {{ PROGRESS_CARD.caption }}
        <span>{{ PROGRESS_CARD.subCaption }}</span>
      </p>
    </div>

    <div ref="host" class="progress__chart"></div>

    <p class="sr-only" aria-live="polite">{{ readout }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onScopeDispose, ref } from 'vue'
import { FoldBarChart } from 'sk-chart-duo'
import type { FoldBarDatum, ThemePack, TooltipPart } from 'sk-chart-duo'
import AppIcon from '@/components/ui/AppIcon.vue'
import { crestioChartTheme } from '@/data/crestioChartTheme'
import { PROGRESS_CARD, PROGRESS_DAYS, PROGRESS_WEEK_AVG } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-WorkProgressCard' })

const CHART_HEIGHT = 190
/** 卡片实测宽远小于库原稿的 860，只能按 1 CSS px = 1 设计单位建设计空间 */
const DATA: FoldBarDatum[] = PROGRESS_DAYS.map((day) => ({ label: day.label, value: day.hours }))
const PEAK_INDEX = DATA.reduce(
  (best, day, index) => (day.value > DATA[best].value ? index : best),
  0,
)

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(vars[key] ?? ''))
}

function readoutOf(stage: FoldBarDatum): string {
  return fill(PROGRESS_CARD.readout, { label: stage.label, value: stage.value.toFixed(1) })
}

/**
 * 紧凑皮肤：原稿的 27px 数值、26px pill、115 起 wash、85/117 两行文字都是按 860×386 定的绝对坐标，
 * 在这张 ~260px 宽的卡里会互相压字，所以整套几何与字号按卡片重标一遍。
 */
function compactTheme(): ThemePack {
  const pack = crestioChartTheme()

  return {
    ...pack,
    tokens: {
      ...pack.tokens,
      number: { fontSize: 12, letterSpacing: '-0.2px' },
      label: { fontSize: 10 },
      tooltip: { fontSize: 10 },
    },
  }
}

const host = ref<HTMLElement | null>(null)
const readout = ref(readoutOf(DATA[PEAK_INDEX]))

let chart: FoldBarChart | null = null
let observer: ResizeObserver | null = null
let frame = 0
let lastWidth = 0

function createChart(el: HTMLElement, width: number): FoldBarChart {
  return new FoldBarChart(el, {
    data: DATA,
    width,
    height: CHART_HEIGHT,
    ariaLabel: PROGRESS_CARD.title,
    theme: compactTheme(),
    padding: { top: 46, right: 6, bottom: 20, left: 6 },
    stair: { bottomOffset: 4, topOffset: 6 },
    fold: { run: 6 },
    axis: { ticks: [] },
    xAxis: { showGrid: false },
    state: { defaultActive: PEAK_INDEX },
    valueFormat: (value) => value.toFixed(1),
    style: {
      labelY: 14,
      numberY: 38,
      washTop: 46,
      pill: { enabled: false },
      fadeMask: { enabled: false },
    },
    tooltip: {
      formatter: (datum): TooltipPart[] => [{ text: readoutOf(datum), tone: 'b' }],
    },
  })
}

onMounted(() => {
  const el = host.value
  if (!el) return

  lastWidth = el.getBoundingClientRect().width
  chart = createChart(el, lastWidth)
  chart.on('column:enter', (payload) => {
    readout.value = readoutOf(payload.datum)
  })

  observer = new ResizeObserver((entries) => {
    const entry = entries[entries.length - 1]
    if (!entry) return
    const { width } = entry.contentRect
    // 高度是写定的，只有宽度变化才需要重建；否则 resize → 高度变 → RO 再触发会死循环
    if (width < 1 || Math.abs(width - lastWidth) < 1) return
    lastWidth = width

    if (frame) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => chart?.resize(width, CHART_HEIGHT))
  })
  observer.observe(el)
})

onScopeDispose(() => {
  if (frame) cancelAnimationFrame(frame)
  observer?.disconnect()
  chart?.destroy()
  chart = null
})
</script>

<style scoped>
.progress {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  overflow: hidden;
}

.progress__chart {
  width: 100%;
  height: 190px;
  margin-top: auto;
}

.progress__metric {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
}

.progress__value {
  font-size: var(--fs-metric);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
}

.progress__value i {
  margin-left: 2px;
  font-size: 13px;
  font-style: normal;
}

.progress__caption {
  padding-top: 3px;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.progress__caption span {
  display: block;
}

/*
 * 库给 <svg> 根元素设了 tabindex 以支持键盘切列，而 base.css 没有任何 :focus 规则，
 * 于是浏览器画出自带的实心黑框。点击时压掉它，键盘聚焦时换成首页既有的琥珀描边。
 * SVG 由 JS 创建、拿不到 scoped 属性，故必须 :deep()。
 */
.progress__chart :deep(svg:focus) {
  outline: none;
}

.progress__chart :deep(svg:focus-visible) {
  outline: 2px solid var(--c-accent-deep);
  outline-offset: 2px;
  border-radius: var(--r-card);
}
</style>
