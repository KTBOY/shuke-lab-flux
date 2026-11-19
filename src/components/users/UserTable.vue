<!--
 * @Author: zlc
 * @Description: 用户管理表格 —— 搜索、列排序、分页与行内操作只发事件，状态统一由 useUserManagement 收口
-->
<template>
  <section class="user-table panel">
    <div class="user-table__toolbar">
      <label class="user-table__search">
        <AppIcon name="search" :size="15" class="user-table__search-icon" />
        <span class="sr-only">{{ USER_MANAGEMENT_UI.searchLabel }}</span>
        <input
          class="user-table__search-input"
          type="search"
          :value="query"
          :placeholder="USER_MANAGEMENT_UI.searchPlaceholder"
          :aria-label="USER_MANAGEMENT_UI.searchLabel"
          @input="onSearchInput"
        />
      </label>

      <div class="user-table__toolbar-side">
        <span class="user-table__count tnum" aria-live="polite">
          {{ USER_MANAGEMENT_UI.resultPrefix }} {{ total }} {{ USER_MANAGEMENT_UI.resultUnit }}
        </span>
        <button type="button" class="user-table__add" @click="emit('create')">
          <AppIcon name="person-plus" :size="15" />
          <span>{{ USER_MANAGEMENT_UI.addUser }}</span>
        </button>
      </div>
    </div>

    <div class="user-table__scroll">
      <table class="user-table__table">
        <caption class="sr-only">
          {{
            USER_MANAGEMENT_UI.tableCaption
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col" :aria-sort="sortState('name')">
              <button
                type="button"
                class="user-table__sort"
                :aria-label="sortAriaLabel('name')"
                @click="emit('sort', 'name')"
              >
                <span>{{ USER_MANAGEMENT_UI.userColumn }}</span>
                <AppIcon
                  :name="
                    sortKey === 'name' && sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'
                  "
                  :size="13"
                />
              </button>
            </th>
            <th scope="col">{{ USER_MANAGEMENT_UI.rolesColumn }}</th>
            <th scope="col" :aria-sort="sortState('menuCount')">
              <button
                type="button"
                class="user-table__sort"
                :aria-label="sortAriaLabel('menuCount')"
                @click="emit('sort', 'menuCount')"
              >
                <span>{{ USER_MANAGEMENT_UI.menuCountColumn }}</span>
                <AppIcon
                  :name="
                    sortKey === 'menuCount' && sortDirection === 'asc'
                      ? 'chevron-up'
                      : 'chevron-down'
                  "
                  :size="13"
                />
              </button>
            </th>
            <th scope="col">{{ USER_MANAGEMENT_UI.statusColumn }}</th>
            <th scope="col" class="user-table__actions-head">
              {{ USER_MANAGEMENT_UI.actionsColumn }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <div class="user-table__user">
                <span class="user-table__avatar" aria-hidden="true">{{
                  row.name.slice(0, 1)
                }}</span>
                <span class="user-table__user-meta">
                  <strong class="user-table__name">{{ row.name }}</strong>
                  <span class="user-table__title">{{ row.title }}</span>
                </span>
              </div>
            </td>
            <td>
              <div class="user-table__chips">
                <span v-for="role in row.roles" :key="role.id" class="user-table__chip">
                  {{ role.name }}
                </span>
              </div>
            </td>
            <td class="user-table__menu-count tnum">{{ row.menuCount }}</td>
            <td>
              <span
                class="user-table__status"
                :class="{ 'is-disabled': row.status === 'disabled' }"
              >
                <span class="user-table__status-dot" aria-hidden="true"></span>
                {{
                  row.status === 'enabled'
                    ? USER_MANAGEMENT_UI.enabled
                    : USER_MANAGEMENT_UI.disabled
                }}
              </span>
            </td>
            <td>
              <div v-if="pendingDeleteId !== row.id" class="user-table__actions">
                <button type="button" class="user-table__action" @click="emit('edit', row.id)">
                  {{ USER_MANAGEMENT_UI.edit }}
                </button>
                <button
                  type="button"
                  class="user-table__action"
                  @click="emit('toggle-status', row.id)"
                >
                  {{
                    row.status === 'enabled'
                      ? USER_MANAGEMENT_UI.disable
                      : USER_MANAGEMENT_UI.enable
                  }}
                </button>
                <button
                  type="button"
                  class="user-table__action user-table__action--danger"
                  @click="pendingDeleteId = row.id"
                >
                  {{ USER_MANAGEMENT_UI.delete }}
                </button>
              </div>
              <div v-else class="user-table__confirm" role="group">
                <span>{{ USER_MANAGEMENT_UI.deleteConfirm }}</span>
                <button
                  type="button"
                  class="user-table__action user-table__action--confirm"
                  @click="confirmDelete(row.id)"
                >
                  {{ USER_MANAGEMENT_UI.confirmDelete }}
                </button>
                <button type="button" class="user-table__action" @click="pendingDeleteId = null">
                  {{ USER_MANAGEMENT_UI.cancel }}
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="rows.length === 0">
            <td colspan="5">
              <div class="user-table__empty">
                <AppIcon name="search" :size="20" class="user-table__empty-icon" />
                <strong class="user-table__empty-title">
                  {{
                    query ? USER_MANAGEMENT_UI.emptySearchTitle : USER_MANAGEMENT_UI.emptyUsersTitle
                  }}
                </strong>
                <span class="user-table__empty-hint">
                  {{
                    query ? USER_MANAGEMENT_UI.emptySearchHint : USER_MANAGEMENT_UI.emptyUsersHint
                  }}
                </span>
                <button
                  v-if="query"
                  type="button"
                  class="user-table__empty-action"
                  @click="emit('clear-search')"
                >
                  {{ USER_MANAGEMENT_UI.clearSearch }}
                </button>
                <button
                  v-else
                  type="button"
                  class="user-table__empty-action"
                  @click="emit('create')"
                >
                  {{ USER_MANAGEMENT_UI.addUser }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="user-table__pagination">
      <label class="user-table__page-size">
        <span>{{ USER_MANAGEMENT_UI.pageSizeLabel }}</span>
        <select
          class="user-table__select"
          :value="pageSize"
          :aria-label="USER_MANAGEMENT_UI.pageSizeLabel"
          @change="onPageSizeChange"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </label>

      <nav class="user-table__pages" :aria-label="USER_MANAGEMENT_UI.pageNavigationLabel">
        <button
          type="button"
          class="user-table__page-button"
          :disabled="page <= 1"
          @click="emit('update:page', page - 1)"
        >
          {{ USER_MANAGEMENT_UI.previousPage }}
        </button>
        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="user-table__page-button user-table__page-button--number"
          :class="{ 'is-active': pageNumber === page }"
          :aria-current="pageNumber === page ? 'page' : undefined"
          :aria-label="`${USER_MANAGEMENT_UI.pageLabel} ${pageNumber} ${USER_MANAGEMENT_UI.pageUnit}`"
          @click="emit('update:page', pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button
          type="button"
          class="user-table__page-button"
          :disabled="page >= totalPages"
          @click="emit('update:page', page + 1)"
        >
          {{ USER_MANAGEMENT_UI.nextPage }}
        </button>
      </nav>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { USER_MANAGEMENT_UI } from '@/data/userManagement'
import type { ManagedUserRow, UserSortDirection, UserSortKey } from '@/data/userManagement'

defineOptions({ name: 'Users-UserTable' })

interface Props {
  rows: ManagedUserRow[]
  total: number
  query: string
  sortKey: UserSortKey
  sortDirection: UserSortDirection
  page: number
  pageSize: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:query': [value: string]
  sort: [key: UserSortKey]
  'update:page': [page: number]
  'update:page-size': [size: number]
  create: []
  edit: [id: string]
  'toggle-status': [id: string]
  delete: [id: string]
  'clear-search': []
}>()

const pendingDeleteId = ref<string | null>(null)
const pageNumbers = computed(() =>
  Array.from({ length: props.totalPages }, (_, index) => index + 1),
)

watch(
  () => props.rows,
  (rows) => {
    if (pendingDeleteId.value && !rows.some((row) => row.id === pendingDeleteId.value)) {
      pendingDeleteId.value = null
    }
  },
)

function sortState(key: UserSortKey): 'ascending' | 'descending' | 'none' {
  if (props.sortKey !== key) return 'none'
  return props.sortDirection === 'asc' ? 'ascending' : 'descending'
}

function sortAriaLabel(key: UserSortKey): string {
  const label = key === 'name' ? USER_MANAGEMENT_UI.userColumn : USER_MANAGEMENT_UI.menuCountColumn
  if (props.sortKey !== key) return label
  return `${label} · ${
    props.sortDirection === 'asc'
      ? USER_MANAGEMENT_UI.sortAscending
      : USER_MANAGEMENT_UI.sortDescending
  }`
}

function onSearchInput(event: Event): void {
  emit('update:query', (event.target as HTMLInputElement).value)
}

function onPageSizeChange(event: Event): void {
  emit('update:page-size', Number((event.target as HTMLSelectElement).value))
}

function confirmDelete(id: string): void {
  pendingDeleteId.value = null
  emit('delete', id)
}
</script>

<style scoped>
.user-table {
  --dur-fast: 0.16s;
  min-width: 0;
  padding: clamp(14px, 2.4cqi, 22px);
  overflow: hidden;
}

.user-table__toolbar,
.user-table__toolbar-side,
.user-table__pagination,
.user-table__pages {
  display: flex;
  align-items: center;
}

.user-table__toolbar {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.user-table__search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(360px, 100%);
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  box-shadow: var(--sd-float);
}

.user-table__search-icon {
  color: var(--c-ink-3);
}

.user-table__search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--c-ink);
  font: inherit;
  font-size: var(--fs-body);
}

.user-table__search-input::placeholder {
  color: var(--c-ink-4);
}

.user-table__toolbar-side {
  gap: 12px;
}

.user-table__count {
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

.user-table__add,
.user-table__empty-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 15px;
  border-radius: var(--r-pill);
  background: var(--c-dark);
  color: var(--c-on-dark);
  font-size: var(--fs-mini);
  font-weight: 500;
  transition:
    transform var(--dur-fast) ease,
    background-color var(--dur-fast) ease;
}

.user-table__add:hover,
.user-table__empty-action:hover {
  transform: translateY(-1px);
  background: var(--c-dark-2);
}

.user-table__scroll {
  overflow-x: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--r-card);
  background: var(--c-surface);
  overscroll-behavior-x: contain;
}

.user-table__table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
  background: var(--c-surface);
}

.user-table__table th,
.user-table__table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--c-line);
  text-align: left;
  vertical-align: middle;
}

.user-table__table th {
  background: var(--c-surface-card);
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.user-table__table tbody tr {
  transition: background-color var(--dur-fast) ease;
}

.user-table__table tbody tr:hover {
  background: var(--c-surface-warm);
}

.user-table__table tbody tr:last-child td {
  border-bottom: 0;
}

.user-table__sort {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
}

.user-table__actions-head {
  min-width: 218px;
}

.user-table__user {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 150px;
}

.user-table__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: var(--c-accent-soft);
  /* accent-soft 在深色下仍是浅黄底，文字要用不随模式翻转的深墨色，深浅两套都保对比 */
  color: var(--c-dark);
  font-size: var(--fs-title);
  font-weight: 500;
}

.user-table__user-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.user-table__name {
  font-size: var(--fs-body);
  font-weight: 500;
  white-space: nowrap;
}

.user-table__title {
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

.user-table__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 150px;
}

.user-table__chip {
  padding: 3px 9px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface-card);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

.user-table__menu-count {
  font-size: var(--fs-title);
  font-weight: 500;
}

.user-table__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-accent-soft);
  /* 同头像：浅黄底在深色下不翻转，文字固定用深墨色 */
  color: var(--c-dark);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

.user-table__status.is-disabled {
  background: var(--c-surface-card);
  color: var(--c-ink-3);
}

.user-table__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-accent-deep);
}

.user-table__status.is-disabled .user-table__status-dot {
  background: var(--c-ink-4);
}

.user-table__actions,
.user-table__confirm {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 218px;
}

.user-table__confirm {
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
}

.user-table__action {
  padding: 5px 11px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  white-space: nowrap;
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease,
    background-color var(--dur-fast) ease;
}

.user-table__action:hover {
  border-color: var(--c-line-dash);
  color: var(--c-ink);
}

.user-table__action--danger {
  color: var(--c-ink-2);
}

.user-table__action--confirm {
  border-color: var(--c-dark);
  background: var(--c-dark);
  color: var(--c-on-dark);
}

.user-table__empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
  padding: 38px 16px;
  text-align: center;
}

.user-table__empty-icon {
  color: var(--c-ink-4);
}

.user-table__empty-title {
  font-size: var(--fs-title);
  font-weight: 500;
}

.user-table__empty-hint {
  color: var(--c-ink-3);
  font-size: var(--fs-label);
}

.user-table__empty-action {
  margin-top: 7px;
}

.user-table__pagination {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.user-table__page-size {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

.user-table__select {
  min-height: 32px;
  padding: 0 8px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  color: var(--c-ink);
  font: inherit;
}

.user-table__pages {
  flex-wrap: wrap;
  gap: 6px;
}

.user-table__page-button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease,
    background-color var(--dur-fast) ease;
}

.user-table__page-button:hover:not(:disabled) {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
}

.user-table__page-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.user-table__page-button--number {
  min-width: 32px;
  padding: 0 8px;
}

.user-table__page-button.is-active {
  border-color: var(--c-dark);
  background: var(--c-dark);
  color: var(--c-on-dark);
}

@media (max-width: 720px) {
  .user-table {
    padding: 12px;
  }

  .user-table__toolbar,
  .user-table__pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .user-table__toolbar-side,
  .user-table__pages {
    justify-content: space-between;
  }

  .user-table__search {
    width: 100%;
  }
}
</style>
