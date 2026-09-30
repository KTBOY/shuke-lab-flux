# sk-chart 漏斗卡接入 Crestio 首页 —— 实施计划

> 状态：**P0 已接线；P1 已接线后按 §10 改判到二级页**（本地六道门禁通过，改判后的真机查看待做），P2 只剩配色，P3/P4 未开工。
> 决策来源：2026-09-29 会话四项拍板（见 §1）。
> 唯一权威出处：sk-chart 的能力边界以 `D:\my\sk-chart\README.md` 为准，本文只记与本次接入相关的部分，不重复抄 API 表。

## 1. 决策记录（已拍板）

| #   | 决策                                                        | 结论                                                                                                               | 代价                                                                                                    |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| D1  | AGENTS.md 硬约束 4「不新增运行时依赖」与本页引入图表库冲突  | **破例引入，并在同一次提交同步改口径**                                                                             | 豁免口子开一次即封：本轮后运行时依赖仍只有 vue / vue-router / @fontsource-variable/inter / sk-chart-duo |
| D2  | npm 上 `0.1.0` 为 MIT、sk-chart 本地 HEAD 已改 GPL-3.0-only | **本轮不动 sk-chart，只记 issue**                                                                                  | flux 必须**精确锁版** `0.1.0`（见 §5 R1），否则上游发版即被动接收 GPL                                   |
| D3  | 首页落位                                                    | **StatOverview 与 `.board` 之间新增整宽漏斗卡**，不删任何现有模块                                                  | 首屏高度 +≈340px，`.board` 下移一屏                                                                     |
| D4  | 视觉基调                                                    | **保留折面轮廓（`scale.exponent: 2`）+ `registerTheme` 换 tokens 配色**，`stripePattern` / `fadeMask` 维持默认开启 | 折面渐变与米黄底色需实测对比重叠                                                                        |

## 2. 事实基线（已实测，非推断）

| 校验项               | 方法                                                         | 结论                                                                                                                                           |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 包可用性             | `npm view sk-chart-duo`                                      | `0.1.0`，`deps: none`，unpackedSize 324 KB（含 sourcemap），gzip ~8 KB                                                                         |
| 文档是否超前于发布版 | 逐一 `cmp` 发布 tarball 与本地 `dist/` 四个产物              | **全部逐字节相同** ⇒ README 的 `registerTheme` / `xAxis.bottomLabels` / 装饰开关 / `toSVGString` 在 npm 包里都可用                             |
| 像素自适应           | `grep -rn "ResizeObserver" src/`                             | **零命中**（README 路线图 M1 仍标"进行中"）⇒ 自适应由宿主做，见 §4.3                                                                           |
| jsdom 可挂载         | `src/charts/fold-bar/interaction.ts:35` `measureTooltipText` | 对 `getComputedTextLength` / `getBBox` 做了 typeof + try 双保护，注释明示 "Safe under jsdom (returns zeros)" ⇒ Vitest 可真实挂载，不必 mock 库 |
| SVG 背景             | README「SVG 本身透明」                                       | 底色由宿主卡片提供，正好复用 `panel panel--warm`                                                                                               |
| 动效降级             | `src/theme/default-theme.ts:262`                             | 库内自带 `prefers-reduced-motion` 关过渡，与 `src/styles/base.css:130` 的全局降级叠加不冲突（后者带 `!important`，优先）                       |

## 3. 为什么只能放整宽行（数值依据）

以本项目自己的最小字号 `--fs-mini: 10px`（`src/styles/tokens.css:40`）为可读下限反推。图表设计空间宽 860，类目行字号 11.5px、y 轴 11px ⇒ 等比缩放下容器需 **≥ ~780px**。1440 视口实测栅格（内宽 ≈1412 = 4 列共 4.1fr − 3×12px 间距）：

| 候选位置                      | 可用宽  | 缩放  | 类目行实际字号 | 判定                                          |
| ----------------------------- | ------- | ----- | -------------- | --------------------------------------------- |
| 左列 / 右列卡片               | ≈335px  | 0.39× | 4.5px          | 不可读；右列 `board__onboard` 还锁死 200px 高 |
| Schedule 区（跨 2 列）        | ≈682px  | 0.79× | 9.1px          | 差一档，且要迁移现有日程卡                    |
| WorkProgress / TimeTracker    | ≈335px  | —     | —              | 二者本身就是手绘图表，替换等于砍掉手写叙事    |
| **Stats 与 board 之间整宽行** | ≈1412px | 1.64× | 18.9px         | 采用                                          |

默认 860×386 在 1412px 下会撑出 ≈634px 高，故不等比缩放，改由宿主 `resize()` 把设计空间设成容器真实像素（见 §4.3），字号即按设计值 1:1 落地。

## 4. 设计

### 4.1 语义与数据

放**招聘转化漏斗**，与首页既有的「面试量 / 已录用」`STAT_BARS` 和「招聘 56」`KPI_STATS` 同源，是同一指标的两种视图；不新造一套业务口径。

新增到 `src/data/dashboard.ts`（模板内不出现中文句子字面量，遵守 AGENTS.md）：

- `FUNNEL_STAGES: FoldBarDatum[]` —— 5 阶：简历投递 → 初筛 → 面试 → 终面 → 已录用，数值单调递减
- `FUNNEL_CARD` —— `title` / `caption` / `valueFormat` 所需的单位后缀 / `footer` 模板（含 `{rate}` 占位，填总转化率）
- `FUNNEL_UI` —— `ariaLabel`、`liveRegionLabel`（高亮阶段变化时给屏幕阅读器）、`hint`

### 4.2 组件

`src/components/dashboard/ConversionFunnelCard.vue`：

- `<script setup lang="ts">` + `defineOptions({ name: 'Dashboard-ConversionFunnelCard' })`，props 用 `interface` + `defineProps<T>()`
- 外层沿用 `panel panel--warm` 壳与 `panel__head` / `panel__title` 结构，和 `WorkProgressCard.vue` 同构，视觉上作为"第 9 张卡"而非外来件
- **不抽 composable**：当前唯一消费方，生命周期写在组件内约 25 行（AGENTS.md「三行重复优于过早封装」）。若后续接第二种图表类型再提 `useSkChart`
- 实例创建在 `onMounted`，销毁在 `onScopeDispose`：`chart.destroy()` + `ro.disconnect()` + 取消 rAF —— 对齐「带资源的组件必须自己收尾」

### 4.3 尺寸自适应（补上游缺口）

`ResizeObserver` 观察图表宿主 `div`，把实测宽度喂给 `chart.resize(w, h)`：

- 1 CSS px = 1 设计单位 ⇒ 字号恒等于 `tokens` 设计值，宽屏窄屏都不缩字
- 高度分档：桌面 340 / ≤1080 300 / ≤720 240（与 `DashboardView.vue` 现有两档容器查询同名 `stage`，不新增容器）
- 回调内用 `requestAnimationFrame` 合帧，宽度增量 <1px 直接 return，避免拖窗时整棵 SVG 重绘
- ≤720 档额外降为 4 阶并关掉 `xAxis.bottomLabels`（底部语义行在 240px 高下必然叠字）

### 4.4 主题接线

`src/data/crestioChartTheme.ts`：

- 色值**运行时**从 `getComputedStyle(document.documentElement).getPropertyValue('--c-accent')` 等读取，不在 ts 里复制第二份十六进制 —— 保持 `tokens.css` 是设计令牌唯一出处
- `registerTheme('crestio', { style: {...}, tokens: {...}, formats: {...} })`：柱体渐变换成 `--c-accent` / `--c-dark` 系，字体族取 `--ff-base`，`axis.fill` 取 `--c-ink-3`
- 折面与 crease 保持默认（`fold.run` 20、crease 白 1.2px），这是招牌外观，关掉就退化成普通柱状图

### 4.5 可访问性

- 卡片标题即图表名；宿主 SVG 容器给 `aria-label`，列级 `role="listitem"` + `aria-selected` 由库提供
- 键盘：库自带 `←` / `→` / `Home` / `End` + `Enter` / `Space`，不再另写
- 高亮阶段文字挂 `aria-live="polite"`（AGENTS.md「会变的数字」一条）
- 漏斗各阶段同时以 SVG 外的文本行呈现当前值，避免只靠图形传达

### 4.6 口径同步（D1 的"同一次提交"部分）

`STACK_NOTE` 与 `TECH_STACK` 的字面枚举是「UI 组件库 / 图标库 / 原子 CSS」，图表库不在其中，**不改写既有断言、只补一句豁免**，避免把真话改成假话：

| 出处                                    | 改法                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md:11` 硬约束 4                 | 追加"唯一豁免：`sk-chart-duo`（SVG 图表，零传递依赖），理由与锁版约束见 `docs/sk-chart-funnel-plan.md`；再开豁免一律走提交说明" |
| `src/data/dashboard.ts:99` `STACK_NOTE` | 补分句说明图表来自自带库，其余仍手写                                                                                            |
| `src/data/dashboard.ts:96` `TECH_STACK` | 增 `'sk-chart'`（与 `WebGL GLSL` 同列，只列名字不写版本号，沿用该文件既有约定）                                                 |
| `README.md:7` / `README.md:127`         | 各补一句，与上面三处口径一致                                                                                                    |

## 5. 风险与回退

| #   | 风险                                                                                                                        | 处置                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| R1  | **GPL 传染**：sk-chart 下一次发版会把 npm 的 license 翻成 GPL-3.0-only，flux 是 MIT 且经 GitHub Pages 对外分发              | 依赖写成精确版本 `"sk-chart-duo": "0.1.0"`（不用 `^`），`package-lock.json` 同步入库。D2 的 issue 落地前不升级 |
| R2  | 上游 M1 若交付 ResizeObserver 真实像素自适应，宿主逻辑变冗余                                                                | §4.3 的实现限定在组件内 25 行，删起来无扩散                                                                    |
| R3  | 折面 wash 是半透明暖色，叠在 `--c-panel-soft` 上可能糊                                                                      | 落地后实测对比重叠，必要时只降 `wash` 不透明度，仍算 D4 范围内                                                 |
| R4  | 首屏高度增加，`DashboardView.vue:227-257` 的 `nth-child` 入场错峰会错位：新卡成为第 3 个子元素后，`.board` 的延时被挤掉一档 | 补 `.dashboard > :nth-child(4)` 一条，顺序重排为 hero → stats → 漏斗 → board                                   |
| R5  | `.prettierignore` / ESLint 是否会处理到包产物                                                                               | 只从包名 import，不 `copy` 任何 dist 进 `src/`，不触碰冻结文件                                                 |

回退成本：一次 `git revert` 两个提交（口径提交 + 接入提交），无数据迁移。

## 6. 分阶段任务与验收

每阶段独立可验证，状态词只用：**未开工 / 已设计 / 已接线 / 已验收**（不自评"已交付"）。

### P0 口径与约束 —— 已接线

改动：AGENTS.md、README 两处、`src/data/dashboard.ts` 两条常量。
验收：全文 grep「零依赖」只剩指 `public/flux/index.html` 的三处（`README.md:16` / `:102` / `:173` / `:199`、`AGENTS.md:7`），不再有任何一处替仪表盘作绝对化断言。

### P1 数据与组件 —— 已接线，但落位已按 §10 改判

改动：`dashboard.ts` 三个常量、`ConversionFunnelCard.vue`、`DashboardView.vue` 接线（含 R4 错峰补丁）。
验收：`npm run dev` 首页出图；`npm run type-check` 通过；模板内无中文字面量。

### P2 主题与响应式 —— 配色已接线（§11），响应式已被 §10 的画幅规则消解

改动：`crestioChartTheme.ts`、三档高度与移动端降级。
验收：1440 / 1080 / 720 三档无叠字无横向溢出；DevTools 量得类目行实际字号 = 11.5px（不随缩放变化）；`getComputedStyle` 取不到变量时有 fallback 且不抛错。
现状补充：P1 已把设计空间设成容器真实像素，字号已恒等于设计值；本阶段只剩**配色与字体族接线**，以及 ≤720 档的列数降级与 `bottomLabels` 关闭。

### P3 门禁与实测 —— 门禁已本地通过，浏览器实测未做

验收清单（AGENTS.md「提交前必须全绿」全套）：

```
npm run lint:check
npm run format:check      # 只格式化改动文件，禁止全仓 --write
npm run type-check
npm run test:unit
npm run build
cmp public/flux/index.html dist/flux/index.html
```

新增单测：

- `ConversionFunnelCard.spec.ts`：挂载后容器内出现 `svg`；卸载后 `chart.destroy()` 与 `ResizeObserver.disconnect()` 均被调用（资源收尾一条，须真断言不能只测渲染）
- `__tests__` 内补 `FUNNEL_STAGES` 单调递减断言（漏斗语义）

浏览器实测（静态检查替代不了）：悬停切列 + tooltip 不溢出卡片、键盘 `←`/`→`/`Home`/`End` 可达、模拟系统减弱动效后无残留动画、拖窗无重绘抖动。

### P4 issue 落地 —— 未开工

见 §7，属对外可见动作，**逐条确认后才建**。

## 7. 待建 issue（D2，需你点头才提交）

目标仓库：`KTBOY/sk-chart`

> **标题**：`package.json` 与已发布 0.1.0 的 license 字段不一致（仓库 GPL-3.0-only / npm MIT）
>
> **正文**：npm 上 `sk-chart-duo@0.1.0`（2026-09-14 发布）的 `package.json` license 字段与 tarball 内 LICENSE 文件均为 MIT；本地 HEAD（1f60bd8，2026-09-21）已把两者改为 GPL-3.0-only，而发布流水线尚未跑过。
> 影响：任何按当前仓库文本判定授权的下游（含 `npm audit licenses`、GitHub 依赖告警、fork 者）都会得到与 registry 相反的结论。下一次 `npm version patch` 会由 CI 自动把 GPL 推上 npm，已引用 MIT 版本的下游无提示地被切换。
> 建议：发版前明确单一结论 —— 统一到 MIT，或承认 GPL 并按 semver 提 minor 版本、在 Release Notes 里写明授权变更。
> 附带：确认 `RELEASING.md` 流水线是否在发布前校验 `license` 字段与 `LICENSE` 文件一致。

## 8. 明确不在本轮范围

- 路线图 M2 的更多图表类型、React/Vue 官方封装
- `toSVGString` / `getDataURL` / `download` 的导出入口（属"借机加更聪明的能力"，需要时单独提一轮）
- 替换 WorkProgress / TimeTracker 两张手绘图表
- 触碰 `public/flux/index.html`（冻结）

## 9. P0/P1 实施记录（2026-09-29）

与计划的差异，以及实现时才发现的事实：

1. **`src/test/setup.ts` 加了 `ResizeObserver` 替身**（计划未列）。jsdom 不实现该 API，不加则组件在测试里直接抛错。替身只留空方法、回调永不触发，收尾断言靠 `vi.spyOn(ResizeObserver.prototype, 'disconnect')`，因此不需要额外的实例登记表。
2. **断言必须限定 `.funnel__plot svg`**。`wrapper.get('svg')` 先命中卡片头按钮里的 `AppIcon`（其 `aria-hidden="true"`），首轮测试就因此把 `aria-label` 读成 `undefined`。
3. **`FUNNEL_TOTAL_RATE` 落在 caption 同一行**（`从投递到录用 · 总转化 10%`），避免图下再堆第三行文字。
4. **`state.defaultActive` 未显式传**：库默认即末列，正好是「已录用」，少写一行。
5. **格式化只碰了本轮新增文件**。`src/data/dashboard.ts` 的 HEAD 版本经核对是 prettier 干净的，唯一非合规行是我新写的 `TECH_STACK`（103 字超出 `printWidth: 100`），按 prettier 的结果拆成多行；`DashboardView.vue` / `setup.ts` / `AGENTS.md` / `README.md` 均未跑 `--write`。
   - 探针教训：prettier 对仓库外的路径（`/tmp/…`）与 `coverage/` 会**静默跳过并零差异退出**，据此判定"基线不合规"是错的。可信做法是 `npx prettier <仓库内路径> > 副本` 走 stdout，或 `--stdin-filepath`。
6. **产物体积**：`dist/assets/index-*.js` 为 150.64 kB / gzip 62.14 kB（含 Vue 与图表库）。接入前的同口径基线未量，差额留到 P3 一并补测，这里不猜。

## 10. 改判记录（2026-09-29，真机截图后）

**D3 作废**：首页整宽漏斗卡经真机查看判定"设计不合理"，已改判为**二级页 `/#/funnel` + 首页 hero 入口胶囊**。

### 根因：§3 的推导漏了一项

§3 只算了**字号下限**（容器 ≥ ~780px 时类目行不低于 `--fs-mini` 的 10px），据此断定"整宽是唯一干净落点"。但漏了**纵横比下限**：库的 `stair.bottomOffset: 30 / topOffset: 74` 与 `fold.run: 20` 都是按 860×386（2.23 : 1）调的——五根柱子的顶边总共只在 44px 行程里移动。

P1 为了让字号不缩，把设计空间设成容器真实像素 ≈1412×280，纵横比变成 **5.04 : 1**：

|            | 原稿     | P1 实装  |
| ---------- | -------- | -------- |
| 纵横比     | 2.23 : 1 | 5.04 : 1 |
| 每列宽     | 172px    | 282px    |
| 单柱高宽比 | 0.45     | **0.16** |

结果就是截图里那条贴地薄带：560 → 56 的十倍差只剩 44px 高度差，还被摊到 282px 宽，趋势完全读不出来，折面塌成一条缝。**首页整宽给的是"够宽"，而这张图要的是"够方"。**

### 修正后的画幅规则

设计空间不再等于容器像素，改为两档：

- 容器 **≥ 748px**：恒用原稿 `860 × 386`，交给库自带的 `width:100%; height:auto` 纯 CSS 等比放大。形状与字号一起变大（960 宽时类目行 11.5 → 12.8px），这是作者调过的那套比例。
- 容器 **< 748px**：才切 1 CSS px = 1 设计单位，字号回到设计值；纵横比两档都死守 2.23 : 1。

`ResizeObserver` 因此只观察**宽度**（高度由 SVG 自己撑出，若也按高度触发就是 resize → 高度变 → RO 再触发的死循环）。

### 顺带修掉的两个缺陷

1. **量纲冲突**：库的 `axis.tickFormat` 默认追加 `'k'`，P1 只覆盖了柱头的 `valueFormat`，于是同一张图上柱头写「560 人」、Y 轴写「600k」。现覆盖为 `String(value)`，并有单测断言轴上不再出现以 `k` 结尾的文本。
2. **文案三层冗余**：柱头类目 + 底部语义行 + 卡片左下 aria-live + tooltip 各说一遍。按判词「只留柱头，转化率进 tooltip」处理：删掉 `xAxis.bottomLabels` 及其两条文案常量，aria-live 读数转 `.sr-only`（仍满足 AGENTS.md「会变的数字挂 aria-live」），卡片右上角那个没有明细页可去的圆形按钮一并删除。

### 布局与体积

- 首页 hero 右侧改为两个入口胶囊成组（`.hero__actions`），`.board` 回到第 3 个子元素，P1 补的 `.dashboard > :nth-child(4)` 与 `.insight` 已撤。
- 主包 `index-*.js` 由 150.64 kB / gzip 62.14 kB 降到 **127.19 kB / gzip 53.57 kB**；图表 24.74 kB / gzip 9.28 kB 全部落在 `FunnelInsightView` 的懒加载 chunk 里，首页不再下载它。

### 仍未做

**D4 配色**：二级页当前仍是库默认的蓝灰折纸压在米黄外壳上，`registerTheme('crestio')` 未接。P2 待开工，且现在只剩这一件事（高度分档问题已被上面的画幅规则消解）。

## 11. 配色接线（2026-09-29，D4 落地）

新增 `src/data/crestioChartTheme.ts`：导出 `crestioChartTheme()`，在实例化时读 `getComputedStyle(document.documentElement)` 上的自定义属性，**色值不复制进 ts**，`tokens.css` 仍是唯一出处。用内联 `theme` 传入而非 `registerTheme` 全局注册——只有一个消费方，全局注册表是多余的可变状态。

映射到首页既有图形语言，而不是新造一套：

| 图表元素            | 取值                                                              | 依据                                                                                                           |
| ------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 闲置柱              | `--c-accent-deep → --c-accent → --c-accent-soft → --c-panel-soft` | 柱底融进卡片底色，接住 `fadeMask` 的渐隐                                                                       |
| 高亮柱              | `--c-dark → --c-dark-2 → --c-ink-2 → --c-ink-3`                   | 首页"主指标"就是深色实心胶囊（`StatOverview` 的 `.bar--dark`）                                                 |
| 斜纹                | 墨色 / 8px 周期 / 1px 线宽 / .28 不透明度 / 122 度                | 逐条照抄 `.bar--striped` 的 `repeating-linear-gradient(122deg, rgba(23,23,26,.28) 0 1px, transparent 1px 8px)` |
| 折痕高光            | 保持库默认白色                                                    | 白细线压在琥珀上是"纸的亮边"，换墨色会变脏边                                                                   |
| 文字三档            | 轴 `--c-ink-3`、闲置 `--c-ink-4`、高亮 `--c-ink`                  | 沿用"闲置淡墨 / 高亮实墨"                                                                                      |
| 网格与 tooltip 描边 | `--c-line`                                                        | 与卡片分隔线同一条线                                                                                           |

单测补一条：替身 `getComputedStyle` 后断言 SVG 里出现 `#f8d97c` 与 `#17171a`、且不再出现库默认蓝灰 `#2B3AD6 / #2A55E2 / #4A78D8`——渐变站点在 `<defs>` 属性上、文字色在 `<style>` 里，所以断言取整段 SVG 标记而非只取 `<style>`。

**无头 Edge 实测**（1260×900，`/#/funnel`）：配色已与米黄外壳同语言，Y 轴不再出现 `k`。但暴露一个新的可读性缺陷，见 §12。

## 12. 漏斗趋势读不出来：旧口径作废与订正

**旧口径（本节初稿）作废**：当时写的是"`stair.bottomOffset: 30 / topOffset: 74` ⇒ 柱顶只有 44px 行程"，并把解法定成"把 `topOffset` 提到 200"。两处都错。

读 `src/charts/fold-bar/geometry.ts:62-63` 后订正：

```
stairBase = plot.bottom - bottomOffset   // value = 0  的柱顶
stairTop  = plot.top    + topOffset      // value = max 的柱顶
```

`topOffset` 是**从绘图区顶部往下留的距离**，调大只会把最高柱压得更矮。真实行程是 `386 − 64(上留白) − 26(下留白) − 74 − 30 = 192px`，本来就不短。

真凶是 `scale.exponent: 2`。库把它推荐给原稿那种 **2:1 跨度**的数据（支付 65.2 → 32.9，平方后末阶仍占 25% 行程）；本漏斗首末差 **10 倍**，平方把后三阶碾进行程最后几像素：

| 阶段 | 归一化 | 平方后 | 平方时柱高 | 线性柱高 |
| ---- | ------ | ------ | ---------- | -------- |
| 560  | 1.000  | 1.000  | 222px      | 222px    |
| 268  | 0.478  | 0.229  | 122px      | 122px    |
| 145  | 0.259  | 0.067  | 43px       | 80px     |
| 78   | 0.139  | 0.019  | 34px       | 57px     |
| 56   | 0.100  | 0.010  | 32px       | 49px     |

**采用的修法**：`scale.exponent: 1`（即回到库默认线性），`stair` 一个数都不动。无头 Edge 复看：五级阶梯与折面全部成立，末阶深色柱 49px 可读，pill 小横条五根都在。

**教训**：`stair` 的两个偏移不是"高度"，是"两端各留多少"，凭字段名猜必错；这类几何参数一律先读 `geometry.ts` 再动。

## 13. 第二次改判（2026-09-29）：撤漏斗，图表改服务「工作进度」

用户判词：**招聘漏斗入口不合理，删除**；**工作进度的图形改用 sk-chart-duo**。

执行：

- 删 `FunnelInsightView.vue`、`ConversionFunnelCard.vue` 及其单测、`/funnel` 路由与 `ROUTE_NAME.funnel`、`FUNNEL_*` 全部数据、首页 hero 的第二个入口胶囊。`DashboardView.vue` 与 `router/index.ts` 因此**回到 HEAD 原状**（已从 `git diff` 中消失）。
- 保留 `sk-chart-duo` 依赖与 `crestioChartTheme.ts`：前者是工作进度卡的渲染方，后者是它的配色来源。
- `WorkProgressCard.vue` 的 `<ul class="chart">`（3px 细条 + CSS 气泡）整体换成 `FoldBarChart`。

### 数据口径被迫订正

原 `PROGRESS_DAYS` 有两个字段：`height`（柱高百分比，装饰用）与 `hours`（'6小时40分' 字符串）。二者**不成正比**——周五 `height: 90` 是最高，但 `hours` 只有 5小时23分，低于周一的 6小时40分。手绘时代没人发现，因为高度是画上去的；换成真图表后柱高必须由数值决定，矛盾立刻暴露。

现改为单一事实源：`{ label, hours: number }`，周末记 `0`。顺带删掉 `active` 与 `faint` 两个标记字段——高亮列由 `state.defaultActive` 指向工时最高的一天（代码里 `reduce` 算出，不写死下标），周末在真数值下自然是 4px 短桩，不需要再靠颜色区分。

### 紧凑画幅的代价（已量化）

卡片图表区只有 ~250px 宽，远低于 §3 的可读下限 748px，因此走 1:1 像素模式，并把原稿按 860×386 调的绝对坐标整套重标：`padding` 46/6/20/6、`stair` 4/6、`fold.run` 6、`labelY` 14、`numberY` 38、`washTop` 46、数值字号 27→12、类目 11.5→10，并关掉 y 轴刻度、竖直网格、柱头 pill 与底部渐隐。

DOM 实测对位正确：柱心 20.5 / 54.5 与文字 x 21 / 55 逐列吻合，0 工时柱高 4px，峰值「一」为深色高亮柱。

**换来的**：键盘 `←`/`→` 导航、`role=listitem` + `aria-selected`、库内建的减弱动效降级。
**丢掉的**：周末淡显（改由 0 值表达）、原 CSS 版 96px 的紧凑度（现 190px，卡片因此变高）。
