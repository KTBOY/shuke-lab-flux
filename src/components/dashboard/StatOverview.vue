<!--
 * @Author: zlc
 * @Description: 概览指标区 —— 四条按数值分配宽度的进度胶囊 + 右侧三项 KPI
-->
<template>
  <section class="stats">
    <ul class="stats__bars">
      <li
        v-for="(bar, index) in STAT_BARS"
        :key="bar.label"
        class="stats__slot"
        :style="{ flexGrow: bar.value, '--i': index }"
      >
        <span class="stats__label">{{ bar.label }}</span>
        <span class="bar" :class="`bar--${bar.variant}`">
          <span class="bar__value">{{ bar.value }}%</span>
        </span>
      </li>
    </ul>

    <ul class="stats__kpi">
      <li v-for="kpi in KPI_STATS" :key="kpi.label" class="kpi">
        <div class="kpi__row">
          <AppIcon class="kpi__icon" :name="kpi.icon" :size="18" />
          <strong class="kpi__value tnum">{{ kpi.value }}</strong>
        </div>
        <span class="kpi__label">{{ kpi.label }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { KPI_STATS, STAT_BARS } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-StatOverview' })
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

.bar {
  display: flex;
  align-items: center;
  height: 27px;
  padding: 0 12px;
  border-radius: var(--r-pill);
  animation: wipe-in 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 70ms + 0.18s);
}

/* 用 clip-path 擦出而非 scaleX，避免把胶囊里的百分比文字拉变形 */
@keyframes wipe-in {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.bar__value {
  font-size: var(--fs-mini);
  font-weight: 500;
}

.bar--dark {
  background: var(--c-dark);
  color: #fff;
}

.bar--accent {
  background: var(--c-accent);
  color: var(--c-ink);
}

.bar--striped {
  border: 1px solid var(--c-line);
  background-color: rgba(255, 255, 255, 0.34);
  background-image: repeating-linear-gradient(
    122deg,
    rgba(23, 23, 26, 0.28) 0 1px,
    transparent 1px 8px
  );
  color: var(--c-ink);
}

.bar--outline {
  border: 1px solid var(--c-line);
  background: rgba(255, 255, 255, 0.5);
  color: var(--c-ink-3);
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
  }
}
</style>
