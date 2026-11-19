<!--
 * @Author: zlc
 * @Description: 权限星图视图 —— 标题行（说明 + 返回仪表盘入口）与星图主体，布局与动效收口在星图组件内
-->
<template>
  <div class="perm">
    <div class="hero">
      <div class="hero__text">
        <h1 class="hero__title">{{ PERMISSION_MAP_UI.title }}</h1>
        <p class="hero__subtitle">{{ PERMISSION_MAP_UI.subtitle }}</p>
      </div>

      <RouterLink class="hero__entry" :to="{ name: ROUTE_NAME.dashboard }">
        <AppIcon name="network" :size="15" class="hero__entry-icon" />
        <span>{{ PERMISSION_MAP_UI.backToDashboard }}</span>
        <AppIcon name="arrow-up-right" :size="12" class="hero__entry-arrow" />
      </RouterLink>
    </div>

    <PermissionStarMap />
  </div>
</template>

<script setup lang="ts">
import PermissionStarMap from '@/components/permissions/PermissionStarMap.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { PERMISSION_MAP_UI } from '@/data/permissions'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'PermissionMap-View' })
</script>

<style scoped>
.perm {
  /* 外壳由 AppShell 提供，这里只作为内容层的根，供入场错峰选择器挂载 */
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

/* 首屏错峰上浮，与仪表盘同一节奏；外壳三件套的节奏由 AppShell 负责 */
.perm > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.perm > :nth-child(1) {
  animation-delay: 0.08s;
}

.perm > :nth-child(2) {
  animation-delay: 0.16s;
}
</style>
