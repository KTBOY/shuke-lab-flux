import { computed, ref } from 'vue'
import { ONBOARDING_TASKS } from '@/data/dashboard'
import type { TaskItem } from '@/data/dashboard'

/**
 * @Author: zlc
 * @Description: 入职任务共享状态 —— 任务清单卡与入职进度卡都要读完成数，故提到模块级单例
 */
const tasks = ref<TaskItem[]>(ONBOARDING_TASKS.items.map((task) => ({ ...task })))

const doneCount = computed(() => tasks.value.filter((task) => task.done).length)
const restCount = computed(() => ONBOARDING_TASKS.total - doneCount.value)

export function useOnboardingTasks() {
  /** 点击任务行切换完成态 */
  function toggle(title: string): void {
    const target = tasks.value.find((task) => task.title === title)
    if (target) target.done = !target.done
  }

  return { tasks, doneCount, restCount, total: ONBOARDING_TASKS.total, toggle }
}
