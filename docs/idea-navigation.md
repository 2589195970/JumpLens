# JumpLens 代码导航交互规范

## 目标与依据

Java 导航覆盖符号解析、候选选择、源码预览、文件定位与位置历史。声明、类型和实现使用各自的导航命令。[IDEA 源码导航](https://www.jetbrains.com/help/idea/navigating-through-the-source-code.html)

代码引用依据语言语义解析，包含包、导入、作用域、接收者类型和方法签名。解析失败与存在多个有效目标分别处理。[IntelliJ PSI References](https://plugins.jetbrains.com/docs/intellij/psi-references.html)

## 名称相同的处理规则

| 场景 | 行为 |
| --- | --- |
| 不同包具有同名类，当前引用可解析 | 进入当前引用对应的声明 |
| 相同方法名存在不同参数签名 | 按参数与接收者类型解析 |
| 接口或父类具有多个实现 | 展示全部合法实现供选择 |
| 用户按名称查找源码文件 | 展示相同名称的文件，并显示工程路径 |
| 当前文档的物理路径匹配不唯一 | 显示文件身份候选，确认后建立分析上下文 |
| 工程分析未就绪或引用无法解析 | 展示原因与重试入口 |

类、文件与符号的名称搜索具有不同入口和范围。[IDEA Search Everywhere](https://www.jetbrains.com/help/idea/searching-everywhere.html)

## 候选选择

候选行显示符号或文件名、包名、工程路径及行号。方法候选同时显示源码中的签名。不同工程与源码根中的候选保持独立身份。

输入名称、包名或路径可筛选候选；上下键切换候选，Enter 打开，Esc 关闭并恢复编辑器焦点。筛选支持大小写不敏感的名称匹配和 CamelCase 缩写。[IDEA Speed Search](https://www.jetbrains.com/help/idea/speed-search-in-the-tool-windows.html)

选中候选时按目标语言展示带语法高亮的只读源码预览。预览不改变原文件、原光标与导航历史；确认打开才记录导航。快速定义用于在当前代码位置查看目标源码。[IDEA 快速定义](https://www.jetbrains.com/help/idea/viewing-definition.html)

引用结果按文件组织，展示调用位置与代码上下文。[IDEA Find Usages](https://www.jetbrains.com/help/idea/find-highlight-usages.html)

## 导航操作

- 声明：从调用、类型使用或字段使用定位声明。
- 实现：从接口、抽象方法或可覆盖方法列出实现。
- 类型：从变量、字段或方法定位其类型。
- 快速定义：在只读预览中查看声明。
- 引用：列出当前符号的使用位置。
- 文件：按名称、路径或 CamelCase 缩写定位源码文件。
- 返回与前进：恢复文件、光标选区与滚动位置。

IDEA 的位置导航与近期位置服务于跨文件返回和代码上下文恢复。[IDEA 最近文件与位置](https://www.jetbrains.com/help/idea/recent-files-and-changes.html)

## 扩展导航范围

| 能力 | 交互与验收范围 |
| --- | --- |
| 父类与父方法 | 从覆盖方法进入父声明，支持多个父接口 |
| 类与方法层次 | 展示继承、实现和调用关系，并可继续导航 |
| 文件结构 | 筛选当前类、字段与方法，定位成员 |
| 最近文件与位置 | 按近期访问筛选文件和代码片段 |
| 编辑器边栏标记 | 展示覆盖、实现及引用入口 |
| 按住修饰键悬停 | 为可导航符号显示链接与定义信息 |
| 项目范围与依赖范围 | 在查找类、文件和引用时明确作用范围 |
| 框架关联 | 按 Spring、MyBatis 等框架分别提供关系解析 |

父方法、继承标记与成员结构来自 [IDEA 源码导航](https://www.jetbrains.com/help/idea/navigating-through-the-source-code.html)。调用与类型层次使用 [IDEA Source code hierarchy](https://www.jetbrains.com/help/idea/viewing-structure-and-hierarchy-of-the-source-code.html)；最近位置使用前述位置导航规则。

## 基础编辑

导航编辑器同时提供 Java、Vue 与 JS/TS 语法颜色及 Vue 内嵌 CSS、SCSS、Sass 高亮、行号、代码折叠、括号匹配与补全、Java 四空格、前端语言两空格的 Tab 缩进、搜索、替换、撤销与重做。保存和外部修改冲突使用 Orca 文档会话。

## 验收场景

| 场景 | 验收结果 |
| --- | --- |
| 两个包均有 UserService | 根据 import 进入正确声明 |
| 两个目录均有 UserService.java | 文件搜索展示完整区别，可筛选后选择 |
| 三个类实现同一接口 | 实现列表展示三项，可预览并确认 |
| 同名方法参数分别为 int 与 String | 各自定位正确重载 |
| 编辑器内容尚未保存 | 查询与预览使用当前缓冲区 |
| 切换候选但尚未确认 | 原文件与光标保持原位置 |
| 关闭候选窗口 | 编辑器恢复焦点 |
| A → B → C，再返回两次 | 恢复 B、A 的原光标与滚动位置 |
| 后退后发起新跳转 | 前进分支按新的导航路径更新 |
| 相同内容存在于两个工作区 | 不混用工作区索引与文档绑定 |
| 编辑期间异步查询返回 | 丢弃过期候选 |
| 目标来自 JDK 或第三方库 | 以只读源码或反编译内容展示 |

## 语言与主题

Java 使用 JDT LS；Vue 与 JS/TS 使用 Vue 语言服务的独立 TypeScript 模式。语言服务按语言类别和工程根目录隔离，导航历史按工作区共享。JS/TS 读取 tsconfig/jsconfig 的导入与别名配置，Vue 模板、脚本和组件由语言服务映射到物理源码。Vue 2 Options API 还提供当前组件模板成员的作用域解析。

候选窗口沿用 ShiftLens 的搜索栏、通栏选中态和源码分区。界面使用 Orca 当前主题的颜色变量，语法调色板随宿主明暗标记切换。主题更新保持当前文档、选区、滚动位置、候选查询与预览。

## Orca 接入边界

当前 Orca 插件文档接口提供内容和版本，文件路径通过工作区匹配确认。此处的文档身份确认独立于 Java 符号解析。IDEA 具备直接的文档与工程身份；插件要达到相同的自动绑定能力，需要宿主提供稳定的文档 URI 与工作区标识。

Spring Bean、Mapper/XML 和运行时反射导航需要额外框架语义支持。按各自能力独立验收。
