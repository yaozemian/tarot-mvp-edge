# Luna Arcana Tarot

Luna Arcana Tarot 是一个基于 EdgeSpark 的全栈塔罗占卜应用。用户可以输入问题或抽取每日运势，获得三张牌的过去、现在、未来牌阵，查看解读历史，并生成适合保存和分享的塔罗结果海报。

线上地址：[https://ready-scorpion-7924.edgespark.app](https://ready-scorpion-7924.edgespark.app)

## 功能亮点

- 三张牌牌阵：过去 / 现在 / 未来
- 两种占卜模式：问题占卜、每日运势
- 78 张 Rider-Waite-Smith 本地牌面图片，页面和分享图都不依赖外部图片热链
- AI 解读接口：配置 OpenAI API Key 后可生成真实 AI 解读
- 备用本地解读：当 OpenAI 额度不足或接口不可用时，仍能生成可读的基础解读
- 登录后云端保存历史记录，未登录时保存在浏览器本地
- 每日使用限制：问题占卜 3 次、每日运势 1 次
- 一键生成竖版分享海报
- GitHub Actions 自动检查与 EdgeSpark 部署工作流

## 截图

![Home](docs/screenshots/home.png)

![History](docs/screenshots/history.png)

## 技术栈

- EdgeSpark
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Hono
- Drizzle ORM
- OpenAI Responses API

## 项目结构

```text
.
├─ server/                 EdgeSpark / Hono API
│  ├─ src/index.ts         API routes
│  └─ src/defs/            database, runtime, storage definitions
├─ web/                    React + Vite frontend
│  ├─ src/                 pages, components, hooks, app logic
│  └─ public/cards/        78 local tarot card images
├─ configs/                EdgeSpark auth config
├─ docs/screenshots/       README screenshots
├─ .github/workflows/      CI and deployment workflows
└─ edgespark.toml          EdgeSpark project config
```

## 本地开发

环境要求：

- Node.js 24+
- EdgeSpark CLI

安装依赖：

```bash
cd server && npm install
cd ../web && npm install
```

常用检查：

```bash
cd server && npm run typecheck
cd ../web && npm run build
```

## AI 配置

服务端通过 EdgeSpark runtime 读取：

- `OPENAI_API_KEY`：OpenAI API 密钥，作为 secret 保存
- `OPENAI_MODEL`：模型名，作为 var 保存，默认可使用 `gpt-4.1-mini`

配置示例：

```bash
edgespark var set OPENAI_MODEL=gpt-4.1-mini
edgespark secret set OPENAI_API_KEY
```

`edgespark secret set` 会给出一个安全网页地址，密钥应只在网页里填写，不要写进代码或提交到 GitHub。

如果 OpenAI 账号没有可用额度，应用会显示备用本地解读；额度恢复后，真实 AI 解读会自动生效。

## 部署

本仓库已通过 [edgespark.toml](edgespark.toml) 关联 EdgeSpark 项目。

手动部署：

```bash
edgespark deploy --dry-run
edgespark deploy
```

## GitHub Actions

仓库包含两个工作流：

- `CI`：在 push 和 pull request 时安装依赖、检查服务端类型、构建前端
- `Deploy to EdgeSpark`：在 `main` 分支更新或手动触发时部署到 EdgeSpark

如需启用 GitHub 自动部署，请添加 repository secret：

- `EDGESPARK_API_KEY`：具备部署权限的 EdgeSpark API token

## 说明

塔罗解读仅用于自我观察和娱乐，不应作为医疗、法律、投资等专业决策依据。
