# UP主模拟器：项目长期认知

## 项目定位与技术选型

- 中文浏览器经营游戏，玩家选择抖音、哔哩哔哩或小红书主题，经营自己的模拟账号。
- 使用原生 HTML、CSS、JavaScript ES Modules（浏览器模块），无第三方前端运行依赖；Node.js 负责本地服务器与自动化测试。
- 应用位于 `creator-studio/`，可部署静态文件位于 `creator-studio/dist/`。
- 平台风格参考真实创作者后台，但不连接真实平台，不采集登录信息；所有经营数据及榜单分数均为游戏模拟。

## 核心架构与目录

- `creator-studio/dist/data.mjs`：平台配置、真实创作者姓名、选题与直播事件。
- `creator-studio/dist/engine.mjs`：可注入随机数的独立游戏引擎，管理发布、直播、结算、榜单与存档校验。
- `creator-studio/dist/app.js`：界面渲染、交互与浏览器本地存档；三个平台使用独立账号存档。
- `creator-studio/dist/style.css`：响应式布局及三平台主题。
- `creator-studio/scripts/`：本地预览服务器。
- `creator-studio/tests/`：使用 Node.js 内置测试工具验证经营规则。
- `.openai/hosting.json`：Sites 站点标识与静态部署目录，保留既有 project_id。
- `.agentdocs/`：变更索引与任务语义记录。

## 运行与验证

- `npm run dev`：启动本地预览，默认 `http://localhost:4173`。
- `npm test`：执行游戏引擎测试。
- `npm run check`：检查 JavaScript 语法。
- `npm run build`：生成 `creator-studio/dist/standalone.html` 单文件版本，内嵌样式、脚本与图片，可直接在浏览器中打开。
- 静态站点不需要打包，`creator-studio/dist/` 就是完整应用；单文件生成是可选的离线交付方式。

## 项目检索方法

按 `AGENTS.md → .agentdocs/index.md → 与任务相关的 workflow 文档 → 源码` 的顺序阅读。不要一开始全量扫描历史变更文档。

## 重要开发规范

- 沟通、文档与必要代码注释使用中文，每次回复以“会话-${index}：”开头。
- 开始代码任务前检查 Git 分支；仅在分支变化可能影响任务时提醒用户。
- 每次代码任务在 `.agentdocs/workflow/` 新建带 `YYYYMMDDHHmmss` 时间前缀的文档，并更新 `.agentdocs/index.md`，记录会话、目标、主要变更、风险和验证结果。
- AGENTS.md 仅更新长期稳定的项目认知；具体需求与普通功能迭代记录在 workflow。
- 保证游戏数据与真实平台数据的区别清晰，真实创作者姓名不得与虚构负面事件关联。
- 经营规则集中在引擎中，随机结果允许注入随机数以便验证，不将随机行为写死在渲染层。
- 存档保存在浏览器 localStorage（本地存储）；存储不可用时仍应能游玩，并明确提示保存限制。
