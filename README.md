# PyBuddy

PyBuddy 是一个面向儿童的 Python 启蒙学习应用。孩子可以通过拖拽 Blockly 积木生成 Python 代码，运行后在页面里看到文字输出或小海龟绘图效果；家长可以查看学习进度和作品记录。

项目当前包含 2 个学习阶段、27 节课程：

- Level 1：积木启蒙岛，共 15 节，覆盖 `print`、变量、四则计算和基础 turtle 绘图。
- Level 2：判断小游戏岛，共 12 节，覆盖条件判断、随机数、列表、循环和函数组合。

## 功能亮点

- 积木到 Python：使用 Blockly 提供儿童友好的拖拽编程体验，并同步生成 Python 代码。
- 浏览器内运行：使用 Skulpt 在前端运行 Python，支持文字输出和 turtle 绘图。
- 课程地图：按 level 展示课程进度、解锁状态和继续学习入口。
- 真实进度存储：完成课程后记录星星、当前课程、作品代码和运行输出。
- 多孩子档案：注册页支持创建和切换不同 learner profile。
- 家长面板：展示已完成课程、学习时长估算和最近学会的知识点。
- AI 小老师：课程页提供 AI 辅导入口，支持对话记忆、流式响应、安全过滤和本地回退（详见下方配置）。
- 离线缓存：包含 service worker 和 Web App Manifest，支持基础 PWA 能力。

## 技术栈

- Next.js 14 App Router
- TypeScript
- React 18
- Tailwind CSS
- Zustand
- Blockly
- Skulpt
- Framer Motion
- Zod
- Playwright

## AI 小老师配置

AI 小老师采用 **LLM 为主、规则为辅** 的混合架构：正常情况下调用 OpenAI 兼容接口，异常时自动降级到本地 30+ 场景规则回复。支持对话记忆、SSE 流式输出、滑动窗口限流、多层安全过滤和输出过滤。

### 快速配置

复制环境变量模板并填入你的 Key：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入以下内容：

```env
OPENAI_API_KEY=sk-proj-你的key
```

### 支持的模型提供商

只需改 `.env.local` 里的 2-3 个变量即可切换不同提供商：

#### OpenAI 官方（默认）

```env
OPENAI_API_KEY=sk-proj-xxx
AI_BASE_URL=https://api.openai.com/v1
OPENAI_TUTOR_MODEL=gpt-4.1-mini
```

#### 硅基流动（DeepSeek-V3、Qwen 等）

```env
OPENAI_API_KEY=siliconflow-key
AI_BASE_URL=https://api.siliconflow.cn/v1
AI_API_ENDPOINT=chat
OPENAI_TUTOR_MODEL=deepseek-ai/DeepSeek-V3
```

#### DeepSeek 官方

```env
OPENAI_API_KEY=sk-xxx
AI_BASE_URL=https://api.deepseek.com/v1
AI_API_ENDPOINT=chat
OPENAI_TUTOR_MODEL=deepseek-chat
```

#### Groq

```env
OPENAI_API_KEY=gsk_xxx
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_ENDPOINT=chat
OPENAI_TUTOR_MODEL=llama-3.3-70b-versatile
```

#### 智谱 GLM

```env
OPENAI_API_KEY=xxx.xxx
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_API_ENDPOINT=chat
OPENAI_TUTOR_MODEL=glm-4
```

### 环境变量说明

| 变量 | 必填 | 说明 |
|---|---|---|
| `OPENAI_API_KEY` | 是 | API 密钥，不配置时自动降级为本地规则回复 |
| `AI_BASE_URL` | 否 | 基础 URL，默认 OpenAI 官方 |
| `AI_API_ENDPOINT` | 否 | `responses`（仅 OpenAI）或 `chat`（通用），不填时自动检测 |
| `OPENAI_TUTOR_MODEL` | 否 | 模型名称，默认 `gpt-4.1-mini` |

### 架构设计

- **安全过滤**：4 层防护（30+ 关键词 + 正则绕过 + 频率检测 + 输出过滤）
- **限流保护**：1 分钟 3 次 + 每天 20 次，按 IP/用户隔离
- **对话记忆**：传递最近 5 条历史消息，上下文连续
- **流式响应**：SSE 实时输出 + 前端打字机光标
- **本地回退**：30+ 场景模板覆盖常见错误类型和知识点

## 目录结构

```text
src/app                         App Router 页面和 API 路由
src/app/learn/[lessonId]         Level 1 课程入口
src/app/learn/level-[level]      多 level 课程入口
src/app/api/tutor                AI 小老师 API（非流式）
src/app/api/tutor/stream         AI 小老师 API（SSE 流式）
src/components/learning          学习页和课程概念卡片
src/components/engines           Blockly 编辑器和 turtle 画布
src/components/ui                通用 UI 组件
src/lib/blockly                  Blockly block 定义和 Python 生成器
src/lib/courses                  课程加载、路由、校验和常量
src/lib/runtime                  Skulpt 运行时和 turtle 输出摘要
src/lib/ai-tutor                 AI 小老师：安全过滤、限流、客户端调用
src/store                        课程、进度、作品、用户等 Zustand store
src/types                        课程和运行时类型
public/courses                   课程 JSON 内容
tests/e2e                        Playwright 端到端测试
scripts                          课程一致性校验脚本
docs                             产品和架构文档
```

## 本地开发

先安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

常用入口：

- `/map`：课程地图
- `/learn/lesson_001`：Level 1 第一课
- `/learn/level-2/lesson_001`：Level 2 第一课
- `/register`：创建或切换孩子档案
- `/parent`：家长面板
- `/profile`：成就和作品页

## 验证和测试

课程内容一致性校验：

```bash
npm run verify:courses
```

Lint：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

端到端测试：

```bash
npm run test:e2e
```

完整验证：

```bash
npm run verify
```

`npm run verify` 会依次执行课程校验、lint、生产构建、TypeScript 类型检查和 Playwright E2E。

注意：不要在 `npm run dev` 仍然运行时执行 `npm run build`。Next.js 会共用 `.next` 输出目录，可能出现临时的 500 错误或缺失 `vendor-chunks/*.js`。需要构建时先停止 dev server；如果已经出现异常，停止 dev、删除 `.next`，再重新构建或启动。

## 课程内容

课程文件存放在：

```text
public/courses/level-1
public/courses/level-2
```

每节课是一个 JSON 文件，例如 `lesson_001.json`。课程包含：

- 基本信息：`id`、`level`、`number`、`title`
- 故事和学习目标：`story`、`objectives`
- 可用积木：`blocks.available`
- 预期代码：`expected_code`
- 可视化类型：`visual.type`
- 校验规则：`validation`
- 提示语：`hints`

修改课程后建议立即运行：

```bash
npm run verify:courses
```

这个脚本会检查课程编号、level、Blockly block 可用性、预期代码和校验规则是否匹配。

## 部署

这是标准 Next.js 应用，可以部署到 Vercel、Docker 或任何支持 Node.js 的平台。

### Docker 部署

项目内置多阶段 Dockerfile，生产镜像仅 35MB。

```bash
# 构建镜像
docker build -t pybuddy .

# 运行容器（需要 .env.local 文件）
docker run -d -p 3000:3000 --env-file .env.local --name pybuddy pybuddy

# 或使用 docker-compose
docker compose up -d
```

使用 docker-compose（推荐）：

```yaml
# docker-compose.yml 已包含健康检查、资源限制和自动重启
services:
  pybuddy:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

访问 `http://localhost:3000` 确认部署成功。

### 传统部署

生产构建：

```bash
npm run build
```

本地启动生产版本：

```bash
npm run start
```

## GitHub

仓库地址：

```text
https://github.com/goodtiger/pybuddy
```
