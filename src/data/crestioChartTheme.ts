/**
 * @Description: 漏斗图的 crestio 皮肤 —— 运行时从 tokens.css 取色，让 sk-chart 走首页既有的图形语言而非库默认蓝灰
 */
import type { ThemePack } from 'sk-chart-duo'

/** 库的渐变站点是 [offset, color]，GradientStop 未导出，此处声明同形 */
type GradientStop = readonly [number, string]

/**
 * 只取自定义属性本身，不做兜底：tokens.css 在 main.ts 里先于一切组件加载，取不到就是漏引样式，
 * 用硬编码色值兜底会把"两处色值漂移"这种问题藏起来。
 */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * 追加两位十六进制 alpha。只对 6 位十六进制令牌成立（--c-accent 等均为十六进制）；
 * rgba 形态的令牌（--c-line）不要过这个函数，直接用原值。
 */
function alpha(hex: string, aa: string): string {
  return `${hex}${aa}`
}

export function crestioChartTheme(): ThemePack {
  const accent = token('--c-accent')
  const accentDeep = token('--c-accent-deep')
  const accentSoft = token('--c-accent-soft')
  const ink = token('--c-ink')
  const ink2 = token('--c-ink-2')
  const ink3 = token('--c-ink-3')
  const ink4 = token('--c-ink-4')
  const dark = token('--c-dark')
  const dark2 = token('--c-dark-2')
  const line = token('--c-line')
  const surface = token('--c-surface')
  const panelSoft = token('--c-panel-soft')

  // 形参类型让字面量按元组而非 number[] 推断，省掉每处 as const
  const gradient = (...pairs: Array<[number, string]>): GradientStop[] => pairs

  return {
    style: {
      // 闲置柱：琥珀由深到浅落回卡片底色（--c-panel-soft 的同色相）
      barGradient: {
        normal: gradient([0, accentDeep], [0.42, accent], [0.82, accentSoft], [1, panelSoft]),
        // 高亮柱：首页"主指标"用的是深色实心胶囊（.bar--dark），末阶正是结果指标
        active: gradient([0, dark], [0.42, dark2], [0.82, ink2], [1, ink3]),
      },
      /**
       * 斜纹照抄 StatOverview 的 .bar--striped：
       * repeating-linear-gradient(122deg, rgba(23,23,26,.28) 0 1px, transparent 1px 8px)
       * 即 8px 周期 / 1px 线宽 / 墨色 .28 不透明度 / 122 度。
       */
      stripePattern: {
        enabled: true,
        size: 8,
        lineWidth: 1,
        lineColor: ink,
        lineOpacity: 0.28,
        rotation: 122,
      },
      foldGradient: gradient([0, accent], [0.38, accentSoft], [1, surface]),
      // 折痕高光保持白色：白细线压在琥珀上就是"纸的亮边"，换成墨色会变成脏边
      washGradient: gradient(
        [0, alpha(accent, '00')],
        [0.55, alpha(accent, '59')],
        [1, alpha(accentDeep, 'A6')],
      ),
      pill: {
        gradient: gradient([0, accentSoft], [0.45, accent], [1, accentDeep]),
        shadow: { color: accentDeep, opacity: 0.75 },
      },
      shadow: { color: ink, opacity: 0.14 },
    },
    tokens: {
      fontFamily: token('--ff-base'),
      title: { fill: ink },
      axis: { fill: ink3 },
      // 类目与数值都遵循"闲置淡墨、高亮实墨"，与首页其它卡的层级一致
      label: { fill: ink4, activeFill: ink },
      number: { fill: ink4, activeFill: ink },
      grid: { stroke: line, strokeWidth: 1 },
      tooltip: {
        bg: surface,
        stroke: line,
        fill: ink2,
        strongFill: ink,
        softFill: ink4,
      },
    },
  }
}
