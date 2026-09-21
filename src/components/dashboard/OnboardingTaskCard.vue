<!--
 * @Author: zlc
 * @Description: 入职任务清单（深色卡）—— 点击任意行切换完成态，计数与入职进度卡联动
-->
<template>
  <section class="panel tasks">
    <header class="tasks__head">
      <h2 class="tasks__title">{{ ONBOARDING_TASKS.title }}</h2>
      <strong class="tasks__count tnum">{{ doneCount }}/{{ total }}</strong>
    </header>

    <ul class="tasks__list">
      <li v-for="task in tasks" :key="task.title">
        <button
          type="button"
          class="task"
          :class="{ 'is-done': task.done }"
          :aria-pressed="task.done"
          @click="toggle(task.title)"
        >
          <span class="task__icon">
            <AppIcon :name="task.icon" :size="14" />
          </span>
          <span class="task__meta">
            <strong class="task__name">{{ task.title }}</strong>
            <span class="task__time">{{ task.time }}</span>
          </span>
          <span class="task__state">
            <Transition name="pop">
              <AppIcon v-if="task.done" name="check" :size="10" :stroke-width="2.4" />
            </Transition>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useOnboardingTasks } from '@/composables/useOnboardingTasks'
import { ONBOARDING_TASKS } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-OnboardingTaskCard' })

const { tasks, doneCount, total, toggle } = useOnboardingTasks()
</script>

<style scoped>
.tasks {
  display: flex;
  flex-direction: column;
  padding: 16px 14px 14px;
  border-radius: var(--r-panel);
  background: var(--c-dark-2);
  color: #fff;
  box-shadow: var(--sd-float);
}

.tasks__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 8px;
}

.tasks__title {
  font-size: 13px;
  font-weight: 500;
}

.tasks__count {
  font-size: 20px;
  font-weight: 300;
  letter-spacing: -0.01em;
}

.tasks__list {
  display: flex;
  flex-direction: column;
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 4px 4px;
  border-radius: 10px;
  text-align: left;
  transition: background-color 0.18s ease;
}

.task:hover {
  background: rgba(255, 255, 255, 0.06);
}

.task__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.72);
  transition: background-color 0.18s ease;
}

.task:hover .task__icon {
  background: rgba(255, 255, 255, 0.14);
}

.task__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.task__name {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.18s ease;
}

.task__time {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.28);
}

.task.is-done .task__name {
  color: #fff;
}

.task__state {
  position: relative;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: var(--c-ink);
  background: transparent;
  transition: background-color 0.2s ease;
}

/* 未完成任务只留一个小灰点，18px 盒位固定避免勾选时抖动 */
.task:not(.is-done) .task__state::after {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  content: '';
}

.task.is-done .task__state {
  background: var(--c-accent);
}

.pop-enter-active {
  transition:
    transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.16s ease;
}

.pop-leave-active {
  transition:
    transform 0.14s ease,
    opacity 0.1s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.4);
}
</style>
