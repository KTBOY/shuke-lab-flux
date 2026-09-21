<!--
 * @Author: zlc
 * @Description: 头像堆叠组，用于日历事件上的人员缩略图
-->
<template>
  <ul class="avatars" :style="{ '--avatar-size': `${size}px` }">
    <li v-for="(src, index) in images" :key="index" class="avatars__item">
      <img :src="src" :alt="`成员 ${index + 1}`" />
    </li>
  </ul>
</template>

<script setup lang="ts">
defineOptions({ name: 'Ui-AvatarStack' })

withDefaults(
  defineProps<{
    images: readonly string[]
    size?: number
  }>(),
  { size: 22 },
)
</script>

<style scoped>
.avatars {
  display: flex;
}

.avatars__item + .avatars__item {
  margin-left: calc(var(--avatar-size) * -0.42);
}

.avatars__item img {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--avatar-ring, var(--c-surface));
  background: var(--c-dark);
}
</style>
