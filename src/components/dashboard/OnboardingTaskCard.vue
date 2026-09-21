<!--
 * @Author: zlc
 * @Description: 入职任务清单（深色卡）—— 点击任意行切换完成态，计数与入职进度卡联动
-->
<template>
  <section class="panel tasks">
    <header class="tasks__head">
      <h2 class="tasks__title">{{ ONBOARDING_TASKS.title }}</h2>
      <strong class="tasks__count tnum">{{ doneCount }}/{{ total }}</strong>
    </header>

    <ul class="tasks__list">
      <li v-for="task in tasks" :key="task.title">
        <button
          type="button"
          class="task"
          :class="{ 'is-done': task.done }"
          :aria-pressed="task.done"
          @click="toggle(task.title)"
        >
          <span class="task__icon">
            <AppIcon :name="task.icon" :size="14" />
          </span>
          <span class="task__meta">
            <strong class="task__name">{{ task.title }}</strong>
            <span class="task__time">{{ task.time }}</span>
          </span>
          <!-- 勾选图标常驻：只有元素不被增删，取消时描边才能反向擦回 -->
          <span class="task__state">
            <span class="task__dot"></span>
            <AppIcon class="task__tick" name="check" :size="10" :stroke-width="2.4" />
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useOnboardingTasks } from '@/composables/useOnboardingTasks'
import { ONBOARDING_TASKS } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-OnboardingTaskCard' })

const { tasks, doneCount, total, toggle } = useOnboardingTasks()
</script>

<style scoped>
/*
 * 勾选动效时间线（三阶段单向衔接，勾选 0.39s / 取消 0.24s）：
 * 勾选：灰点 0~0.1s 加速离场 -> 圆圈 0.05s 起绽放 0.24s -> 描边 0.11s 起画出 0.28s。
 * 相邻阶段刻意重叠一半而不是首尾相接，动作才连成一条，不会读成三格跳；
 * 圆圈在灰点还没缩完时就开始长，视觉上是"空位被填满"，有因果关系。
 * 取消：勾 0s 起反向擦回（第一帧就有反馈）-> 圆圈 0.04s 收回 -> 灰点 0.1s 弹回空位，
 * 顺序整体倒放、每拍时长统一压到 0.14s，所以退场更短更跟手。
 */
.tasks {
  /* 缓动与时长只在根类声明一次，子层全部引用，避免各处散写 cubic-bezier */
  --ease: cubic-bezier(0.33, 1, 0.68, 1);
  /* 圆圈绽放与灰点回位用轻微过冲，收尾那一下就是"咔哒"落定 */
  --ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
  /* 离场一律加速离开，退场带过冲会先鼓一下，看着像犹豫 */
  --ease-in: cubic-bezier(0.55, 0, 1, 0.45);
  /* check 图标单条路径总长约 18.7 用户单位，取整 19 即可让描边完全藏起来 */
  --tick-len: 19;
  --dur-dot: 0.1s;
  --dur-fill: 0.24s;
  --dur-draw: 0.28s;
  --dur-ink: 0.06s;
  --at-fill: 0.05s;
  --at-draw: calc(var(--at-fill) + 0.06s);
  --dur-leave: 0.14s;
  --at-shrink: 0.04s;
  --at-back: 0.1s;
  display: flex;
  flex-direction: column;
  padding: 16px 14px 14px;
  border-radius: var(--r-panel);
  background: var(--c-dark-2);
  color: #fff;
  box-shadow: var(--sd-float);
}

.tasks__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 8px;
}

.tasks__title {
  font-size: 13px;
  font-weight: 500;
}

.tasks__count {
  font-size: 20px;
  font-weight: 300;
  letter-spacing: -0.01em;
}

.tasks__list {
  display: flex;
  flex-direction: column;
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 4px 4px;
  border-radius: 10px;
  text-align: left;
  transition: background-color 0.18s ease;
}

.task:hover {
  background: rgba(255, 255, 255, 0.06);
}

.task__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.72);
  transition: background-color 0.18s ease;
}

.task:hover .task__icon {
  background: rgba(255, 255, 255, 0.14);
}

.task__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.task__name {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  transition: color var(--dur-leave) var(--ease);
}

.task__time {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.28);
}

.task.is-done .task__name {
  color: #fff;
  /* 文字与圆圈同起同收，读起来是"这一行完成了"，而不是几个属性各改各的 */
  transition: color var(--dur-fill) var(--ease) var(--at-fill);
}

.task__state {
  display: grid;
  place-items: center;
  /* 圆圈是 18px 正圆，绝不允许被长标题挤压成椭圆后产生视觉抖动 */
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: var(--c-ink);
}

/*
 * 三个图层全部落在 1 号 grid 单元里叠放，比 position:absolute 少一层定位上下文，
 * 且都不参与流式尺寸计算，所以任何时刻盒位都是稳定的 18px。
 * 填充层画在灰点之下（伪元素恒为首个 grid item），灰点缩到一半时正好被圆圈盖住。
 */
.task__state::before {
  grid-area: 1 / 1;
  place-self: stretch;
  border-radius: 50%;
  background: var(--c-accent);
  opacity: 0;
  transform: scale(0.55);
  content: '';
  transition:
    opacity var(--dur-leave) var(--ease) var(--at-shrink),
    transform var(--dur-leave) var(--ease) var(--at-shrink);
}

.task.is-done .task__state::before {
  opacity: 1;
  transform: none;
  /* 只有 transform 吃过冲，opacity 走普通缓动，否则亮度会冲过头闪一下 */
  transition:
    opacity var(--dur-fill) var(--ease) var(--at-fill),
    transform var(--dur-fill) var(--ease-pop) var(--at-fill);
}

/*
 * 灰点由伪元素改成真实节点：原先 .task:not(.is-done) .task__state::after 这种带条件的
 * 伪元素只有"存在/不存在"两态，被类开关时只能瞬现瞬隐，根本进不了过渡。
 */
.task__dot {
  grid-area: 1 / 1;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  transition:
    transform var(--dur-leave) var(--ease-pop) var(--at-back),
    opacity var(--dur-leave) var(--ease) var(--at-back);
}

.task.is-done .task__dot {
  opacity: 0;
  transform: scale(0);
  /* 淡出提前结束，避免灰点压在刚长出来的圆圈之上糊成一团 */
  transition:
    transform var(--dur-dot) var(--ease-in),
    opacity calc(var(--dur-dot) * 0.6) var(--ease-in);
}

/* 勾不再整体缩放，而是沿路径画出，才有"打勾"这个动作本身 */
.task__tick {
  grid-area: 1 / 1;
  opacity: 0;
  transition: opacity var(--dur-leave) var(--ease);
}

.task.is-done .task__tick {
  /* 与描边同时起步即可，顺带盖住 dashoffset 归位前露出的那半个圆头 */
  opacity: 1;
  transition: opacity var(--dur-ink) linear var(--at-draw);
}

.task__tick :deep(path) {
  stroke-dasharray: var(--tick-len);
  stroke-dashoffset: var(--tick-len);
  /* 退场是反向擦回：末端先消失、笔尖退回起点，与勾出一一对应 */
  transition: stroke-dashoffset var(--dur-leave) var(--ease);
}

.task.is-done .task__tick :deep(path) {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--dur-draw) var(--ease) var(--at-draw);
}
</style>
