<!--
 * @Author: zlc
 * @Description: 命令面板 —— ⌘K / Ctrl+K 全局唤出：搜页面、动作与权限实体（键盘可达），
               输入像问题时切到本地权限问答（规则在 data/commandPalette.ts，组件只渲染与执行）。
               常驻挂载 + is-open 类开关（跟随仓库动效约定，不挂撤），挂在 AppShell 一次、全站可用。
-->
<template>
  <Teleport to="body">
    <div class="cmdk" :class="{ 'is-open': isPaletteOpen }">
      <div class="cmdk__backdrop" @click="closePalette"></div>

      <section
        class="cmdk__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="COMMAND_PALETTE_UI.dialogAriaLabel"
      >
        <div class="cmdk__search">
          <AppIcon name="search" :size="16" class="cmdk__search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="cmdk__input"
            :placeholder="COMMAND_PALETTE_UI.inputPlaceholder"
            :aria-label="COMMAND_PALETTE_UI.inputAriaLabel"
            autocomplete="off"
            @keydown="onInputKeydown"
          />
          <kbd class="cmdk__kbd">ESC</kbd>
        </div>

        <div class="cmdk__body">
          <!-- 问答态：结论句 + 链路条 / 清单 chips / 兜底示例 -->
          <div v-if="answer" class="cmdk__answer">
            <p class="cmdk__group-title">
              <AppIcon name="bulb" :size="13" />
              <span>{{ COMMAND_PALETTE_UI.answerTitle }}</span>
            </p>
            <p class="cmdk__summary">{{ summary }}</p>

            <template v-if="answer.type === 'who-can'">
              <p class="cmdk__sub">
                {{ COMMAND_PALETTE_UI.chainsLabel }} · {{ answer.chains.length }}
                {{ COMMAND_PALETTE_UI.chainMore }}
              </p>
              <div
                v-for="(chain, idx) in answer.chains.slice(0, CHAIN_LIMIT)"
                :key="idx"
                class="cmdk__chain"
              >
                <span class="cmdk__chip">{{ chain.user.name }}</span>
                <span class="cmdk__arrow">→</span>
                <span class="cmdk__chip">{{ chain.role.name }}</span>
                <span class="cmdk__arrow">→</span>
                <span class="cmdk__chip cmdk__chip--menu">{{ chain.menu.name }}</span>
              </div>
              <p v-if="answer.chains.length > CHAIN_LIMIT" class="cmdk__more">
                …{{ answer.chains.length - CHAIN_LIMIT }} {{ COMMAND_PALETTE_UI.chainMore }}
              </p>
            </template>

            <template v-else-if="answer.type === 'role-check' || answer.type === 'user-check'">
              <p
                v-if="answer.type === 'user-check' && answer.viaRoles.length > 0"
                class="cmdk__sub"
              >
                {{ COMMAND_PALETTE_UI.viaRolesLabel }} ·
                {{ answer.viaRoles.map((role) => role.name).join('、') }}
              </p>
              <p class="cmdk__sub">{{ COMMAND_PALETTE_UI.menusLabel }}</p>
              <div class="cmdk__chips">
                <span v-for="menu in answer.menus" :key="menu.id" class="cmdk__chip">
                  {{ menu.name }}
                </span>
              </div>
            </template>

            <template v-else-if="answer.type === 'unknown'">
              <p class="cmdk__sub">{{ COMMAND_PALETTE_UI.unknownExamplesLabel }}</p>
              <div class="cmdk__examples">
                <button
                  v-for="example in COMMAND_PALETTE_UI.exampleQuestions"
                  :key="example"
                  type="button"
                  class="cmdk__example"
                  @click="askExample(example)"
                >
                  {{ example }}
                </button>
              </div>
            </template>

            <button v-if="askMode" type="button" class="cmdk__back" @click="exitAskMode">
              {{ COMMAND_PALETTE_UI.backToResults }}
            </button>
          </div>

          <!-- 搜索态：分组结果 / 空状态 / 问答入口 -->
          <template v-else>
            <div v-for="group in indexedGroups" :key="group.id" class="cmdk__group">
              <p class="cmdk__group-title">{{ group.label }}</p>
              <button
                v-for="entry in group.items"
                :key="entry.item.id"
                type="button"
                class="cmdk__item"
                :class="{ 'is-active': entry.index === activeIndex }"
                :data-row-index="entry.index"
                @click="runItem(entry.item)"
                @mousemove="activeIndex = entry.index"
              >
                <AppIcon :name="entry.item.icon" :size="15" class="cmdk__item-icon" />
                <span class="cmdk__item-label">{{ entry.item.label }}</span>
                <span class="cmdk__item-hint">{{ entry.item.hint }}</span>
              </button>
            </div>

            <div v-if="indexedGroups.length === 0" class="cmdk__empty">
              <p class="cmdk__empty-title">{{ COMMAND_PALETTE_UI.emptyTitle }}</p>
              <p class="cmdk__empty-hint">{{ COMMAND_PALETTE_UI.emptyHint }}</p>
            </div>

            <button
              v-if="showAskEntry"
              type="button"
              class="cmdk__item cmdk__item--ask"
              :class="{ 'is-active': activeIndex === askEntryIndex }"
              :data-row-index="askEntryIndex"
              @click="enterAskMode"
              @mousemove="activeIndex = askEntryIndex"
            >
              <AppIcon name="bulb" :size="15" class="cmdk__item-icon" />
              <span class="cmdk__item-label">{{ COMMAND_PALETTE_UI.askEntryLabel }}</span>
              <span class="cmdk__item-hint">{{ COMMAND_PALETTE_UI.askEntryHint }}</span>
            </button>
          </template>
        </div>

        <footer class="cmdk__foot">{{ COMMAND_PALETTE_UI.footerHint }}</footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useColorMode } from '@/composables/useColorMode'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import {
  COMMAND_ACTION,
  COMMAND_PALETTE_UI,
  answerPermissionQuestion,
  answerSummary,
  flattenGroups,
  isQuestionLike,
  searchCommands,
} from '@/data/commandPalette'
import type { CommandItem, PermissionAnswer } from '@/data/commandPalette'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Command-Palette' })

/** 答案卡里链路条最多画几条，超出只报总数（超级管理员的全量链会刷屏） */
const CHAIN_LIMIT = 8

const router = useRouter()
const { isPaletteOpen, closePalette, togglePalette } = useCommandPalette()
const { toggleColorMode } = useColorMode()
const { applyTheme, clearTheme } = useDashboardTheme()

const query = ref('')
const activeIndex = ref(0)
/** 经「问答入口」强制进入问答态（输入本身不像问题时用）；自然提问不走这里 */
const askMode = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

/** 打开瞬间把焦点还给谁：关闭时归还，避免键盘用户丢失上下文 */
let lastFocused: HTMLElement | null = null

const answer = computed<PermissionAnswer | null>(() => {
  const text = query.value.trim()
  if (text === '') return null
  if (askMode.value) return answerPermissionQuestion(text) ?? { type: 'unknown' }
  return isQuestionLike(text) ? answerPermissionQuestion(text) : null
})

const summary = computed(() => (answer.value ? answerSummary(answer.value) : ''))

const groups = computed(() => (answer.value ? [] : searchCommands(query.value)))
const flatItems = computed(() => flattenGroups(groups.value))

/** 搜索无果且输入非空时，给一条「用问答试试」的入口行（排在全部结果之后） */
const showAskEntry = computed(
  () => !answer.value && query.value.trim() !== '' && flatItems.value.length === 0,
)
const askEntryIndex = computed(() => flatItems.value.length)
const totalSelectable = computed(() => flatItems.value.length + (showAskEntry.value ? 1 : 0))

/** 模板渲染用的带全局序号分组：键盘选中态按摊平顺序走，分组只是视觉层 */
const indexedGroups = computed(() => {
  let index = 0
  return groups.value.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ item, index: index++ })),
  }))
})

watch(query, () => {
  activeIndex.value = 0
  if (query.value.trim() === '') askMode.value = false
})

watch(isPaletteOpen, (open) => {
  if (open) {
    lastFocused = document.activeElement as HTMLElement | null
    query.value = ''
    activeIndex.value = 0
    askMode.value = false
    document.documentElement.style.overflow = 'hidden'
    void nextTick(() => inputRef.value?.focus())
  } else {
    document.documentElement.style.overflow = ''
    lastFocused?.focus?.()
    lastFocused = null
  }
})

function enterAskMode(): void {
  askMode.value = true
}

function exitAskMode(): void {
  askMode.value = false
  void nextTick(() => inputRef.value?.focus())
}

function askExample(example: string): void {
  query.value = example
  askMode.value = true
  void nextTick(() => inputRef.value?.focus())
}

function runItem(item: CommandItem): void {
  if (item.kind === 'page' && item.routeName) {
    closePalette()
    void router.push({ name: item.routeName })
    return
  }
  if (item.kind === 'entity') {
    closePalette()
    void router.push({ name: ROUTE_NAME.permissions })
    return
  }
  if (item.kind === 'action' && item.actionId) {
    if (item.actionId === COMMAND_ACTION.toggleColorMode) toggleColorMode()
    else if (item.actionId === COMMAND_ACTION.restoreDefaultTheme) clearTheme()
    else if (item.actionId.startsWith(COMMAND_ACTION.applyThemePrefix)) {
      applyTheme(item.actionId.slice(COMMAND_ACTION.applyThemePrefix.length))
    }
    closePalette()
  }
}

function runActive(): void {
  if (answer.value) return
  if (showAskEntry.value && activeIndex.value === askEntryIndex.value) {
    enterAskMode()
    return
  }
  const item = flatItems.value[activeIndex.value]
  if (item) runItem(item)
}

function moveActive(step: number): void {
  const total = totalSelectable.value
  if (total === 0) return
  activeIndex.value = (activeIndex.value + step + total) % total
  void nextTick(() => {
    document
      .querySelector(`[data-row-index="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}

function onInputKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    runActive()
  }
}

/** 全局键：⌘K / Ctrl+K 开关面板，Esc 关闭（面板打开时） */
function onGlobalKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    togglePalette()
  } else if (event.key === 'Escape' && isPaletteOpen.value) {
    closePalette()
  }
}

document.addEventListener('keydown', onGlobalKeydown)
onScopeDispose(() => document.removeEventListener('keydown', onGlobalKeydown))
</script>

<style scoped>
.cmdk {
  --dur-in: 0.26s;
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  position: fixed;
  inset: 0;
  z-index: 60;
  visibility: hidden;
  transition: visibility 0s linear 0.3s;
}

.cmdk.is-open {
  visibility: visible;
  transition-delay: 0s;
}

.cmdk__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(23, 23, 26, 0.34);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cmdk.is-open .cmdk__backdrop {
  opacity: 1;
}

.cmdk__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(620px, calc(100vw - 32px));
  max-height: min(72vh, 640px);
  margin: 11vh auto 0;
  overflow: hidden;
  border: 1px solid var(--c-hairline);
  border-radius: var(--r-panel);
  /* 半透暖面 + 背景模糊出玻璃感；深色下令牌自动换深面，不写死浅色 */
  background: var(--c-surface-warm);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 48px -24px rgba(23, 23, 26, 0.45);
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
  transition:
    opacity 0.18s ease,
    transform var(--dur-in) var(--ease-spring);
}

.cmdk.is-open .cmdk__panel {
  opacity: 1;
  transform: none;
}

.cmdk__search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-line);
}

.cmdk__search-icon {
  flex: none;
  color: var(--c-ink-3);
}

.cmdk__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--c-ink);
  font: inherit;
  font-size: var(--fs-title);
}

.cmdk__input::placeholder {
  color: var(--c-ink-4);
}

.cmdk__kbd {
  flex: none;
  padding: 2px 7px;
  border: 1px solid var(--c-line);
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  letter-spacing: 0.04em;
}

.cmdk__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
}

.cmdk__group {
  margin-bottom: 6px;
}

.cmdk__group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px 5px;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  letter-spacing: 0.06em;
}

.cmdk__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--r-card);
  text-align: left;
  transition: background-color 0.14s ease;
}

/* 选中态不用 accent-soft（深色下是近白块、字会糊），改中性面 + 左侧强调条，两套模式都成立 */
.cmdk__item.is-active {
  background: var(--c-surface-card);
}

.cmdk__item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: var(--r-pill);
  background: var(--c-accent);
}

.cmdk__item-icon {
  flex: none;
  color: var(--c-ink-3);
}

.cmdk__item.is-active .cmdk__item-icon {
  color: var(--c-ink);
}

.cmdk__item-label {
  flex: none;
  font-size: var(--fs-body);
}

.cmdk__item.is-active .cmdk__item-label {
  font-weight: 500;
}

.cmdk__item-hint {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cmdk__item--ask {
  margin-top: 4px;
}

.cmdk__empty {
  padding: 22px 12px 14px;
  text-align: center;
}

.cmdk__empty-title {
  font-size: var(--fs-body);
  font-weight: 500;
}

.cmdk__empty-hint {
  margin-top: 5px;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

.cmdk__answer {
  padding: 2px 4px 6px;
}

.cmdk__summary {
  padding: 0 10px;
  font-size: var(--fs-body);
  line-height: 1.65;
}

.cmdk__sub {
  padding: 12px 10px 6px;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  letter-spacing: 0.04em;
}

.cmdk__chain {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 3px 10px;
}

.cmdk__arrow {
  color: var(--c-ink-4);
  font-size: var(--fs-mini);
}

.cmdk__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 10px;
}

.cmdk__chip {
  padding: 3px 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

.cmdk__chip--menu {
  border-color: var(--c-accent-deep);
}

.cmdk__more {
  padding: 6px 10px 0;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

.cmdk__examples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 10px;
}

.cmdk__example {
  padding: 5px 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: var(--fs-mini);
  transition: border-color 0.14s ease;
}

.cmdk__example:hover {
  border-color: var(--c-line-dash);
}

.cmdk__back {
  margin: 14px 10px 4px;
  padding: 5px 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  font-size: var(--fs-mini);
  color: var(--c-ink-2);
  transition: color 0.14s ease;
}

.cmdk__back:hover {
  color: var(--c-ink);
}

.cmdk__foot {
  padding: 8px 16px;
  border-top: 1px solid var(--c-line);
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

@media (max-width: 720px) {
  .cmdk__panel {
    margin-top: 7vh;
  }

  .cmdk__item-hint {
    display: none;
  }
}
</style>
