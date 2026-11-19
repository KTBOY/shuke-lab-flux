/**
 * @Author: zlc
 * @Description: 命令面板数据与规则 —— 可搜目录（页面 / 动作 / 权限实体）、模糊匹配，
 *               以及基于权限数据的本地问答（谁能 X / 某角色或某用户有什么权限）。
 *               全部纯函数、无副作用，组件只负责渲染与执行；问答只读 permissions.ts
 *               的映射与派生，数据里没有的权限一律答不出，不猜不编。
 */
import { FLUX_THEMES } from '@/data/fluxThemes'
import type { IconName } from '@/data/icons'
import {
  MENU_BY_ID,
  PERMISSION_MENUS,
  PERMISSION_ROLES,
  PERMISSION_USERS,
  menusOfRole,
  menusOfUser,
  rolesOfUser,
  rolesWithMenu,
  usersOfRole,
} from '@/data/permissions'
import type { PermissionMenu, PermissionRole, PermissionUser } from '@/data/permissions'

/* ---------------- 目录条目 ---------------- */

export type CommandKind = 'page' | 'action' | 'entity'
export type CommandEntityKind = 'user' | 'role' | 'menu'

export interface CommandItem {
  /** 全局唯一，动作类带前缀（如 apply-theme:aurora），实体类带 kind 前缀 */
  id: string
  kind: CommandKind
  /** 主文案（页面名 / 动作名 / 实体名） */
  label: string
  /** 右侧或下方的弱提示（页面说明 / 动作说明 / 实体类型与简介） */
  hint: string
  icon: IconName
  /** 参与匹配的全部文本（名称 + 别名 + 英文 id + 说明），匹配只看这里与 label */
  keywords: string
  /** kind = page 时的目标路由名（与 ROUTE_NAME 的值一致，数据层不反向依赖 router） */
  routeName?: string
  /** kind = action 时的动作标识，执行分支收口在组件里 */
  actionId?: string
  /** kind = entity 时的实体类型与 id，选中后跳权限星图 */
  entityKind?: CommandEntityKind
  entityId?: string
}

export interface CommandGroup {
  id: CommandKind
  label: string
  items: CommandItem[]
}

/** 动作标识：组件执行分支与这里一一对应，新增动作两边同改 */
export const COMMAND_ACTION = {
  toggleColorMode: 'toggle-color-mode',
  restoreDefaultTheme: 'restore-default-theme',
  logout: 'logout',
  applyThemePrefix: 'apply-theme:',
} as const

/* ---------------- 文案 ---------------- */

export const COMMAND_PALETTE_UI = {
  triggerLabel: '搜索',
  triggerAriaLabel: '打开命令面板（⌘K）',
  dialogAriaLabel: '命令面板',
  inputPlaceholder: '搜页面、动作、权限实体，或直接问：谁能导出数据？',
  inputAriaLabel: '命令面板输入',
  groupPage: '页面',
  groupAction: '动作',
  groupEntity: '权限实体',
  emptyTitle: '没有找到匹配项',
  emptyHint: '换个关键词，或把问题问完整一点 —— 比如「谁能导出数据？」',
  askEntryLabel: '用问答方式试试这个问题',
  askEntryHint: '基于权限数据本地分析',
  answerTitle: '权限问答',
  backToResults: '返回搜索结果',
  unknownAnswer: '这个问题我暂时答不上来 —— 我只能查权限数据里真实存在的用户、角色和菜单。',
  unknownExamplesLabel: '可以这样问我：',
  exampleQuestions: ['谁能导出数据？', '运营有什么权限？', '苏晴能管理用户吗？'],
  chainMore: '条链路',
  chainsLabel: '授权链路',
  menusLabel: '菜单清单',
  viaRolesLabel: '经由角色',
  footerHint: '↑↓ 选择 · Enter 执行 · Esc 关闭',
  kindUser: '用户',
  kindRole: '角色',
  kindMenu: '菜单',
}

/* ---------------- 静态目录 ---------------- */

const PAGE_ITEMS: CommandItem[] = [
  {
    id: 'page:dashboard',
    kind: 'page',
    label: '仪表盘',
    hint: '工作台指标与卡片总览',
    icon: 'briefcase',
    keywords: '仪表盘 工作台 首页 dashboard workbench',
    routeName: 'dashboard',
  },
  {
    id: 'page:users',
    kind: 'page',
    label: '用户管理',
    hint: '维护用户、角色归属与启停状态',
    icon: 'people',
    keywords: '用户管理 用户 账号 员工 users accounts management',
    routeName: 'users',
  },
  {
    id: 'page:permissions',
    kind: 'page',
    label: '权限星图',
    hint: '用户、角色与菜单的授权关系全貌',
    icon: 'network',
    keywords: '权限星图 权限 角色 用户 菜单 星图 permissions map',
    routeName: 'permissions',
  },
  {
    id: 'page:color-lab',
    kind: 'page',
    label: '颜色实验室',
    hint: 'FLUX 流体配色，选主题应用到全站',
    icon: 'disc',
    keywords: '颜色实验室 颜色 配色 主题 换肤 lab flux color theme',
    routeName: 'color-lab',
  },
  {
    id: 'page:color-lab-legacy',
    kind: 'page',
    label: '颜色实验室 · 旧版',
    hint: '零依赖单文件版 FLUX',
    icon: 'history',
    keywords: '旧版 单文件 实验室 legacy flux old',
    routeName: 'color-lab-legacy',
  },
]

const ACTION_ITEMS: CommandItem[] = [
  {
    id: `action:${COMMAND_ACTION.toggleColorMode}`,
    kind: 'action',
    label: '切换深色 / 浅色模式',
    hint: '全站深浅外观，与实验室主题正交',
    icon: 'moon',
    keywords: '深色 暗色 浅色 夜间 模式 dark light mode 切换',
    actionId: COMMAND_ACTION.toggleColorMode,
  },
  {
    id: `action:${COMMAND_ACTION.restoreDefaultTheme}`,
    kind: 'action',
    label: '恢复默认主题',
    hint: '摘掉实验室应用的配色，回到默认黄色令牌',
    icon: 'history',
    keywords: '恢复 默认 主题 黄色 重置 reset default theme',
    actionId: COMMAND_ACTION.restoreDefaultTheme,
  },
  {
    id: `action:${COMMAND_ACTION.logout}`,
    kind: 'action',
    label: '退出登录',
    hint: '退出当前演示身份，回到登录页',
    icon: 'logout',
    keywords: '退出 登录 注销 登出 切换账号 logout sign out exit account',
    actionId: COMMAND_ACTION.logout,
  },
  /* 每套 FLUX 主题一条「应用主题」动作：在面板里直接换肤，不必先去实验室 */
  ...FLUX_THEMES.map<CommandItem>((theme) => ({
    id: `action:${COMMAND_ACTION.applyThemePrefix}${theme.id}`,
    kind: 'action',
    label: `应用主题 ${theme.en}`,
    hint: `${theme.cn} · 把这套 FLUX 配色应用到全站`,
    icon: 'zap',
    keywords: `应用 主题 换肤 配色 ${theme.en} ${theme.cn} ${theme.id} apply theme`,
    actionId: `${COMMAND_ACTION.applyThemePrefix}${theme.id}`,
  })),
]

const ENTITY_KIND_LABEL: Record<CommandEntityKind, string> = {
  user: COMMAND_PALETTE_UI.kindUser,
  role: COMMAND_PALETTE_UI.kindRole,
  menu: COMMAND_PALETTE_UI.kindMenu,
}

const ENTITY_ICON: Record<CommandEntityKind, IconName> = {
  user: 'user',
  role: 'people',
  menu: 'link',
}

const ENTITY_ITEMS: CommandItem[] = [
  ...PERMISSION_USERS.map<CommandItem>((user) => ({
    id: `entity:user:${user.id}`,
    kind: 'entity',
    label: user.name,
    hint: `${ENTITY_KIND_LABEL.user} · ${user.title}`,
    icon: ENTITY_ICON.user,
    keywords: `${user.name} ${user.id} ${user.title} 用户`,
    entityKind: 'user',
    entityId: user.id,
  })),
  ...PERMISSION_ROLES.map<CommandItem>((role) => ({
    id: `entity:role:${role.id}`,
    kind: 'entity',
    label: role.name,
    hint: `${ENTITY_KIND_LABEL.role} · ${role.desc}`,
    icon: ENTITY_ICON.role,
    keywords: `${role.name} ${role.id} ${role.desc} 角色`,
    entityKind: 'role',
    entityId: role.id,
  })),
  ...PERMISSION_MENUS.map<CommandItem>((menu) => ({
    id: `entity:menu:${menu.id}`,
    kind: 'entity',
    label: menu.name,
    hint: `${ENTITY_KIND_LABEL.menu} · ${menu.desc}`,
    icon: ENTITY_ICON.menu,
    keywords: `${menu.name} ${menu.id} ${menu.desc} 菜单 权限`,
    entityKind: 'menu',
    entityId: menu.id,
  })),
]

/** 全量目录（页面 + 动作 + 实体），顺序即分组顺序 */
export const COMMAND_CATALOG: CommandItem[] = [...PAGE_ITEMS, ...ACTION_ITEMS, ...ENTITY_ITEMS]

/* ---------------- 搜索 ---------------- */

const GROUP_LABEL: Record<CommandKind, string> = {
  page: COMMAND_PALETTE_UI.groupPage,
  action: COMMAND_PALETTE_UI.groupAction,
  entity: COMMAND_PALETTE_UI.groupEntity,
}

const GROUP_ORDER: CommandKind[] = ['page', 'action', 'entity']
/** 每组最多展示条数：实体全量 35 条，命中太多时截断保住面板高度 */
const GROUP_LIMIT = 8

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

/** 条目是否命中：整串命中，或每个空格分词都命中（支持「应用 aurora」这类组合词） */
function matches(item: CommandItem, query: string): boolean {
  const haystack = normalize(`${item.label} ${item.keywords}`)
  if (haystack.includes(query)) return true
  const tokens = query.split(/\s+/).filter(Boolean)
  return tokens.length > 1 && tokens.every((token) => haystack.includes(token))
}

/**
 * 按分组返回命中结果。空查询返回默认态：页面 + 动作两组（实体不带查询时太长，不进默认态）。
 * 空组不返回，组件按返回顺序渲染分组标题。
 */
export function searchCommands(rawQuery: string): CommandGroup[] {
  const query = normalize(rawQuery)
  const groups: CommandGroup[] = []

  GROUP_ORDER.forEach((kind) => {
    const pool = COMMAND_CATALOG.filter((item) => item.kind === kind)
    const items =
      query === '' ? (kind === 'entity' ? [] : pool) : pool.filter((item) => matches(item, query))
    const sliced = items.slice(0, GROUP_LIMIT)
    if (sliced.length > 0) groups.push({ id: kind, label: GROUP_LABEL[kind], items: sliced })
  })

  return groups
}

/** 分组结果摊平成一维列表，键盘上下选择按这个顺序走 */
export function flattenGroups(groups: CommandGroup[]): CommandItem[] {
  return groups.flatMap((group) => group.items)
}

/* ---------------- 问答 ---------------- */

/** 问题特征词：命中任一即视为「在提问」而非在搜目录 */
const QUESTION_MARKERS = [
  '谁',
  '吗',
  '？',
  '?',
  '能不能',
  '可不可以',
  '哪些',
  '哪位',
  '什么',
  '有权',
  '可以',
]

export function isQuestionLike(raw: string): boolean {
  const text = raw.trim()
  if (text === '') return false
  return QUESTION_MARKERS.some((marker) => text.includes(marker))
}

/**
 * 菜单同义词表：问法里的口语说法 → 菜单 id。
 * 只收录数据里真实存在的菜单；匹配时先认菜单原名，再认同义词，长词优先。
 */
const MENU_SYNONYMS: Record<string, string[]> = {
  'user-manage': ['删除用户', '删用户', '停用用户', '新增用户', '管理用户', '用户账号', '账号'],
  'role-manage': ['管理角色', '分配角色'],
  'permission-map': ['看权限', '权限全景', '权限图'],
  dashboard: ['看仪表盘', '工作台'],
  content: ['发内容', '上下架', '内容'],
  device: ['领用设备', '设备'],
  schedule: ['调班', '排班'],
  'work-hours': ['核算工时', '工时'],
  export: ['导出数据', '下载报表', '导出', '下载'],
  settings: ['系统配置', '改参数', '设置'],
  'audit-log': ['审计', '操作记录', '日志'],
  dictionary: ['枚举', '字典'],
  recruit: ['招人', '招聘'],
  calendar: ['会议安排', '日程', '日历'],
  review: ['绩效', '评价'],
  notice: ['发通知', '通知'],
}

/** 按名称长度降序找实体：先长后短，避免「系统管理员」被「管理员」之类的短词抢走（此处即全名优先） */
function findByName<T extends { name: string }>(items: readonly T[], text: string): T | null {
  const sorted = [...items].sort((a, b) => b.name.length - a.name.length)
  return sorted.find((item) => text.includes(item.name)) ?? null
}

function findMenu(text: string): PermissionMenu | null {
  const byName = findByName(PERMISSION_MENUS, text)
  if (byName) return byName

  const pairs: { menuId: string; word: string }[] = []
  Object.entries(MENU_SYNONYMS).forEach(([menuId, words]) => {
    words.forEach((word) => pairs.push({ menuId, word }))
  })
  pairs.sort((a, b) => b.word.length - a.word.length)
  const hit = pairs.find((pair) => text.includes(pair.word))
  return hit ? (MENU_BY_ID.get(hit.menuId) ?? null) : null
}

export interface PermissionChain {
  user: PermissionUser
  role: PermissionRole
  menu: PermissionMenu
}

export type PermissionAnswer =
  | {
      type: 'who-can'
      menu: PermissionMenu
      /** 拥有该菜单的全部角色 */
      roles: PermissionRole[]
      /** 逐条授权链：持有角色的用户 × 角色 × 该菜单 */
      chains: PermissionChain[]
    }
  | {
      type: 'role-check'
      role: PermissionRole
      /** 问句里点到的菜单；没点到时为 null，此时只答清单 */
      menu: PermissionMenu | null
      /** menu 非空时该角色是否有此菜单；menu 为空时为 null */
      allowed: boolean | null
      menus: PermissionMenu[]
    }
  | {
      type: 'user-check'
      user: PermissionUser
      menu: PermissionMenu | null
      allowed: boolean | null
      /** menu 非空且 allowed 时，给出该菜单的角色；menu 为空时是用户的全部角色 */
      viaRoles: PermissionRole[]
      menus: PermissionMenu[]
    }
  | { type: 'unknown' }

/** 结论句：组件直接展示，规则细节都收口在这里便于单测 */
export function answerSummary(answer: PermissionAnswer): string {
  switch (answer.type) {
    case 'who-can': {
      if (answer.roles.length === 0) return `没有任何角色拥有「${answer.menu.name}」。`
      const roleNames = answer.roles.map((role) => role.name).join('、')
      const userNames = [...new Set(answer.chains.map((chain) => chain.user.name))].join('、')
      return `「${answer.menu.name}」属于 ${roleNames}，共 ${answer.roles.length} 个角色；持有这些角色的用户是 ${userNames}。`
    }
    case 'role-check': {
      if (answer.menu === null) {
        return `${answer.role.name}共有 ${answer.menus.length} 个菜单：${answer.menus
          .map((menu) => menu.name)
          .join('、')}。`
      }
      return answer.allowed
        ? `能。${answer.role.name}拥有「${answer.menu.name}」，它在该角色的 ${answer.menus.length} 个菜单之内。`
        : `不能。${answer.role.name}没有「${answer.menu.name}」，它的菜单只有：${answer.menus
            .map((menu) => menu.name)
            .join('、')}。`
    }
    case 'user-check': {
      if (answer.menu === null) {
        const roleNames = answer.viaRoles.map((role) => role.name).join('、')
        return `${answer.user.name}经由 ${roleNames} 共拥有 ${answer.menus.length} 个菜单：${answer.menus
          .map((menu) => menu.name)
          .join('、')}。`
      }
      if (answer.allowed) {
        const roleNames = answer.viaRoles.map((role) => role.name).join('、')
        return `能。${answer.user.name}经由 ${roleNames} 拥有「${answer.menu.name}」。`
      }
      return `不能。${answer.user.name}的角色是 ${rolesOfUser(answer.user)
        .map((role) => role.name)
        .join('、')}，有效菜单里没有「${answer.menu.name}」。`
    }
    case 'unknown':
      return COMMAND_PALETTE_UI.unknownAnswer
  }
}

/**
 * 本地问答入口。不是问题形态（isQuestionLike 为假）时返回 null，组件继续走搜索；
 * 是问题但解析不出实体/菜单时返回 unknown，组件展示兜底与示例问法，绝不编造。
 */
export function answerPermissionQuestion(raw: string): PermissionAnswer | null {
  const text = raw.trim()
  if (!isQuestionLike(text)) return null

  const asksWho = text.includes('谁') || text.includes('哪些') || text.includes('哪位')
  const menu = findMenu(text)

  /* 谁能 X：先认菜单，再由菜单反查角色与用户链 */
  if (asksWho) {
    if (!menu) return { type: 'unknown' }
    const roles = rolesWithMenu(menu.id)
    const chains: PermissionChain[] = roles.flatMap((role) =>
      usersOfRole(role.id).map((user) => ({ user, role, menu })),
    )
    return { type: 'who-can', menu, roles, chains }
  }

  /* 某角色能 X 吗 / 有什么权限：角色名全名优先匹配 */
  const role = findByName(PERMISSION_ROLES, text)
  if (role) {
    const menus = menusOfRole(role)
    return {
      type: 'role-check',
      role,
      menu,
      allowed: menu === null ? null : role.menuIds.includes(menu.id),
      menus,
    }
  }

  /* 某用户能 X 吗 / 有什么权限：经由他的角色判定 */
  const user = findByName(PERMISSION_USERS, text)
  if (user) {
    const menus = menusOfUser(user)
    if (menu === null) {
      return {
        type: 'user-check',
        user,
        menu: null,
        allowed: null,
        viaRoles: rolesOfUser(user),
        menus,
      }
    }
    const viaRoles = rolesOfUser(user).filter((candidate) => candidate.menuIds.includes(menu.id))
    return { type: 'user-check', user, menu, allowed: viaRoles.length > 0, viaRoles, menus }
  }

  /* 只点到菜单、没点到人的问法（如「导出数据可以吗」）：按谁能处理 */
  if (menu && (text.includes('权限') || text.includes('可以') || text.includes('有权'))) {
    const roles = rolesWithMenu(menu.id)
    const chains: PermissionChain[] = roles.flatMap((role) =>
      usersOfRole(role.id).map((user) => ({ user, role, menu })),
    )
    return { type: 'who-can', menu, roles, chains }
  }

  return { type: 'unknown' }
}
