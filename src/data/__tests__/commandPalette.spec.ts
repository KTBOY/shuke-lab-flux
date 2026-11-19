/**
 * @Author: zlc
 * @Description: 命令面板规则单测 —— 搜索分组口径与本地问答三类问法、兜底，
 *               问答期望全部按 permissions.ts 的真实映射手算，不跟着实现跑
 */
import { describe, expect, it } from 'vitest'
import {
  answerPermissionQuestion,
  answerSummary,
  flattenGroups,
  isQuestionLike,
  searchCommands,
} from '@/data/commandPalette'

describe('searchCommands', () => {
  it('空查询是默认态：只有页面与动作两组，没有实体组', () => {
    const groups = searchCommands('')
    expect(groups.map((group) => group.id)).toEqual(['page', 'action'])
    const labels = flattenGroups(groups).map((item) => item.label)
    expect(labels).toContain('仪表盘')
    expect(labels).toContain('权限星图')
    expect(labels).toContain('颜色实验室')
    expect(labels).toContain('切换深色 / 浅色模式')
    expect(labels).toContain('恢复默认主题')
    /* 六套 FLUX 主题各一条应用动作 */
    expect(labels).toContain('应用主题 AURORA')
  })

  it('搜「星图」命中权限星图页面与同名菜单实体', () => {
    const items = flattenGroups(searchCommands('星图'))
    expect(items.some((item) => item.id === 'page:permissions')).toBe(true)
    expect(items.some((item) => item.id === 'entity:menu:permission-map')).toBe(true)
  })

  it('搜「导出」命中数据导出菜单实体', () => {
    const items = flattenGroups(searchCommands('导出'))
    expect(items.some((item) => item.id === 'entity:menu:export')).toBe(true)
  })

  it('搜「深色」命中切换模式动作，组合词「应用 aurora」命中对应主题动作', () => {
    expect(
      flattenGroups(searchCommands('深色')).some((item) => item.actionId === 'toggle-color-mode'),
    ).toBe(true)
    const applied = flattenGroups(searchCommands('应用 aurora'))
    expect(applied.some((item) => item.actionId === 'apply-theme:aurora')).toBe(true)
  })

  it('搜「退出」命中退出登录动作', () => {
    const items = flattenGroups(searchCommands('退出'))
    expect(items.some((item) => item.actionId === 'logout')).toBe(true)
  })

  it('无意义查询返回空分组（组件据此出空状态与问答入口）', () => {
    expect(searchCommands('zzz不存在的东西')).toEqual([])
  })
})

describe('isQuestionLike', () => {
  it('带疑问特征的算问题，纯名词搜索不算', () => {
    expect(isQuestionLike('谁能导出数据？')).toBe(true)
    expect(isQuestionLike('运营有什么权限')).toBe(true)
    expect(isQuestionLike('访客能导出吗')).toBe(true)
    expect(isQuestionLike('权限星图')).toBe(false)
    expect(isQuestionLike('星图')).toBe(false)
    expect(isQuestionLike('')).toBe(false)
  })
})

describe('answerPermissionQuestion', () => {
  it('不是问题形态时返回 null，交给搜索', () => {
    expect(answerPermissionQuestion('星图')).toBeNull()
    expect(answerPermissionQuestion('导出')).toBeNull()
  })

  it('「谁能导出数据」：反查到超级管理员、运营、财务与全部用户链', () => {
    const answer = answerPermissionQuestion('谁能导出数据？')
    expect(answer?.type).toBe('who-can')
    if (answer?.type !== 'who-can') return
    expect(answer.menu.id).toBe('export')
    expect(answer.roles.map((role) => role.id)).toEqual(['super', 'ops', 'finance'])
    expect(answer.chains.map((chain) => chain.user.name)).toEqual([
      '周明远',
      '陈嘉禾',
      '韩子墨',
      '吴若曦',
      '顾一舟',
      '唐婉婷',
    ])
    expect(answer.chains.every((chain) => chain.menu.id === 'export')).toBe(true)
    expect(answerSummary(answer)).toContain('数据导出')
    expect(answerSummary(answer)).toContain('顾一舟')
  })

  it('「谁能删除用户」：同义词落到用户管理，链上有周明远与林小鹿', () => {
    const answer = answerPermissionQuestion('谁能删除用户？')
    expect(answer?.type).toBe('who-can')
    if (answer?.type !== 'who-can') return
    expect(answer.menu.id).toBe('user-manage')
    expect(answer.chains.map((chain) => chain.user.name)).toEqual(['周明远', '林小鹿', '何俊杰'])
  })

  it('「运营有什么权限」：答清单，运营的 5 个菜单一个不多一个不少', () => {
    const answer = answerPermissionQuestion('运营有什么权限？')
    expect(answer?.type).toBe('role-check')
    if (answer?.type !== 'role-check') return
    expect(answer.menu).toBeNull()
    expect(answer.allowed).toBeNull()
    expect(answer.menus.map((menu) => menu.id)).toEqual([
      'dashboard',
      'content',
      'schedule',
      'work-hours',
      'export',
    ])
  })

  it('「财务能导出吗」答能、「访客能导出吗」答不能', () => {
    const yes = answerPermissionQuestion('财务能导出吗？')
    expect(yes?.type).toBe('role-check')
    if (yes?.type === 'role-check') {
      expect(yes.role.id).toBe('finance')
      expect(yes.allowed).toBe(true)
    }

    const no = answerPermissionQuestion('访客能导出吗？')
    expect(no?.type).toBe('role-check')
    if (no?.type === 'role-check') {
      expect(no.role.id).toBe('guest')
      expect(no.allowed).toBe(false)
      expect(answerSummary(no)).toContain('不能')
    }
  })

  it('「苏晴能管理用户吗」：经由编辑角色判定为不能；「周明远能删除用户吗」经由超级管理员为能', () => {
    const no = answerPermissionQuestion('苏晴能管理用户吗？')
    expect(no?.type).toBe('user-check')
    if (no?.type === 'user-check') {
      expect(no.user.id).toBe('su-qing')
      expect(no.menu?.id).toBe('user-manage')
      expect(no.allowed).toBe(false)
    }

    const yes = answerPermissionQuestion('周明远能删除用户吗？')
    expect(yes?.type).toBe('user-check')
    if (yes?.type === 'user-check') {
      expect(yes.allowed).toBe(true)
      expect(yes.viaRoles.map((role) => role.id)).toEqual(['super'])
      expect(answerSummary(yes)).toContain('超级管理员')
    }
  })

  it('答不出的问题走 unknown 兜底，不编造', () => {
    const answer = answerPermissionQuestion('今天天气怎么样？')
    expect(answer?.type).toBe('unknown')
    if (answer?.type === 'unknown') {
      expect(answerSummary(answer)).toContain('答不上来')
    }
    /* 问「谁」但点不到任何菜单，同样兜底 */
    expect(answerPermissionQuestion('谁负责打扫卫生？')?.type).toBe('unknown')
  })
})
