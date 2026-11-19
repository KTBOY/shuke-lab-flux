<!--
 * @Author: zlc
 * @Description: 权限星图 —— 用户/角色/菜单三个带刻度环的主节点，角色环绕角色主节点、菜单作外层叶子；
 * 点角色展开分支（连线生长 + 叶子弹簧入场），点用户触发光点沿「用户→角色→菜单」逐段追溯，右侧详情面板同步滑出
-->
<template>
  <div class="star-map panel">
    <!-- 左轨：用户列表，点选即追溯 -->
    <div class="star-map__rail">
      <div class="panel__head">
        <h2 class="panel__title">{{ PERMISSION_MAP_UI.usersTitle }}</h2>
        <span class="star-map__count tnum">{{ PERMISSION_STATS.userCount }}</span>
      </div>

      <ul class="star-map__users">
        <li v-for="user in PERMISSION_USERS" :key="user.id">
          <button
            type="button"
            class="star-map__user"
            :class="{ 'is-active': selectedUserId === user.id }"
            :aria-pressed="selectedUserId === user.id"
            @click="selectUser(user)"
          >
            <span class="star-map__avatar" aria-hidden="true">{{ user.name.slice(0, 1) }}</span>
            <span class="star-map__user-meta">
              <strong class="star-map__user-name">{{ user.name }}</strong>
              <span class="star-map__user-title">{{ user.title }}</span>
              <span class="star-map__user-roles">
                {{
                  rolesOfUser(user)
                    .map((role) => role.name)
                    .join(' · ')
                }}
              </span>
            </span>
          </button>
        </li>
      </ul>

      <p class="star-map__hint">{{ PERMISSION_MAP_UI.usersHint }}</p>
    </div>

    <!-- 中区：星图画布 -->
    <div class="star-map__stage">
      <svg
        class="star-map__svg"
        viewBox="0 0 980 700"
        role="img"
        :aria-label="PERMISSION_MAP_UI.mapAriaLabel"
      >
        <!-- 主节点 → 角色连线（追溯时点亮） -->
        <path
          v-for="node in roleNodes"
          :key="`edge-${node.role.id}`"
          :ref="registerPath(`role-edge-${node.role.id}`)"
          class="star-map__edge"
          :class="{ 'is-hot': tracedRoleId === node.role.id }"
          :d="node.edgeD"
        />

        <!-- 角色 → 菜单叶子连线：dash 生长，展开时从角色处长出 -->
        <path
          v-for="leaf in leafNodes"
          :key="`leaf-edge-${leaf.role.id}-${leaf.menu.id}`"
          :ref="registerPath(`leaf-edge-${leaf.role.id}-${leaf.menu.id}`)"
          class="star-map__leaf-edge"
          :class="{
            'is-open': expandedRoleIds.has(leaf.role.id),
            'is-hot': tracedLeafIds.has(`${leaf.role.id}-${leaf.menu.id}`),
          }"
          :d="leaf.edgeD"
          pathLength="1"
        />

        <!-- 三个主节点：刻度环 + 计数 -->
        <g
          v-for="(hub, hubIndex) in hubs"
          :key="hub.key"
          :transform="`translate(${hub.pos.x} ${hub.pos.y})`"
        >
          <g
            class="star-map__pop"
            :style="{ animationDelay: `${0.05 + hubIndex * 0.09}s` }"
            role="button"
            tabindex="0"
            :aria-label="`${hub.name}主节点，共 ${hub.count} 项`"
            @click="selectHub(hub.key)"
            @keydown.enter.prevent="selectHub(hub.key)"
            @keydown.space.prevent="selectHub(hub.key)"
          >
            <line
              v-for="(tick, tickIndex) in ticks"
              :key="tickIndex"
              class="star-map__tick"
              :class="{ 'is-major': tick.major }"
              :x1="tick.x1"
              :y1="tick.y1"
              :x2="tick.x2"
              :y2="tick.y2"
            />
            <circle
              class="star-map__hub-face"
              :class="{
                'is-dark': hub.dark,
                'is-selected': selected.kind === 'hub' && selected.id === hub.key,
              }"
              r="46"
            />
            <text class="star-map__hub-count" :class="{ 'is-dark': hub.dark }" y="-3">
              {{ hub.count }}
            </text>
            <text class="star-map__hub-name" :class="{ 'is-dark': hub.dark }" y="17">
              {{ hub.name }}
            </text>
          </g>
        </g>

        <!-- 角色节点：环绕角色主节点排布 -->
        <g
          v-for="(node, nodeIndex) in roleNodes"
          :key="node.role.id"
          :transform="`translate(${node.pos.x} ${node.pos.y})`"
        >
          <g
            class="star-map__pop"
            :style="{ animationDelay: `${0.3 + nodeIndex * 0.07}s` }"
            role="button"
            tabindex="0"
            :aria-label="`角色 ${node.role.name}，${node.role.menuIds.length} 个菜单，点击展开或收起`"
            :aria-expanded="expandedRoleIds.has(node.role.id)"
            @click="selectRole(node.role, true)"
            @keydown.enter.prevent="selectRole(node.role, true)"
            @keydown.space.prevent="selectRole(node.role, true)"
          >
            <circle
              class="star-map__role-halo"
              :class="{ 'is-on': selected.kind === 'role' && selected.id === node.role.id }"
              r="37"
            />
            <circle
              class="star-map__role-face"
              :class="{
                'is-open': expandedRoleIds.has(node.role.id),
                'is-selected': selected.kind === 'role' && selected.id === node.role.id,
              }"
              r="30"
            />
            <text class="star-map__role-count">{{ node.role.menuIds.length }}</text>
            <text class="star-map__role-unit" y="14">{{ PERMISSION_MAP_UI.roleMenuCount }}</text>
            <text class="star-map__role-name" y="50">{{ node.role.name }}</text>
          </g>
        </g>

        <!-- 菜单叶子：常驻挂载，靠类开关弹簧显隐，避免挂撤造成跳变 -->
        <g
          v-for="leaf in leafNodes"
          :key="`leaf-${leaf.role.id}-${leaf.menu.id}`"
          :transform="`translate(${leaf.pos.x} ${leaf.pos.y})`"
        >
          <g
            class="star-map__leaf"
            :class="{
              'is-open': expandedRoleIds.has(leaf.role.id),
              'is-traced': tracedLeafIds.has(`${leaf.role.id}-${leaf.menu.id}`),
              'is-selected': selected.kind === 'menu' && selected.id === leaf.menu.id,
            }"
            :style="{ transitionDelay: `${leaf.index * 0.035}s` }"
            role="button"
            tabindex="0"
            :aria-label="`菜单 ${leaf.menu.name}，经角色 ${leaf.roleName} 授权`"
            @click="selectMenu(leaf.menu, leaf.role.id)"
            @keydown.enter.prevent="selectMenu(leaf.menu, leaf.role.id)"
            @keydown.space.prevent="selectMenu(leaf.menu, leaf.role.id)"
          >
            <circle class="star-map__leaf-face" r="13" />
            <text class="star-map__leaf-name" y="28">{{ leaf.menu.name }}</text>
          </g>
        </g>

        <!-- 追溯光点：位置由 rAF 沿真实 path 逐段写入 -->
        <g
          v-if="dotPos"
          class="star-map__dot"
          :class="{ 'is-on': dotVisible }"
          :transform="`translate(${dotPos.x} ${dotPos.y})`"
          aria-hidden="true"
        >
          <circle class="star-map__dot-halo" r="11" />
          <circle class="star-map__dot-core" r="5.5" />
        </g>
      </svg>

      <ul class="star-map__legend">
        <li>
          <span class="star-map__swatch star-map__swatch--hub"></span
          >{{ PERMISSION_MAP_UI.legendHub }}
        </li>
        <li>
          <span class="star-map__swatch star-map__swatch--role"></span
          >{{ PERMISSION_MAP_UI.legendRole }}
        </li>
        <li>
          <span class="star-map__swatch star-map__swatch--menu"></span
          >{{ PERMISSION_MAP_UI.legendMenu }}
        </li>
      </ul>
    </div>

    <!-- 右轨：详情面板，选中变化时以 key 重挂触发滑入 -->
    <aside :key="detailKey" class="star-map__detail" aria-live="polite">
      <p class="star-map__crumbs">
        <template v-for="(crumb, crumbIndex) in detail.breadcrumb" :key="crumbIndex">
          <span v-if="crumbIndex > 0" class="star-map__crumb-sep" aria-hidden="true">›</span>
          <span :class="{ 'is-current': crumbIndex === detail.breadcrumb.length - 1 }">{{
            crumb
          }}</span>
        </template>
      </p>

      <div class="star-map__detail-head">
        <span class="star-map__kind">{{ detail.kindLabel }}</span>
        <h2 class="star-map__detail-title">{{ detail.title }}</h2>
      </div>
      <p class="star-map__detail-desc">{{ detail.desc }}</p>

      <dl class="star-map__rows">
        <div v-for="row in detail.rows" :key="row.label" class="star-map__row">
          <dt>{{ row.label }}</dt>
          <dd class="tnum">{{ row.value }}</dd>
        </div>
      </dl>

      <div v-for="group in detail.groups" :key="group.label" class="star-map__group">
        <h3 class="star-map__group-label">{{ group.label }}</h3>
        <div class="star-map__chips">
          <button
            v-for="chip in group.chips"
            :key="chip.key"
            type="button"
            class="star-map__chip"
            @click="onChipClick(chip)"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import {
  MENU_BY_ID,
  PERMISSION_KIND_LABEL,
  PERMISSION_MAP_UI,
  PERMISSION_MENUS,
  PERMISSION_ROLES,
  PERMISSION_STATS,
  PERMISSION_USERS,
  ROLE_BY_ID,
  menusOfRole,
  menusOfUser,
  rolesOfUser,
  rolesWithMenu,
  usersOfRole,
} from '@/data/permissions'
import type { PermissionMenu, PermissionRole, PermissionUser } from '@/data/permissions'

defineOptions({ name: 'Permissions-PermissionStarMap' })

/* ---------------- 几何（SVG 坐标系 980×700，全部布局现算，不写死节点位置表） ---------------- */
interface Point {
  x: number
  y: number
}

interface Tick {
  x1: number
  y1: number
  x2: number
  y2: number
  major: boolean
}

interface HubNode {
  key: string
  name: string
  count: number
  pos: Point
  dark?: boolean
}

interface RoleNode {
  role: PermissionRole
  pos: Point
  edgeD: string
}

interface LeafNode {
  menu: PermissionMenu
  role: PermissionRole
  roleId: string
  roleName: string
  pos: Point
  edgeD: string
  /** 同角色内的序号，叶子入场错峰用 */
  index: number
}

const CENTER: Point = { x: 470, y: 350 }
const ROLE_ORBIT = { rx: 172, ry: 198 }
/** 角色在椭圆轨道上的角度（度）：菜单多的角色朝向菜单主节点一侧，叶子扇形才有地方展开 */
const ROLE_ANGLE: Record<string, number> = {
  super: 30,
  system: -30,
  ops: 90,
  editor: -90,
  finance: 150,
  guest: 210,
}
const LEAF_RING_SIZE = 8
const LEAF_RING_RADIUS = 102
const LEAF_RING_GAP = 48

const HUBS: HubNode[] = [
  {
    key: 'users',
    name: PERMISSION_KIND_LABEL.user,
    count: PERMISSION_STATS.userCount,
    pos: { x: 128, y: 350 },
  },
  {
    key: 'roles',
    name: PERMISSION_KIND_LABEL.role,
    count: PERMISSION_STATS.roleCount,
    pos: CENTER,
    dark: true,
  },
  {
    key: 'menus',
    name: PERMISSION_KIND_LABEL.menu,
    count: PERMISSION_STATS.menuCount,
    pos: { x: 852, y: 350 },
  },
]

const hubs = HUBS

/** 刻度环：60 根刻度（每 6° 一根），每 30° 一根长刻度，绕主节点圆周排布 */
const ticks: Tick[] = Array.from({ length: 60 }, (_, i) => {
  const rad = (i * 6 * Math.PI) / 180
  const major = i % 5 === 0
  const inner = major ? 52 : 55
  const outer = 60
  return {
    x1: Math.cos(rad) * inner,
    y1: Math.sin(rad) * inner,
    x2: Math.cos(rad) * outer,
    y2: Math.sin(rad) * outer,
    major,
  }
})

/** 二次贝塞尔连线：中点沿法线偏移 bend，线条带一点弧度而非直尺连线 */
function quadPath(a: Point, b: Point, bend: number): string {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const cx = mx + (-dy / len) * bend
  const cy = my + (dx / len) * bend
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
}

function orbitPoint(angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER.x + Math.cos(rad) * ROLE_ORBIT.rx,
    y: CENTER.y + Math.sin(rad) * ROLE_ORBIT.ry,
  }
}

const roleNodes = computed<RoleNode[]>(() =>
  PERMISSION_ROLES.map((role) => {
    const pos = orbitPoint(ROLE_ANGLE[role.id] ?? 0)
    return { role, pos, edgeD: quadPath(CENTER, pos, 14) }
  }),
)

const rolePosById = computed(() => {
  const map = new Map<string, Point>()
  roleNodes.value.forEach((node) => map.set(node.role.id, node.pos))
  return map
})

/**
 * 叶子布局：以角色的朝向角为中轴扇形展开；超过一环（8 个）就再起一环，
 * 超级管理员的 16 个菜单分两环才不会互相压住。
 */
const leafNodes = computed<LeafNode[]>(() => {
  const leaves: LeafNode[] = []
  PERMISSION_ROLES.forEach((role) => {
    const rolePos = rolePosById.value.get(role.id)
    if (!rolePos) return
    const outward = ROLE_ANGLE[role.id] ?? 0
    const menus = menusOfRole(role)
    menus.forEach((menu, index) => {
      const ring = Math.floor(index / LEAF_RING_SIZE)
      const inRing = index % LEAF_RING_SIZE
      const ringSize = Math.min(LEAF_RING_SIZE, menus.length - ring * LEAF_RING_SIZE)
      const spread = Math.min(150, Math.max(44, ringSize * 20))
      const step = ringSize > 1 ? spread / (ringSize - 1) : 0
      const stagger = ring % 2 === 1 ? step / 2 : 0
      const angle = outward - spread / 2 + step * inRing + stagger
      const rad = (angle * Math.PI) / 180
      const radius = LEAF_RING_RADIUS + ring * LEAF_RING_GAP
      const pos = {
        x: rolePos.x + Math.cos(rad) * radius,
        y: rolePos.y + Math.sin(rad) * radius,
      }
      leaves.push({
        menu,
        role,
        roleId: role.id,
        roleName: role.name,
        pos,
        edgeD: quadPath(rolePos, pos, 6),
        index,
      })
    })
  })
  return leaves
})

/* ---------------- 选中与展开 ---------------- */
interface Selection {
  kind: 'hub' | 'user' | 'role' | 'menu'
  id: string
}

const selected = ref<Selection>({ kind: 'role', id: 'system' })
const expandedRoleIds = ref<ReadonlySet<string>>(new Set(['system']))
const selectedUserId = ref<string | null>(null)
/** 菜单详情的面包屑上下文：最近一次点开的角色 */
const contextRoleId = ref<string | null>('system')

function toggleExpanded(roleId: string): void {
  const next = new Set(expandedRoleIds.value)
  if (next.has(roleId)) next.delete(roleId)
  else next.add(roleId)
  expandedRoleIds.value = next
}

function ensureExpanded(roleId: string): void {
  if (expandedRoleIds.value.has(roleId)) return
  expandedRoleIds.value = new Set([...expandedRoleIds.value, roleId])
}

function selectHub(key: string): void {
  selected.value = { kind: 'hub', id: key }
}

function selectRole(role: PermissionRole, toggle: boolean): void {
  selected.value = { kind: 'role', id: role.id }
  contextRoleId.value = role.id
  if (toggle) toggleExpanded(role.id)
  else ensureExpanded(role.id)
}

function selectMenu(menu: PermissionMenu, roleId: string | null): void {
  selected.value = { kind: 'menu', id: menu.id }
  if (roleId) contextRoleId.value = roleId
}

/* ---------------- 光点追溯 ---------------- */
const dotPos = ref<Point | null>(null)
const dotVisible = ref(false)
const tracedRoleId = ref<string | null>(null)
const tracedLeafIds = ref<ReadonlySet<string>>(new Set())

const pathEls = new Map<string, SVGPathElement>()
let traceToken = 0
let rafId = 0

function registerPath(key: string): (el: Element | ComponentPublicInstance | null) => void {
  return (el) => {
    if (el instanceof SVGPathElement) pathEls.set(key, el)
    else pathEls.delete(key)
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/** 让光点沿一条真实 path 走完：时长随时长按速度现算，长线慢、短线快 */
function animateAlong(path: SVGPathElement, token: number): Promise<void> {
  return new Promise((resolve) => {
    const total = path.getTotalLength()
    const duration = Math.min(850, Math.max(220, total / 0.55))
    let start: number | null = null
    const step = (now: number): void => {
      if (token !== traceToken) {
        resolve()
        return
      }
      if (start === null) start = now
      const raw = Math.min(1, (now - start) / duration)
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2
      const point = path.getPointAtLength(total * eased)
      dotPos.value = { x: point.x, y: point.y }
      if (raw >= 1) {
        resolve()
        return
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
  })
}

async function runTrace(user: PermissionUser): Promise<void> {
  const role = rolesOfUser(user)[0]
  if (!role) return
  const token = ++traceToken
  tracedRoleId.value = role.id
  tracedLeafIds.value = new Set()
  ensureExpanded(role.id)
  contextRoleId.value = role.id
  await nextTick()
  if (token !== traceToken) return

  const hubPath = pathEls.get(`role-edge-${role.id}`)
  if (!hubPath) return

  /* 减动效偏好下不逐段播放，直接把整条链路点亮落位 */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const menus = menusOfRole(role)
    tracedLeafIds.value = new Set(menus.map((menu) => `${role.id}-${menu.id}`))
    const lastPath = pathEls.get(`leaf-edge-${role.id}-${menus[menus.length - 1]?.id}`)
    if (lastPath) {
      const end = lastPath.getPointAtLength(lastPath.getTotalLength())
      dotPos.value = { x: end.x, y: end.y }
      dotVisible.value = true
    }
    return
  }

  dotVisible.value = true
  await animateAlong(hubPath, token)
  for (const menu of menusOfRole(role)) {
    if (token !== traceToken) return
    const leafPath = pathEls.get(`leaf-edge-${role.id}-${menu.id}`)
    if (!leafPath) continue
    await animateAlong(leafPath, token)
    if (token !== traceToken) return
    tracedLeafIds.value = new Set([...tracedLeafIds.value, `${role.id}-${menu.id}`])
    await wait(60)
  }
  await wait(500)
  if (token === traceToken) dotVisible.value = false
}

function selectUser(user: PermissionUser): void {
  selectedUserId.value = user.id
  selected.value = { kind: 'user', id: user.id }
  void runTrace(user)
}

onScopeDispose(() => {
  traceToken++
  cancelAnimationFrame(rafId)
  pathEls.clear()
})

/* ---------------- 详情面板（全部由选中节点现算） ---------------- */
interface DetailChip {
  key: string
  label: string
  kind: 'user' | 'role' | 'menu'
  id: string
}

interface DetailGroup {
  label: string
  chips: DetailChip[]
}

interface DetailRow {
  label: string
  value: string
}

interface Detail {
  kindLabel: string
  title: string
  desc: string
  rows: DetailRow[]
  groups: DetailGroup[]
  breadcrumb: string[]
}

function userChips(users: PermissionUser[]): DetailChip[] {
  return users.map((user) => ({ key: `u-${user.id}`, label: user.name, kind: 'user', id: user.id }))
}

function roleChips(roles: PermissionRole[]): DetailChip[] {
  return roles.map((role) => ({ key: `r-${role.id}`, label: role.name, kind: 'role', id: role.id }))
}

function menuChips(menus: PermissionMenu[]): DetailChip[] {
  return menus.map((menu) => ({ key: `m-${menu.id}`, label: menu.name, kind: 'menu', id: menu.id }))
}

const detail = computed<Detail>(() => {
  const root = PERMISSION_MAP_UI.breadcrumbRoot
  const sel = selected.value

  if (sel.kind === 'hub') {
    if (sel.id === 'users') {
      const avgRoles = (
        PERMISSION_USERS.reduce((sum, user) => sum + user.roleIds.length, 0) /
        PERMISSION_USERS.length
      ).toFixed(1)
      return {
        kindLabel: PERMISSION_KIND_LABEL.user,
        title: PERMISSION_KIND_LABEL.user,
        desc: '全部登录账号，权限不直接授予个人，而是来自被分配的角色。',
        rows: [
          { label: '用户总数', value: String(PERMISSION_STATS.userCount) },
          { label: '人均角色', value: avgRoles },
        ],
        groups: [{ label: PERMISSION_KIND_LABEL.user, chips: userChips(PERMISSION_USERS) }],
        breadcrumb: [root, PERMISSION_KIND_LABEL.user],
      }
    }
    if (sel.id === 'roles') {
      return {
        kindLabel: PERMISSION_KIND_LABEL.role,
        title: PERMISSION_KIND_LABEL.role,
        desc: '权限的打包单位：角色持有菜单，用户经角色间接获得权限。',
        rows: [
          { label: '角色总数', value: String(PERMISSION_STATS.roleCount) },
          { label: '授权连线', value: String(PERMISSION_STATS.grantCount) },
        ],
        groups: [{ label: PERMISSION_KIND_LABEL.role, chips: roleChips(PERMISSION_ROLES) }],
        breadcrumb: [root, PERMISSION_KIND_LABEL.role],
      }
    }
    const referenced = new Set(PERMISSION_ROLES.flatMap((role) => role.menuIds)).size
    return {
      kindLabel: PERMISSION_KIND_LABEL.menu,
      title: PERMISSION_KIND_LABEL.menu,
      desc: '可授权的最小单位，每个菜单对应一个页面或一组操作入口。',
      rows: [
        { label: '菜单总数', value: String(PERMISSION_STATS.menuCount) },
        { label: '已被引用', value: String(referenced) },
      ],
      groups: [{ label: PERMISSION_KIND_LABEL.menu, chips: menuChips(PERMISSION_MENUS) }],
      breadcrumb: [root, PERMISSION_KIND_LABEL.menu],
    }
  }

  if (sel.kind === 'user') {
    const user = PERMISSION_USERS.find((item) => item.id === sel.id)
    if (user) {
      const roles = rolesOfUser(user)
      const menus = menusOfUser(user)
      const tracedRole = tracedRoleId.value ? ROLE_BY_ID.get(tracedRoleId.value) : undefined
      const breadcrumb = [root, PERMISSION_KIND_LABEL.user, user.name]
      if (tracedRole && roles.some((role) => role.id === tracedRole.id)) {
        breadcrumb.push(tracedRole.name)
        breadcrumb.push(
          `${PERMISSION_MAP_UI.traceDone} ${tracedLeafIds.value.size} / ${menusOfRole(tracedRole).length} ${PERMISSION_MAP_UI.roleMenuCount}`,
        )
      }
      return {
        kindLabel: PERMISSION_KIND_LABEL.user,
        title: user.name,
        desc: user.title,
        rows: [
          { label: PERMISSION_KIND_LABEL.role, value: String(roles.length) },
          { label: PERMISSION_MAP_UI.effectiveMenus, value: String(menus.length) },
        ],
        groups: [
          { label: PERMISSION_MAP_UI.grantedBy, chips: roleChips(roles) },
          { label: PERMISSION_MAP_UI.effectiveMenus, chips: menuChips(menus) },
        ],
        breadcrumb,
      }
    }
  }

  if (sel.kind === 'role') {
    const role = ROLE_BY_ID.get(sel.id)
    if (role) {
      return {
        kindLabel: PERMISSION_KIND_LABEL.role,
        title: role.name,
        desc: role.desc,
        rows: [
          { label: PERMISSION_KIND_LABEL.menu, value: String(role.menuIds.length) },
          { label: PERMISSION_MAP_UI.heldByUsers, value: String(usersOfRole(role.id).length) },
        ],
        groups: [
          { label: PERMISSION_MAP_UI.heldByUsers, chips: userChips(usersOfRole(role.id)) },
          { label: PERMISSION_KIND_LABEL.menu, chips: menuChips(menusOfRole(role)) },
        ],
        breadcrumb: [root, PERMISSION_KIND_LABEL.role, role.name],
      }
    }
  }

  const menu = MENU_BY_ID.get(sel.id)
  if (menu) {
    const roles = rolesWithMenu(menu.id)
    const coveredUsers = PERMISSION_USERS.filter((user) =>
      menusOfUser(user).some((item) => item.id === menu.id),
    )
    const contextRole = contextRoleId.value ? ROLE_BY_ID.get(contextRoleId.value) : undefined
    const breadcrumb = [root]
    if (contextRole && roles.some((role) => role.id === contextRole.id)) {
      breadcrumb.push(PERMISSION_KIND_LABEL.role, contextRole.name)
    }
    breadcrumb.push(PERMISSION_KIND_LABEL.menu, menu.name)
    return {
      kindLabel: PERMISSION_KIND_LABEL.menu,
      title: menu.name,
      desc: menu.desc,
      rows: [
        { label: PERMISSION_MAP_UI.includedInRoles, value: String(roles.length) },
        { label: PERMISSION_MAP_UI.heldByUsers, value: String(coveredUsers.length) },
      ],
      groups: [{ label: PERMISSION_MAP_UI.includedInRoles, chips: roleChips(roles) }],
      breadcrumb,
    }
  }

  return {
    kindLabel: '',
    title: '',
    desc: '',
    rows: [],
    groups: [],
    breadcrumb: [root],
  }
})

const detailKey = computed(() => `${selected.value.kind}-${selected.value.id}`)

function onChipClick(chip: DetailChip): void {
  if (chip.kind === 'user') {
    const user = PERMISSION_USERS.find((item) => item.id === chip.id)
    if (user) selectUser(user)
    return
  }
  if (chip.kind === 'role') {
    const role = ROLE_BY_ID.get(chip.id)
    if (role) selectRole(role, false)
    return
  }
  const menu = MENU_BY_ID.get(chip.id)
  if (menu) selectMenu(menu, contextRoleId.value)
}
</script>

<style scoped>
.star-map {
  /*
   * 星图专用浅绿：令牌表（tokens.css）目前只有黄色品牌强调色，没有绿色。
   * 目标效果（后台视频）的强调色是浅绿，这里只在本组件根上声明两个星图专用变量，
   * 其余颜色/圆角/字号仍全部取令牌；后续若令牌表补上绿色，改这一处即可。
   */
  --star-accent: #7db343;
  --star-accent-soft: #eef6dd;
  --star-glow: #c9e69b;
  /* 动效时长与缓动按仓库约定收口在组件根类，叶子弹簧与连线生长共用 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0.2, 0.7, 0.3, 1);
  --dur-grow: 0.5s;

  display: grid;
  grid-template-columns: 208px minmax(0, 1fr) 264px;
  gap: 14px;
  padding: 14px;
  align-items: start;
}

/* —— 左轨：用户列表 —— */
.star-map__rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.star-map__count {
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: var(--r-pill);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  font-size: var(--fs-label);
  font-weight: 600;
}

.star-map__users {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.star-map__user {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: var(--r-card);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  text-align: left;
  transition:
    border-color 0.16s ease,
    transform 0.16s ease;
}

.star-map__user:hover {
  transform: translateY(-1px);
}

.star-map__user.is-active {
  border-color: var(--star-accent);
}

.star-map__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--star-accent-soft);
  color: var(--c-ink-2);
  font-size: var(--fs-body);
  font-weight: 600;
}

.star-map__user.is-active .star-map__avatar {
  background: var(--star-accent);
  color: var(--c-surface);
}

.star-map__user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.star-map__user-name {
  font-size: var(--fs-body);
  font-weight: 600;
}

.star-map__user-title {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.star-map__user-roles {
  overflow: hidden;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-map__hint {
  font-size: var(--fs-mini);
  line-height: 1.6;
  color: var(--c-ink-3);
}

/* —— 中区：画布 —— */
.star-map__stage {
  min-width: 0;
}

.star-map__svg {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--r-card);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
}

.star-map__edge {
  fill: none;
  stroke: var(--c-ink-4);
  stroke-width: 1.5;
  opacity: 0.55;
  transition:
    stroke 0.25s ease,
    opacity 0.25s ease;
}

.star-map__edge.is-hot {
  stroke: var(--star-accent);
  stroke-width: 2.5;
  opacity: 1;
}

.star-map__leaf-edge {
  fill: none;
  stroke: var(--star-accent);
  stroke-width: 1.5;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition:
    stroke-dashoffset var(--dur-grow) var(--ease-out),
    opacity 0.25s ease;
}

.star-map__leaf-edge.is-open {
  stroke-dashoffset: 0;
  opacity: 0.55;
}

.star-map__leaf-edge.is-hot {
  stroke-width: 2.5;
  opacity: 1;
}

/* 节点入场：外层 g 负责定位（transform 属性），内层 g 只管弹簧缩放，互不覆盖 */
.star-map__pop {
  animation: star-pop 0.55s var(--ease-spring) backwards;
  cursor: pointer;
  outline: none;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes star-pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.star-map__tick {
  stroke: var(--c-ink-4);
  stroke-width: 1.4;
  opacity: 0.6;
}

.star-map__tick.is-major {
  stroke: var(--star-accent);
  stroke-width: 2;
  opacity: 0.9;
}

.star-map__hub-face {
  fill: var(--c-surface);
  stroke: var(--c-line-dash);
  stroke-width: 1.5;
  transition: stroke 0.16s ease;
}

.star-map__hub-face.is-dark {
  fill: var(--c-dark);
  stroke: var(--c-dark);
}

.star-map__hub-face.is-selected {
  stroke: var(--star-accent);
  stroke-width: 2.5;
}

.star-map__hub-count {
  fill: var(--c-ink);
  font-size: 20px;
  font-weight: 600;
  text-anchor: middle;
}

.star-map__hub-count.is-dark {
  fill: var(--c-accent);
}

.star-map__hub-name {
  fill: var(--c-ink-3);
  font-size: 11px;
  text-anchor: middle;
}

.star-map__hub-name.is-dark {
  fill: var(--c-on-dark-soft);
}

.star-map__role-halo {
  fill: none;
  stroke: var(--star-accent);
  stroke-width: 1.5;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.star-map__role-halo.is-on {
  opacity: 0.4;
}

.star-map__role-face {
  fill: var(--c-surface);
  stroke: var(--c-line-dash);
  stroke-width: 1.5;
  transition: stroke 0.16s ease;
}

.star-map__role-face.is-open {
  stroke: var(--star-accent);
}

.star-map__role-face.is-selected {
  stroke: var(--star-accent);
  stroke-width: 2.5;
}

.star-map__role-count {
  fill: var(--c-ink);
  font-size: 15px;
  font-weight: 600;
  text-anchor: middle;
}

.star-map__role-unit {
  fill: var(--c-ink-3);
  font-size: 9px;
  text-anchor: middle;
}

.star-map__role-name {
  fill: var(--c-ink-2);
  font-size: 12.5px;
  font-weight: 500;
  text-anchor: middle;
}

.star-map__leaf {
  opacity: 0;
  cursor: pointer;
  outline: none;
  pointer-events: none;
  transform: scale(0.3);
  transform-box: fill-box;
  transform-origin: center;
  transition:
    opacity 0.3s var(--ease-spring),
    transform 0.45s var(--ease-spring);
}

.star-map__leaf.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

.star-map__leaf-face {
  fill: var(--c-surface);
  stroke: var(--c-line-dash);
  stroke-width: 1.5;
  transition:
    fill 0.2s ease,
    stroke 0.2s ease;
}

.star-map__leaf.is-traced .star-map__leaf-face {
  fill: var(--star-accent-soft);
  stroke: var(--star-accent);
}

.star-map__leaf.is-selected .star-map__leaf-face {
  stroke: var(--star-accent);
  stroke-width: 2.5;
}

.star-map__leaf-name {
  fill: var(--c-ink-2);
  font-size: 10.5px;
  text-anchor: middle;
  pointer-events: none;
}

.star-map__dot {
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.star-map__dot.is-on {
  opacity: 1;
}

.star-map__dot-halo {
  fill: var(--star-glow);
  opacity: 0.45;
}

.star-map__dot-core {
  fill: var(--star-accent);
  stroke: var(--c-surface);
  stroke-width: 1.5;
}

.star-map__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 10px;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.star-map__legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-map__swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-surface);
  border: 1.5px solid var(--c-line-dash);
}

.star-map__swatch--hub {
  border-color: var(--star-accent);
}

.star-map__swatch--role {
  background: var(--c-dark);
  border-color: var(--c-dark);
}

.star-map__swatch--menu {
  background: var(--star-accent-soft);
  border-color: var(--star-accent);
}

/* —— 右轨：详情面板 —— */
.star-map__detail {
  min-width: 0;
  padding: 14px;
  border-radius: var(--r-card);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  animation: detail-in 0.38s var(--ease-out) backwards;
}

@keyframes detail-in {
  from {
    opacity: 0;
    transform: translateX(18px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.star-map__crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.star-map__crumbs .is-current {
  color: var(--c-ink);
  font-weight: 500;
}

.star-map__crumb-sep {
  color: var(--c-ink-4);
}

.star-map__detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.star-map__kind {
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: var(--star-accent-soft);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  font-weight: 500;
}

.star-map__detail-title {
  font-size: var(--fs-title);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.star-map__detail-desc {
  margin-top: 6px;
  font-size: var(--fs-label);
  line-height: 1.6;
  color: var(--c-ink-3);
}

.star-map__rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 12px;
}

.star-map__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-label);
}

.star-map__row dt {
  color: var(--c-ink-3);
}

.star-map__row dd {
  margin: 0;
  font-weight: 600;
}

.star-map__group {
  margin-top: 14px;
}

.star-map__group-label {
  font-size: var(--fs-mini);
  font-weight: 500;
  color: var(--c-ink-3);
}

.star-map__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.star-map__chip {
  padding: 4px 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-canvas);
  font-size: var(--fs-mini);
  color: var(--c-ink-2);
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.star-map__chip:hover {
  border-color: var(--star-accent);
  color: var(--c-ink);
  transform: translateY(-1px);
}

/* —— 平板：详情整行落到画布下方 —— */
@container stage (max-width: 1080px) {
  .star-map {
    grid-template-columns: 184px minmax(0, 1fr);
  }

  .star-map__detail {
    grid-column: 1 / -1;
  }
}

/* —— 手机：单列堆叠，用户列表横向滚 —— */
@container stage (max-width: 720px) {
  .star-map {
    grid-template-columns: minmax(0, 1fr);
  }

  .star-map__users {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .star-map__users li {
    flex: none;
  }

  .star-map__user {
    width: auto;
  }
}
</style>
