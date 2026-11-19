<!--
 * @Author: zlc
 * @Description: 员工档案卡 —— 头像照片 + 底部渐变遮罩上的姓名与岗位
-->
<template>
  <figure class="profile">
    <img class="profile__photo" :src="PROFILE.photo" :alt="PROFILE.name" />
    <figcaption class="profile__mask">
      <div class="profile__meta">
        <strong class="profile__name">{{ PROFILE.name }}</strong>
        <span class="profile__role">{{ PROFILE.role }}</span>
      </div>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { PROFILE } from '@/data/dashboard'

defineOptions({ name: 'Dashboard-EmployeeProfileCard' })
</script>

<style scoped>
.profile {
  position: relative;
  overflow: hidden;
  height: 200px;
  border-radius: var(--r-panel);
  background: var(--c-ink-4);
  box-shadow: var(--sd-panel);
}

.profile__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 22%;
}

/*
 * 超宽屏下左栏宽 800px 以上，200px 定高会把照片裁成一条横幅、人脸被切。
 * 高度封顶放到 320：宽高比回到约 2.6:1 以内，脸所在的 22% 焦点带完整露得出。
 */
@container stage (min-width: 2560px) {
  .profile {
    height: 320px;
  }
}

.profile__mask {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 44px 14px 14px;
  background: linear-gradient(180deg, rgba(58, 44, 22, 0) 0%, rgba(52, 39, 20, 0.72) 100%);
}

.profile__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.profile__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--c-on-dark);
  letter-spacing: -0.01em;
}

.profile__role {
  font-size: var(--fs-mini);
  color: rgba(255, 255, 255, 0.72);
}
</style>
