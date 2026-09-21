/**
 * @Author: zlc
 * @Description: 素材压缩脚本 —— 把 src/assets/img 下的 PNG 原图按实际展示尺寸转成 WebP
 *               PNG 原图不入库（见 .gitignore），运行前需先把设计原图放到 src/assets/img/
 * @usage node scripts/optimize-assets.mjs
 */
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

import sharp from 'sharp'

const SRC_DIR = 'src/assets/img'
const QUALITY = 78

/** 目标尺寸约为展示尺寸的 2 倍，覆盖 2x 屏；height 省略时按原比例缩放 */
const TARGETS = [
  { file: 'portrait-shuke', width: 576 },
  { file: 'device-macbook', width: 160, height: 120 },
  { file: 'avatar-1', width: 96, height: 96 },
  { file: 'avatar-2', width: 96, height: 96 },
  { file: 'avatar-3', width: 96, height: 96 },
  { file: 'avatar-4', width: 96, height: 96 },
]

async function optimize({ file, width, height }) {
  const source = join(SRC_DIR, `${file}.png`)
  const target = join(SRC_DIR, `${file}.webp`)

  // 原图不入库，缺哪张就跳过哪张，不阻断其余素材
  if (
    !(await stat(source).then(
      () => true,
      () => false,
    ))
  ) {
    console.log(`跳过 ${file}：未找到 ${source}`)
    return
  }

  await sharp(source)
    .resize({ width, height, fit: 'cover' })
    .webp({ quality: QUALITY })
    .toFile(target)

  const { size } = await stat(target)
  console.log(`${file}.webp  ${width}x${height ?? 'auto'}  ${(size / 1024).toFixed(1)} kB`)
}

await Promise.all(TARGETS.map(optimize))
