# 贡献指南

工程约定与硬性红线写在 **[AGENTS.md](./AGENTS.md)**,人和 AI 贡献者都按那一份走。本文只讲流程。

## 环境

- Node `>= 22.12`(见 `package.json` 的 `engines` 与 `.nvmrc`),包管理器 npm。
- `nvm use && npm ci`

## 开发

```bash
npm run dev            # http://localhost:5173
npm run test:unit      # Vitest 单测
npm run lint:check     # ESLint
npm run format:check   # Prettier
npm run type-check     # vue-tsc
npm run build          # 类型检查 + 生产构建
```

提交时 husky 会自动跑 lint-staged(只处理暂存文件)与 commitlint(只校验提交信息)。

## 分支与 PR

1. 从 `main` 切分支,一个 PR 只做一件事。
2. PR 描述里写清"为什么",涉及视觉改动必须附改动前后截图。
3. 改动 `public/flux/index.html` 的 PR 单独开,不要与仪表盘/Vue 版混在一起。
4. CI 全绿(含 `cmp` 冻结校验)才可合并。

## 素材

`src/assets/img/` 只提交压缩后的 WebP;PNG 原图不入库,放好后跑 `npm run assets:optimize`。
