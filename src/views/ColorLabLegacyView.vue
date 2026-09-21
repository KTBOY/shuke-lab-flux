<!--
 * @Author: zlc
 * @Description: FLUX 旧版视图 —— iframe 承载 public/flux 下的零依赖单文件，原文件保持零改动
-->
<template>
  <section class="legacy">
    <header class="legacy__bar">
      <div class="legacy__meta">
        <h1 class="legacy__title">{{ FLUX_LEGACY_UI.title }}</h1>
        <p class="legacy__desc">{{ FLUX_LEGACY_UI.desc }}</p>
      </div>

      <div class="legacy__actions">
        <RouterLink class="legacy__pill" :to="{ name: ROUTE_NAME.colorLab }">
          <AppIcon name="chevron-up" :size="14" class="legacy__icon--back" />
          <span>{{ FLUX_LEGACY_UI.toStudio }}</span>
        </RouterLink>

        <a class="legacy__pill" :href="fluxSrc" target="_blank" rel="noopener noreferrer">
          <span>{{ FLUX_LEGACY_UI.openExternal }}</span>
          <AppIcon name="external-link" :size="13" />
        </a>
      </div>
    </header>

    <iframe class="legacy__frame" :src="fluxSrc" :title="FLUX_LEGACY_UI.frameTitle"></iframe>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { FLUX_LEGACY_UI } from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Color-Lab-Legacy-View' })

/** BASE_URL 在 dev 下是 '/'、配相对 base 构建后是 './'，两种形态都能直接拼出 public 下的地址 */
const fluxSrc = `${import.meta.env.BASE_URL}flux/index.html`
</script>

<style scoped>
.legacy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legacy__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-card);
  background: var(--c-surface);
}

.legacy__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.legacy__title {
  font-size: var(--fs-title);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.legacy__desc {
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.legacy__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legacy__pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  text-decoration: none;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.legacy__pill:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

/* 图标表里没有左向箭头，旋转现成的上向 chevron 复用，免得为一处 UI 扩表 */
.legacy__icon--back {
  transform: rotate(-90deg);
}

/*
 * iframe 要一个确定高度，而外壳是随内容增高的普通块，撑不出 flex 满高；
 * 这里按视口给一档流式高度，内部滚动交给旧页自己处理，与裸页表现一致。
 */
.legacy__frame {
  width: 100%;
  height: clamp(560px, 72vh, 980px);
  border: 1px solid var(--c-line);
  border-radius: var(--r-panel);
  background: var(--c-surface);
}
</style>
