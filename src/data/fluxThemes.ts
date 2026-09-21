/**
 * @Author: zlc
 * @Description: FLUX 主题数据 —— 六套配色的三个主色，直接作为着色器 uniform 传入
 *               与 public/flux/index.html 的 CARDS 同源；旧页是冻结的零依赖副本，
 *               新增或调整主题以这份为准，再按需同步旧页
 */

/** 线性归一化的 RGB 三分量，取值 0~1 */
export type FluxRgb = readonly [number, number, number]

export interface FluxTheme {
  id: string
  /** 展示用英文名 */
  en: string
  /** 展示用中文名 */
  cn: string
  /** PAID 标签前景色，CSS 颜色值 */
  paid: string
  /** 三个主色，顺序对应着色器的 uC1 / uC2 / uC3 */
  colors: readonly [FluxRgb, FluxRgb, FluxRgb]
}

export const FLUX_THEMES: readonly FluxTheme[] = [
  {
    id: 'original',
    en: 'ORIGINAL',
    cn: '原始版本',
    paid: '#f0679e',
    // 粉 / 橙 / 紫红
    colors: [
      [1.0, 0.31, 0.62],
      [1.0, 0.55, 0.25],
      [0.72, 0.24, 1.0],
    ],
  },
  {
    id: 'aurora',
    en: 'AURORA',
    cn: '极光',
    paid: '#2fbf8f',
    // 青绿 / 蓝 / 紫
    colors: [
      [0.08, 0.88, 0.58],
      [0.18, 0.48, 1.0],
      [0.55, 0.25, 0.95],
    ],
  },
  {
    id: 'klein',
    en: 'KLEIN',
    cn: '克莱因',
    paid: '#e08a3c',
    // 克莱因蓝 / 蓝 / 橙
    colors: [
      [0.0, 0.18, 0.65],
      [0.13, 0.25, 0.85],
      [1.0, 0.36, 0.12],
    ],
  },
  {
    id: 'ultraviolet',
    en: 'ULTRAVIOLET',
    cn: '超 VIOLET',
    paid: '#7a52d6',
    // 紫 / 黄绿 / 深紫
    colors: [
      [0.48, 0.24, 1.0],
      [0.72, 0.83, 0.24],
      [0.3, 0.17, 0.63],
    ],
  },
  {
    id: 'chrome',
    en: 'CHROME',
    cn: '铬',
    paid: '#8a8a8a',
    // 灰阶三档
    colors: [
      [0.13, 0.13, 0.13],
      [0.55, 0.55, 0.55],
      [0.82, 0.82, 0.82],
    ],
  },
  {
    id: 'sunset',
    en: 'SUNSET',
    cn: '落日',
    paid: '#e0a030',
    // 金橙 / 绯红 / 梅紫
    colors: [
      [1.0, 0.72, 0.18],
      [1.0, 0.34, 0.28],
      [0.62, 0.14, 0.44],
    ],
  },
] as const

/** 卡片上的占位标价，六张卡通用 */
export const FLUX_CARD_PRICE = '$128.00'

/** 筛选栏「全部」的取值，与主题 id 区分开 */
export const FLUX_FILTER_ALL = 'all'
