<!--
 * @Author: zlc
 * @Description: 用户编辑弹窗 —— 新增与编辑共用一份表单，校验走 userManagement 的纯函数，保存事件交回页面状态
-->
<template>
  <Teleport to="body">
    <div class="user-dialog">
      <div class="user-dialog__backdrop" @click="emit('close')"></div>

      <section
        ref="panelRef"
        class="user-dialog__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogTitle"
        @keydown="onPanelKeydown"
      >
        <header class="user-dialog__head">
          <div>
            <h2 class="user-dialog__title">{{ dialogTitle }}</h2>
            <p class="user-dialog__desc">{{ USER_MANAGEMENT_UI.dialogDescription }}</p>
          </div>
          <button
            type="button"
            class="user-dialog__close"
            :aria-label="USER_MANAGEMENT_UI.closeDialog"
            @click="emit('close')"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form class="user-dialog__form" novalidate @submit.prevent="onSubmit">
          <div class="user-dialog__field">
            <label class="user-dialog__label" for="user-edit-name">
              {{ USER_MANAGEMENT_UI.nameLabel }}
            </label>
            <input
              id="user-edit-name"
              ref="nameInputRef"
              v-model="name"
              class="user-dialog__input"
              type="text"
              :placeholder="USER_MANAGEMENT_UI.namePlaceholder"
              :aria-invalid="Boolean(errors.name)"
              :aria-describedby="errors.name ? 'user-edit-name-error' : undefined"
              autocomplete="off"
              @input="errors.name = undefined"
            />
            <p v-if="errors.name" id="user-edit-name-error" class="user-dialog__error">
              {{ errors.name }}
            </p>
          </div>

          <fieldset class="user-dialog__field user-dialog__fieldset">
            <legend class="user-dialog__label">{{ USER_MANAGEMENT_UI.rolesLabel }}</legend>
            <div class="user-dialog__options" :aria-describedby="rolesDescriptionId">
              <label
                v-for="role in roles"
                :key="role.id"
                class="user-dialog__option"
                :class="{ 'is-selected': roleIds.includes(role.id) }"
              >
                <input
                  class="sr-only"
                  type="checkbox"
                  :checked="roleIds.includes(role.id)"
                  @change="toggleRole(role.id)"
                />
                <span>{{ role.name }}</span>
              </label>
            </div>
            <p :id="rolesHintId" class="user-dialog__hint">
              {{ USER_MANAGEMENT_UI.rolesHint }}
            </p>
            <p v-if="errors.roleIds" :id="rolesErrorId" class="user-dialog__error">
              {{ errors.roleIds }}
            </p>
          </fieldset>

          <fieldset class="user-dialog__field user-dialog__fieldset">
            <legend class="user-dialog__label">{{ USER_MANAGEMENT_UI.statusLabel }}</legend>
            <div class="user-dialog__options">
              <label class="user-dialog__option" :class="{ 'is-selected': status === 'enabled' }">
                <input v-model="status" class="sr-only" type="radio" value="enabled" />
                <span>{{ USER_MANAGEMENT_UI.enabled }}</span>
              </label>
              <label class="user-dialog__option" :class="{ 'is-selected': status === 'disabled' }">
                <input v-model="status" class="sr-only" type="radio" value="disabled" />
                <span>{{ USER_MANAGEMENT_UI.disabled }}</span>
              </label>
            </div>
          </fieldset>

          <footer class="user-dialog__foot">
            <button type="button" class="user-dialog__button" @click="emit('close')">
              {{ USER_MANAGEMENT_UI.cancel }}
            </button>
            <button type="submit" class="user-dialog__button user-dialog__button--primary">
              <AppIcon name="check" :size="14" />
              <span>{{ USER_MANAGEMENT_UI.save }}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { PermissionRole, PermissionUserStatus } from '@/data/permissions'
import { USER_MANAGEMENT_UI, validateUserForm } from '@/data/userManagement'
import type { ManagedUser, UserFormErrors, UserFormValues } from '@/data/userManagement'

defineOptions({ name: 'Users-UserEditDialog' })

interface Props {
  user: ManagedUser | null
  roles: PermissionRole[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [values: UserFormValues]
}>()

const name = ref(props.user?.name ?? '')
const roleIds = ref<string[]>([...(props.user?.roleIds ?? [])])
const status = ref<PermissionUserStatus>(props.user?.status ?? 'enabled')
const errors = ref<UserFormErrors>({})
const nameInputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const dialogTitle = computed(() =>
  props.user ? USER_MANAGEMENT_UI.dialogEditTitle : USER_MANAGEMENT_UI.dialogCreateTitle,
)
const rolesHintId = 'user-edit-roles-hint'
const rolesErrorId = 'user-edit-roles-error'
const rolesDescriptionId = computed(() => (errors.value.roleIds ? rolesErrorId : rolesHintId))

let lastFocused: HTMLElement | null = null

onMounted(() => {
  lastFocused = document.activeElement as HTMLElement | null
  document.addEventListener('keydown', onGlobalKeydown)
  void nextTick(() => nameInputRef.value?.focus())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  lastFocused?.focus?.()
  lastFocused = null
})

function toggleRole(roleId: string): void {
  roleIds.value = roleIds.value.includes(roleId)
    ? roleIds.value.filter((id) => id !== roleId)
    : [...roleIds.value, roleId]
  if (roleIds.value.length > 0) errors.value.roleIds = undefined
}

function onSubmit(): void {
  const values: UserFormValues = {
    name: name.value,
    roleIds: [...roleIds.value],
    status: status.value,
  }
  errors.value = validateUserForm(values)
  if (Object.keys(errors.value).length > 0) {
    if (errors.value.name) nameInputRef.value?.focus()
    return
  }
  emit('save', values)
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

/** Tab 只在弹窗内循环，焦点不会跑到被遮罩盖住的表格后面 */
function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !panelRef.value) return
  const focusable = [
    ...panelRef.value.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => !element.hasAttribute('disabled'))
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<style scoped>
.user-dialog {
  --dur-in: 0.26s;
  --ease-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
  position: fixed;
  inset: 0;
  z-index: 70;
}

.user-dialog__backdrop {
  position: absolute;
  inset: 0;
  background: var(--c-dark);
  opacity: 0.42;
  animation: user-dialog-fade var(--dur-in) ease both;
}

.user-dialog__panel {
  position: relative;
  width: min(520px, calc(100vw - 32px));
  max-height: min(88vh, 720px);
  margin: 7vh auto 0;
  overflow-y: auto;
  border: 1px solid var(--c-hairline);
  border-radius: var(--r-panel);
  background: var(--c-surface-warm);
  box-shadow: var(--sd-panel);
  backdrop-filter: blur(16px);
  animation: user-dialog-in var(--dur-in) var(--ease-spring) both;
}

@keyframes user-dialog-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.42;
  }
}

@keyframes user-dialog-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.user-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 14px;
  border-bottom: 1px solid var(--c-line);
}

.user-dialog__title {
  font-size: var(--fs-title);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.user-dialog__desc {
  margin-top: 5px;
  color: var(--c-ink-3);
  font-size: var(--fs-label);
  line-height: 1.55;
}

.user-dialog__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: var(--c-surface);
  color: var(--c-ink-2);
  font-size: var(--fs-title);
  line-height: 1;
}

.user-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 17px;
  padding: 18px 20px 20px;
}

.user-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-dialog__fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

.user-dialog__label {
  color: var(--c-ink-2);
  font-size: var(--fs-label);
  font-weight: 500;
}

.user-dialog__input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-card);
  outline: none;
  background: var(--c-surface);
  color: var(--c-ink);
  font: inherit;
  font-size: var(--fs-body);
}

.user-dialog__input:focus {
  border-color: var(--c-line-dash);
}

.user-dialog__options {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.user-dialog__option {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  cursor: pointer;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.user-dialog__option.is-selected {
  border-color: var(--c-dark);
  background: var(--c-dark);
  color: var(--c-on-dark);
}

.user-dialog__hint {
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

.user-dialog__error {
  color: var(--c-ink);
  font-size: var(--fs-mini);
  font-weight: 500;
}

.user-dialog__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 3px;
}

.user-dialog__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  font-weight: 500;
}

.user-dialog__button--primary {
  border-color: var(--c-dark);
  background: var(--c-dark);
  color: var(--c-on-dark);
}

@media (max-width: 720px) {
  .user-dialog__panel {
    margin-top: 4vh;
  }

  .user-dialog__head,
  .user-dialog__form {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
