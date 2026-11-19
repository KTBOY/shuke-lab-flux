/**
 * @Author: zlc
 * @Description: 用户管理页数据与纯逻辑 —— 行数据全部从 permissions.ts 的用户与角色映射派生，
 *               搜索、排序、分页与表单校验都是无副作用函数，页面本地增删改不回写静态数据源。
 */
import { PERMISSION_USERS, ROLE_BY_ID, menusOfUser } from '@/data/permissions'
import type { PermissionRole, PermissionUser, PermissionUserStatus } from '@/data/permissions'

export type UserSortKey = 'name' | 'menuCount'
export type UserSortDirection = 'asc' | 'desc'

export interface ManagedUser {
  id: string
  name: string
  title: string
  roleIds: string[]
  status: PermissionUserStatus
}

export interface ManagedUserRow extends ManagedUser {
  roles: PermissionRole[]
  /** 经全部角色合并去重后的有效菜单数，与权限星图、⌘K 问答同一口径 */
  menuCount: number
}

export interface UserFormValues {
  name: string
  roleIds: string[]
  status: PermissionUserStatus
}

export interface UserFormErrors {
  name?: string
  roleIds?: string
}

export interface PaginatedUsers {
  items: ManagedUserRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/* ---------------- 页面文案 ---------------- */
export const USER_MANAGEMENT_UI = {
  title: '用户管理',
  subtitle: '维护演示账号、角色归属与启停状态；增删改只作用于当前页面，刷新后恢复初始数据',
  toPermissionMap: '查看权限星图',
  searchLabel: '搜索用户',
  searchPlaceholder: '按姓名或角色搜索',
  addUser: '新增用户',
  tableCaption: '用户列表，可按姓名或有效菜单数排序',
  userColumn: '用户',
  rolesColumn: '角色',
  menuCountColumn: '有效菜单',
  statusColumn: '状态',
  actionsColumn: '操作',
  enabled: '启用',
  disabled: '停用',
  enable: '启用',
  disable: '停用',
  edit: '编辑',
  delete: '删除',
  deleteConfirm: '确认删除？',
  confirmDelete: '确认删除',
  cancel: '取消',
  resultPrefix: '共',
  resultUnit: '位用户',
  pageSizeLabel: '每页条数',
  previousPage: '上一页',
  nextPage: '下一页',
  pageNavigationLabel: '用户列表分页',
  pageLabel: '第',
  pageUnit: '页',
  sortAscending: '升序',
  sortDescending: '降序',
  emptySearchTitle: '没有找到匹配的用户',
  emptySearchHint: '换个姓名或角色关键词试试',
  clearSearch: '清除搜索',
  emptyUsersTitle: '还没有用户',
  emptyUsersHint: '新增第一位用户后，表格会从这里开始生长',
  dialogCreateTitle: '新增用户',
  dialogEditTitle: '编辑用户',
  dialogDescription: '角色决定有效菜单范围，保存后立即回到表格查看结果',
  closeDialog: '关闭用户表单',
  nameLabel: '姓名',
  namePlaceholder: '请输入姓名',
  rolesLabel: '角色',
  rolesHint: '至少选择一个角色',
  statusLabel: '账号状态',
  save: '保存',
  nameRequired: '姓名不能为空',
  rolesRequired: '至少选择一个角色',
  newUserTitle: '新成员',
}

const nameCollator = new Intl.Collator('zh-Hans-CN', { sensitivity: 'base' })

/** 把静态权限用户复制成页面可编辑的本地行源，数组与角色列表都不共享引用 */
export function createManagedUser(user: PermissionUser): ManagedUser {
  return {
    id: user.id,
    name: user.name,
    title: user.title,
    roleIds: [...user.roleIds],
    status: user.status,
  }
}

export function createInitialManagedUsers(): ManagedUser[] {
  return PERMISSION_USERS.map((user) => createManagedUser(user))
}

/** 给本地用户补齐角色对象与有效菜单数，展示层只读这一份派生结果 */
export function toManagedUserRow(user: ManagedUser): ManagedUserRow {
  const roles = user.roleIds
    .map((roleId) => ROLE_BY_ID.get(roleId))
    .filter((role): role is PermissionRole => role !== undefined)

  return {
    ...user,
    roleIds: [...user.roleIds],
    roles,
    menuCount: menusOfUser(user).length,
  }
}

export function createManagedUserRows(): ManagedUserRow[] {
  return createInitialManagedUsers().map((user) => toManagedUserRow(user))
}

/** 搜索口径：姓名或任一角色名命中即可，大小写与首尾空白不敏感 */
export function filterUsers(rows: ManagedUserRow[], rawQuery: string): ManagedUserRow[] {
  const query = rawQuery.trim().toLowerCase()
  if (query === '') return [...rows]
  return rows.filter((row) => {
    if (row.name.toLowerCase().includes(query)) return true
    return row.roles.some((role) => role.name.toLowerCase().includes(query))
  })
}

/** 排序不改原数组；同值时用姓名收尾，避免翻页时行序漂移 */
export function sortUsers(
  rows: ManagedUserRow[],
  key: UserSortKey,
  direction: UserSortDirection,
): ManagedUserRow[] {
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const primary =
      key === 'name' ? nameCollator.compare(a.name, b.name) : a.menuCount - b.menuCount
    if (primary !== 0) return primary * factor
    return nameCollator.compare(a.name, b.name)
  })
}

/** 页码永远夹在 [1, totalPages]，空表也保留 1 页给空状态与分页控件站位 */
export function paginateUsers(
  rows: ManagedUserRow[],
  requestedPage: number,
  pageSize: number,
): PaginatedUsers {
  const safePageSize = Math.max(1, Math.floor(pageSize) || 1)
  const totalPages = Math.max(1, Math.ceil(rows.length / safePageSize))
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages)
  const start = (page - 1) * safePageSize
  return {
    items: rows.slice(start, start + safePageSize),
    total: rows.length,
    page,
    pageSize: safePageSize,
    totalPages,
  }
}

/** 表单校验与弹窗、composable 共用同一口径：姓名非空、至少一个角色 */
export function validateUserForm(values: UserFormValues): UserFormErrors {
  const errors: UserFormErrors = {}
  if (values.name.trim() === '') errors.name = USER_MANAGEMENT_UI.nameRequired
  if (values.roleIds.length === 0) errors.roleIds = USER_MANAGEMENT_UI.rolesRequired
  return errors
}
