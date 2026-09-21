<!--
 * @Author: zlc
 * @Description: 日程卡 —— 月份可前后切换，表头按基准日实时推算，虚线网格与排期事件
-->
<template>
  <section class="panel schedule">
    <header class="schedule__head">
      <button type="button" class="schedule__month" aria-label="上一月" @click="shiftMonth(-1)">
        {{ prevMonthLabel }}
      </button>

      <h2 class="schedule__title" :key="monthTitle">{{ monthTitle }}</h2>

      <button type="button" class="schedule__month" aria-label="下一月" @click="shiftMonth(1)">
        {{ nextMonthLabel }}
      </button>
    </header>

    <div class="schedule__scroll">
      <div
        class="schedule__grid"
        :style="{
          '--cols': CALENDAR.dayCount,
          '--rows': CALENDAR.rows.length,
        }"
      >
        <span class="schedule__corner" />
        <div
          v-for="(day, index) in monthDays"
          :key="day.date"
          class="schedule__day"
          :class="{ 'is-today': day.today }"
          :style="{ '--i': index }"
        >
          <span class="schedule__weekday">{{ day.weekday }}</span>
          <strong class="schedule__date">{{ day.date }}</strong>
        </div>

        <template v-for="row in CALENDAR.rows" :key="row">
          <span class="schedule__time">{{ row }}</span>
          <span v-for="day in monthDays" :key="`${row}-${day.date}`" class="schedule__cell" />
        </template>

        <article
          v-for="event in SCHEDULE_EVENTS"
          :key="event.title"
          class="event"
          :class="`event--${event.theme}`"
          :style="{
            gridColumn: `${event.col + 1} / span ${event.span}`,
            gridRow: `${event.row + 1}`,
          }"
        >
          <div class="event__meta">
            <strong class="event__title">{{ event.title }}</strong>
            <span class="event__desc">{{ event.desc }}</span>
          </div>
          <AvatarStack class="event__people" :images="event.avatars" :size="20" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AvatarStack from '@/components/ui/AvatarStack.vue'
import { CALENDAR, SCHEDULE_EVENTS, WEEKDAY_LABELS } from '@/data/dashboard'
import type { CalendarDay } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-ScheduleCard' })

const MONTH_LABELS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
] as const

/** 相对基准月（2024-09）的偏移量 */
const monthOffset = ref(0)

/** 当前月份网格首日 */
const gridStart = computed(() => {
  const start = new Date(CALENDAR.anchor)
  start.setMonth(start.getMonth() + monthOffset.value)
  return start
})

const monthTitle = computed(() => {
  const date = gridStart.value
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
})

const prevMonthLabel = computed(() => MONTH_LABELS[(gridStart.value.getMonth() + 11) % 12])
const nextMonthLabel = computed(() => MONTH_LABELS[(gridStart.value.getMonth() + 1) % 12])

const monthDays = computed<CalendarDay[]>(() =>
  Array.from({ length: CALENDAR.dayCount }, (_, index) => {
    const date = new Date(gridStart.value)
    date.setDate(date.getDate() + index)
    return {
      weekday: WEEKDAY_LABELS[date.getDay()],
      date: date.getDate(),
      today: monthOffset.value === 0 && index === CALENDAR.todayIndex,
    }
  }),
)

function shiftMonth(step: number): void {
  monthOffset.value += step
}
</script>

<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 14px 14px;
}

.schedule__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.schedule__month {
  padding: 4px 11px;
  border-radius: var(--r-pill);
  background: var(--c-accent-soft);
  color: var(--c-ink-2);
  font-size: 9.5px;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.schedule__month:hover {
  background: var(--c-accent);
  color: var(--c-ink);
}

.schedule__title {
  font-size: 13px;
  font-weight: 500;
  animation: fade-in 0.22s ease backwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

.schedule__scroll {
  display: flex;
  flex: 1;
  min-height: 0;
}

.schedule__grid {
  position: relative;
  display: grid;
  flex: 1;
  grid-template-columns: 44px repeat(var(--cols), 1fr);
  grid-template-rows: 30px repeat(var(--rows), minmax(0, 1fr));
  margin-top: 4px;
}

.schedule__corner {
  grid-area: 1 / 1;
}

.schedule__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  animation: fade-in 0.3s ease backwards;
  animation-delay: calc(var(--i) * 26ms);
}

.schedule__weekday {
  font-size: 9px;
  color: var(--c-ink-3);
}

.schedule__date {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--c-ink-3);
  transition: color 0.2s ease;
}

.schedule__day.is-today .schedule__date {
  color: var(--c-ink);
}

.schedule__time {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
  font-size: 9px;
  color: var(--c-ink-3);
}

.schedule__cell {
  border-left: 1px dashed var(--c-line-dash);
  border-bottom: 1px dashed var(--c-line-dash);
}

.event {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  align-self: center;
  width: calc(100% + 10px);
  padding: 8px 9px;
  border-radius: 12px;
}

.event--dark {
  background: var(--c-dark);
  color: #fff;
  --avatar-ring: var(--c-dark);
}

.event--light {
  background: var(--c-surface);
  box-shadow: 0 10px 22px -18px rgba(23, 23, 26, 0.7);
  --avatar-ring: var(--c-surface);
}

.event__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.event__title {
  font-size: 10.5px;
  font-weight: 500;
  white-space: nowrap;
}

.event__desc {
  font-size: 8.5px;
  color: currentColor;
  opacity: 0.55;
  white-space: nowrap;
}

.event__people {
  flex: none;
}

@container stage (max-width: 720px) {
  /* 六列日程在手机上压不出可读列宽，改为保持最小宽度 + 横向滑动 */
  .schedule__scroll {
    overflow-x: auto;
    padding-bottom: 4px;
    overscroll-behavior-x: contain;
  }

  .schedule__grid {
    min-width: 520px;
  }

  .event__title,
  .event__desc {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
