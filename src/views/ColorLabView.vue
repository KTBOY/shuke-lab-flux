<!--
 * @Author: zlc
 * @Description: 颜色生成器视图 —— 顶部窄工具栏 + iframe 承载 /flux 独立静态页，FLUX 原文件保持零改动
-->
<template>
  <div class="lab">
    <header class="lab__bar">
      <RouterLink class="lab__pill" :to="{ name: ROUTE_NAME.dashboard }">
        <AppIcon name="chevron-up" :size="14" class="lab__icon--back" />
        <span>{{ COLOR_LAB_ENTRY.back }}</span>
      </RouterLink>

      <div class="lab__meta">
        <h1 class="lab__title">{{ COLOR_LAB_ENTRY.title }}</h1>
        <p class="lab__desc">{{ COLOR_LAB_ENTRY.desc }}</p>
      </div>

      <a class="lab__pill" :href="fluxSrc" target="_blank" rel="noopener noreferrer">
        <span>{{ COLOR_LAB_ENTRY.openExternal }}</span>
        <AppIcon name="external-link" :size="13" />
      </a>
    </header>

    <iframe class="lab__frame" :src="fluxSrc" :title="COLOR_LAB_ENTRY.frameTitle"></iframe>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { COLOR_LAB_ENTRY } from '@/data/dashboard'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Color-Lab-View' })

/** BASE_URL 在 dev 下是 '/'、配相对 base 构建后是 './'，两种形态都能直接拼出 public 下的地址 */
const fluxSrc = `${import.meta.env.BASE_URL}flux/index.html`
</script>

<style scoped>
.lab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--c-canvas);
}

.lab__bar {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.6vw, 14px);
  flex: none;
  padding: clamp(8px, 1.4vw, 12px) clamp(10px, 2.4vw, 20px);
  border-bottom: 1px solid var(--c-line);
  background: var(--c-surface);
}

.lab__pill {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
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

.lab__pill:hover {
  color: var(--c-ink);
  border-color: var(--c-line-dash);
  transform: translateY(-1px);
}

/* 图标表里没有左向箭头，旋转现成的上向 chevron 复用，免得为一处 UI 扩表 */
.lab__icon--back {
  transform: rotate(-90deg);
}

/* 标题与说明各占一行并各自截断：窄屏下靠这里收缩，胶囊按钮始终完整可点 */
.lab__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.lab__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--fs-body);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.lab__desc {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--fs-mini);
  color: var(--c-ink-3);
}

.lab__frame {
  flex: 1;
  /* 不显式清零的话，flex 项默认 min-height:auto 会按 iframe 内容高度撑破视口 */
  min-height: 0;
  width: 100%;
  border: 0;
}
</style>
