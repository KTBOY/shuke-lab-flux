/**
 * @Author: zlc
 * @Description: 提交信息门禁 —— Conventional Commits,针对中文正文放宽行宽与大小写约束
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    /* 中文一句话不该按 100 列腰斩换行 */
    'body-max-line-length': [0],
    /* 中文没有大小写,英文项目那条 case 规则在这里只会误伤 */
    'subject-case': [0],
    'header-max-length': [2, 'always', 72],
  },
}
