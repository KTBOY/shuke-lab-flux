<!--
 * @Author: zlc
 * @Description: FLUX 色彩胶囊 —— 一块 WebGL 画布承载一套主题材质，悬停与指针搅动由 useFluidField 驱动
-->
<template>
  <figure class="capsule" :class="{ 'is-hidden': !visible }">
    <figcaption class="capsule__label">
      {{ theme.en }}
      <span class="capsule__label-cn">{{ theme.cn }}</span>
    </figcaption>

    <div
      class="capsule__body"
      @pointerenter="field.enter()"
      @pointerleave="field.leave()"
      @pointermove="onPointerMove"
    >
      <canvas v-if="supported" ref="canvasRef" class="capsule__canvas"></canvas>
      <!-- WebGL 不可用时铺同色系静态渐变，避免出现空白框或一张死图 -->
      <div v-else class="capsule__canvas" :style="stillStyle"></div>

      <div class="capsule__content">
        <span class="capsule__title">FLUX</span>
        <span class="capsule__price">{{ FLUX_CARD_PRICE }}</span>
        <strong class="capsule__paid" :style="{ color: theme.paid }">PAID</strong>
      </div>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { fluxFallbackStyle, useFluidField } from '@/composables/useFluidField'
import { FLUX_CARD_PRICE } from '@/data/fluxThemes'
import type { FluxTheme } from '@/data/fluxThemes'

defineOptions({ name: 'Flux-Capsule' })

const props = defineProps<{
  theme: FluxTheme
  /** 噪声初相位，由列表下标推出，六张卡才不会跳同一段舞 */
  seed: number
  /** 被筛选隐藏：停掉绘制但保留上下文与流动进度 */
  visible: boolean
  /** 全局流动开关，暂停时定格在当前花纹 */
  running: boolean
}>()

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const field = useFluidField(canvasRef, { theme: props.theme, seed: props.seed })

const { supported } = field
const stillStyle = computed(() => ({ background: fluxFallbackStyle(props.theme) }))

function onPointerMove(event: PointerEvent): void {
  /* 触控板上没有位移就没有搅动能量，这里只负责上报坐标 */
  field.trackPointer(event.clientX, event.clientY)
}

watch(() => props.visible, field.setVisible, { immediate: true })
watch(() => props.running, field.setRunning, { immediate: true })
</script>

<style scoped>
.capsule {
  display: flex;
  flex-direction: column;
}

.capsule.is-hidden {
  display: none;
}

.capsule__label {
  align-self: center;
  margin-bottom: 14px;
  font-size: var(--fs-mini);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--c-ink);
}

.capsule__label-cn {
  margin-left: 4px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  color: var(--c-ink-2);
}

/* 药丸玻璃壳：亮边勾轮廓 + 顶部内圈光 + 底部体积阴影，材质语言与旧页一致 */
.capsule__body {
  position: relative;
  height: 108px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  overflow: hidden;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.95),
    inset 0 -12px 20px rgba(0, 0, 0, 0.07),
    0 22px 36px -16px rgba(0, 0, 0, 0.32),
    0 3px 8px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.35s cubic-bezier(0.22, 0.9, 0.3, 1.2),
    box-shadow 0.35s ease;
}

.capsule__body:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.95),
    inset 0 -12px 20px rgba(0, 0, 0, 0.07),
    0 30px 46px -18px rgba(0, 0, 0, 0.38),
    0 5px 12px rgba(0, 0, 0, 0.07);
}

/* 顶部镜面高光带，iOS 药丸的反光 */
.capsule__body::after {
  position: absolute;
  z-index: 2;
  top: 5%;
  right: 3%;
  left: 3%;
  height: 44%;
  border-radius: var(--r-pill);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.55),
    rgba(255, 255, 255, 0.1) 70%,
    transparent
  );
  content: '';
  pointer-events: none;
}

.capsule__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.capsule__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 44px;
  pointer-events: none;
}

.capsule__title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--c-ink-2);
}

.capsule__price {
  margin-top: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: var(--fs-label);
  color: var(--c-ink-3);
}

.capsule__paid {
  margin-top: 5px;
  font-size: var(--fs-mini);
  font-weight: 800;
  letter-spacing: 2px;
}
</style>
