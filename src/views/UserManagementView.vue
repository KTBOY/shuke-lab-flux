<!--
 * @Author: zlc
 * @Description: 用户管理视图 —— 标题行（说明 + 权限星图入口）与用户表格，状态由 useUserManagement 收口
-->
<template>
  <div class="users">
    <div class="hero">
      <div class="hero__text">
        <h1 class="hero__title">{{ USER_MANAGEMENT_UI.title }}</h1>
        <p class="hero__subtitle">{{ USER_MANAGEMENT_UI.subtitle }}</p>
      </div>

      <RouterLink class="hero__entry" :to="{ name: ROUTE_NAME.permissions }">
        <AppIcon name="network" :size="15" class="hero__entry-icon" />
        <span>{{ USER_MANAGEMENT_UI.toPermissionMap }}</span>
        <AppIcon name="arrow-up-right" :size="12" class="hero__entry-arrow" />
      </RouterLink>
    </div>

    <UserTable
      :rows="pagedRows"
      :total="pagination.total"
      :query="query"
      :sort-key="sortKey"
      :sort-direction="sortDirection"
      :page="pagination.page"
      :page-size="pageSize"
      :total-pages="pagination.totalPages"
      @update:query="setQuery"
      @sort="toggleSort"
      @update:page="setPage"
      @update:page-size="setPageSize"
      @create="openCreate"
      @edit="openEdit"
      @toggle-status="toggleStatus"
      @delete="deleteUser"
      @clear-search="clearSearch"
    />

    <UserEditDialog
      v-if="dialogOpen"
      :user="editingUser"
      :roles="PERMISSION_ROLES"
      @close="closeDialog"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UserEditDialog from '@/components/users/UserEditDialog.vue'
import UserTable from '@/components/users/UserTable.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUserManagement } from '@/composables/useUserManagement'
import { PERMISSION_ROLES } from '@/data/permissions'
import { USER_MANAGEMENT_UI } from '@/data/userManagement'
import type { ManagedUser, UserFormValues } from '@/data/userManagement'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'UserManagement-View' })

const {
  query,
  sortKey,
  sortDirection,
  pageSize,
  pagination,
  pagedRows,
  setQuery,
  clearSearch,
  toggleSort,
  setPage,
  setPageSize,
  toggleStatus,
  saveUser,
  deleteUser,
  userById,
} = useUserManagement()

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const editingUser = computed<ManagedUser | null>(() =>
  editingId.value ? (userById(editingId.value) ?? null) : null,
)

function openCreate(): void {
  editingId.value = null
  dialogOpen.value = true
}

function openEdit(id: string): void {
  editingId.value = id
  dialogOpen.value = true
}

function closeDialog(): void {
  dialogOpen.value = false
  editingId.value = null
}

function onSave(values: UserFormValues): void {
  const errors = saveUser(values, editingId.value ?? undefined)
  if (Object.keys(errors).length === 0) closeDialog()
}
</script>

<style scoped>
.users {
  min-width: 0;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: clamp(10px, 2cqi, 18px);
  margin: clamp(14px, 2.6cqi, 24px) 0 clamp(12px, 2.2cqi, 20px);
}

.hero__title {
  min-width: 0;
  font-size: clamp(26px, 5cqi, var(--fs-display));
  font-weight: 300;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.hero__subtitle {
  margin-top: 6px;
  font-size: var(--fs-label);
  color: var(--c-ink-3);
}

.hero__entry {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  padding: clamp(6px, 0.9cqi, 8px) clamp(12px, 1.6cqi, 16px);
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  letter-spacing: 0.01em;
  text-decoration: none;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.18s ease;
}

.hero__entry:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

.hero__entry:active {
  transform: translateY(0);
}

.hero__entry-icon {
  color: var(--c-ink-3);
  transition: color 0.16s ease;
}

.hero__entry-arrow {
  color: var(--c-ink-4);
  transition: color 0.16s ease;
}

.hero__entry:hover .hero__entry-icon {
  color: var(--c-ink);
}

.hero__entry:hover .hero__entry-arrow {
  color: var(--c-accent-deep);
}

.users > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.users > :nth-child(1) {
  animation-delay: 0.08s;
}

.users > :nth-child(2) {
  animation-delay: 0.16s;
}
</style>
