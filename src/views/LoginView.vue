<!--
 * @Author: zlc
 * @Description: 登录页 —— 独立顶层页（不套外壳）：左侧深色面板放 FLUX 胶囊与口号，右侧表单选演示身份进入管理区。
               演示模式不装真鉴权（任意非空密码），口径在表单上方明示；登录按钮会收成圆并画出对勾再跳转。
-->
<template>
  <div class="login">
    <section class="login__visual">
      <span class="login__brand">{{ BRAND }}</span>

      <div v-if="heroTheme" class="login__capsule">
        <FluxCapsule :theme="heroTheme" :seed="1" :visible="true" :running="true" />
      </div>

      <div class="login__visual-foot">
        <p class="login__slogan">{{ LOGIN_UI.slogan }}</p>
        <p class="login__visual-note">{{ LOGIN_UI.visualNote }}</p>
      </div>
    </section>

    <section class="login__form-side">
      <form class="login__form" novalidate @submit.prevent="onSubmit">
        <h1 class="login__title">{{ LOGIN_UI.title }}</h1>
        <p class="login__subtitle">{{ LOGIN_UI.subtitle }}</p>
        <p class="login__demo">{{ LOGIN_UI.demoHint }}</p>

        <div class="login__field">
          <label class="label" for="login-user">{{ LOGIN_UI.userLabel }}</label>
          <span class="login__control">
            <select
              id="login-user"
              ref="userSelectRef"
              v-model="selectedUserId"
              class="login__input"
              :disabled="phase !== 'idle'"
              :aria-invalid="Boolean(userError)"
              :aria-describedby="userError ? 'login-user-error' : undefined"
              @change="userError = ''"
            >
              <option value="" disabled>{{ LOGIN_UI.userPlaceholder }}</option>
              <option v-for="user in PERMISSION_USERS" :key="user.id" :value="user.id">
                {{ user.name }} ·
                {{
                  rolesOfUser(user)
                    .map((role) => role.name)
                    .join(' / ')
                }}
              </option>
            </select>
            <AppIcon name="chevron-down" :size="14" class="login__control-icon" />
          </span>
          <p v-if="userError" id="login-user-error" class="login__error" role="alert">
            {{ userError }}
          </p>
          <div v-if="selectedUser" class="login__roles">
            <span class="login__roles-label">{{ LOGIN_UI.rolesLabel }}</span>
            <span v-for="role in rolesOfUser(selectedUser)" :key="role.id" class="login__chip">
              {{ role.name }}
            </span>
          </div>
        </div>

        <div class="login__field">
          <label class="label" for="login-password">{{ LOGIN_UI.passwordLabel }}</label>
          <input
            id="login-password"
            ref="passwordRef"
            v-model="password"
            type="password"
            class="login__input"
            :placeholder="LOGIN_UI.passwordPlaceholder"
            autocomplete="current-password"
            :disabled="phase !== 'idle'"
            :aria-invalid="Boolean(passwordError)"
            :aria-describedby="passwordError ? 'login-password-error' : undefined"
            @input="passwordError = ''"
          />
          <p v-if="passwordError" id="login-password-error" class="login__error" role="alert">
            {{ passwordError }}
          </p>
        </div>

        <button
          type="submit"
          class="login__submit"
          :class="{ 'is-busy': phase === 'busy', 'is-check': phase === 'check' }"
          :disabled="phase !== 'idle'"
          :aria-busy="phase !== 'idle'"
        >
          <span class="login__submit-label">{{ submitLabel }}</span>
          <svg class="login__check" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.5 12.8 10.2 17.5 18.5 7" />
          </svg>
        </button>

        <button
          type="button"
          class="login__quick"
          :disabled="phase !== 'idle'"
          @click="onQuickEntry"
        >
          {{ LOGIN_UI.quickEntry }}
        </button>
        <p class="login__quick-hint">{{ LOGIN_UI.quickEntryHint }}</p>

        <RouterLink class="login__to-lab" :to="{ name: ROUTE_NAME.colorLab }">
          {{ LOGIN_UI.toColorLab }}
        </RouterLink>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FluxCapsule from '@/components/flux/FluxCapsule.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { DEMO_LOGIN_USER_ID, resolvePostLoginTarget, useAuth } from '@/composables/useAuth'
import { BRAND, LOGIN_UI } from '@/data/dashboard'
import { FLUX_THEMES } from '@/data/fluxThemes'
import { PERMISSION_USERS, USER_BY_ID, rolesOfUser } from '@/data/permissions'
import { ROUTE_NAME } from '@/router'

defineOptions({ name: 'Login-View' })

/** 登录动效三段：闲置 → 收圆 → 画对勾，随后跳转；状态只驱动类开关，动画全在 CSS */
type LoginPhase = 'idle' | 'busy' | 'check'

const route = useRoute()
const router = useRouter()
const { loginAs } = useAuth()

/** 左侧视觉用第一套主题（ORIGINAL）：与实验室首屏同一颗胶囊，品牌口径一致 */
const heroTheme = FLUX_THEMES.find((theme) => theme.id === 'original')

const selectedUserId = ref('')
const password = ref('')
const userError = ref('')
const passwordError = ref('')
const phase = ref<LoginPhase>('idle')
/** 减动效时不走变形序列，按钮改显「登录中…」并立即跳转 */
const reducedJump = ref(false)

const userSelectRef = ref<HTMLSelectElement | null>(null)
const passwordRef = ref<HTMLInputElement | null>(null)

const selectedUser = computed(() => USER_BY_ID.get(selectedUserId.value) ?? null)

const submitLabel = computed(() =>
  reducedJump.value && phase.value !== 'idle' ? LOGIN_UI.submitting : LOGIN_UI.submit,
)

/* 跳转前的两个定时器（收圆时长、对勾停留）必须随组件销毁摘掉，避免离开页面后还往回跳 */
const timers: number[] = []

function later(fn: () => void, ms: number): void {
  timers.push(window.setTimeout(fn, ms))
}

onScopeDispose(() => {
  timers.forEach((id) => window.clearTimeout(id))
  timers.length = 0
})

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function goNext(): void {
  void router.replace(resolvePostLoginTarget(route.query.redirect))
}

/** 登录的统一出口：先落状态，再走动效序列（减动效直接跳），最后回跳 redirect 或仪表盘 */
function startLogin(userId: string): void {
  if (phase.value !== 'idle') return
  if (!loginAs(userId)) return

  if (prefersReducedMotion()) {
    reducedJump.value = true
    phase.value = 'busy'
    goNext()
    return
  }

  phase.value = 'busy'
  later(() => {
    phase.value = 'check'
  }, 400)
  later(goNext, 1020)
}

function onSubmit(): void {
  userError.value = selectedUserId.value ? '' : LOGIN_UI.userRequired
  passwordError.value = password.value.trim() === '' ? LOGIN_UI.passwordRequired : ''
  if (userError.value || passwordError.value) {
    if (userError.value) userSelectRef.value?.focus()
    else passwordRef.value?.focus()
    return
  }
  startLogin(selectedUserId.value)
}

/** 一键体验：默认演示用户直接进，不校验密码，动效与正式登录共用同一条序列 */
function onQuickEntry(): void {
  selectedUserId.value = DEMO_LOGIN_USER_ID
  userError.value = ''
  passwordError.value = ''
  startLogin(DEMO_LOGIN_USER_ID)
}
</script>

<style scoped>
.login {
  --ease-out: cubic-bezier(0.2, 0.7, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  --dur-shrink: 0.38s;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--c-canvas);
}

/* —— 左侧视觉：深墨面在两种模式下都自洽（--c-dark 体系不随 data-theme 变） —— */
.login__visual {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(22px, 4vw, 46px);
  border-right: 1px solid var(--c-hairline-dark);
  background: var(--c-dark);
  color: var(--c-on-dark);
  animation: rise-in 0.5s var(--ease-out) backwards;
}

.login__brand {
  align-self: flex-start;
  padding: 8px 20px;
  border: 1px solid var(--c-hairline-dark);
  border-radius: var(--r-pill);
  background: var(--c-dark-2);
  font-size: var(--fs-title);
  letter-spacing: -0.01em;
}

.login__capsule {
  width: min(460px, 100%);
  margin-inline: auto;
}

/* 胶囊自带的标题是给浅底设计的（--c-ink 家族），压到深墨面上要翻成 on-dark 两档 */
.login__capsule :deep(.capsule__label) {
  color: var(--c-on-dark);
}

.login__capsule :deep(.capsule__label-cn) {
  color: var(--c-on-dark-soft);
}

.login__slogan {
  font-size: var(--fs-metric);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.login__visual-note {
  margin-top: 8px;
  color: var(--c-on-dark-soft);
  font-size: var(--fs-label);
}

/* —— 右侧表单面：全程令牌，深色模式下自动换深面 —— */
.login__form-side {
  display: grid;
  place-items: center;
  padding: 28px 22px;
  animation: rise-in 0.5s var(--ease-out) 0.08s backwards;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 13px;
  width: min(400px, 100%);
}

.login__title {
  font-size: var(--fs-metric);
  font-weight: 500;
  letter-spacing: -0.02em;
}

.login__subtitle {
  color: var(--c-ink-3);
  font-size: var(--fs-body);
}

/* 演示口径横幅：中性面 + 边线，深浅两套下都可读（不用 accent-soft，深色下会与字色撞） */
.login__demo {
  padding: 9px 13px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-card);
  background: var(--c-surface-card);
  color: var(--c-ink-2);
  font-size: var(--fs-mini);
  line-height: 1.55;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login__control {
  position: relative;
  display: block;
}

.login__control-icon {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: var(--c-ink-3);
  pointer-events: none;
}

.login__input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-card);
  background: var(--c-surface);
  color: var(--c-ink);
  font: inherit;
  font-size: var(--fs-body);
  transition:
    border-color 0.16s ease,
    background-color 0.25s ease;
}

select.login__input {
  padding-right: 40px;
  appearance: none;
  cursor: pointer;
}

.login__input:focus-visible {
  border-color: var(--c-accent-deep);
  outline: none;
  box-shadow: 0 0 0 3px var(--c-accent-soft);
}

.login__input:disabled {
  opacity: 0.6;
  cursor: default;
}

/* 错误文案口径与用户管理弹窗一致：令牌里没有红色档，用 ink + 加粗承担警示 */
.login__error {
  color: var(--c-ink);
  font-size: var(--fs-mini);
  font-weight: 500;
}

.login__roles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.login__roles-label {
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
}

.login__chip {
  padding: 3px 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: var(--fs-mini);
  white-space: nowrap;
}

/*
 * 登录按钮动效：整宽胶囊先收成 48px 圆（宽度过渡 + 弹簧曲线），文案淡出；
 * 对勾 SVG 以 dashoffset 生长画出，停留一拍后由脚本跳转。序列时长与脚本里的定时器同口径。
 */
.login__submit {
  position: relative;
  align-self: center;
  width: 100%;
  height: 48px;
  margin-top: 4px;
  border-radius: var(--r-pill);
  background: var(--c-dark);
  color: var(--c-on-dark);
  font-size: var(--fs-body);
  font-weight: 500;
  transition:
    width var(--dur-shrink) var(--ease-spring),
    background-color 0.25s ease;
}

.login__submit:not(:disabled):hover {
  background: var(--c-dark-2);
}

.login__submit:disabled {
  cursor: default;
}

.login__submit.is-busy,
.login__submit.is-check {
  width: 48px;
}

.login__submit-label {
  transition: opacity 0.16s ease;
}

.login__submit.is-busy .login__submit-label,
.login__submit.is-check .login__submit-label {
  opacity: 0;
}

.login__check {
  position: absolute;
  inset: 0;
  width: 22px;
  height: 22px;
  margin: auto;
  opacity: 0;
  transition: opacity 0.12s ease;
}

.login__check path {
  fill: none;
  stroke: var(--c-on-dark);
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* 路径全长约 20，dash 取 21 保证起点完全藏住 */
  stroke-dasharray: 21;
  stroke-dashoffset: 21;
}

.login__submit.is-check .login__check {
  opacity: 1;
}

.login__submit.is-check .login__check path {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.32s ease 0.04s;
}

/*
 * 深色下主按钮反转：--c-dark 与深色画布几乎同色，整颗按钮会沉进背景里，
 * 改用 on-dark 作底、dark 作字与对勾。注意 :global 必须整段包住选择器——
 * 只包 :root 段时编译器会把后面的类名吞掉、规则落到根元素上（星图那批踩过同款坑）。
 */
:global(:root[data-theme='dark'] .login__submit) {
  background: var(--c-on-dark);
  color: var(--c-dark);
}

:global(:root[data-theme='dark'] .login__submit:not(:disabled):hover) {
  background: var(--c-ink-2);
}

:global(:root[data-theme='dark'] .login__check path) {
  stroke: var(--c-dark);
}

.login__quick {
  height: 44px;
  border: 1px solid var(--c-line-dash);
  border-radius: var(--r-pill);
  background: var(--c-surface);
  font-size: var(--fs-body);
  transition:
    border-color 0.16s ease,
    background-color 0.25s ease;
}

.login__quick:not(:disabled):hover {
  border-color: var(--c-ink-4);
}

.login__quick:disabled {
  opacity: 0.6;
  cursor: default;
}

.login__quick-hint {
  margin-top: -6px;
  color: var(--c-ink-3);
  font-size: var(--fs-mini);
  text-align: center;
}

.login__to-lab {
  margin-top: 6px;
  color: var(--c-ink-3);
  font-size: var(--fs-label);
  text-align: center;
  text-decoration: none;
  transition: color 0.16s ease;
}

.login__to-lab:hover {
  color: var(--c-ink);
  text-decoration: underline;
}

@media (max-width: 900px) {
  .login {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .login__visual {
    gap: 18px;
    padding: 18px;
    border-right: 0;
    border-bottom: 1px solid var(--c-hairline-dark);
  }

  .login__capsule {
    width: min(380px, 100%);
  }

  .login__slogan {
    font-size: var(--fs-title);
  }

  .login__form-side {
    place-items: start center;
    padding: 24px 16px 36px;
  }
}
</style>
