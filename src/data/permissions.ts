/**
 * @Author: zlc
 * @Description: 权限星图静态数据 —— 用户、角色、菜单三层与两段映射（用户→角色、角色→菜单），
 * 模板项目无后端，数据集中在此；星图的计数全部由组件现算，不另立口径
 */

/* ---------------- 类型 ---------------- */
export type PermissionNodeKind = 'user' | 'role' | 'menu'

export type PermissionUserStatus = 'enabled' | 'disabled'

export interface PermissionUser {
  id: string
  name: string
  /** 职务说明，展示在用户列表与详情面板 */
  title: string
  roleIds: string[]
  /** 演示用账号状态：模板项目没有后端，此字段与用户数据同源，供管理页展示与切换初始值 */
  status: PermissionUserStatus
}

export interface PermissionRole {
  id: string
  name: string
  desc: string
  menuIds: string[]
}

export interface PermissionMenu {
  id: string
  name: string
  desc: string
}

/* ---------------- 菜单（权限项） ---------------- */
export const PERMISSION_MENUS: PermissionMenu[] = [
  { id: 'dashboard', name: '仪表盘', desc: '查看工作台指标与卡片总览' },
  { id: 'user-manage', name: '用户管理', desc: '新增、停用与分配用户账号' },
  { id: 'role-manage', name: '角色管理', desc: '维护角色定义与成员归属' },
  { id: 'permission-map', name: '权限星图', desc: '以星图方式查看权限全貌与链路' },
  { id: 'content', name: '内容管理', desc: '内容生产、排期与上下架' },
  { id: 'device', name: '设备管理', desc: '办公设备领用与归还登记' },
  { id: 'schedule', name: '排班管理', desc: '排班表维护与调班审批' },
  { id: 'work-hours', name: '工时统计', desc: '工时汇总、核算与趋势查看' },
  { id: 'export', name: '数据导出', desc: '报表导出与下载记录' },
  { id: 'settings', name: '系统设置', desc: '站点参数与安全策略配置' },
  { id: 'audit-log', name: '操作日志', desc: '关键操作的审计留痕查询' },
  { id: 'dictionary', name: '字典管理', desc: '枚举字典与参数项维护' },
  { id: 'recruit', name: '招聘管理', desc: '职位发布与候选人流程' },
  { id: 'calendar', name: '日程日历', desc: '团队日程与会议安排' },
  { id: 'review', name: '绩效评价', desc: '周期评价与结果归档' },
  { id: 'notice', name: '消息通知', desc: '站内通知的发送与模板' },
]

/* ---------------- 角色 ---------------- */
export const PERMISSION_ROLES: PermissionRole[] = [
  {
    id: 'super',
    name: '超级管理员',
    desc: '拥有全部菜单与数据权限，仅限平台负责人持有',
    menuIds: PERMISSION_MENUS.map((menu) => menu.id),
  },
  {
    id: 'system',
    name: '系统管理员',
    desc: '负责账号、角色与系统配置的日常维护',
    menuIds: [
      'dashboard',
      'user-manage',
      'role-manage',
      'permission-map',
      'device',
      'schedule',
      'audit-log',
      'settings',
      'dictionary',
    ],
  },
  {
    id: 'ops',
    name: '运营',
    desc: '内容排期、排班协同与数据复盘',
    menuIds: ['dashboard', 'content', 'schedule', 'work-hours', 'export'],
  },
  {
    id: 'editor',
    name: '编辑',
    desc: '内容生产与字典条目维护',
    menuIds: ['dashboard', 'content', 'dictionary'],
  },
  {
    id: 'finance',
    name: '财务',
    desc: '工时核算与财务报表导出',
    menuIds: ['dashboard', 'work-hours', 'export'],
  },
  {
    id: 'guest',
    name: '访客',
    desc: '只读查看仪表盘，不开放任何写操作',
    menuIds: ['dashboard'],
  },
]

/* ---------------- 用户 ---------------- */
export const PERMISSION_USERS: PermissionUser[] = [
  {
    id: 'zhou-mingyuan',
    name: '周明远',
    title: '平台负责人',
    roleIds: ['super'],
    status: 'enabled',
  },
  { id: 'lin-xiaolu', name: '林小鹿', title: '系统管理员', roleIds: ['system'], status: 'enabled' },
  {
    id: 'chen-jiahe',
    name: '陈嘉禾',
    title: '运营主管',
    roleIds: ['ops', 'editor'],
    status: 'enabled',
  },
  { id: 'su-qing', name: '苏晴', title: '内容编辑', roleIds: ['editor'], status: 'enabled' },
  { id: 'gu-yizhou', name: '顾一舟', title: '财务专员', roleIds: ['finance'], status: 'enabled' },
  {
    id: 'luo-xiaoman',
    name: '罗小满',
    title: '实习生（访客）',
    roleIds: ['guest'],
    status: 'disabled',
  },
  { id: 'han-zimo', name: '韩子墨', title: '运营专员', roleIds: ['ops'], status: 'enabled' },
  {
    id: 'tang-wanting',
    name: '唐婉婷',
    title: '财务助理',
    roleIds: ['finance'],
    status: 'disabled',
  },
  { id: 'he-junjie', name: '何俊杰', title: '系统运维', roleIds: ['system'], status: 'enabled' },
  { id: 'shen-jiayi', name: '沈佳怡', title: '内容策划', roleIds: ['editor'], status: 'enabled' },
  { id: 'zhao-yiming', name: '赵一鸣', title: '外部访客', roleIds: ['guest'], status: 'disabled' },
  {
    id: 'wu-ruoxi',
    name: '吴若曦',
    title: '运营助理',
    roleIds: ['ops', 'editor'],
    status: 'enabled',
  },
  {
    id: 'zheng-kaiwen',
    name: '郑凯文',
    title: '培训讲师',
    roleIds: ['editor', 'guest'],
    status: 'enabled',
  },
]

/* ---------------- 查找与派生 ---------------- */
export const MENU_BY_ID: ReadonlyMap<string, PermissionMenu> = new Map(
  PERMISSION_MENUS.map((menu) => [menu.id, menu]),
)

export const ROLE_BY_ID: ReadonlyMap<string, PermissionRole> = new Map(
  PERMISSION_ROLES.map((role) => [role.id, role]),
)

export const USER_BY_ID: ReadonlyMap<string, PermissionUser> = new Map(
  PERMISSION_USERS.map((user) => [user.id, user]),
)

/** 角色实际拥有的菜单对象（按映射顺序） */
export function menusOfRole(role: PermissionRole): PermissionMenu[] {
  return role.menuIds
    .map((id) => MENU_BY_ID.get(id))
    .filter((menu): menu is PermissionMenu => menu !== undefined)
}

/** 用户被分配的角色对象（按映射顺序） */
export function rolesOfUser(user: PermissionUser): PermissionRole[] {
  return user.roleIds
    .map((id) => ROLE_BY_ID.get(id))
    .filter((role): role is PermissionRole => role !== undefined)
}

/** 用户经全部角色合并后的有效菜单（去重，保持首次出现顺序） */
export function menusOfUser(user: PermissionUser): PermissionMenu[] {
  const seen = new Set<string>()
  const result: PermissionMenu[] = []
  rolesOfUser(user).forEach((role) => {
    menusOfRole(role).forEach((menu) => {
      if (seen.has(menu.id)) return
      seen.add(menu.id)
      result.push(menu)
    })
  })
  return result
}

/** 拥有某角色的用户（详情面板反查用） */
export function usersOfRole(roleId: string): PermissionUser[] {
  return PERMISSION_USERS.filter((user) => user.roleIds.includes(roleId))
}

/** 包含某菜单的角色（详情面板反查用） */
export function rolesWithMenu(menuId: string): PermissionRole[] {
  return PERMISSION_ROLES.filter((role) => role.menuIds.includes(menuId))
}

/* ---------------- 统计（全部现算，避免写死数字与数据漂移） ---------------- */
export const PERMISSION_STATS = {
  userCount: PERMISSION_USERS.length,
  roleCount: PERMISSION_ROLES.length,
  menuCount: PERMISSION_MENUS.length,
  /** 角色→菜单映射总条数，星图连线规模的口径 */
  grantCount: PERMISSION_ROLES.reduce((sum, role) => sum + role.menuIds.length, 0),
}

/* ---------------- 页面文案 ---------------- */
export const PERMISSION_KIND_LABEL: Record<PermissionNodeKind, string> = {
  user: '用户',
  role: '角色',
  menu: '菜单',
}

export const PERMISSION_MAP_UI = {
  title: '权限星图',
  subtitle: '用户、角色与菜单的授权关系全貌 —— 点角色展开菜单分支，点用户追溯他的权限链路',
  backToDashboard: '返回仪表盘',
  usersTitle: '用户',
  usersHint: '点任意用户，光点会沿「用户 → 角色 → 菜单」逐段追溯',
  detailTitle: '节点详情',
  breadcrumbRoot: '权限星图',
  roleMenuCount: '个菜单',
  userRoleCount: '个角色',
  effectiveMenus: '有效菜单',
  grantedBy: '经由角色',
  includedInRoles: '包含于角色',
  heldByUsers: '持有用户',
  traceDone: '已追溯到',
  legendHub: '主节点（带刻度环）',
  legendRole: '角色（点击展开 / 收起）',
  legendMenu: '菜单叶子',
  mapAriaLabel: '权限星图：用户、角色与菜单的授权关系图',
}
