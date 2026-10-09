<!--
 * @Author: zlc
 * @Description: 工作进度卡片 —— 本周日均工时与工作日折纸柱状图（sk-chart-duo 渲染）
-->
<template>
  <section class="panel panel--warm progress">
    <header class="panel__head">
      <h2 class="panel__title">{{ PROGRESS_CARD.title }}</h2>
      <button type="button" class="icon-round" aria-label="查看工时详情">
        <AppIcon name="arrow-up-right" :size="14" />
      </button>
    </header>

    <div class="progress__body">
      <div class="progress__main">
        <div class="progress__metric">
          <p class="progress__value tnum">
            {{ PROGRESS_WEEK_AVG }}<i>{{ PROGRESS_CARD.unit }}</i>
          </p>
          <p class="progress__caption">
            {{ PROGRESS_CARD.caption }}
            <span>{{ PROGRESS_CARD.subCaption }}</span>
          </p>
        </div>

        <div ref="host" class="progress__chart" :style="chartBox"></div>
      </div>

      <ProgressInsightPanel class="progress__aside" />
    </div>

    <p class="sr-only" aria-live="polite">{{ readout }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onScopeDispose, ref } from 'vue'
import { FoldBarChart } from 'sk-chart-duo'
import type { FoldBarDatum, ThemePack, TooltipPart } from 'sk-chart-duo'
import ProgressInsightPanel from '@/components/dashboard/ProgressInsightPanel.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { crestioChartTheme } from '@/data/crestioChartTheme'
import { PROGRESS_CARD, PROGRESS_DAYS, PROGRESS_WEEK_AVG } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-WorkProgressCard' })

/** 图表列约占整行的 2/3（其余给解读栏），高度与折边宽度按这一档幅面定标 */
const CHART_HEIGHT = 250
/** 容器高度与实例化参数同源，避免样式和 JS 各写一遍 */
const chartBox = { height: `${CHART_HEIGHT}px` }
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
      // 必须逐组展开再覆盖：整组替换会把皮肤里的 fill 丢回库默认蓝灰，字就淡得读不出。
      // ThemePack 的 tokens 是 DeepPartial，故用可选链展开；皮肤函数保证这些组运行时齐全。
      number: { ...pack.tokens?.number, fontSize: 12, letterSpacing: '-0.2px' },
      // 10px 中文在暖底上发糊，抬到 11px；五列比七列宽裕，放得下
      label: { ...pack.tokens?.label, fontSize: 11 },
      tooltip: { ...pack.tokens?.tooltip, fontSize: 10 },
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
    // 折边宽度按幅面取比例：设计空间是 1 CSS px = 1 单位，写死值在 350 与 1400 两档必有一档失真
    fold: { run: Math.max(4, Math.round(width / 110)) },
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
  padding: 12px;
  overflow: hidden;
}

/* 图表与解读并排：整行只放一张图会把右半幅空出来，解读栏正好落在那儿 */
.progress__body {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 0.92fr);
  flex: 1;
  gap: 14px;
}

.progress__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.progress__chart {
  width: 100%;
  margin-top: auto;
}

@container stage (max-width: 720px) {
  .progress__body {
    grid-template-columns: minmax(0, 1fr);
  }
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
