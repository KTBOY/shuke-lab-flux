# AGENTS.md

面向 AI 编码代理与人工贡献者的**可执行**约定。与 README 的叙述冲突时以本文为准；改了约定就改这个文件。

## 硬性约束(违反即返工)

1. **`public/flux/index.html` 是冻结文件**:零依赖、不参与构建、必须逐字节不变。禁止对它跑格式化、禁止"顺手优化"、禁止把设计令牌或 Vue 代码塞进去。CI 用 `cmp public/flux/index.html dist/flux/index.html` 守这条线。
   - 要改材质/交互 → 改 Vue 版(`src/composables/useFluidField.ts`、`src/components/flux/`、`src/views/FluxStudioView.vue`),旧版另开一次提交并说明理由。
2. **主题数据存在两份**:`src/data/fluxThemes.ts` 是权威,旧页内联的 `CARDS` 是副本。新增或调整主题以 TS 为准,不要反过来。
3. **禁止历史重写与强推**:仓库公开且已有 fork,`git push --force` / `filter-repo` / 改已有提交一律不做。
4. **不新增运行时依赖**:没有 UI 组件库、没有图标库、没有原子 CSS 框架、没有 Pinia。加依赖要在提交说明里给理由。

## 代码约定

- 显式 `import`,Vue API 不靠自动导入;类型导入一律 `import type`。
- 组件用 `<script setup lang="ts">` + `defineOptions({ name })`;props 用 `interface` + `defineProps<T>()`,对象类型**不许**用 `type` 别名(ESLint 已开 `consistent-type-definitions`)。
- 样式一律 `<style scoped>` + BEM `block__elem--mod`;颜色/圆角/字号/阴影只取 `src/styles/tokens.css` 的变量,组件里不写魔法值。
- 文案与指标进 `src/data/*.ts`,模板里不出现中文句子字面量。
- 带资源的组件必须自己收尾:rAF 订阅、`matchMedia` 监听、WebGL 上下文、事件监听一律在 `onScopeDispose` 里摘掉。
- **六张 WebGL 胶囊必须常驻**:筛选只切 `visible` prop,不许用 `v-if` 增删卡片——那会销毁上下文并把流动进度清零。

## 动效与可访问性

- 时长与缓动在组件根类声明 CSS 变量(`--ease` / `--dur-*`)再引用,不在各处散写 `cubic-bezier`。
- 状态切换优先"动画常驻 + `animation-play-state`"或"常驻元素 + 类开关",避免挂撤动画造成跳变。
- `prefers-reduced-motion` 已在 `src/styles/base.css` 全局降级(含 `transition-delay` 归零),**不要**在组件里再写一套媒体查询。
- 可交互元素要有可访问名:`aria-label` / `aria-pressed` / `aria-current`;会变的数字挂 `aria-live="polite"`。
- 外链一律 `target="_blank" rel="noopener noreferrer"`。

## 命名与文件

- 组件文件 PascalCase(`FluxCapsule.vue`),路由视图以 `View` 结尾(`FluxStudioView.vue`),数据与工具模块 kebab-case(`fluxThemes.ts`)。
- **新增文件名一律 ASCII**:`assets/录屏_*.gif` 是历史遗留,别再制造需要转义的引用。
- 不写 `index.ts` 桶文件,不做无意义的目录嵌套。

## 提交信息

Conventional Commits:`type(scope): 中文或英文主题`,类型小写、冒号后留空格、主题不超过 72 字。正文写"为什么",不复述 diff。

## 提交前必须全绿

```bash
npm run lint:check     # ESLint
npm run format:check   # Prettier
npm run type-check     # vue-tsc
npm run test:unit      # Vitest
npm run build          # 构建(含类型检查)
cmp public/flux/index.html dist/flux/index.html   # 冻结文件未被改动
```

## 不要做

- 不要 `prettier --write .` 或 `eslint . --fix` 全仓库跑——`.prettierignore` 已挡掉冻结文件,但存量代码里存在与当前规则不一致的写法,全量修复会产出几百行无关 diff。只格式化你改动的文件。
- 不要提交 `.qoder/`、`dist/`、截图与临时浏览器 profile。
- 不要为"以后可能用到"抽抽象;三行重复优于过早封装。
- 不要在内容仪表盘的组件里改布局断点阈值,除非你确实测量过内容地板宽。

## 已知历史包袱(未处理,别当成规范)

- `assets/` 下约 24 MB 的 GIF/MP4 直接进库、无 Git LFS,且文件名非 ASCII。
- 旧版提交信息有无空格风格(`feat:增加图片`),commitlint 只约束新提交。
- GitHub Pages 未开启,README 不写在线预览链接。
