import { computed, ref } from 'vue'
import { ONBOARDING_TASKS } from '@/data/dashboard'
import type { TaskItem } from '@/data/dashboard'

/**
 * @Author: zlc
 * @Description: 入职任务共享状态 —— 任务清单卡与入职进度卡都要读完成数，故提到模块级单例
 */
const tasks = ref<TaskItem[]>(ONBOARDING_TASKS.items.map((task) => ({ ...task })))

/** 总数只有一个出处：清单本身有几行就是几项，不在数据里另存一份常数 */
const total = ONBOARDING_TASKS.items.length

const doneCount = computed(() => tasks.value.filter((task) => task.done).length)
const restCount = computed(() => total - doneCount.value)
/** 完成率同源现算：进度卡大字、任务分项条与洞察数字都读它，全屏只有一个答案 */
const completionRate = computed(() =>
  total === 0 ? 0 : Math.round((doneCount.value / total) * 100),
)

export function useOnboardingTasks() {
  /** 点击任务行切换完成态 */
  function toggle(title: string): void {
    const target = tasks.value.find((task) => task.title === title)
    if (target) target.done = !target.done
  }

  return { tasks, doneCount, restCount, completionRate, total, toggle }
}
