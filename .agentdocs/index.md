# 项目文档索引

## 当前重要变更

- `workflow/20261104220614-publish-github-pages.md`
  - 会话：会话-14 起的 GitHub 发布任务。
  - 内容：发布公开源码仓库，接入测试、构建与 GitHub Pages 在线试玩。
  - 读取场景：修改 GitHub Actions、仓库远程地址、构建产物或 GitHub Pages 发布流程时。
  - 交付：公开仓库及 Pages 已发布，云端全部检查通过；关键线上资源 HTTP 200，线上浏览器交互因工具连接超时未复核。

- `workflow/20261104212511-create-up-simulator.md`
  - 会话：会话-1 开始的首次开发任务。
  - 内容：从空仓库实现三平台 UP 主经营游戏、工作台、视频分发规则、直播互动、模拟榜单、趋势看板和本地存档。
  - 读取场景：修改平台主题、经营规则、日结、任务奖励、榜单、图表或存档时。
  - 交付：15 项测试通过，已私有发布；当前浏览器的线上访问受 Cloudflare 拦截，离线单文件与本地源码保留。

## 长期关键记忆

- 项目长期约定与检索顺序见根目录 `AGENTS.md`。
- `creator-studio/dist/` 是完整静态应用，修改后直接刷新预览，无构建步骤；`npm run dev` 默认使用 4173 端口。
- `npm run build` 可生成内嵌全部素材的 `creator-studio/dist/standalone.html`，用于直接打开及离线试玩，产物不纳入 Git。
- Sites 托管需要使用根目录 `dist/`；`npm run build` 同时生成此目录，`.openai/hosting.json` 的标准目录约束不可配置为任意子目录。
- 游戏引擎集中于 `engine.mjs`，与界面分离；随机规则允许注入随机数，测试使用 Node.js 内置工具。
- 游戏与真实平台隔离。创作者姓名是真实名单灵感，榜单分数及互动事件均为模拟。
- Sites 项目身份见 `.openai/hosting.json`；后续更新复用 project_id，保持站点访问范围。
- GitHub 远程 `origin` 为 `LeP-Ton/up-creator-simulator`；游戏代码推送 `main` 触发 `.github/workflows/pages.yml`，文档变更不会单独触发部署。
