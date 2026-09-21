# FLUX — shuke Lab

让固定容器里的颜色材质"活"起来 🎨

一个仓库、两条线:**FLUX 流体颜色生成器**(Vue 版 + 零依赖单文件旧版)与 **Crestio 仪表盘工作台**(Vue 3 + TypeScript + Vite 像素级还原)。三者打包成同一个静态站点,共用一层导航外壳,仪表盘首页有一条路由入口直达颜色实验室。

## 站点构成

| 页面               | 访问地址              | 形态                                                  |
| ------------------ | --------------------- | ----------------------------------------------------- |
| 仪表盘工作台(首页) | `/#/`                 | Vue 3 + TS + Vite 构建产物                            |
| FLUX 颜色实验室    | `/#/color-lab`        | Vue 版,六张胶囊各一块 WebGL 画布,融进仪表盘设计语言   |
| FLUX 旧版          | `/#/color-lab/legacy` | iframe 承载下面那个独立单文件,材质与交互与 Vue 版等价 |
| FLUX 裸页          | `/flux/index.html`    | 零依赖单文件,可脱离构建直接打开                       |

源码位置:Vue 版在 `src/views/FluxStudioView.vue` + `src/components/flux/`;旧版那个单文件在 `public/flux/index.html`(Vite 原样拷贝到产物根目录,不参与构建);仪表盘在 `src/views/DashboardView.vue` + `src/components/dashboard/`。三页共用 `src/layouts/AppShell.vue` 这层外壳。

## 效果演示

烟雾在 iOS 风格玻璃胶囊里持续流动:

![录屏演示](assets/录屏_20260731_221830.gif)

页面全览(左侧筛选栏 + 六种配色主题):

![页面截图](assets/preview.png)

小程序直接预览

![1785745483818](image/README/1785745483818.png)

## 快速开始

```bash
# 要求 Node >= 22.12(见 package.json 的 engines 与 .nvmrc)
npm ci
npm run dev        # http://localhost:5173
```

只想看颜色生成器,不必装任何东西——用浏览器直接打开 `public/flux/index.html` 即可。

## 可用脚本

| 命令                      | 作用                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `npm run dev`             | 启动开发服务器                                                |
| `npm run build`           | 类型检查 + 生产构建                                           |
| `npm run build-only`      | 仅构建,跳过类型检查                                           |
| `npm run preview`         | 预览构建产物                                                  |
| `npm run type-check`      | `vue-tsc` 类型检查                                            |
| `npm run lint`            | ESLint 检查并自动修复                                         |
| `npm run lint:check`      | ESLint 只检查不改写(CI 用这条)                                |
| `npm run format`          | Prettier 格式化全仓库(`.prettierignore` 会跳过冻结文件与产物) |
| `npm run format:check`    | Prettier 只检查不改写(CI 用这条)                              |
| `npm run test:unit`       | Vitest 跑 `src/**/__tests__`                                  |
| `npm run test:watch`      | Vitest 监听模式                                               |
| `npm run coverage`        | 跑测试并输出覆盖率(低于门槛即失败)                            |
| `npm run assets:optimize` | 把 `src/assets/img/*.png` 原图压成 2x 展示尺寸的 WebP         |
| `npm run screenshot`      | 用本机 Edge 无头模式出图,用于与参考稿逐块比对                 |

## FLUX 颜色生成器

### 功能

- **6 种配色主题**:ORIGINAL 原始版本 / AURORA 极光 / KLEIN 克莱因 / ULTRAVIOLET 超紫 / CHROME 铬 / SUNSET 落日
- **iOS 风格玻璃胶囊**:完全药丸形 + 顶部镜面高光带 + 内圈光与体积阴影
- **左侧筛选**:点击主题按钮可单独查看某一张卡片,计数器同步更新
- **悬停交互**:鼠标移入卡片,流速平滑微加速、卡片上浮
- **搅动交互**:鼠标在胶囊内移动,烟雾流速随移动速度加快(最高约 4 倍),停下后约 1 秒平滑回落

### 实现原理

每张卡片内嵌一个独立的 WebGL 画布,核心是片元着色器:

1. **域扭曲 FBM 噪声(Domain-Warped FBM)** — 两层 5 阶分形噪声互相推挤,产生水彩云雾般的自然纹理;
2. **三色混合** — 每个主题由 3 个主色 uniform 传入,按噪声值平滑插值;
3. **白色蒙版** — 卡片左侧约四成渐隐留白给文字,顶部叠加淡淡白雾;
4. **逐帧累积时间** — JS 侧 `flowTime += dt * speed`,悬停变速时画面完全连续,不会跳变;
5. **随机初相位** — 每张卡片的噪声种子与起始时间不同,花纹永不重复。

### 自定义

打开 `public/flux/index.html`,在 `CARDS` 数组中即可增删主题:

```js
{ id: 'sunset', en: 'SUNSET', cn: '落日', paid: '#e0a030',
  colors: [[1.00,0.72,0.18],[1.00,0.34,0.28],[0.62,0.14,0.44]] }  // RGB 0~1,三个主色
```

流速在 `tick(dt)` 中调整:

```js
flowTime += dt * (0.22 + eased * 0.28) // 0.22 静止流速,悬停加速至 0.50
```

## 两版实现

同一套材质在仓库里有两份实现,各有职责:

- **旧版** `public/flux/index.html`:零依赖单文件,不参与构建、可脱离一切工具双击打开。这是本仓库的立身之本,**保持字节不变**,CI 里有一条 `cmp` 专门守着。
- **Vue 版** `src/views/FluxStudioView.vue`:站点默认入口,融进仪表盘的设计语言与导航外壳,材质与交互逐条对齐旧版。

Vue 版分层:

| 文件                                  | 职责                                     |
| ------------------------------------- | ---------------------------------------- |
| `src/data/fluxThemes.ts`              | 六套主题的三色组与展示字段               |
| `src/webgl/fluxShader.ts`             | GLSL 源码(与旧页内联版本逐行等价)        |
| `src/composables/useFluidField.ts`    | 上下文生命周期、共享时钟、悬停与搅动状态 |
| `src/components/flux/FluxCapsule.vue` | 一块画布一张卡,含降级兜底                |
| `src/views/FluxStudioView.vue`        | 筛选栏、计数器、流动开关与栅格           |

几个刻意这么做(或刻意不这么做)的地方:

- **一条 rAF 时钟驱动六块画布**:六次独立 `requestAnimationFrame` 会让主线程排六遍回调。时钟在模块级按订阅数启停,没人订阅就停摆;页面切到后台也停摆,否则切回来会一次性追帧。
- **筛选只切 `visible`,不用 `v-if` 增删卡片**:销毁组件等于销毁 WebGL 上下文,切一次筛选要重建六个,而且 `flowTime` 进度归零、花纹从头开始。隐藏时只是停掉绘制。
- **卸载时主动 `WEBGL_lose_context.loseContext()`**:热更新会反复重建组件,等 GC 回收会先撞上浏览器的上下文上限。
- **`devicePixelRatio` 封顶 2**,且只在尺寸真的变了时才重设 drawingBuffer——给 canvas 宽高赋值本身会清空画布。
- **动效降级**:`prefers-reduced-motion` 下不订阅时钟,只定格渲染一帧(系统偏好优先于页内开关);页内另有「暂停流动」,暂停是退订时钟而不是让它在后台空转。
- **WebGL 不可用或上下文被回收**时,卡片铺一层同色系 CSS 渐变,而不是留一个空白框或一张死图。
- **主题数据存在两份**(旧页内联的 `CARDS` 与 `fluxThemes.ts`)。改主题以 TS 那份为准,旧页按需另开一次提交同步——它必须保持单文件自包含,不能反过来 import。

## 仪表盘工作台

一张 HR 仪表盘设计稿的 1:1 还原,不依赖任何 UI 组件库、原子 CSS 框架与图标库:视觉细节全部由 `src/styles/tokens.css` 的设计令牌 + 手写 CSS 实现。

| 区块       | 组件                  | 说明                                                             |
| ---------- | --------------------- | ---------------------------------------------------------------- |
| 顶部导航   | `AppNavbar`           | 品牌标识、深色菜单胶囊组(选中项为滑动指示器)、设置下拉与用户操作 |
| 概览指标   | `StatOverview`        | 四条按数值分配宽度的进度胶囊 + 三项 KPI                          |
| 作者身份卡 | `EmployeeProfileCard` | 照片 + 底部渐变遮罩上的姓名/岗位/金额                            |
| 信息手风琴 | `DeviceAccordion`     | 养老金 / 设备 / 薪酬 / 福利四组数据,可展开收起                   |
| 工时进度   | `WorkProgressCard`    | 七日柱状图,逐根可悬停查看当日工时                                |
| 工时计时   | `TimeTrackerCard`     | 环形刻度表盘,播放/暂停真实走时                                   |
| 入职概览   | `OnboardingCard`      | 总完成率与三条分项进度                                           |
| 入职任务   | `OnboardingTaskCard`  | 深色清单卡,与概览卡同列上下排布                                  |
| 日程表     | `ScheduleCard`        | 月历切换、虚线网格与两条排期事件                                 |

接业务时替换 `src/data/dashboard.ts` 的数据源即可,组件不持有任何文案。

### 响应式

布局跟随**组件自身可用宽度**而非浏览器视口(`.stage` 为 `container-type: inline-size`),因此把仪表盘嵌进任意宽度的侧栏/抽屉都能正确降级。

| 容器宽度   | 档   | 栅格                        |
| ---------- | ---- | --------------------------- |
| > 1080px   | 桌面 | 四列命名区域,日程表跨中两列 |
| 720–1080px | 平板 | 两列,日程表通栏             |
| ≤ 720px    | 手机 | 单列纵向堆叠                |

字号、圆角、内边距一律 `clamp()` 流式缩放,不在断点上跳变;`prefers-reduced-motion` 下入场动画与过渡一并降级。

## 路由与部署

- 路由用**哈希模式**(`createWebHashHistory`):站点是纯静态托管,没有 SPA rewrite,history 模式下刷新 `/color-lab` 会被服务端判成 404。
- 构建配 `base: './'`(相对路径),因此 `dist/` 既能放在域名根目录,也能放在 GitHub Pages 的项目子路径 `/shuke-lab-flux/` 下,不需要为仓库改配置。
- 产物是普通静态目录,任意静态服务器都能跑:`npm run build && npm run preview`,或 `npx serve dist`。
- 仓库目前**未开启** GitHub Pages。要上线时把 `dist/` 交给 Pages 即可,两种常见做法:上传 artifact 后跑 `actions/deploy-pages`,或把 `dist/` 推到 `gh-pages` 分支。

### 性能预算

构建产物体积(可作为后续改动的对照基线):

| 资源                                     | 原始 / gzip        |
| ---------------------------------------- | ------------------ |
| `index.js`(Vue + Router + 外壳 + 仪表盘) | 125 KB / 53 KB     |
| `FluxStudioView.js`(路由懒加载,含着色器) | 9.8 KB / 4.8 KB    |
| `ColorLabLegacyView.js`(路由懒加载)      | 1.0 KB / 0.6 KB    |
| `index.css`(全部手写样式)                | 30 KB / 6.8 KB     |
| `FluxStudioView.css`                     | 6.5 KB / 1.8 KB    |
| `flux/index.html`                        | 19 KB,零请求零依赖 |

配套做法:

- 两个颜色实验室页面都是路由懒加载的独立 chunk,首页不为它们付出下载成本;仪表盘静态引入以保证首屏不多一次往返。
- **六块 WebGL 画布是这一页真正的成本所在**,不在 JS 体积而在 GPU:每块画布跑两层 5 阶 FBM,`devicePixelRatio` 封顶 2;被筛掉的卡片停掉绘制、暂停按钮直接退订时钟、页面切到后台时钟停摆。
- 5 张 1 KB 上下的头像/设备图被 Vite 内联为 data URL,不额外发请求;30 KB 的人像图单独成文件并走内容哈希缓存。
- Inter 以可变字体子集分发,只下载实际用到的字重与字符区间。
- `assets/` 下的录屏 GIF/MP4 约 24 MB,只服务于 README 展示,不进入构建产物,也不会被浏览器在访问站点时下载。

## 工程约定

摘要如下,完整且权威的版本(含禁止事项与提交前命令)在 **[AGENTS.md](./AGENTS.md)**。

- **无自动导入**:`.vue` 与 `.ts` 中的 Vue API 均需显式 `import`,类型导入用 `import type`。
- **令牌驱动**:颜色/圆角/字号/阴影统一取自 `src/styles/tokens.css` 的 CSS 变量,组件里不写魔法色值。
- **数据与视图分离**:文案与指标集中在 `src/data/dashboard.ts`,组件只负责渲染。
- **BEM 命名**:样式类一律 `block__elem--mod`,`<style scoped>` 独占。
- **外壳常驻,页面不画导航**:三个页面都挂在 `src/layouts/AppShell.vue` 下,顶部导航与页脚署名只此一份;导航高亮由当前路由推导,view 里不要再引 `AppNavbar`。
- **重资源组件要自己收尾**:WebGL 上下文、`matchMedia` 监听、rAF 订阅一律在 `onScopeDispose` 里摘掉,新增带这类资源的组件照此办理。
- **`public/flux/index.html` 是"外来户"**:它保持零依赖单文件,不参与构建、不接设计令牌,改动它请另开一次提交,别和仪表盘改动混在一起。

## 项目结构

```
.
├── public/flux/index.html   # FLUX 旧版单文件,零依赖,构建时原样拷贝(冻结)
├── src/
│  ├── assets/img/           # 素材(人像、设备、头像)
│  ├── components/
│  │  ├── dashboard/         # 仪表盘业务卡片
│  │  ├── flux/              # FluxCapsule 一块 WebGL 胶囊卡
│  │  └── ui/                # AppIcon / AvatarStack 等无业务原子件
│  ├── composables/          # useFluidField、useTimeTracker、useOnboardingTasks
│  │  └── __tests__/         # 时钟启停、暂停门控、搅动衰减、降级路径
│  ├── data/                 # 内容与类型:dashboard、fluxThemes、icons(+ __tests__)
│  ├── layouts/AppShell.vue  # 渐变画布 + 常驻导航 + 页脚,三个页面共用
│  ├── router/               # 路由表与路由名常量
│  ├── styles/               # tokens.css 设计令牌、base.css 重置与复用类
│  ├── test/setup.ts         # jsdom 环境补齐(matchMedia 等)
│  ├── views/                # DashboardView / FluxStudioView / ColorLabLegacyView
│  ├── webgl/fluxShader.ts   # FLUX 着色器 GLSL 源码
│  ├── App.vue
│  └── main.ts
├── .husky/                  # pre-commit(lint-staged)与 commit-msg(commitlint)
├── assets/                  # README 用的演示图与录屏
├── scripts/                 # 素材压缩、无头截图脚本
├── AGENTS.md                # 人与 AI 共用的硬约束清单
├── CONTRIBUTING.md          # 流程细节
├── commitlint.config.js     # 提交信息规则
├── vitest.config.ts         # 测试环境与覆盖率门槛
├── .prettierignore          # 挡住冻结文件与产物
└── index.html               # Vue 应用外壳
```

## 浏览器支持

现代常青浏览器(Chrome / Edge / Safari 16.4+ / Firefox 110+)。用到 CSS 容器查询、`mask`、WebGL 等现代特性,不支持 IE。

## 质量门禁

**CI**(`.github/workflows/ci.yml`)按顺序跑:ESLint → Prettier → `vue-tsc` → Vitest 覆盖率 → 构建 → `cmp` 校验 FLUX 单文件未被改动;PR 还要过 commitlint。

**本地钩子**(husky + lint-staged):`pre-commit` 只对暂存文件跑 `eslint --fix` 与 `prettier --write`,`commit-msg` 跑 commitlint。克隆仓库后 `npm ci` 会通过 `prepare` 脚本自动装好钩子。

**测试**放在被测代码同层的 `__tests__/` 下,覆盖率只统计有逻辑的 `src/composables` 与 `src/data` 两层(门槛 80/70/75/80,语句/分支/函数/行),组件视觉正确性由人工验收兜底,不拿数字假装覆盖。

## 贡献

1. 先读 **[AGENTS.md](./AGENTS.md)**——那是人与 AI 贡献者共用的硬约束清单(冻结文件、双份主题数据、不许加的依赖、提交前命令)。
2. 从 `main` 切分支,一个 PR 只做一件事;提交信息走 Conventional Commits,钩子会拦。
3. 涉及视觉改动时,附上改动前后的截图;改动 `public/flux/index.html` 的 PR 单独开。

流程细节见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

[MIT](./LICENSE)
