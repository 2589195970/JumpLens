# 设计

## 文案表

`src/i18n.ts` 以中文文案为基准定义键，英文和韩文表的类型要求包含同一组键，缺少翻译时类型检查失败。带参数的文案使用 `{name}` 占位，单元测试要求各语言的占位一致。

## 语言来源

页面在 `session()` 完成后读取 `orca.locale`，替换带 `data-i18n`、`data-i18n-title`、`data-i18n-aria-label`、`data-i18n-placeholder` 的静态文案，只替换文字节点，保留按钮图标。worker 没有宿主语言，页面启动时通过 `locale` 请求告知 worker，之后 worker 的错误与进度提示使用同一语言。

`zh*` 显示中文，`ko*` 显示韩文，其他语言显示英文；语言为空时保持中文。
