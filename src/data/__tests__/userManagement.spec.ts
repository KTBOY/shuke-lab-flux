/**
 * @Author: zlc
 * @Description: 用户管理纯逻辑单测 —— 行数据派生口径、搜索、排序、分页边界与表单校验
 */
import { describe, expect, it } from 'vitest'
import {
  createManagedUserRows,
  filterUsers,
  paginateUsers,
  sortUsers,
  validateUserForm,
} from '@/data/userManagement'

describe('用户管理纯逻辑', () => {
  it('行数据由权限映射派生：多角色用户的有效菜单是去重并集', () => {
    const rows = createManagedUserRows()
    const chen = rows.find((row) => row.id === 'chen-jiahe')
    expect(chen?.roles.map((role) => role.id)).toEqual(['ops', 'editor'])
    expect(chen?.menuCount).toBe(6)
    expect(rows).toHaveLength(13)
  })

  it('搜索可按姓名命中，也可按角色名命中整组用户', () => {
    const rows = createManagedUserRows()
    expect(filterUsers(rows, '若曦').map((row) => row.name)).toEqual(['吴若曦'])
    expect(filterUsers(rows, '财务').map((row) => row.name)).toEqual(['顾一舟', '唐婉婷'])
    expect(filterUsers(rows, '不存在的角色')).toEqual([])
  })

  it('排序支持姓名与有效菜单数两个键的升降序，且不改原数组', () => {
    const rows = createManagedUserRows()
    const originalOrder = rows.map((row) => row.id)

    const nameAsc = sortUsers(rows, 'name', 'asc')
    const nameDesc = sortUsers(rows, 'name', 'desc')
    expect(nameDesc.map((row) => row.id)).toEqual([...nameAsc].reverse().map((row) => row.id))

    const countAsc = sortUsers(rows, 'menuCount', 'asc').map((row) => row.menuCount)
    expect(countAsc).toEqual([...countAsc].sort((a, b) => a - b))
    const countDesc = sortUsers(rows, 'menuCount', 'desc').map((row) => row.menuCount)
    expect(countDesc).toEqual([...countDesc].sort((a, b) => b - a))
    expect(rows.map((row) => row.id)).toEqual(originalOrder)
  })

  it('分页会把越界页码夹回有效范围，末页只返回剩余行', () => {
    const rows = createManagedUserRows()
    const last = paginateUsers(rows, 99, 5)
    expect(last.total).toBe(13)
    expect(last.totalPages).toBe(3)
    expect(last.page).toBe(3)
    expect(last.items).toHaveLength(3)

    const first = paginateUsers(rows, 0, 5)
    expect(first.page).toBe(1)
    expect(first.items).toHaveLength(5)
    expect(paginateUsers([], 4, 10)).toMatchObject({ total: 0, totalPages: 1, page: 1, items: [] })
  })

  it('表单校验拦截空姓名与未选角色，合法表单无错误', () => {
    expect(validateUserForm({ name: '  ', roleIds: [], status: 'enabled' })).toEqual({
      name: '姓名不能为空',
      roleIds: '至少选择一个角色',
    })
    expect(validateUserForm({ name: '新同事', roleIds: ['guest'], status: 'disabled' })).toEqual({})
  })
})
