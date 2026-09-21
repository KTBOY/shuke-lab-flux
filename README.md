# FLUX — shuke Lab

让固定容器里的颜色材质"活"起来 🎨

一个仓库、两样东西:**FLUX 流体颜色生成器**(零依赖单文件 WebGL)与 **Crestio 仪表盘工作台**(Vue 3 + TypeScript + Vite 像素级还原)。两者打包成同一个静态站点,仪表盘首页有一条路由入口直达颜色生成器。

## 站点构成

| 页面 | 访问地址 | 形态 |
| --- | --- | --- |
| 仪表盘工作台(首页) | `/#/` | Vue 3 + TS + Vite 构建产物 |
| FLUX 颜色生成器 | `/#/color-lab` | iframe 承载下面那个独立页面 |
| FLUX 裸页 | `/flux/index.html` | 零依赖单文件,可脱离构建直接打开 |

源码位置:颜色页在 `public/flux/index.html`(Vite 原样拷贝到产物根目录,不参与构建);仪表盘在 `src/`。

## 效果演示

烟雾在 iOS 风格玻璃胶囊里持续流动:

![录屏演示](assets/录屏_20260731_221830.gif)

页面全览(左侧筛选栏 + 六种配色主题):

![页面截图](assets/preview.png)

小程序直接预览

![1785745483818](image/README/1785745483818.png)

## 快速开始

```bash
# 要求 Node >= 20
npm install
npm run dev        # http://localhost:5173
```

只想看颜色生成器,不必装任何东西——用浏览器直接打开 `public/flux/index.html` 即可。

## 可用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run build-only` | 仅构建,跳过类型检查 |
| `npm run preview` | 预览构建产物 |
| `npm run type-check` | `vue-tsc` 类型检查 |
| `npm run lint` | ESLint 检查并自动修复 |
| `npm run lint:check` | ESLint 只检查不改写(CI 用这条) |
| `npm run format` | Prettier 格式化 `src/` |
| `npm run assets:optimize` | 把 `src/assets/img/*.png` 原图压成 2x 展示尺寸的 WebP |
| `npm run screenshot` | 用本机 Edge 无头模式出图,用于与参考稿逐块比对 |

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
flowTime += dt * (0.22 + eased * 0.28);  // 0.22 静止流速,悬停加速至 0.50
```

## 仪表盘工作台

一张 HR 仪表盘设计稿的 1:1 还原,不依赖任何 UI 组件库、原子 CSS 框架与图标库:视觉细节全部由 `src/styles/tokens.css` 的设计令牌 + 手写 CSS 实现。

| 区块 | 组件 | 说明 |
| --- | --- | --- |
| 顶部导航 | `AppNavbar` | 品牌标识、深色菜单胶囊组(选中项为滑动指示器)、设置下拉与用户操作 |
| 概览指标 | `StatOverview` | 四条按数值分配宽度的进度胶囊 + 三项 KPI |
| 作者身份卡 | `EmployeeProfileCard` | 照片 + 底部渐变遮罩上的姓名/岗位/金额 |
| 信息手风琴 | `DeviceAccordion` | 养老金 / 设备 / 薪酬 / 福利四组数据,可展开收起 |
| 工时进度 | `WorkProgressCard` | 七日柱状图,逐根可悬停查看当日工时 |
| 工时计时 | `TimeTrackerCard` | 环形刻度表盘,播放/暂停真实走时 |
| 入职概览 | `OnboardingCard` | 总完成率与三条分项进度 |
| 入职任务 | `OnboardingTaskCard` | 深色清单卡,与概览卡同列上下排布 |
| 日程表 | `ScheduleCard` | 月历切换、虚线网格与两条排期事件 |

接业务时替换 `src/data/dashboard.ts` 的数据源即可,组件不持有任何文案。

### 响应式

布局跟随**组件自身可用宽度**而非浏览器视口(`.stage` 为 `container-type: inline-size`),因此把仪表盘嵌进任意宽度的侧栏/抽屉都能正确降级。

| 容器宽度 | 档 | 栅格 |
| --- | --- | --- |
| > 1080px | 桌面 | 四列命名区域,日程表跨中两列 |
| 720–1080px | 平板 | 两列,日程表通栏 |
| ≤ 720px | 手机 | 单列纵向堆叠 |

字号、圆角、内边距一律 `clamp()` 流式缩放,不在断点上跳变;`prefers-reduced-motion` 下入场动画与过渡一并降级。

## 路由与部署

- 路由用**哈希模式**(`createWebHashHistory`):站点是纯静态托管,没有 SPA rewrite,history 模式下刷新 `/color-lab` 会被服务端判成 404。
- 构建配 `base: './'`(相对路径),因此 `dist/` 既能放在域名根目录,也能放在 GitHub Pages 的项目子路径 `/shuke-lab-flux/` 下,不需要为仓库改配置。
- 产物是普通静态目录,任意静态服务器都能跑:`npm run build && npm run preview`,或 `npx serve dist`。
- 仓库目前**未开启** GitHub Pages。要上线时把 `dist/` 交给 Pages 即可,两种常见做法:上传 artifact 后跑 `actions/deploy-pages`,或把 `dist/` 推到 `gh-pages` 分支。

### 性能预算

构建产物体积(可作为后续改动的对照基线):

| 资源 | 原始 / gzip |
| --- | --- |
| `index.js`(Vue + Router + 仪表盘) | 124 KB / 52 KB |
| `ColorLabView.js`(路由懒加载) | 0.9 KB / 0.5 KB |
| `index.css`(全部手写样式) | 28 KB / 6.5 KB |
| `flux/index.html` | 19 KB,零请求零依赖 |

配套做法:

- 颜色生成器是路由懒加载的独立 chunk,首页不为其付出下载成本;iframe 只在进入 `/color-lab` 时才创建。
- 5 张 1 KB 上下的头像/设备图被 Vite 内联为 data URL,不额外发请求;30 KB 的人像图单独成文件并走内容哈希缓存。
- Inter 以可变字体子集分发,只下载实际用到的字重与字符区间。
- `assets/` 下的录屏 GIF/MP4 约 24 MB,只服务于 README 展示,不进入构建产物,也不会被浏览器在访问站点时下载。

## 工程约定

- **无自动导入**:`.vue` 与 `.ts` 中的 Vue API 均需显式 `import`,类型导入用 `import type`。
- **令牌驱动**:颜色/圆角/字号/阴影统一取自 `src/styles/tokens.css` 的 CSS 变量,组件里不写魔法色值。
- **数据与视图分离**:文案与指标集中在 `src/data/dashboard.ts`,组件只负责渲染。
- **BEM 命名**:样式类一律 `block__elem--mod`,`<style scoped>` 独占。
- **`public/flux/index.html` 是"外来户"**:它保持零依赖单文件,不参与构建、不接设计令牌,改动它请另开一次提交,别和仪表盘改动混在一起。

## 项目结构

```
.
├── public/flux/index.html   # FLUX 颜色生成器,零依赖单文件,构建时原样拷贝
├── src/
│  ├── assets/img/           # 素材(人像、设备、头像)
│  ├── components/
│  │  ├── dashboard/         # 仪表盘业务卡片
│  │  └── ui/                # AppIcon / AvatarStack 等无业务原子件
│  ├── composables/          # useTimeTracker、useOnboardingTasks
│  ├── data/                 # dashboard.ts 静态内容与类型、icons.ts 图标路径表
│  ├── router/               # 路由表与路由名常量
│  ├── styles/               # tokens.css 设计令牌、base.css 重置与复用类
│  ├── views/                # DashboardView / ColorLabView 两个路由页面
│  ├── App.vue
│  └── main.ts
├── assets/                  # README 用的演示图与录屏
├── scripts/                 # 素材压缩、无头截图脚本
└── index.html               # Vue 应用外壳
```

## 浏览器支持

现代常青浏览器(Chrome / Edge / Safari 16.4+ / Firefox 110+)。用到 CSS 容器查询、`mask`、WebGL 等现代特性,不支持 IE。

## 贡献

1. 从 `main` 切出分支
2. 提交前跑 `npm run lint:check && npm run type-check && npm run build`
3. 涉及视觉改动时,附上改动前后的截图

## 许可证

MIT
