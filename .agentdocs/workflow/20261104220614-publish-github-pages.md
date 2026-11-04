# 发布 GitHub 公开仓库与在线试玩

## 背景与目标

- 关联会话：会话-14 起。
- 用户要求“发布到 github”，并明确选择“公开仓库，并提供 GitHub Pages 在线试玩”。
- 起始分支为 `main`，与上一轮开发一致；初始工作区干净，尚未配置 GitHub 远程。
- 使用已登录的 `LeP-Ton` 账号，目标仓库为 `LeP-Ton/up-creator-simulator`。

## 约束与决策

- 保留现有源码与 Git 历史，公开上传本项目，不包含本地存档、测试截图或临时凭据。
- GitHub 连接器用于账号与仓库信息核对；其未提供建仓及 Pages 设置能力，这些操作由已登录的 GitHub CLI 完成。
- 采用官方 Pages 工作流，以 `dist/` 为部署产物；保持源码分支不跟踪生成目录。
- 构建前执行现有游戏规则测试和 JavaScript 语法检查，任一步失败就停止部署。
- GitHub Actions 使用 Node.js 24，项目无需安装外部依赖；发布权限仅授予部署任务。
- 先推送已有源码建立 `main`，启用 Pages 后再推送工作流，避免首次构建早于 Pages 配置。

## 阶段与 TODO

- [x] 检查分支与工作区，读取项目约定与相关变更文档
- [x] 确认 GitHub 账号与公开仓库、在线试玩发布方式
- [x] 检查目标仓库重名和已跟踪内容中的凭据特征
- [x] 编写测试、构建、Pages 部署工作流
- [x] 创建公开仓库并推送完整源码
- [x] 启用 GitHub Pages 并验证首次 Actions 发布
- [x] 核对线上页面与项目路径下的静态资源
- [x] 补充最终发布结果

## 主要文件

- `.github/workflows/pages.yml`：新增两阶段工作流；游戏代码或工作流推送到 `main` 时触发，也支持手动运行。
- `README.md`：新增仓库、在线试玩、Actions 链接及发布说明。
- `AGENTS.md`：记录 GitHub 远程和稳定发布方式。
- `.agentdocs/index.md`：加入本次发布任务索引。

## 关键风险与验证方法

- Pages 使用仓库子路径，必须确认 CSS、模块和图片均使用相对地址，并在部署后实际检查。
- 构建产物从游戏源码复制得到，工作流只上传静态目录。
- 工作流权限与 Pages 环境配置可能影响首次发布，应以 Actions 最终状态和页面 HTTP 响应确认完成。

## 测试用例

### TC-001 自动检查与构建

- 类型：自动化验证，优先级：高。
- 步骤：执行 `npm test`、`npm run check`、`npm run build`，再确认 GitHub Actions 中相同步骤通过。
- 预期：15 项游戏测试全部通过，语法检查通过，生成完整静态产物和单文件游戏。
- 验证状态：本地及 GitHub Actions 的 15 项测试、语法检查与构建均通过；构建、部署两个云端任务全部成功。

### TC-002 Pages 线上访问

- 类型：部署验证，优先级：高。
- 步骤：核对 Pages API、Actions 发布状态，打开在线地址并检查主页面和关键资源。
- 预期：公开站点可访问，平台选择、主题切换、作品发布正常，静态资源不因仓库子路径而丢失。
- 验证状态：部署成功；主页、CSS、入口脚本、两个模块、封面图片及单文件游戏均返回 HTTP 200，模块的响应类型为 JavaScript。浏览器自动化连接连续超时，未完成线上主题切换及发布操作复核；前一开发任务已完成同版应用的本地浏览器流程验证。

## 参考

- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)

## 当前发布进展

- 已创建公开仓库：[LeP-Ton/up-creator-simulator](https://github.com/LeP-Ton/up-creator-simulator)。
- 既有源码与完整 Git 历史已推送到远程 `main`，起始源码提交为 `2f965b7`。
- Pages 已启用，发布来源为 `workflow`，API 返回地址为 [在线试玩](https://lep-ton.github.io/up-creator-simulator/)。
- 当前 Windows Git 未自动继承已启用的系统代理，显式使用系统既有代理后上传成功；仅对本次命令设置连接参数，不写入共享仓库配置。

## 最终发布结果

- 公开仓库：[LeP-Ton/up-creator-simulator](https://github.com/LeP-Ton/up-creator-simulator)。
- 在线试玩：[GitHub Pages](https://lep-ton.github.io/up-creator-simulator/)。
- 云端发布完成时间：2026-11-04 22:16:12，Asia/Shanghai。
- 部署源码提交：`2f8a3cfcd2d1d00f2031784139d0ef3c6c2e663c`。
- Actions 运行：[41845615885](https://github.com/LeP-Ton/up-creator-simulator/actions/runs/41845615885)，最终结果 `success`。
- Pages 发布来源为 `workflow`，HTTPS 已强制启用；仓库首页已设置为在线试玩地址。
- 未验证项仅为线上浏览器交互：浏览器连接超时，未以自动化完成线上发布操作；HTTP 及部署状态均已确认正常。
