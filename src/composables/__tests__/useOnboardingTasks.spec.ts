/**
 * @Author: zlc
 * @Description: 入职任务共享状态的单测 —— 两张卡共用一个模块级单例，计数联动是它的唯一契约
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ONBOARDING_TASKS } from '@/data/dashboard'

/** 状态挂在模块作用域，用例之间必须重置模块才能拿到干净的初始态 */
async function useStore() {
  const mod = await import('@/composables/useOnboardingTasks')
  return mod.useOnboardingTasks()
}

const initialDone = ONBOARDING_TASKS.items.filter((item) => item.done).length

beforeEach(() => {
  vi.resetModules()
})

describe('useOnboardingTasks', () => {
  it('初始计数与数据源一致', async () => {
    const { doneCount, restCount, total } = await useStore()

    expect(doneCount.value).toBe(initialDone)
    expect(total).toBe(ONBOARDING_TASKS.total)
    expect(restCount.value).toBe(total - initialDone)
  })

  it('勾选未完成任务时完成数加一、剩余数减一', async () => {
    const { tasks, doneCount, restCount, toggle } = await useStore()
    const pending = tasks.value.find((item) => !item.done)
    if (!pending) throw new Error('数据源里没有未完成任务，用例前提不成立')

    toggle(pending.title)

    expect(doneCount.value).toBe(initialDone + 1)
    expect(restCount.value).toBe(ONBOARDING_TASKS.total - initialDone - 1)
  })

  it('重复点击回到原态，两个计数也回到原值', async () => {
    const { tasks, doneCount, toggle } = await useStore()
    const target = tasks.value.find((item) => !item.done)
    if (!target) throw new Error('数据源里没有未完成任务，用例前提不成立')

    toggle(target.title)
    toggle(target.title)

    expect(target.done).toBe(false)
    expect(doneCount.value).toBe(initialDone)
  })

  it('切换不存在的任务标题不改变任何状态', async () => {
    const { doneCount, toggle } = await useStore()

    toggle('没有这条任务')

    expect(doneCount.value).toBe(initialDone)
  })
})
