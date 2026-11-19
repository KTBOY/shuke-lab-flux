/**
 * @Description: sk-chart 图表的 crestio 皮肤 —— 运行时从 tokens.css 取色，让图表走首页既有的图形语言而非库默认蓝灰
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
  const line = token('--c-line')
  const surface = token('--c-surface')

  // 形参类型让字面量按元组而非 number[] 推断，省掉每处 as const
  const gradient = (...pairs: Array<[number, string]>): GradientStop[] => pairs

  return {
    style: {
      /**
       * 闲置柱平涂浅档：accent 30% 两端同色，不再渐变落回卡面底色。
       * 旧渐变让柱底「溶」进背景，长度编码的共同基线被吃掉，柱高只能靠读柱顶数字比；
       * 平涂后柱体与卡面之间始终有一条明确的底边，长度才可比。
       * 30% 走 alpha 后缀（与 washGradient 同一条路径），色相仍是令牌原色。
       */
      barGradient: {
        normal: gradient([0, alpha(accent, '4D')], [1, alpha(accent, '4D')]),
        /**
         * 高亮柱保留渐变（深阶 → 主色），与闲置柱的平涂拉开区分；桥接后两端已是同色相
         * （accent-deep 由 accent 同色深阶派生），渐变只剩明度差，不再跨色。
         * 墨色阶（--c-dark）会把峰值柱画成暖卡里唯一的黑块，
         * 而这条渐变同时就是悬停态——等于每一根柱悬停上去都闪一次黑。
         */
        active: gradient([0, accentDeep], [0.55, accent], [1, accent]),
      },
      /**
       * 斜纹关闭：它原先照抄 StatOverview 的 striped 胶囊，两处是一套纹理语言；
       * 胶囊已统一为轨道 + 平涂填充（斜纹没有留下明确语义），图表这边一并关掉，
       * 免得同一屏里斜纹在柱子上继续无义地存在。
       */
      stripePattern: {
        enabled: false,
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
      // 类目与数值都遵循"闲置淡墨、高亮实墨"；闲置档停在 ink-2：
      // 再浅一档（ink-4 约 1.8:1）在暖底上读不出字，过不了小字 4.5:1 的对比度线
      label: { fill: ink2, activeFill: ink },
      number: { fill: ink2, activeFill: ink },
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
