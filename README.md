# JumpLens · 代码导航

**从调用到定义，让代码关系一跳可达。**

Semantic navigation, source previews, and theme-aware highlighting for Java, Vue, JavaScript and TypeScript in Orca.

在 Orca 的 Java、Vue、JavaScript 和 TypeScript 文件页中编辑代码并使用语义导航。编辑器提供语法配色、行号、折叠、括号补全、Tab 缩进、搜索、替换、撤销和重做。Java 使用 Eclipse JDT LS，Vue 与 JS/TS 使用独立的 Vue / TypeScript 语言服务。

## 使用

打开工作区中的 `.java`、`.vue`、`.ts`、`.tsx`、`.js` 或 `.jsx` 文件，选择文件页的「JumpLens」视图。模块扩展名 `.mjs`、`.cjs`、`.mts`、`.cts` 同样支持。

工具栏提供返回、前进、定义、实现、引用和文件搜索。「更多操作」包含类型跳转、定义预览和重新连接语言服务。候选窗口使用 ShiftLens 的紧凑搜索栏、通栏选中态与左右分区布局。

| 操作 | 快捷键 |
| --- | --- |
| 跳转定义 | Cmd/Ctrl + 点击，Cmd/Ctrl+B，F12 |
| 跳转实现 | Cmd/Ctrl+Alt+B |
| 查找引用 | Shift+F12 |
| 类型跳转 | Cmd/Ctrl+Shift+B |
| 快速定义 | Alt+Space |
| 查找源码文件 | Cmd+Shift+O，Windows/Linux Ctrl+Shift+N |
| 返回 / 前进 | macOS Cmd+[ / Cmd+]，Windows/Linux Ctrl+Alt+左箭头 / 右箭头 |

多个实现或引用显示在候选选择窗口。候选展示符号、包名、工程路径、签名与行号；输入名称或路径筛选，上下键选择，Enter 打开，Esc 返回代码。右侧显示带语法高亮的只读源码预览。预览按目标扩展名选择 Java、Vue、JS/TS、JSON、HTML、CSS、SCSS 或 Sass 高亮。JDK 和依赖库源码以只读浮层展示，Esc 关闭。编辑内容通过 Orca 的文档会话同步，使用 Orca 原有保存流程；外部文件修改发生冲突时使用宿主的冲突处理。

工程识别在后台完成。前后端分离项目可以打开前后端共同所在的工作区；各语言按工程根目录分别分析。Orca 的插件编辑器接口提供文件内容，插件在当前本机工作区内匹配原文件；相同内容或类型存在多个候选时，由用户选择路径。

按名称查找源码文件时，同名文件按完整工程路径分别展示。代码符号的声明跳转由对应语言服务解析。具体交互、功能范围和验收场景见 [代码导航交互规范](docs/idea-navigation.md)。

## 多语言与主题

| 语言 | 解析与导航 |
| --- | --- |
| Java | 定义、类型、实现、引用、重载及依赖源码 |
| Vue | 脚本导入、模板表达式、组件及与 JS/TS 的跨文件引用 |
| JavaScript / TypeScript / JSX / TSX | 定义、类型、实现和引用，读取 tsconfig/jsconfig 的路径别名 |
| Vue 2 Options API | 当前组件模板到 methods、props、data、computed 的定位与模板引用；局部绑定和对象属性按作用域区分 |

Vue 模板中的指令、带连字符的绑定属性、事件修饰符、动态参数和插槽作用域按语法着色。`<style lang="scss">`、`<style lang="sass">` 及普通 CSS 样式块使用各自解析器，区分选择器、属性、变量、值、单位和注释。

Vue/TS 语言服务随插件提供，读取工程现有的 `tsconfig.json` / `jsconfig.json` 和 Vue 类型依赖。组件与框架类型解析需要工程已安装相应依赖。Vue 2 模板局部作用域由语言服务解析；组件内的补充解析会避开循环、插槽和箭头函数的局部绑定。

界面背景、正文、边框与次要文字使用 Orca 注入的主题变量。Orca 更新 `<html>` 的 `light` / `dark` 类时，关键字、字符串、数字、注释、类型、方法、标签和属性的语法配色同步切换。主编辑器、候选预览和依赖预览使用同一套规则，切换时保留文档、光标和查询状态。宿主提供的主题接口包含界面色与明暗模式，语法颜色使用插件对应明暗模式的调色板。

## 环境与设置

首次分析会从 Eclipse 官方下载 JDT LS 1.63.0，从 Eclipse Adoptium 下载独立 Java 25 运行环境，并准备 Lombok 1.18.42。下载包含 SHA-256 校验，文件缓存在 `~/.cache/orca-java-navigation`。JDT LS 的工程元数据与索引也存放在缓存中。

插件设置可指定语言服务 JDK、项目 JDK、JDT LS 安装目录。语言服务需要 Java 25，业务工程可以使用 Java 8。macOS 自动识别已安装的 Java 8 作为默认项目 JDK。修改设置后点击「重新连接」。

当前版本支持本机工作区。Java 编译期定义、实现和引用使用 JDT LS；Spring Bean 配置导航及 Mapper/XML 双向跳转属于独立功能范围。

## 安装

需要 Orca 1.4.248 或更高版本，插件系统已启用。

从 Orca 的插件设置添加仓库 `2589195970/JumpLens`，或执行：

```sh
orca plugin install 2589195970/JumpLens --json
```

插件标识为 `2589195970.jumplens`。仓库包含运行文件，可直接安装。

安装命令返回该版本的授权信息和指纹。核对后使用返回的 `--approve` 命令安装：

```sh
orca plugin install 2589195970/JumpLens --json --approve <fingerprint>
```

插件以独立 Node worker 运行，用当前用户权限读取工程文件、启动 Java 子进程、下载官方运行组件，并调用 Orca CLI 打开文件。声明的宿主权限为读取工作区、打开工作区文件、读写插件自身设置。

## 开发与验证

需要 Node.js 22 或更高版本，以及可运行的 Orca CLI。

```sh
git clone https://github.com/2589195970/JumpLens.git
cd JumpLens
npm ci --ignore-scripts
orca plugin types . --json
npm run build
npm run typecheck
npm test
orca plugin test . --json
npm run test:integration
npm run test:integration:web
npm run check
```

真实 JDT LS 集成测试覆盖跨文件定义、重载方法、中文与 emoji 坐标、未保存修改、多实现、引用及 JDK 虚拟源码。`editor/sync.test.ts` 使用 Orca 自带测试工具验证保存、冲突与只读文档行为。

`src/project.ts` 负责工作区与文件身份；`src/language-server.ts` 连接 JDT LS；`src/web-language-server.ts` 连接 Vue/TS 服务；`src/worker.ts` 连接宿主与编辑器；`editor/main.ts` 实现编辑与导航界面。发布包包含清单、说明、编辑器及各语言服务的运行文件。Vue 服务固定为 2.2.12 的独立 TypeScript 模式，TypeScript 固定为 5.9.3；依赖由锁文件管理。

## 本地打包

```sh
npm run package
orca plugin inspect ./releases/jumplens-0.3.2 --json
orca plugin install ./releases/jumplens-0.3.2 --json
```

## 许可证

项目使用 [MIT License](LICENSE)。运行文件中的第三方组件保留各自许可证；Vue 语法来源说明见 [VUE-SYNTAX-LICENSE.txt](editor/VUE-SYNTAX-LICENSE.txt)。
