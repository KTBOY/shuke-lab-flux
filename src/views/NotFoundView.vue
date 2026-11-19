<!--
 * @Author: zlc
 * @Description: 404 视图 —— 路由兜底页：大号状态码、一张常驻 FLUX 胶囊与两个回程入口（实验室 / 仪表盘）
-->
<template>
  <div class="not-found">
    <p class="not-found__code">{{ NOT_FOUND_UI.code }}</p>

    <h1 class="not-found__title">{{ NOT_FOUND_UI.title }}</h1>
    <p class="not-found__desc">{{ NOT_FOUND_UI.desc }}</p>

    <!-- 单张胶囊给空页面留一点本站的材质感；visible/running 常开，WebGL 不可用时组件自带静态兜底 -->
    <div class="not-found__capsule">
      <FluxCapsule :theme="FLUX_THEMES[0]" :seed="1" visible running />
    </div>

    <div class="not-found__actions">
      <RouterLink class="pill" :to="{ name: ROUTE_NAME.colorLab }">
        <AppIcon name="disc" :size="13" class="pill__icon" />
        <span>{{ NOT_FOUND_UI.toColorLab }}</span>
      </RouterLink>

      <RouterLink class="pill" :to="{ name: ROUTE_NAME.dashboard }">
        <span>{{ NOT_FOUND_UI.toDashboard }}</span>
        <AppIcon name="arrow-up-right" :size="12" class="pill__icon" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import FluxCapsule from '@/components/flux/FluxCapsule.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { NOT_FOUND_UI } from '@/data/dashboard'
import { FLUX_THEMES } from '@/data/fluxThemes'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'NotFound-View' })
</script>

<style scoped>
.not-found {
  /* 外壳由 AppShell 提供，这里只作为内容层：整页居中收束，与其他视图同一纵向留白 */
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  margin: clamp(14px, 2.6cqi, 24px) 0 clamp(18px, 3cqi, 30px);
  text-align: center;
}

.not-found__code {
  font-size: clamp(72px, 15cqi, 132px);
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--c-ink);
}

.not-found__title {
  margin-top: clamp(10px, 1.8cqi, 16px);
  font-size: clamp(20px, 3.6cqi, var(--fs-kpi));
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.not-found__desc {
  margin-top: 8px;
  color: var(--c-ink-2);
}

.not-found__capsule {
  width: clamp(240px, 32cqi, 320px);
  margin-top: clamp(20px, 3.4cqi, 32px);
  text-align: left;
}

.not-found__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: clamp(20px, 3.4cqi, 32px);
}

/* 入口胶囊与实验室头部操作同一套样式口径，令牌取色、不另起炉灶 */
.pill {
  display: flex;
  align-items: center;
  gap: 7px;
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

.pill:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

.pill:active {
  transform: translateY(0);
}

.pill__icon {
  color: var(--c-ink-3);
}

.pill:hover .pill__icon {
  color: var(--c-ink);
}

.pill:focus-visible {
  outline: 2px solid var(--c-accent-deep);
  outline-offset: 2px;
}

/* 入场错峰与外壳、实验室同一节拍：状态码先立，胶囊与入口随后 */
.not-found > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.not-found > :nth-child(2) {
  animation-delay: 0.08s;
}

.not-found > :nth-child(3) {
  animation-delay: 0.14s;
}

.not-found > :nth-child(4) {
  animation-delay: 0.22s;
}

.not-found > :nth-child(5) {
  animation-delay: 0.3s;
}
</style>
