/**
 * @Author: zlc
 * @Description: 图标路径表单测 —— 表类型已保证 key 齐全，这里守的是"渲染得出来"
 */
import { describe, expect, it } from 'vitest'
import { ICON_SHAPES } from '@/data/icons'
import type { IconName } from '@/data/icons'

const entries = Object.entries(ICON_SHAPES) as [IconName, (typeof ICON_SHAPES)[IconName]][]

describe('ICON_SHAPES', () => {
  it('每个图标至少有一条图元', () => {
    expect(entries.length).toBeGreaterThan(0)
    entries.forEach(([name, shapes]) => {
      expect(shapes.length, `${name} 是空图标`).toBeGreaterThan(0)
    })
  })

  it('每条图元要么是路径要么是圆，否则渲染时静默消失', () => {
    entries.forEach(([name, shapes]) => {
      shapes.forEach((shape) => {
        const isPath = typeof shape.d === 'string' && shape.d.length > 0
        const isDot = shape.cx !== undefined && shape.cy !== undefined && shape.r !== undefined
        expect(isPath || isDot, `${name} 存在既无 d 也无圆心的图元`).toBe(true)
      })
    })
  })

  it('路径只使用直线与圆弧指令，保持 24 视窗内的描边风格', () => {
    entries.forEach(([name, shapes]) => {
      shapes.forEach((shape) => {
        if (shape.d === undefined) return
        const commands = [...shape.d].filter((char) => /[A-Za-z]/.test(char)).join('')
        expect(commands, `${name} 出现了未预期的绘制指令`).toMatch(/^[MmLlHhVvAaCcZz]+$/)
      })
    })
  })
})
