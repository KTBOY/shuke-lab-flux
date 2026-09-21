<!--
 * @Author: zlc
 * @Description: FLUX 颜色工作室（Vue 版）—— 头部说明与流动开关、左侧主题筛选与计数器、右侧六张 WebGL 胶囊
-->
<template>
  <div class="studio">
    <header class="head">
      <div class="head__meta">
        <h1 class="head__title">{{ COLOR_LAB_ENTRY.title }}</h1>
        <p class="head__desc">{{ COLOR_LAB_ENTRY.desc }}</p>
        <p class="head__hint">
          <AppIcon name="disc" :size="12" class="head__hint-icon" />
          <span>{{ FLUX_STUDIO_UI.hint }}</span>
        </p>
      </div>

      <div class="head__actions">
        <button type="button" class="pill" @click="flowRunning = !flowRunning">
          <AppIcon :name="flowRunning ? 'pause' : 'play'" :size="13" class="pill__icon" />
          <!-- 文案本身就说明动作，无需再加 aria-pressed 让屏幕阅读器重复播报状态 -->
          <span>{{ flowRunning ? FLUX_STUDIO_UI.flowPause : FLUX_STUDIO_UI.flowResume }}</span>
        </button>

        <RouterLink class="pill" :to="{ name: ROUTE_NAME.colorLabLegacy }">
          <span>{{ FLUX_STUDIO_UI.toLegacy }}</span>
          <AppIcon name="arrow-up-right" :size="12" class="pill__icon" />
        </RouterLink>
      </div>
    </header>

    <div class="body">
      <aside class="rail panel panel--warm">
        <h2 class="rail__title">{{ FLUX_STUDIO_UI.filtersTitle }}</h2>

        <ul class="filters">
          <li v-for="(option, index) in FILTER_OPTIONS" :key="option.id" :style="{ '--i': index }">
            <button
              type="button"
              class="filter"
              :class="{ 'is-active': option.id === activeFilter }"
              :aria-pressed="option.id === activeFilter"
              :style="{ '--sw': option.swatch }"
              @click="activeFilter = option.id"
            >
              <span class="filter__dot" aria-hidden="true"></span>
              <span class="filter__en">{{ option.en }}</span>
              <span class="filter__cn">{{ option.cn }}</span>
            </button>
          </li>
        </ul>

        <p class="counter" aria-live="polite">
          <span class="tnum">{{ counterText }}</span>
          <span class="counter__unit">{{ FLUX_STUDIO_UI.counterUnit }}</span>
        </p>
      </aside>

      <!-- 六张卡常驻，筛选只切 visible：v-if 会把 WebGL 上下文和已经流动到的进度一起丢掉 -->
      <div class="grid">
        <!-- 初相位沿用旧版的 i * 13.7 + 1，两版同一套主题才流出同一段花纹，便于对照 -->
        <FluxCapsule
          v-for="(theme, index) in FLUX_THEMES"
          :key="theme.id"
          :theme="theme"
          :seed="index * 13.7 + 1"
          :visible="visibleIds.has(theme.id)"
          :running="flowRunning"
          :style="{ '--i': index }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FluxCapsule from '@/components/flux/FluxCapsule.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { COLOR_LAB_ENTRY, FLUX_STUDIO_UI } from '@/data/dashboard'
import { FLUX_FILTER_ALL, FLUX_THEMES } from '@/data/fluxThemes'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Flux-Studio-View' })

interface FilterOption {
  id: string
  /** 主标签取主题英文名，与胶囊上方的字样保持一致 */
  en: string
  /** 次要标签：中文说明，靠右弱显示 */
  cn: string
  /** 色点的 CSS background 值，故既可以是色值也可以是渐变 */
  swatch: string
}

/* 「全部」没有对应主题色，用六套 PAID 色拼一圈色相环，语义正好是「都不筛」 */
const ALL_SWATCH = `conic-gradient(${FLUX_THEMES.map((theme) => theme.paid).join(', ')})`

/* 纯静态列表，模块作用域算一次即可，没必要进响应式容器 */
const FILTER_OPTIONS: readonly FilterOption[] = [
  { id: FLUX_FILTER_ALL, en: 'ALL', cn: FLUX_STUDIO_UI.filterAll, swatch: ALL_SWATCH },
  ...FLUX_THEMES.map((theme) => ({
    id: theme.id,
    en: theme.en,
    cn: theme.cn,
    swatch: theme.paid,
  })),
]

/* FLUX_FILTER_ALL 带字面量类型，不显式标注 ref 就只允许等于 'all'，切主题会报类型错 */
const activeFilter = ref<string>(FLUX_FILTER_ALL)
const flowRunning = ref(true)

/** @description 当前可见的主题集合；用集合而非过滤后的数组，卡片才不会因增删重建上下文 */
const visibleIds = computed(() =>
  activeFilter.value === FLUX_FILTER_ALL
    ? new Set(FLUX_THEMES.map((theme) => theme.id))
    : new Set([activeFilter.value]),
)

/** @description 补零到两位，对齐旧版「06 / 06」的等宽排布 */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

const counterText = computed(() => `${pad(visibleIds.value.size)} / ${pad(FLUX_THEMES.length)}`)
</script>

<style scoped>
.studio {
  /* 外壳与页脚由 AppShell 提供，这里只是内容层，纵向节奏自己管 */
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2.4cqi, 24px);
  min-width: 0;
  margin: clamp(14px, 2.6cqi, 24px) 0 clamp(18px, 3cqi, 30px);
}

/* —— 头部 —— */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  /* 操作区换行由 wrap 兜底，尺寸走 clamp 流式，不在断点上跳变 */
  gap: clamp(12px, 2cqi, 20px) clamp(16px, 3cqi, 28px);
}

.head__title {
  font-size: clamp(26px, 5cqi, var(--fs-display));
  font-weight: 300;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.head__desc {
  margin-top: 6px;
  color: var(--c-ink-2);
}

.head__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: var(--fs-label);
  color: var(--c-ink-3);
}

.head__hint-icon {
  color: var(--c-ink-4);
}

.head__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.pill {
  display: flex;
  align-items: center;
  gap: 7px;
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

.pill:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

.pill:active {
  transform: translateY(0);
}

.pill__icon {
  color: var(--c-ink-3);
}

.pill:hover .pill__icon {
  color: var(--c-ink);
}

.pill:focus-visible,
.filter:focus-visible {
  outline: 2px solid var(--c-accent-deep);
  outline-offset: 2px;
}

/* —— 主体：左栏 + 胶囊栅格 —— */
.body {
  display: grid;
  grid-template-columns: clamp(186px, 19cqi, 224px) minmax(0, 1fr);
  align-items: start;
  gap: clamp(20px, 3.4cqi, 40px);
}

.rail {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.6cqi, 16px);
  min-width: 0;
  padding: clamp(12px, 1.5cqi, 16px);
}

.rail__title {
  font-size: var(--fs-label);
  font-weight: 600;
  color: var(--c-ink-3);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

/* flex: none 同时服务三档：竖排时被 .filter 的 width 拉满，横排与滚动时按内容宽排列 */
.filters > li {
  flex: none;
  min-width: 0;
}

.filter {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-width: 0;
  padding: clamp(7px, 0.95cqi, 10px) clamp(10px, 1.3cqi, 14px);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-align: left;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.filter:hover {
  color: var(--c-ink);
  transform: translateY(-1px);
}

.filter:active {
  transform: translateY(0);
}

/* 色点取主题的 PAID 色，与胶囊右下角那枚标记同源 */
.filter__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--sw);
  transition: transform 0.25s ease;
}

.filter__en {
  white-space: nowrap;
}

.filter__cn {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--c-ink-4);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 选中态压在 hover 之后声明：两者特异性相同，靠书写顺序让深色底不被 hover 抢回去 */
.filter.is-active {
  background: var(--c-dark);
  color: var(--c-surface);
}

.filter.is-active .filter__cn {
  color: var(--c-ink-3);
}

.filter.is-active .filter__dot {
  transform: scale(1.25);
}

.counter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-mini);
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--c-ink);
}

/* 旧版用一条尾线收住计数器，这里延续同样的收尾感 */
.counter::after {
  width: 28px;
  height: 1px;
  background: var(--c-line-dash);
  content: '';
}

.counter__unit {
  font-weight: 500;
  letter-spacing: 0;
  color: var(--c-ink-3);
}

/* 地板宽约 270px：FLUX 字样 + 44px 左内边距 + 价格行，再窄就要压到材质上 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(26px, 4.2cqi, 44px) clamp(24px, 4.4cqi, 46px);
  align-content: start;
  min-width: 0;
}

/*
 * 900px：两列胶囊（约 590px）+ 间隙 + 左栏 224px 已经顶到外壳内边距，
 * 但单靠缩间隙还能救，所以这一档只把左栏横置，胶囊保持两列。
 */
@container stage (max-width: 900px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
  }

  .rail {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
  }

  .rail__title {
    width: 100%;
  }

  /* 胶囊按内容宽自然换行：等宽轨道会把「原始版本」这栏中文压成省略号 */
  .filters {
    flex: 1 1 340px;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter {
    width: auto;
  }

  .counter {
    margin-left: auto;
  }

  .grid {
    gap: clamp(22px, 3.4cqi, 34px) clamp(20px, 3cqi, 32px);
  }
}

/*
 * 640px：两列会掉到 260px 以下，宁可让页面变长也不压扁胶囊；
 * 七个筛选项在这里换行会把栏高顶到两倍以上，改成一条横向滚动的胶囊带。
 */
@container stage (max-width: 640px) {
  .head__actions {
    flex-wrap: wrap;
  }

  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(18px, 4.5cqi, 26px);
  }

  /* 上一档改的是 wrap，这里得连方向一起显式覆盖，否则继承到基档的 column 就变回竖排 */
  .filters {
    flex: 1 1 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filters::-webkit-scrollbar {
    display: none;
  }

  .counter {
    margin-left: 0;
  }
}

/* 首屏错峰上浮：区块按 nth-child，十余个重复项按 --i 换算延时，省掉十几条同构规则 */
.studio > *,
.filters > li,
.grid > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: calc(var(--i, 0) * 55ms + 0.12s);
}

.studio > :nth-child(1) {
  animation-delay: 0.06s;
}

.studio > :nth-child(2) {
  animation-delay: 0.16s;
}
</style>
