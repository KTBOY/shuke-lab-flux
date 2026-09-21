/**
 * @Author: zlc
 * @Description: FLUX 片元着色器源码 —— 与 public/flux/index.html 内联版本同源，逐行等价
 *               用 TS 模板字符串承载是为了进构建、被类型检查与打包器处理，不引入 .glsl 加载插件
 */

/** 全屏三角形：三个顶点覆盖整个裁剪空间，省掉索引缓冲 */
export const FLUX_VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

/**
 * 域扭曲 FBM（Domain-Warped FBM）驱动的三色云雾：
 * 两层分形噪声互相推挤产生水彩质感，左侧渐隐留白给文字，uHover 让颜色在悬停时更饱满。
 */
export const FLUX_FRAG = /* glsl */ `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uHover;
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;
uniform float uSeed;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.55;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.0 + 3.7;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 1.6;
  float t = uTime;

  /* 域扭曲:两层噪声互相推动,颜色像在"呼吸" */
  vec2 q = vec2(fbm(p + t * vec2(0.6, 0.2)),
                fbm(p + t * vec2(-0.4, 0.5) + 5.2));
  vec2 r = vec2(fbm(p + 2.2 * q + t * vec2(0.3, -0.4) + 1.7),
                fbm(p + 2.2 * q + t * vec2(-0.2, 0.3) + 8.3));
  float f = fbm(p + 2.4 * r);

  /* 三色混合 */
  vec3 col = mix(uC1, uC2, smoothstep(0.15, 0.62, f));
  col = mix(col, uC3, smoothstep(0.60, 0.95, clamp(q.x * 1.3, 0.0, 1.0)));
  col += 0.15 * r.y * uC2;              /* 高光泛色 */
  /* 悬停时颜色变饱满,配合缓动形成明显但柔和的反馈 */
  col = mix(col, col * col * 1.35 + col * 0.12, uHover * 0.55);

  /* 白色叠加:左侧约四成留白给文字,颜色向右渐浓 */
  float colorZone = smoothstep(0.30, 0.80, uv.x + 0.15 * (q.y - 0.5));
  /* 顶部淡淡的白雾,还原视频中上缘发白 */
  float whiteT = smoothstep(0.50, 1.05, uv.y) * 0.55;
  float density = smoothstep(0.32, 0.85, f + 0.22 * r.x);  /* 云雾疏密,留出白隙 */
  vec3 base = vec3(0.985);
  float mask = colorZone * density;
  mask = clamp(mask + colorZone * 0.15, 0.0, 1.0);
  vec3 outCol = mix(base, col, mask);
  outCol = mix(outCol, base, whiteT * (1.0 - mask * 0.55));

  gl_FragColor = vec4(outCol, 1.0);
}
`
