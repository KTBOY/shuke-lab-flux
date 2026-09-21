<!--
 * @Author: zlc
 * @Description: 全站外壳 —— 渐变画布、常驻顶部导航、路由出口与页脚署名，三个页面共用同一层容器
-->
<template>
  <div class="stage">
    <main class="shell">
      <AppNavbar />

      <div class="shell__body">
        <RouterView />
      </div>

      <footer class="credits">
        <span>© {{ AUTHOR.year }} {{ AUTHOR.name }}</span>
        <span class="credits__links">
          <a
            v-for="link in AUTHOR.links"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ link.hint }}
          </a>
        </span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/dashboard/AppNavbar.vue'
import { AUTHOR } from '@/data/dashboard'

defineOptions({ name: 'App-Shell' })
</script>

<style scoped>
.stage {
  display: grid;
  /* 不显式声明列的话，隐式 auto 列会按 max-content 撑开，窄屏下整块内容溢出视口 */
  grid-template-columns: minmax(0, 1fr);
  min-height: 100vh;
  background: var(--c-canvas);
  container-type: inline-size;
  container-name: stage;
}

.shell {
  /* 渐变铺满整个视口，内容不再收进外框卡片，圆角与外投影一并去掉 */
  width: 100%;
  min-width: 0;
  padding: clamp(8px, 1.4cqi, 14px);
  background:
    radial-gradient(115% 135% at 94% 100%, var(--c-shell-to) 0%, rgba(249, 230, 171, 0) 62%),
    radial-gradient(95% 120% at 74% 92%, #f7e9c0 0%, rgba(247, 233, 192, 0) 60%),
    linear-gradient(128deg, var(--c-shell-from) 0%, #f0eee9 42%, #f6ecd2 100%);
}

.shell__body {
  padding: 0 clamp(4px, 1.2cqi, 12px);
}

.credits {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: clamp(12px, 2cqi, 20px);
  padding-top: 10px;
  border-top: 1px solid var(--c-line);
  font-size: 9.5px;
  color: var(--c-ink-3);
}

.credits__links {
  display: flex;
  gap: 14px;
}

.credits a {
  color: inherit;
  text-decoration: none;
  transition: color 0.16s ease;
}

.credits a:hover {
  color: var(--c-ink);
  text-decoration: underline;
}

/*
 * 外壳三件套的入场节奏：导航先立起来，路由出口随后，署名最后。
 * 页面内部内容的错峰由各 view 自己管，切路由时才不会去重排外壳的动画。
 */
.shell > * {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

.shell > :nth-child(1) {
  animation-delay: 0.02s;
}

.shell > :nth-child(3) {
  animation-delay: 0.46s;
}
</style>
