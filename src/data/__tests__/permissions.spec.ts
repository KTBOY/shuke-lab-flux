/**
 * @Author: zlc
 * @Description: 权限星图数据单测 —— 三层 id 唯一、两段映射的引用完整性、统计与派生函数的口径一致
 */
import { describe, expect, it } from 'vitest'
import {
  MENU_BY_ID,
  PERMISSION_MENUS,
  PERMISSION_ROLES,
  PERMISSION_STATS,
  PERMISSION_USERS,
  ROLE_BY_ID,
  menusOfRole,
  menusOfUser,
  rolesOfUser,
} from '@/data/permissions'

describe('权限星图数据', () => {
  it('用户、角色、菜单三层 id 各自唯一', () => {
    expect(new Set(PERMISSION_USERS.map((user) => user.id)).size).toBe(PERMISSION_USERS.length)
    expect(new Set(PERMISSION_ROLES.map((role) => role.id)).size).toBe(PERMISSION_ROLES.length)
    expect(new Set(PERMISSION_MENUS.map((menu) => menu.id)).size).toBe(PERMISSION_MENUS.length)
  })

  it('规模落在星图可读区间：5-6 个用户、6 个角色、14-18 个菜单', () => {
    expect(PERMISSION_USERS.length).toBeGreaterThanOrEqual(5)
    expect(PERMISSION_USERS.length).toBeLessThanOrEqual(6)
    expect(PERMISSION_ROLES).toHaveLength(6)
    expect(PERMISSION_MENUS.length).toBeGreaterThanOrEqual(14)
    expect(PERMISSION_MENUS.length).toBeLessThanOrEqual(18)
  })

  it('用户引用的角色都存在', () => {
    PERMISSION_USERS.forEach((user) => {
      expect(user.roleIds.length).toBeGreaterThan(0)
      user.roleIds.forEach((roleId) => {
        expect(ROLE_BY_ID.has(roleId), `用户 ${user.id} 引用了不存在的角色 ${roleId}`).toBe(true)
      })
    })
  })

  it('角色引用的菜单都存在，且角色内不重复引用', () => {
    PERMISSION_ROLES.forEach((role) => {
      expect(role.menuIds.length).toBeGreaterThan(0)
      expect(new Set(role.menuIds).size).toBe(role.menuIds.length)
      role.menuIds.forEach((menuId) => {
        expect(MENU_BY_ID.has(menuId), `角色 ${role.id} 引用了不存在的菜单 ${menuId}`).toBe(true)
      })
    })
  })

  it('每个菜单至少被一个角色引用，星图上没有孤儿叶子', () => {
    const referenced = new Set(PERMISSION_ROLES.flatMap((role) => role.menuIds))
    PERMISSION_MENUS.forEach((menu) => {
      expect(referenced.has(menu.id), `菜单 ${menu.id} 没有任何角色引用`).toBe(true)
    })
  })

  it('统计计数与数据现算一致', () => {
    expect(PERMISSION_STATS.userCount).toBe(PERMISSION_USERS.length)
    expect(PERMISSION_STATS.roleCount).toBe(PERMISSION_ROLES.length)
    expect(PERMISSION_STATS.menuCount).toBe(PERMISSION_MENUS.length)
    expect(PERMISSION_STATS.grantCount).toBe(
      PERMISSION_ROLES.reduce((sum, role) => sum + role.menuIds.length, 0),
    )
  })

  it('派生函数与原始映射一致：有效菜单 = 各角色菜单去重并集', () => {
    PERMISSION_USERS.forEach((user) => {
      const roles = rolesOfUser(user)
      expect(roles.map((role) => role.id)).toEqual(user.roleIds)

      const expected = new Set(roles.flatMap((role) => role.menuIds))
      const effective = menusOfUser(user)
      expect(new Set(effective.map((menu) => menu.id))).toEqual(expected)
      expect(effective.length).toBe(expected.size)
    })

    PERMISSION_ROLES.forEach((role) => {
      expect(menusOfRole(role).map((menu) => menu.id)).toEqual(role.menuIds)
    })
  })

  it('展示字段齐备', () => {
    PERMISSION_USERS.forEach((user) => {
      expect(user.name.length).toBeGreaterThan(0)
      expect(user.title.length).toBeGreaterThan(0)
    })
    PERMISSION_ROLES.forEach((role) => {
      expect(role.name.length).toBeGreaterThan(0)
      expect(role.desc.length).toBeGreaterThan(0)
    })
    PERMISSION_MENUS.forEach((menu) => {
      expect(menu.name.length).toBeGreaterThan(0)
      expect(menu.desc.length).toBeGreaterThan(0)
    })
  })
})
