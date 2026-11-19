<!--
 * @Author: zlc
 * @Description: 概览指标区 —— 四条同轨道、同填充的进度胶囊（差异只由填充长度表达）+ 右侧三项 KPI
-->
<template>
  <section class="stats">
    <ul class="stats__bars">
      <li
        v-for="(bar, index) in bars"
        :key="bar.label"
        class="stats__slot"
        :style="{ '--i': index }"
      >
        <span class="stats__label">{{ bar.label }} · {{ bar.baseline }}</span>
        <span class="bar">
          <span class="bar__value tnum">{{ bar.display }}%</span>
          <span class="bar__track">
            <span class="bar__fill" :style="{ width: `${bar.value}%` }"></span>
          </span>
        </span>
      </li>
    </ul>

    <ul class="stats__kpi">
      <li v-for="kpi in kpis" :key="kpi.label" class="kpi">
        <div class="kpi__row">
          <AppIcon class="kpi__icon" :name="kpi.icon" :size="18" />
          <!-- 动画节点对读屏隐藏：逐帧中间值不该被念出来，终值由下面的一次性 live 区播报 -->
          <strong class="kpi__value tnum" aria-hidden="true">{{ kpi.display }}</strong>
          <span class="sr-only" aria-live="polite">{{ kpi.finalText }}</span>
        </div>
        <span class="kpi__label">{{ kpi.label }}</span>

        <div class="kpi__foot">
          <span class="kpi__delta" :class="`kpi__delta--${kpi.tone}`">
            <span class="kpi__delta-label">{{ KPI_DELTA_LABEL }}</span>
            <AppIcon :name="kpi.delta >= 0 ? 'chevron-up' : 'chevron-down'" :size="10" />
            <span class="tnum">{{ signed(kpi.delta) }}</span>
          </span>

          <span class="kpi__trend" aria-hidden="true">
            <span v-for="(column, index) in kpi.trend" :key="index" class="trend__col">
              <i
                v-for="row in TREND_ROWS"
                :key="row"
                class="trend__dot"
                :class="{ 'is-on': row > TREND_ROWS - Math.round(column * TREND_ROWS) }"
              ></i>
            </span>
          </span>
          <span class="kpi__trend-label" aria-hidden="true">{{ KPI_TREND_LABEL }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCountUp } from '@/composables/useCountUp'
import { KPI_DELTA_LABEL, KPI_STATS, KPI_TREND_LABEL, STAT_BARS } from '@/data/dashboard'
import type { KpiStat } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-StatOverview' })

/* 主数字挂载时从 0 滚到目标值；填充长度按终值定版，不随滚动逐帧变宽 */
const barCountUps = STAT_BARS.map((bar) => useCountUp(bar.value))
const kpiCountUps = KPI_STATS.map((kpi) => useCountUp(kpi.value))

/** delta 的色调跟含义走、不跟方向走：中性指标一律灰，定性明确时方向与含义相符才算「好」 */
function deltaTone(kpi: KpiStat): 'pos' | 'neg' | 'neu' {
  if (kpi.sentiment === 'neutral' || kpi.delta === 0) return 'neu'
  return kpi.delta > 0 === (kpi.sentiment === 'positive') ? 'pos' : 'neg'
}

/** 把当前帧的格式化文案并回数据行，模板只读字段、不感知滚动细节 */
const bars = computed(() =>
  STAT_BARS.map((bar, index) => ({ ...bar, display: barCountUps[index]?.text.value ?? '' })),
)
const kpis = computed(() =>
  KPI_STATS.map((kpi, index) => ({
    ...kpi,
    display: kpiCountUps[index]?.text.value ?? '',
    /* 落定前为空、落定后一次性写入终值：挂在 sr-only 的 live 区里，只播报一次 */
    finalText: kpiCountUps[index]?.finalText.value ?? '',
    tone: deltaTone(kpi),
  })),
)

/** 点阵的行数：列高按它取整，七列四行足够看出形状又不抢主数值 */
const TREND_ROWS = 4

function signed(value: number): string {
  return `${value >= 0 ? '+' : '−'}${Math.abs(value)}`
}
</script>

<style scoped>
.stats {
  display: flex;
  align-items: flex-end;
  gap: 28px;
}

.stats__bars {
  display: flex;
  flex: 1 1 auto;
  align-items: flex-end;
  gap: 10px;
  min-width: 0;
}

.stats__slot {
  display: flex;
  /* 四个槽等宽：轨道长度不再编码数值，避免四条并排被读成一条构成/份额条 */
  flex: 1 1 0;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.stats__label {
  padding-left: 2px;
  font-size: var(--fs-label);
  color: var(--c-ink-2);
  white-space: nowrap;
}

/*
 * 同组同画法：一条轨道 + 一段填充，四条只差填充长度。
 * 数值不压在填充上：填充色随桥接主题变（可深可浅），压字必然在某套主题下丢对比；
 * 数值固定站在轨道左侧、走墨字，填充只负责长度编码。
 */
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: wipe-in 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 70ms + 0.18s);
}

/* 用 clip-path 擦出而非 scaleX，避免把百分比文字拉变形 */
@keyframes wipe-in {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.bar__value {
  flex: none;
  font-size: var(--fs-label);
  font-weight: 500;
}

.bar__track {
  position: relative;
  flex: 1;
  height: 27px;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
}

.bar__fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--c-accent);
}

.stats__kpi {
  display: flex;
  flex: none;
  align-items: flex-end;
  gap: 30px;
}

.kpi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.kpi__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kpi__icon {
  color: var(--c-ink-3);
}

.kpi__value {
  font-size: var(--fs-kpi);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
}

.kpi__label {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.kpi__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
}

.kpi__delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: var(--r-pill);
  font-size: var(--fs-label);
  font-weight: 500;
  line-height: 1.3;
}

/* 颜色跟含义不跟箭头：语义为「好」才吃强调底，中性与「坏」一律描边灰 */
.kpi__delta--pos {
  border: 1px solid var(--c-accent-deep);
  background: var(--c-accent-soft);
  color: var(--c-ink);
}

.kpi__delta--neg,
.kpi__delta--neu {
  border: 1px solid var(--c-line-dash);
  color: var(--c-ink-2);
}

/* 比较窗与趋势窗各自上屏标注，不再只藏在 sr-only 里 */
.kpi__delta-label {
  font-weight: 400;
  opacity: 0.75;
}

.kpi__trend-label {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
  white-space: nowrap;
}

.kpi__trend {
  display: flex;
  align-items: flex-end;
  gap: 2px;
}

.trend__col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trend__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--c-line-dash);
}

.trend__dot.is-on {
  background: var(--c-ink-2);
}

@container stage (max-width: 1080px) {
  .stats {
    gap: 18px;
  }

  .stats__kpi {
    gap: 18px;
  }
}

@container stage (max-width: 720px) {
  .stats {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  /* 单列空间放不下「宽度即数值」的横条，改为两列网格、胶囊占满格宽 */
  .stats__bars {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 10px;
  }

  .stats__kpi {
    justify-content: space-between;
    gap: 12px;
  }

  .kpi {
    align-items: flex-start;
    min-width: 0;
  }

  /* 比较窗与趋势窗都上屏后，单枚 KPI 的脚注在手机宽下排不下一行，允许折行而不是撑出整页横滚 */
  .kpi__foot {
    flex-wrap: wrap;
    row-gap: 4px;
  }
}
</style>
