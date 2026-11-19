import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import {
  USER_MANAGEMENT_UI,
  createInitialManagedUsers,
  filterUsers,
  paginateUsers,
  sortUsers,
  toManagedUserRow,
  validateUserForm,
} from '@/data/userManagement'
import type {
  ManagedUser,
  ManagedUserRow,
  PaginatedUsers,
  UserFormErrors,
  UserFormValues,
  UserSortDirection,
  UserSortKey,
} from '@/data/userManagement'

/**
 * @Author: zlc
 * @Description: 用户管理页本地状态 —— 静态权限数据只作为初始值，搜索、排序、分页与增删改
 *               都停留在当前页面实例内，不回写 permissions.ts，也不做持久化。
 */
export interface UseUserManagement {
  query: Ref<string>
  sortKey: Ref<UserSortKey>
  sortDirection: Ref<UserSortDirection>
  page: Ref<number>
  pageSize: Ref<number>
  rows: ComputedRef<ManagedUserRow[]>
  filteredRows: ComputedRef<ManagedUserRow[]>
  sortedRows: ComputedRef<ManagedUserRow[]>
  pagination: ComputedRef<PaginatedUsers>
  pagedRows: ComputedRef<ManagedUserRow[]>
  setQuery: (value: string) => void
  clearSearch: () => void
  toggleSort: (key: UserSortKey) => void
  setPage: (nextPage: number) => void
  setPageSize: (size: number) => void
  toggleStatus: (id: string) => void
  saveUser: (values: UserFormValues, editingId?: string) => UserFormErrors
  deleteUser: (id: string) => void
  userById: (id: string) => ManagedUser | undefined
}

export function useUserManagement(): UseUserManagement {
  const users = ref<ManagedUser[]>(createInitialManagedUsers())
  const query = ref('')
  const sortKey = ref<UserSortKey>('name')
  const sortDirection = ref<UserSortDirection>('asc')
  const page = ref(1)
  const pageSize = ref(5)
  let localIdSequence = 0

  const rows = computed(() => users.value.map((user) => toManagedUserRow(user)))
  const filteredRows = computed(() => filterUsers(rows.value, query.value))
  const sortedRows = computed(() =>
    sortUsers(filteredRows.value, sortKey.value, sortDirection.value),
  )
  const pagination = computed(() => paginateUsers(sortedRows.value, page.value, pageSize.value))
  const pagedRows = computed(() => pagination.value.items)

  watch(query, () => {
    page.value = 1
  })

  watch(pageSize, () => {
    page.value = 1
  })

  /* 删除末页最后一行后把页码收回有效范围，分页页脚与表格读到的是同一个页码 */
  watch(
    () => pagination.value.page,
    (clampedPage) => {
      if (page.value !== clampedPage) page.value = clampedPage
    },
  )

  function setQuery(value: string): void {
    query.value = value
  }

  function clearSearch(): void {
    query.value = ''
  }

  function toggleSort(key: UserSortKey): void {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      return
    }
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  function setPage(nextPage: number): void {
    page.value = Math.min(Math.max(1, nextPage), pagination.value.totalPages)
  }

  function setPageSize(size: number): void {
    pageSize.value = size
  }

  function toggleStatus(id: string): void {
    const target = users.value.find((user) => user.id === id)
    if (target) target.status = target.status === 'enabled' ? 'disabled' : 'enabled'
  }

  function createUserId(): string {
    let id = ''
    do {
      localIdSequence += 1
      id = `local-user-${Date.now().toString(36)}-${localIdSequence}`
    } while (users.value.some((user) => user.id === id))
    return id
  }

  function saveUser(values: UserFormValues, editingId?: string): UserFormErrors {
    const errors = validateUserForm(values)
    if (Object.keys(errors).length > 0) return errors

    const normalized: UserFormValues = {
      name: values.name.trim(),
      roleIds: [...values.roleIds],
      status: values.status,
    }

    if (editingId) {
      const target = users.value.find((user) => user.id === editingId)
      if (target) Object.assign(target, normalized)
      return {}
    }

    users.value = [
      {
        id: createUserId(),
        title: USER_MANAGEMENT_UI.newUserTitle,
        ...normalized,
      },
      ...users.value,
    ]
    page.value = 1
    return {}
  }

  function deleteUser(id: string): void {
    users.value = users.value.filter((user) => user.id !== id)
  }

  function userById(id: string): ManagedUser | undefined {
    const target = users.value.find((user) => user.id === id)
    return target ? { ...target, roleIds: [...target.roleIds] } : undefined
  }

  return {
    query,
    sortKey,
    sortDirection,
    page,
    pageSize,
    rows,
    filteredRows,
    sortedRows,
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
  }
}
