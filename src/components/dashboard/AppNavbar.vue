<!--
 * @Author: zlc
 * @Description: 顶部导航栏 —— 品牌标识、主菜单胶囊组（选中项为滑动指示器）、设置下拉（个人链接）与用户操作
-->
<template>
  <nav class="nav">
    <span class="nav__brand">{{ BRAND }}</span>

    <ul ref="menuRef" class="nav__menu">
      <li v-for="item in NAV_ITEMS" :key="item">
        <!-- 唯一真跳转的一项：链接才有中键/新窗口能力，高亮由当前路由决定 -->
        <RouterLink
          v-if="item === COLOR_LAB_NAV_LABEL"
          class="nav__item"
          :class="{ 'is-active': item === activeLabel }"
          :aria-current="item === activeLabel ? 'page' : undefined"
          :data-label="item"
          :to="{ name: ROUTE_NAME.colorLab }"
        >
          {{ item }}
        </RouterLink>

        <button
          v-else
          type="button"
          class="nav__item"
          :class="{ 'is-active': item === activeLabel }"
          :aria-current="item === activeLabel ? 'page' : undefined"
          :data-label="item"
          @click="onNavClick(item)"
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
import { computed, nextTick, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  ACTIVE_NAV,
  AUTHOR,
  BRAND,
  COLOR_LAB_NAV_LABEL,
  NAV_ITEMS,
  SETTING_LABEL,
} from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Dashboard-AppNavbar' })

const route = useRoute()
const router = useRouter()

const activeNav = ref<string>(ACTIVE_NAV)
const linksOpen = ref(false)
const linksWrap = ref<HTMLElement | null>(null)

/** 实验室两项（Vue 版与旧版单文件）共用一个入口，高亮跟着路由走；其余是模板里的占位菜单 */
const activeLabel = computed(() =>
  route.name === ROUTE_NAME.colorLab || route.name === ROUTE_NAME.colorLabLegacy
    ? COLOR_LAB_NAV_LABEL
    : activeNav.value,
)

const menuRef = ref<HTMLElement | null>(null)
const thumbStyle = ref<CSSProperties>({})
const isReady = ref(false)

let resizeObserver: ResizeObserver | null = null
let isDisposed = false

/**
 * @description 量一次活动项，把滑块摆到它的位置。用 rect 而非 offsetLeft 以保留小数、避免累计误差；
 * 叠加 scrollLeft 把视觉坐标换算成滚动内容内的布局坐标，窄屏横向滚动时滑块才会跟着内容一起走。
 */
function measureThumb(): void {
  const menu = menuRef.value
  if (!menu) return
  const item = menu.querySelector<HTMLElement>(`[data-label="${CSS.escape(activeLabel.value)}"]`)
  if (!item) return

  const box = item.getBoundingClientRect()
  const base = menu.getBoundingClientRect()
  thumbStyle.value = {
    transform: `translate3d(${box.left - base.left + menu.scrollLeft}px, ${box.top - base.top}px, 0)`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  }
}

/** 占位菜单没有对应页面，在实验室里点它等于要回仪表盘，否则看起来像点了没反应 */
function onNavClick(item: string): void {
  activeNav.value = item
  if (route.name !== ROUTE_NAME.dashboard) void router.push({ name: ROUTE_NAME.dashboard })
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

watch(activeLabel, async () => {
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
  /*
   * 三列网格而非 flex + auto 外边距：flex 下 margin-inline:auto 只能在「剩余空间」里居中，
   * 而品牌胶囊与操作区不等宽，菜单中心必然偏离视口中线；两侧 1fr 等分才天然居中。
   */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
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
  justify-self: start;
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
  /* 同一规则也作用于链接形态的颜色实验室项，去掉浏览器默认下划线 */
  text-decoration: none;
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
  justify-self: end;
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
    /* 下面的 order 重排与「菜单独占一行」只有 flex 才成立，桌面档改成网格后这里要显式退回 flex */
    display: flex;
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
