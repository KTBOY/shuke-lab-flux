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
export const NAV_ITEMS = ['仪表盘', '员工', '招聘', '设备', '应用', '薪酬', '日历', '评价'] as const

export const ACTIVE_NAV = '仪表盘'

export const BRAND = 'Crestio'
export const SETTING_LABEL = '设置'
export const WELCOME_TITLE = '欢迎回来，Nixtio'

/* ---------------- 指标进度条 ---------------- */
export type StatBarVariant = 'dark' | 'accent' | 'striped' | 'outline'

export interface StatBar {
  label: string
  /** 百分比数值，同时决定胶囊宽度 */
  value: number
  variant: StatBarVariant
}

export const STAT_BARS: StatBar[] = [
  { label: '面试量', value: 15, variant: 'dark' },
  { label: '已录用', value: 15, variant: 'accent' },
  { label: '项目工时', value: 60, variant: 'striped' },
  { label: '产出比', value: 10, variant: 'outline' },
]

export interface KpiStat {
  icon: IconName
  value: number
  label: string
}

export const KPI_STATS: KpiStat[] = [
  { icon: 'people', value: 78, label: '员工' },
  { icon: 'person-plus', value: 56, label: '招聘' },
  { icon: 'briefcase', value: 203, label: '项目' },
]

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

/* ---------------- 员工档案 ---------------- */
export const PROFILE = {
  name: AUTHOR.name,
  role: 'UX/UI 设计师',
  amount: '$1,200',
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
      { label: '实发合计', value: '¥ 22,680', emphasis: true },
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
  /** 柱体高度百分比 */
  height: number
  /** 当日工时，用于气泡展示 */
  hours: string
  active?: boolean
  /** 浅色未激活（周末）柱 */
  faint?: boolean
}

export const PROGRESS_CARD = {
  title: '工作进度',
  value: '6.1',
  unit: '小时',
  caption: '工作时长',
  subCaption: '本周',
}

export const PROGRESS_DAYS: ProgressDay[] = [
  { label: '日', height: 22, hours: '0小时00分', faint: true },
  { label: '一', height: 78, hours: '6小时40分' },
  { label: '二', height: 58, hours: '5小时05分' },
  { label: '三', height: 42, hours: '3小时30分' },
  { label: '四', height: 74, hours: '6小时10分' },
  { label: '五', height: 90, hours: '5小时23分', active: true },
  { label: '六', height: 18, hours: '0小时00分', faint: true },
]

/* ---------------- 工时计时卡片 ---------------- */
export const TIME_TRACKER_CARD = {
  title: '工时计时',
  /** 初始工时 02:35，展示格式 HH:MM */
  initialSeconds: 2 * 3600 + 35 * 60,
  /** 环形进度百分比 */
  progress: 72,
  caption: '工作时长',
}

/* ---------------- 入职进度卡片 ---------------- */
export interface OnboardingBar {
  label: string
  value: number
  /** 分项名称，展示在胶囊内 */
  tag: string
  variant: 'accent' | 'dark' | 'plain'
}

export const ONBOARDING_CARD = {
  title: '入职进度',
  rate: 18,
  bars: [
    { label: '30%', value: 30, tag: '任务', variant: 'accent' },
    { label: '25%', value: 25, tag: '培训', variant: 'dark' },
    { label: '0%', value: 0, tag: '评估', variant: 'plain' },
  ] as OnboardingBar[],
  /** 底部说明文案模板，{rest} 由任务清单实际数据填充 */
  footer: '还剩 {rest} 项待完成',
}

export interface TaskItem {
  icon: IconName
  title: string
  time: string
  done: boolean
}

export const ONBOARDING_TASKS = {
  title: '入职任务清单',
  total: 8,
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
  /** 默认高亮为「今天」的列下标 */
  todayIndex: 2,
  rows: ['08:00', '09:00', '10:00', '11:00'],
}

export interface ScheduleEvent {
  title: string
  desc: string
  /** 起始列（1 起，对应 days 下标 +1） */
  col: number
  /** 跨列数 */
  span: number
  /** 起始行（1 起，对应 rows 下标 +1） */
  row: number
  theme: 'dark' | 'light'
  avatars: string[]
}

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    title: '周会同步',
    desc: '讨论各项目进展',
    col: 2,
    span: 2,
    row: 2,
    theme: 'dark',
    avatars: [avatar1, avatar2, avatar3],
  },
  {
    title: '新人入职宣讲',
    desc: '新成员认识与介绍',
    col: 4,
    span: 2,
    row: 3,
    theme: 'light',
    avatars: [avatar4, avatar1],
  },
]

/* ---------------- 颜色生成器入口 ---------------- */
export interface ColorLabEntry {
  icon: IconName
  /** 入口胶囊与实验室工具栏共用的页面名 */
  title: string
  /** 一句话说明实际能力，用于工具栏副标题 */
  desc: string
  /** 首页入口按钮文案 */
  action: string
  /** 实验室工具栏返回按钮文案 */
  back: string
  /** 工具栏「新窗口打开」文案 */
  openExternal: string
  /** iframe 的无障碍标题，屏幕阅读器据此读出框架内容 */
  frameTitle: string
}

export const COLOR_LAB_ENTRY: ColorLabEntry = {
  icon: 'disc',
  title: 'FLUX 颜色生成器',
  desc: 'WebGL 流体色彩 · 6 套配色主题，悬停与鼠标搅动会加快流速',
  action: '进入颜色实验室',
  back: '返回仪表盘',
  openExternal: '新窗口打开',
  frameTitle: 'FLUX 流体色彩实验',
}
