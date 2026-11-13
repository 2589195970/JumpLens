## ADDED Requirements

### Requirement: 一致的符号颜色
代码编辑、预览和提交阅读 SHALL 使用统一的符号类别和选定调色板。Java SHALL 区分类、方法、字段、参数、局部变量、常量、注解与关键字。语义服务未就绪时 SHALL 保留语法高亮。

### Requirement: 提交版本身份
每个提交侧 SHALL 绑定仓库、完整 commit、路径和左右侧。新增、删除、重命名和根提交 SHALL 正确显示存在的一侧。所有提交源码 SHALL 只读。

### Requirement: 历史导航
历史代码的语言服务 SHALL 分析对应提交的独立缓存。预览目标 SHALL 来自同版本缓存或其依赖源码，SHALL NOT 自动打开同路径的工作区当前文件。

### Requirement: 原生 Git 差异高亮
插件 SHALL 提供 Java 语法贡献和 One Dark／IDEA 主题，供 Orca 原生代码与差异编辑器选择。
