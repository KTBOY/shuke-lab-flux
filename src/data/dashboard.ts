/**
 * @Author: zlc
 * @Description: 仪表盘静态内容数据与类型定义（模板项目无后端，数据集中在此便于替换）
 */
import avatar1 from '@/assets/img/avatar-1.webp'
import avatar2 from '@/assets/img/avatar-2.webp'
import avatar3 from '@/assets/img/avatar-3.webp'
import avatar4 from '@/assets/img/avatar-4.webp'
import deviceImg from '@/assets/img/device-macbook.webp'
import portraitImg from '@/assets/img/portrait-shuke.webp'
import type { IconName } from '@/data/icons'

export const AVATARS = [avatar1, avatar2, avatar3, avatar4] as const

/* ---------------- 顶部导航 ---------------- */
/** 菜单里真正跳转的项，标签常量供 AppNavbar 判定渲染成路由链接 */
export const COLOR_LAB_NAV_LABEL = '颜色实验室'

/** 权限星图入口标签，同样是真跳转项 */
export const PERMISSIONS_NAV_LABEL = '权限星图'

/** 用户管理入口标签，由原占位项「员工」落地为真页面 */
export const USERS_NAV_LABEL = '用户管理'

/** 还没有对应页面的菜单项，暂收起来；补上页面后拼回 NAV_ITEMS 即可 */
export const PLACEHOLDER_NAV_ITEMS = ['招聘', '设备', '应用', '薪酬', '日历', '评价'] as const

export const NAV_ITEMS = [
  '仪表盘',
  USERS_NAV_LABEL,
  PERMISSIONS_NAV_LABEL,
  COLOR_LAB_NAV_LABEL,
] as const

export const ACTIVE_NAV = '仪表盘'

export const BRAND = 'Crestio'
export const SETTING_LABEL = '设置'
export const WELCOME_TITLE = '欢迎回来'

/** 标题行的时间基线：与日程卡锚定周（CALENDAR.anchor 所在周的周一至周五）对齐，给全屏一个坐标系 */
export const DASHBOARD_WEEK_LABEL = '本周 · 9月23日–27日'

/** 示例数据角标：本屏数据全部是静态演示数据，整屏与日程卡共用这一枚标记，不另写第二份文案 */
export const SAMPLE_BADGE_LABEL = '示例数据'

/* ---------------- 指标进度条 ---------------- */
export interface StatBar {
  label: string
  /** 百分比数值，同时决定轨道内填充的长度 */
  value: number
  /** 一词基线：这个百分比的分母是谁（占月计划 / 占季度目标……），与数值同屏出现 */
  baseline: string
}

/* 四条胶囊同一种轨道 + 同一种填充，差异只由数值（填充长度）表达，不再各换一种画法 */
export const STAT_BARS: StatBar[] = [
  { label: '面试量', value: 15, baseline: '占月计划' },
  { label: '已录用', value: 15, baseline: '占季度目标' },
  { label: '项目工时', value: 60, baseline: '占总工时' },
  { label: '产出比', value: 10, baseline: '占月目标' },
]

/** 指标定性：delta 上不上色看含义不看方向，计数类涨跌无好坏一律 neutral */
export type KpiSentiment = 'positive' | 'negative' | 'neutral'

export interface KpiStat {
  icon: IconName
  value: number
  label: string
  /** 较上周的净变化，正负决定徽标朝向 */
  delta: number
  /** 变化的含义：positive = 涨是好事，negative = 涨是坏事，neutral = 涨跌无好坏、delta 走灰 */
  sentiment: KpiSentiment
  /** 近七周的相对高度（0–1）。只画形状、不标读数，避免和主数值口径打架 */
  trend: number[]
}

export const KPI_STATS: KpiStat[] = [
  {
    icon: 'people',
    value: 78,
    label: '员工',
    delta: 6,
    sentiment: 'neutral',
    trend: [0.35, 0.45, 0.4, 0.6, 0.55, 0.8, 1],
  },
  {
    icon: 'person-plus',
    value: 56,
    label: '招聘',
    delta: 12,
    sentiment: 'neutral',
    trend: [0.2, 0.3, 0.5, 0.45, 0.7, 0.65, 0.9],
  },
  {
    icon: 'briefcase',
    value: 203,
    label: '项目',
    delta: -3,
    sentiment: 'neutral',
    trend: [0.9, 0.85, 0.8, 0.7, 0.75, 0.6, 0.55],
  },
]

/** 环比徽标前的说明文字，上屏可见（不只给屏幕阅读器） */
export const KPI_DELTA_LABEL = '较上周'

/** 点阵趋势的时间窗标注，与 delta 的「较上周」是两个窗口，必须各自标明 */
export const KPI_TREND_LABEL = '近七周'

/* ---------------- 作者身份 ---------------- */
export interface AuthorLink {
  icon: IconName
  label: string
  /** 展示用的短域名 */
  hint: string
  href: string
}

export const AUTHOR = {
  name: '舒克-KTBOY',
  year: 2026,
  links: [
    {
      icon: 'globe',
      label: '个人网站',
      hint: 'ktboy.github.io',
      href: 'https://ktboy.github.io/sh-design/',
    },
    {
      icon: 'code-branch',
      label: 'GitHub',
      hint: 'github.com/KTBOY',
      href: 'https://github.com/KTBOY',
    },
  ] as AuthorLink[],
}

/* ---------------- 页脚技术栈 ---------------- */
/** 只列名字不写版本号：版本随依赖升级变动，写进页脚一定会和实际构建脱节 */
export const TECH_STACK = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'WebGL GLSL',
  'sk-chart',
  'Vitest',
] as const

/** 与 AGENTS.md「不新增运行时依赖」同源的自我约束，作为脚注而非卖点陈列；图表库是该约束的唯一豁免 */
export const STACK_NOTE =
  '无 UI 组件库 / 图标库 / 原子 CSS，样式取自 tokens.css 设计令牌，图表由 sk-chart-duo 渲染并沿用同一套令牌'

/* ---------------- 员工档案 ---------------- */
export const PROFILE = {
  name: AUTHOR.name,
  role: 'UX/UI 设计师',
  photo: portraitImg,
}

export interface InfoRow {
  label: string
  value: string
  /** 合计类数值，视觉上加粗 */
  emphasis?: boolean
}

export interface AccordionItem {
  key: string
  label: string
  rows: InfoRow[]
  /** 标签集合，渲染为胶囊组 */
  tags?: string[]
  /** 设备面板专属内容 */
  device?: { name: string; spec: string; image: string }
}

export const ACCORDION_ITEMS: AccordionItem[] = [
  {
    key: 'pension',
    label: '养老金缴纳',
    rows: [
      { label: '缴纳基数', value: '¥ 24,000' },
      { label: '单位缴纳 16%', value: '¥ 3,840' },
      { label: '个人缴纳 8%', value: '¥ 1,920' },
    ],
  },
  {
    key: 'devices',
    label: '办公设备',
    rows: [{ label: '领用日期', value: '2023-04-17' }],
    device: { name: 'MacBook Air', spec: 'M1 版本', image: deviceImg },
  },
  {
    key: 'compensation',
    label: '薪酬汇总',
    rows: [
      { label: '基本工资', value: '¥ 18,000' },
      { label: '岗位津贴', value: '¥ 3,000' },
      { label: '季度绩效', value: '¥ 3,000' },
      /* 应发 24,000 − 个人养老金 1,920 = 22,080，屏上唯一扣除项就是养老金，实发必须对得平 */
      { label: '实发合计', value: '¥ 22,080', emphasis: true },
    ],
  },
  {
    key: 'benefits',
    label: '员工福利',
    rows: [{ label: '生效状态', value: '已生效' }],
    tags: ['五险一金', '补充医疗', '年度体检', '交通补贴', '弹性工时'],
  },
]

/** 默认展开的手风琴项 */
export const DEFAULT_ACTIVE_PANEL = 'devices'

/* ---------------- 工作进度卡片 ---------------- */
export interface ProgressDay {
  label: string
  /** 当日工时（小时）；柱高直接由它决定，不再另设装饰性高度字段 */
  hours: number
}

export const PROGRESS_CARD = {
  title: '工作进度',
  unit: '小时',
  caption: '工作时长',
  subCaption: '本周',
  /** 悬停/聚焦某天时读给屏幕阅读器的模板 */
  readout: '{label} {value} 小时',
}

/**
 * 工时按真实打卡的口径取「整分钟」的小时数（4.58 = 4 小时 35 分）。
 * 台阶设在每日 0.7～0.9 小时：落差小于 0.5 五根柱看不出高低，大于 1.5 就变成锯齿、
 * 像数据出错而不是工作量波动。形状讲一个故事——周初收作业、周中爬到峰值、周五回落。
 * 只列工作日：休息日没有工时，画出来只是两条贴地扁条，纯噪声。
 */
export const PROGRESS_DAYS: ProgressDay[] = [
  { label: '一', hours: 4.58 },
  { label: '二', hours: 5.5 },
  { label: '三', hours: 6.25 },
  { label: '四', hours: 6.92 },
  { label: '五', hours: 6.08 },
]

/** 上周合计工时，环比由它现算，避免写死的差值与 PROGRESS_DAYS 漂移 */
export const PROGRESS_PREV_TOTAL = 27.2

/**
 * 合计口径以「柱顶标签显示值」为准：图表标签是 hours 的一位小数（4.6/5.5/6.3/6.9/6.1），
 * 读者把标签相加得到 29.4；若合计按原始值算（29.33 → 29.3），同一数字在同屏出现两个版本。
 * 故先取标签值再求和，日均与环比都从这个合计派生，保证全卡只有一个口径。
 */
const labelHours = PROGRESS_DAYS.map((day) => Number(day.hours.toFixed(1)))
const weekTotal = labelHours.reduce((sum, hours) => sum + hours, 0)
const weekAvg = weekTotal / PROGRESS_DAYS.length
const deltaHours = weekTotal - PROGRESS_PREV_TOTAL

/** 标题行的「本周日均工时」：与合计同源（标签值求和后取均值） */
export const PROGRESS_WEEK_AVG: string = weekAvg.toFixed(1)

export interface ProgressCompositionRow {
  label: string
  /** 占比百分比，同时决定条宽 */
  value: number
}

/** 工时卡右侧「解读」栏：只留数字事实（合计、环比、构成），结论句与原因句不上屏 */
export const PROGRESS_INSIGHT = {
  title: '解读',
  totalLabel: '本周合计',
  total: weekTotal.toFixed(1),
  unit: '小时',
  compositionTitle: '工时构成',
  composition: [
    { label: '开发与修复', value: 54 },
    { label: '会议与评审', value: 27 },
    { label: '临时插入', value: 19 },
  ] as ProgressCompositionRow[],
}

export const PROGRESS_DELTA = {
  label: 'vs 上周',
  dir: deltaHours >= 0 ? ('up' as const) : ('down' as const),
  hours: `${deltaHours >= 0 ? '+' : '−'}${Math.abs(deltaHours).toFixed(1)}`,
  percent: `${deltaHours >= 0 ? '+' : '−'}${Math.round(Math.abs((deltaHours / PROGRESS_PREV_TOTAL) * 100))}%`,
  /** 工时多寡本身无好坏，环比不上语义色、走灰（与 KPI 的定性口径一致） */
  sentiment: 'neutral' as KpiSentiment,
}

/* ---------------- 工时计时卡片 ---------------- */
export const TIME_TRACKER_CARD = {
  title: '工时计时',
  /** 初始工时 02:35，展示格式 HH:MM */
  initialSeconds: 2 * 3600 + 35 * 60,
  /** 全天目标时长（秒）：圆环编码「已计时长 / 目标」，不再写死百分比 */
  targetSeconds: 8 * 3600,
  /** 环下的一词基线：圆环的分母 */
  targetLabel: '目标 8 小时',
  caption: '工作时长',
}

/* ---------------- 入职进度卡片 ---------------- */
export interface OnboardingBar {
  label: string
  value: number
  /** 分项名称，展示在胶囊内 */
  tag: string
  variant: 'accent' | 'dark' | 'plain'
  /**
   * 与任务清单同源的分项：渲染时 label/value 由 useOnboardingTasks 现算覆盖，
   * 数据里不写第二份常数，避免同屏出现两个完成率。
   */
  fromTasks?: boolean
}

export const ONBOARDING_CARD = {
  title: '入职进度',
  bars: [
    { label: '', value: 0, tag: '任务', variant: 'accent', fromTasks: true },
    { label: '25%', value: 25, tag: '培训', variant: 'dark' },
    { label: '0%', value: 0, tag: '评估', variant: 'plain' },
  ] as OnboardingBar[],
  /** 未开始分项（value 为 0）的标记词：虚线描边之外再给一个文字 chip，不靠猜 */
  notStartedLabel: '未开始',
  /** 底部说明文案模板，{rest} 由任务清单实际数据填充 */
  footer: '还剩 {rest} 项待完成',
}

/* ---------------- 洞察卡片 ---------------- */
export interface InsightFact {
  /** 大数字，允许 {占位符}，由组件按页面实际状态填充 */
  value: string
  /** 一词基线：这个数字是什么 */
  label: string
  /** 解释只进 tooltip（title），不上屏成句；允许 {占位符} */
  hint: string
}

export const INSIGHT_CARD = {
  chip: '洞察',
  /** 三个事实块的数值全部取自本页其它卡的同一份数据，不另立口径、不写无出处的估算 */
  facts: [
    {
      value: '{taskRate}%',
      label: '入职任务',
      hint: '已完成 {done}/{total} 项',
    },
    {
      value: '{weekTotal}',
      label: '本周工时',
      hint: '单位：小时；环比上周 {deltaPercent}',
    },
    {
      value: '{devShare}%',
      label: '开发与修复',
      hint: '会议与评审 {meetingShare}%，临时插入 {insertShare}%',
    },
  ] as InsightFact[],
}

export interface TaskItem {
  icon: IconName
  title: string
  time: string
  done: boolean
}

export const ONBOARDING_TASKS = {
  title: '入职任务清单',
  /** 卡头未完成计数标记的文案模板，{rest} 由清单实际状态填充；强调色只给它 */
  restChip: '还剩 {rest} 项',
  /** 全部完成时的空状态文案：清单还在（可点回），但「待办」一栏已经空了 */
  allDoneLabel: '全部完成',
  /** 清单一条都没有时的空状态文案 */
  emptyLabel: '暂无任务',
  /* 总数不再单列字段：一律以 items.length 为准，清单几行就是几项，不留幻影项 */
  items: [
    { icon: 'message', title: '入职面试', time: '9月13日 08:30', done: true },
    { icon: 'zap', title: '团队会议', time: '9月13日 10:30', done: true },
    { icon: 'disc', title: '项目同步', time: '9月13日 13:00', done: false },
    { icon: 'paperclip', title: '讨论 Q3 目标', time: '9月13日 14:45', done: false },
    { icon: 'link', title: 'HR 制度宣讲', time: '9月13日 16:30', done: false },
  ] as TaskItem[],
}

/* ---------------- 日程表卡片 ---------------- */
export interface CalendarDay {
  weekday: string
  date: number
  today?: boolean
}

/** 星期名，下标与 Date.getDay() 对齐 */
export const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

export const CALENDAR = {
  /** 网格首日（2024-09-23，周一）；切换月份时以此为基准推算表头 */
  anchor: new Date(2024, 8, 23),
  /** 可视列数 */
  dayCount: 6,
  /** 默认高亮为「今天」的列下标；只在锚定月（偏移 0）出现，切月后不跟着走 */
  todayIndex: 2,
  /** 全天工作时段逐小时成行，网格不再只露上午四行、下半截空着 */
  rows: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
}

/** 当前显示月份一条事件都没有时的空状态文案 */
export const SCHEDULE_EMPTY_LABEL = '本月暂无日程'

export interface ScheduleEvent {
  title: string
  desc: string
  /** 所属月份相对锚定月（2024-09）的偏移：事件按显示月份过滤，不再钉死在每一月 */
  monthOffset: number
  /** 起始列（1 起，对应 days 下标 +1） */
  col: number
  /** 跨列数 */
  span: number
  /** 起始行（1 起，对应 rows 下标 +1）；事件固定跨 2 个小时行（日历事件是时间块，不是单行标签） */
  row: number
  theme: 'dark' | 'light'
  avatars: string[]
}

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    title: '周会同步',
    desc: '讨论各项目进展',
    monthOffset: 0,
    col: 2,
    span: 2,
    row: 2,
    theme: 'dark',
    avatars: [avatar1, avatar2, avatar3],
  },
  {
    title: '新人入职宣讲',
    desc: '新成员认识与介绍',
    monthOffset: 0,
    col: 4,
    span: 2,
    row: 3,
    theme: 'light',
    avatars: [avatar4, avatar1],
  },
  {
    title: '季度复盘',
    desc: 'Q3 目标对齐与复盘',
    monthOffset: 1,
    col: 3,
    span: 2,
    row: 2,
    theme: 'light',
    avatars: [avatar2, avatar3],
  },
]

/* ---------------- 二级页入口（首页 hero 右侧胶囊） ---------------- */
export interface PageEntry {
  /** 首页入口胶囊的图标 */
  icon: IconName
  title: string
  desc: string
  action: string
}

export const COLOR_LAB_ENTRY: PageEntry = {
  icon: 'disc',
  title: 'FLUX 颜色生成器',
  desc: 'WebGL 流体色彩 · 6 套配色主题，悬停与鼠标搅动会加快流速',
  action: '进入颜色实验室',
}

export interface FluxStudioUi {
  /** 左栏筛选区的小标题 */
  filtersTitle: string
  /** 筛选栏「全部」按钮文案 */
  filterAll: string
  flowPause: string
  flowResume: string
  /** 材质交互提示，首次进入时告诉用户胶囊是可以搅动的 */
  hint: string
  /** 指向旧版零依赖单文件的按钮文案 */
  toLegacy: string
  /** 计数器的分母说明，如「套主题」 */
  counterUnit: string
  /** 把当前选中的 FLUX 主题应用为全站仪表盘主题的按钮文案 */
  applyToDashboard: string
  /** 应用成功后按钮短暂显示的反馈文案，后接主题英文名 */
  applyDone: string
  /** 筛选为「全部」时应用按钮禁用，title 里给出的原因 */
  applyNeedSelect: string
  /** 恢复 tokens.css 默认主题的按钮文案 */
  restoreDefault: string
  /** 导出当前选中主题的 CSS 变量文件按钮文案 */
  exportCss: string
  /** 导出当前选中主题的 JSON 色板文件按钮文案 */
  exportJson: string
  /** 导出成功后按钮短暂显示的反馈文案，后接主题英文名 */
  exportDone: string
  /** 筛选为「全部」时导出按钮禁用，title 里给出的原因 */
  exportNeedSelect: string
}

export const FLUX_STUDIO_UI: FluxStudioUi = {
  filtersTitle: '配色主题',
  filterAll: '全部',
  flowPause: '暂停流动',
  flowResume: '继续流动',
  hint: '把指针放进胶囊里划动，云雾会被搅动，停下后约一秒平滑回落',
  toLegacy: '旧版单文件页',
  counterUnit: '套主题',
  applyToDashboard: '应用到仪表盘',
  applyDone: '已应用',
  applyNeedSelect: '先在左栏选一套主题，再应用到仪表盘',
  restoreDefault: '恢复默认主题',
  exportCss: '导出 CSS',
  exportJson: '导出 JSON',
  exportDone: '已导出',
  exportNeedSelect: '先在左栏选一套主题，再导出它的配色',
}

export interface NotFoundUi {
  /** 大号状态码 */
  code: string
  /** 一句话点明这一页不存在 */
  title: string
  /** 辅助说明：地址可能写错，或页面已被挪走 */
  desc: string
  /** 回颜色实验室（首页）的入口文案 */
  toColorLab: string
  /** 去仪表盘的入口文案 */
  toDashboard: string
}

export const NOT_FOUND_UI: NotFoundUi = {
  code: '404',
  title: '这一页找不到了',
  desc: '地址可能写错了，或者这一页已经被挪走。挑个熟悉的地方回去吧。',
  toColorLab: '回颜色实验室',
  toDashboard: '去仪表盘',
}

export interface FluxLegacyUi {
  /** 旧版页标题，点明它是零依赖单文件而非 Vue 实现 */
  title: string
  /** 说明旧版与 Vue 版的关系，避免读者以为是两个不同的产品 */
  desc: string
  /** iframe 的无障碍标题，屏幕阅读器据此读出框架内容 */
  frameTitle: string
  /** 指回 Vue 版的按钮文案 */
  toStudio: string
  /** 直接打开裸单文件页的按钮文案 */
  openExternal: string
}

export const FLUX_LEGACY_UI: FluxLegacyUi = {
  title: 'FLUX 颜色生成器 · 旧版单文件',
  desc: 'public/flux/index.html 原样发布，不参与构建、零依赖；材质与交互与 Vue 版等价',
  frameTitle: 'FLUX 流体色彩实验',
  toStudio: '返回 Vue 版',
  openExternal: '新窗口打开',
}

export interface LoginUi {
  /** 左侧深色面板的一句口号，压在 FLUX 胶囊下方 */
  slogan: string
  /** 口号下面的弱说明：点明管理区与实验室的公开口径 */
  visualNote: string
  /** 表单标题 */
  title: string
  /** 表单副标题：说明登录只针对管理区 */
  subtitle: string
  /** 演示模式明示横幅：不装真鉴权，任意非空密码即可 */
  demoHint: string
  /** 身份选择字段名 */
  userLabel: string
  /** 身份未选时的占位项 */
  userPlaceholder: string
  /** 身份字段下面展示所选用户角色时的前缀 */
  rolesLabel: string
  /** 密码字段名 */
  passwordLabel: string
  /** 密码输入占位 */
  passwordPlaceholder: string
  /** 校验：未选身份 */
  userRequired: string
  /** 校验：密码为空 */
  passwordRequired: string
  /** 登录按钮默认文案 */
  submit: string
  /** 减动效降级时按钮上的进行中文案 */
  submitting: string
  /** 一键体验按钮文案（以默认演示用户直接进入） */
  quickEntry: string
  /** 一键体验的弱说明 */
  quickEntryHint: string
  /** 登录页回公开实验室的链接文案 */
  toColorLab: string
  /** 顶栏未登录时登录入口的文案 */
  navLogin: string
  /** 顶栏账号菜单的可访问名与标题 */
  accountMenuLabel: string
  /** 顶栏账号菜单里的退出动作 */
  logout: string
}

export const LOGIN_UI: LoginUi = {
  slogan: '让固定容器里的颜色与材质活起来',
  visualNote: '颜色实验室始终公开；仪表盘、用户管理与权限星图在登录之后',
  title: '登录工作台',
  subtitle: '选一个演示身份进入管理区，实验室不登录也能逛',
  demoHint: '演示模式：任意非空密码即可登录，不校验真实凭据',
  userLabel: '登录身份',
  userPlaceholder: '请选择一位演示用户',
  rolesLabel: '持有角色',
  passwordLabel: '密码',
  passwordPlaceholder: '任意非空密码',
  userRequired: '先选一个登录身份',
  passwordRequired: '密码不能为空（演示模式下任意填写即可）',
  submit: '登录',
  submitting: '登录中…',
  quickEntry: '一键体验',
  quickEntryHint: '以周明远（超级管理员）直接进入，不用填密码',
  toColorLab: '先逛逛颜色实验室',
  navLogin: '登录',
  accountMenuLabel: '账号',
  logout: '退出登录',
}
