<!--
 * @Author: zlc
 * @Description: 顶部导航栏 —— 品牌标识、主菜单胶囊组（选中项为滑动指示器）、设置下拉（个人链接）与用户操作
-->
<template>
  <nav class="nav">
    <span class="nav__brand">{{ BRAND }}</span>

    <ul ref="menuRef" class="nav__menu">
      <li v-for="item in NAV_ITEMS" :key="item">
        <button
          :ref="(el) => setItemRef(el, item)"
          type="button"
          class="nav__item"
          :class="{ 'is-active': item === activeNav }"
          :aria-current="item === activeNav ? 'page' : undefined"
          :data-label="item"
          @click="activeNav = item"
        >
          {{ item }}
        </button>
      </li>

      <!-- 选中态由这块滑块承载，位置与尺寸按活动按钮实测写入内联样式 -->
      <li
        class="nav__thumb"
        :class="{ 'is-ready': isReady }"
        :style="thumbStyle"
        aria-hidden="true"
      ></li>
    </ul>

    <div class="nav__actions">
      <div ref="linksWrap" class="nav__links">
        <button
          type="button"
          class="nav__setting"
          :aria-expanded="linksOpen"
          aria-haspopup="true"
          aria-controls="nav-links-panel"
          @click="linksOpen = !linksOpen"
        >
          <AppIcon name="gear" :size="15" />
          <span>{{ SETTING_LABEL }}</span>
        </button>

        <Transition name="panel">
          <div v-if="linksOpen" id="nav-links-panel" class="links">
            <p class="links__title">我的链接</p>
            <a
              v-for="link in AUTHOR.links"
              :key="link.href"
              class="links__item"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              @click="linksOpen = false"
            >
              <AppIcon :name="link.icon" :size="15" class="links__icon" />
              <span class="links__meta">
                <strong class="links__label">{{ link.label }}</strong>
                <span class="links__hint">{{ link.hint }}</span>
              </span>
              <AppIcon name="external-link" :size="12" class="links__ext" />
            </a>
          </div>
        </Transition>
      </div>

      <button type="button" class="nav__round" aria-label="通知">
        <AppIcon name="bell" :size="16" />
      </button>
      <button type="button" class="nav__round" aria-label="个人中心">
        <AppIcon name="user" :size="16" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ACTIVE_NAV, AUTHOR, BRAND, NAV_ITEMS, SETTING_LABEL } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-AppNavbar' })

const activeNav = ref<string>(ACTIVE_NAV)
const linksOpen = ref(false)
const linksWrap = ref<HTMLElement | null>(null)

const menuRef = ref<HTMLElement | null>(null)
const thumbStyle = ref<CSSProperties>({})
const isReady = ref(false)
/** 按钮元素只在测量时读取，无需响应式 */
const itemRefs = new Map<string, HTMLElement>()

let resizeObserver: ResizeObserver | null = null
let isDisposed = false

function setItemRef(el: unknown, item: string): void {
  if (el instanceof HTMLElement) itemRefs.set(item, el)
  else itemRefs.delete(item)
}

/**
 * @description 量一次活动按钮，把滑块摆到它的位置。用 rect 而非 offsetLeft 以保留小数、避免累计误差；
 * 叠加 scrollLeft 把视觉坐标换算成滚动内容内的布局坐标，窄屏横向滚动时滑块才会跟着内容一起走。
 */
function measureThumb(): void {
  const menu = menuRef.value
  const item = itemRefs.get(activeNav.value)
  if (!menu || !item) return

  const box = item.getBoundingClientRect()
  const base = menu.getBoundingClientRect()
  thumbStyle.value = {
    transform: `translate3d(${box.left - base.left + menu.scrollLeft}px, ${box.top - base.top}px, 0)`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  }
}

onMounted(() => {
  measureThumb()
  // 测量落地的下一帧才挂上过渡，否则首帧会从 x=0 飞入
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!isDisposed) isReady.value = true
    })
  })

  resizeObserver = new ResizeObserver(measureThumb)
  if (menuRef.value) resizeObserver.observe(menuRef.value)

  // Inter 异步加载完按钮宽度才会定型，字体就绪时补测一次
  void document.fonts.ready.then(() => {
    if (!isDisposed) measureThumb()
  })
})

watch(activeNav, async () => {
  await nextTick()
  measureThumb()
})

onScopeDispose(() => {
  isDisposed = true
  resizeObserver?.disconnect()
  resizeObserver = null
})

/** 下拉外点击或按 Esc 关闭；监听器随组件作用域销毁一起摘掉 */
function onPointerDown(event: PointerEvent): void {
  if (!linksWrap.value?.contains(event.target as Node)) linksOpen.value = false
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') linksOpen.value = false
}

document.addEventListener('pointerdown', onPointerDown)
document.addEventListener('keydown', onKeyDown)

onScopeDispose(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 46px;
  padding: 0 6px 0 0;
  border-radius: var(--r-pill);
  background: var(--c-surface-warm);
}

.nav__brand {
  display: grid;
  place-items: center;
  height: 38px;
  padding: 0 22px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: 15px;
  letter-spacing: -0.01em;
}

.nav__menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline: auto;
  padding: 4px;
  border-radius: var(--r-pill);
  background: var(--c-dark);
}

.nav__menu > li {
  position: relative;
  z-index: 1;
}

/* 选中态滑块：位移与宽高由 JS 测量活动按钮后写入内联样式，压在文字层下方 */
.nav__menu > .nav__thumb {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 0;
  height: 0;
  border-radius: var(--r-pill);
  background: var(--c-surface);
  pointer-events: none;
}

/* 首帧不带过渡，测量落位后才挂上，避免滑块从左侧飞入 */
.nav__thumb.is-ready {
  transition:
    transform 0.34s cubic-bezier(0.33, 1, 0.68, 1),
    width 0.34s cubic-bezier(0.33, 1, 0.68, 1);
}

.nav__item {
  display: block;
  padding: 6px 15px;
  border-radius: var(--r-pill);
  color: #b5b5ba;
  font-size: var(--fs-mini);
  letter-spacing: 0.01em;
  transition: color 0.16s ease;
}

/* 用隐藏的同文案加粗副本预留宽度：字重切换时按钮尺寸恒定，滑块才不会跟着抖动 */
.nav__item::after {
  content: attr(data-label);
  display: block;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: 500;
}

.nav__item:hover {
  color: #fff;
}

.nav__item.is-active {
  color: var(--c-ink);
  font-weight: 500;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.nav__links {
  position: relative;
}

.nav__setting {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: var(--fs-mini);
  transition: color 0.16s ease;
}

.nav__setting:hover,
.nav__setting[aria-expanded='true'] {
  color: var(--c-ink-2);
}

.nav__round {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--c-surface);
  color: var(--c-ink-2);
  transition:
    color 0.16s ease,
    transform 0.16s ease;
}

.nav__round:hover {
  color: var(--c-ink);
  transform: translateY(-1px);
}

/* —— 设置下拉：个人链接 —— */
.links {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 208px;
  padding: 8px;
  border: 1px solid var(--c-line);
  border-radius: 16px;
  background: var(--c-surface);
  box-shadow: 0 22px 44px -24px rgba(23, 23, 26, 0.55);
}

.links__title {
  padding: 4px 8px 8px;
  font-size: 9.5px;
  color: var(--c-ink-3);
}

.links__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: 11px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.16s ease;
}

.links__item:hover {
  background: var(--c-accent-soft);
}

.links__icon {
  color: var(--c-ink-2);
}

.links__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.links__label {
  font-size: 11.5px;
  font-weight: 500;
}

.links__hint {
  font-size: 9px;
  color: var(--c-ink-3);
}

.links__ext {
  color: var(--c-ink-4);
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@container stage (max-width: 1080px) {
  .nav__item {
    padding: 6px 11px;
  }
}

@container stage (max-width: 720px) {
  .nav {
    flex-wrap: wrap;
    height: auto;
    gap: 8px;
    /* 换行后 nav 高度接近 90px，胶囊圆角会把子元素挤出背景，改成与内容高度匹配的卡片圆角 */
    padding: 8px;
    border-radius: var(--r-panel);
  }

  .nav__brand {
    order: 1;
    height: 34px;
    padding: 0 16px;
  }

  .nav__actions {
    order: 2;
  }

  /* 菜单组独占一行，超出部分横向滚动而不是压缩变形 */
  .nav__menu {
    order: 3;
    width: 100%;
    margin-inline: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav__menu::-webkit-scrollbar {
    display: none;
  }

  .nav__menu > li {
    flex: none;
  }

  .nav__item {
    padding: 6px 13px;
    white-space: nowrap;
  }

  .nav__setting {
    height: 34px;
  }

  .nav__round {
    width: 34px;
    height: 34px;
  }
}
</style>
