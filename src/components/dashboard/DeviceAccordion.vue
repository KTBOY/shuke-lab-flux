<!--
 * @Author: zlc
 * @Description: 员工信息手风琴 —— 四个面板均有内容，展开/收起走 grid-template-rows 行轨过渡并叠加内容淡入位移
-->
<template>
  <div class="accordion">
    <section
      v-for="item in ACCORDION_ITEMS"
      :key="item.key"
      class="group"
      :class="{ 'is-open': isOpen(item.key) }"
    >
      <button
        type="button"
        class="group__head"
        :aria-expanded="isOpen(item.key)"
        :aria-controls="`panel-${item.key}`"
        @click="toggle(item.key)"
      >
        <span class="group__label">{{ item.label }}</span>
        <AppIcon name="chevron-down" :size="15" class="group__chevron" />
      </button>

      <Transition name="collapse">
        <div v-show="isOpen(item.key)" :id="`panel-${item.key}`" class="group__wrap">
          <div class="group__panel">
            <div class="group__inner">
              <div v-if="item.device" class="device">
                <img class="device__img" :src="item.device.image" :alt="item.device.name" />
                <div class="device__meta">
                  <strong class="device__name">{{ item.device.name }}</strong>
                  <span class="device__spec">{{ item.device.spec }}</span>
                </div>
                <button type="button" class="device__more" aria-label="设备操作">
                  <AppIcon name="more-vertical" :size="16" />
                </button>
              </div>

              <dl class="rows">
                <div v-for="row in item.rows" :key="row.label" class="row">
                  <dt class="row__label">{{ row.label }}</dt>
                  <dd class="row__value" :class="{ 'is-emphasis': row.emphasis }">
                    {{ row.value }}
                  </dd>
                </div>
              </dl>

              <ul v-if="item.tags" class="tags">
                <li v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ACCORDION_ITEMS, DEFAULT_ACTIVE_PANEL } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-DeviceAccordion' })

const activeKey = ref<string | null>(DEFAULT_ACTIVE_PANEL)

/** 手风琴交互：再次点击已展开项则收起 */
function toggle(key: string): void {
  activeKey.value = activeKey.value === key ? null : key
}

function isOpen(key: string): boolean {
  return activeKey.value === key
}
</script>

<style scoped>
.accordion {
  /* 主缓动 + 展开/收起时长：面板与箭头共用，避免各处散写魔法值 */
  --ease: cubic-bezier(0.33, 1, 0.68, 1);
  --dur-open: 0.32s;
  --dur-close: 0.24s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group {
  border-radius: var(--r-card);
  background: var(--c-surface);
  box-shadow: 0 10px 24px -22px rgba(23, 23, 26, 0.6);
  transition: box-shadow 0.2s ease;
}

.group:hover {
  box-shadow: 0 14px 26px -22px rgba(23, 23, 26, 0.7);
}

.group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  font-size: 12.5px;
  text-align: left;
}

.group__chevron {
  color: var(--c-ink-3);
  /* 收起走短时长；展开时由 is-open 覆盖，箭头与面板同时收尾 */
  transition: transform var(--dur-close) var(--ease);
}

.group.is-open .group__chevron {
  transform: rotate(180deg);
  transition-duration: var(--dur-open);
}

/* grid-template-rows 0fr -> 1fr 是内容高度未知时最稳的展开动画 */
.group__wrap {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--dur-open) var(--ease);
}

.group__panel {
  min-height: 0;
  overflow: hidden;
}

/* padding 放在内容层，行轨归零时才不会被内边距顶出 12px 的残留高度 */
.group__inner {
  padding: 0 12px 12px;
  transition:
    opacity 0.2s var(--ease),
    transform var(--dur-open) var(--ease);
}

/*
 * 展开的起始态必须交给 enter-from 类：inner 藏在 display:none 的 wrap 里，
 * 首次渲染就直接取最终样式，靠 is-open 切换属性根本跑不出过渡（实测无效）。
 */
.collapse-enter-from .group__inner,
.collapse-leave-to .group__inner {
  opacity: 0;
  transform: translateY(-6px);
}

/* 收起比展开更短更跟手，文字也要先淡出，不能被慢慢挤走 */
.collapse-leave-active {
  transition-duration: var(--dur-close);
}

.collapse-leave-active .group__inner {
  transition:
    opacity 0.12s var(--ease),
    transform var(--dur-close) var(--ease);
}

.collapse-enter-from,
.collapse-leave-to {
  grid-template-rows: 0fr;
}

.device {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: var(--c-panel-soft);
}

.device__img {
  width: 40px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
}

.device__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.device__name {
  font-size: 12px;
  font-weight: 500;
}

.device__spec {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.device__more {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: var(--c-ink-3);
  transition: color 0.16s ease;
}

.device__more:hover {
  color: var(--c-ink);
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.row__label {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.row__value {
  margin: 0;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

.row__value.is-emphasis {
  font-size: 12.5px;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.tag {
  padding: 3px 8px;
  border-radius: var(--r-pill);
  background: var(--c-accent-soft);
  color: var(--c-ink-2);
  font-size: 9.5px;
}
</style>
