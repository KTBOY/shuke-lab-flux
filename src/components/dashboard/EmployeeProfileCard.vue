<!--
 * @Author: zlc
 * @Description: 员工档案卡 —— 头像照片 + 底部渐变遮罩上的姓名、岗位与金额胶囊
-->
<template>
  <figure class="profile">
    <img class="profile__photo" :src="PROFILE.photo" :alt="PROFILE.name" />
    <figcaption class="profile__mask">
      <div class="profile__meta">
        <strong class="profile__name">{{ PROFILE.name }}</strong>
        <span class="profile__role">{{ PROFILE.role }}</span>
      </div>
      <span class="profile__amount">{{ PROFILE.amount }}</span>
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
  color: #fff;
  letter-spacing: -0.01em;
}

.profile__role {
  font-size: var(--fs-mini);
  color: rgba(255, 255, 255, 0.72);
}

.profile__amount {
  display: grid;
  place-items: center;
  height: 27px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: var(--fs-mini);
  font-weight: 500;
  backdrop-filter: blur(4px);
}
</style>
