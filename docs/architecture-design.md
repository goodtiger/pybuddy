# PyBuddy — 完整技术架构方案

> v1.0 | 2026-05-20 | 配套产品方案 + Stitch UI 设计

---

## 一、架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Browser / PWA)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Onboarding│  │ 课程学习  │  │ 家长面板  │  │ 成就/设置    │    │
│  │ Splash    │  │ Screen   │  │ Dashboard│  │ Screen       │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       └──────────────┴─────────────┴───────────────┘            │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────┐      │
│  │              核心引擎层 (Core Engines)                  │      │
│  ├───────────────────────────────────────────────────────┤      │
│  │  BlockFade Engine  │  Code Editor  │  Visual Engine  │      │
│  │  积木↔代码渐进过渡  │  Monaco/CM6   │  Turtle/Canvas  │      │
│  ├───────────────────────────────────────────────────────┤      │
│  │  Python Runtime    │  AI Tutor     │  Lesson Engine  │      │
│  │  Skulpt → Pyodide  │  OpenAI API   │  JSON课程解析   │      │
│  └───────────────────────┬───────────────────────────────┘      │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────┐      │
│  │              数据层 (Client Data)                       │      │
│  ├───────────────────────────────────────────────────────┤      │
│  │  IndexedDB (离线缓存)  │  Service Worker  │  Zustand   │      │
│  │  课程资源/用户进度缓存  │  预加载策略      │  状态管理  │      │
│  └───────────────────────────────────────────────────────┘      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                        后端 API (FastAPI)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Auth API   │  │ Course API │  │ Progress   │  │ AI Proxy  │ │
│  │ JWT/OAuth  │  │ CRUD       │  │ Tracking   │  │ 安全网关  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘ │
│        └───────────────┴───────────────┴───────────────┘        │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────┐      │
│  │              PostgreSQL + Redis                        │      │
│  │  users │ courses │ progress │ lessons │ analytics     │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、前端架构

### 2.1 技术栈选型

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| **框架** | Next.js 14 (App Router) | 14.x | SSR/SSG + React 18, 良好的SEO |
| **语言** | TypeScript | 5.x | 类型安全，团队协作 |
| **状态管理** | Zustand | 4.x | 轻量，比 Redux 简单，适合中等复杂度 |
| **样式** | Tailwind CSS + CSS Modules | 3.x | 快速开发 + 局部样式控制 |
| **积木引擎** | Google Blockly | 10.x | 行业标准，自定义 Python Generator |
| **代码编辑器** | CodeMirror 6 (MVP) → Monaco (V2) | 6.x / 0.43 | CM6 轻量适合MVP，Monaco功能更全 |
| **Python运行时** | Skulpt (MVP) → Pyodide (V2) | latest | Skulpt ~250KB快速启动，Pyodide完整Py3 |
| **可视化输出** | Turtle (Skulpt内置) → Canvas/Phaser | - | 先跑通Turtle，再扩展游戏引擎 |
| **HTTP客户端** | TanStack Query (React Query) | 5.x | 缓存、自动重试、乐观更新 |
| **动画** | Framer Motion | 10.x | 声明式动画，庆祝效果 |
| **PWA** | next-pwa + Service Worker | - | 离线缓存课程资源 |
| **部署** | Vercel | - | Next.js原生支持，全球CDN |

### 2.2 目录结构

```
pybuddy-web/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 公开页面
│   │   ├── page.tsx              # Landing / Splash
│   │   └── layout.tsx
│   ├── (auth)/                   # 认证页面
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (kid)/                    # 孩子端（受保护路由）
│   │   ├── learn/                # 学习主界面
│   │   │   └── [lessonId]/page.tsx
│   │   ├── map/page.tsx          # 课程地图
│   │   ├── achievements/page.tsx # 成就页面
│   │   ├── celebration/page.tsx  # 完成庆祝
│   │   └── layout.tsx            # KidLayout (大按钮、简洁导航)
│   └── (parent)/                 # 家长端（受保护路由）
│       ├── dashboard/page.tsx    # 家长面板
│       ├── reports/page.tsx      # 学习报告
│       └── layout.tsx            # ParentLayout (数据密集)
│
├── components/
│   ├── engines/                  # 核心引擎组件
│   │   ├── BlockFadeEngine/      # 积木↔代码渐进过渡引擎
│   │   │   ├── BlockFadeEngine.tsx
│   │   │   ├── PhaseRenderer.tsx
│   │   │   ├── BlockPalette.tsx
│   │   │   └── CodePreview.tsx
│   │   ├── PythonRuntime/        # Python运行时封装
│   │   │   ├── SkulptRunner.ts
│   │   │   ├── PyodideRunner.ts  # V2
│   │   │   └── RuntimeFactory.ts
│   │   ├── VisualOutput/         # 可视化输出
│   │   │   ├── TurtleCanvas.tsx
│   │   │   ├── AnimationPlayer.tsx
│   │   │   └── GameCanvas.tsx    # V2
│   │   └── AITutor/              # AI导师
│   │       ├── TutorChat.tsx
│   │       ├── TutorBubble.tsx
│   │       └── ErrorExplainer.tsx
│   ├── code-editor/              # 代码编辑器封装
│   │   ├── BlockEditor.tsx       # Blockly容器
│   │   ├── TextEditor.tsx        # CodeMirror/Monaco容器
│   │   └── HybridEditor.tsx      # Phase 2 混合编辑器
│   ├── learning/                 # 学习相关组件
│   │   ├── StoryCard.tsx         # 故事引入卡片
│   │   ├── LessonProgress.tsx    # 课程进度条
│   │   ├── CelebrationModal.tsx  # 庆祝弹窗
│   │   └── StreakBadge.tsx       # 连续学习徽章
│   ├── parent/                   # 家长端组件
│   │   ├── StatsCard.tsx
│   │   ├── SkillsRadar.tsx
│   │   ├── WeeklyTimeline.tsx
│   │   └── ScreenTimeSlider.tsx
│   └── shared/                   # 共享组件
│       ├── MascotAvatar.tsx      # 小海龟吉祥物
│       ├── FriendlyError.tsx     # 友好错误提示
│       ├── LoadingScreen.tsx     # 加载动画
│       └── StarRating.tsx
│
├── lib/                          # 核心工具库
│   ├── blockly/                  # Blockly定制
│   │   ├── python-generator.ts   # 自定义Python代码生成器
│   │   ├── block-categories.ts   # 积木分类配置
│   │   └── themes/kid-theme.ts   # 儿童友好主题
│   ├── blockfade/                # BlockFade引擎核心
│   │   ├── phase-detector.ts     # 阶段判定逻辑
│   │   ├── code-ast-sync.ts      # 代码↔AST同步 (BlockMirror参考)
│   │   └── fade-transition.ts    # 渐退动画逻辑
│   ├── runtime/                  # Python运行时
│   │   ├── skulpt-config.ts      # Skulpt配置
│   │   ├── turtle-wrapper.ts     # Turtle模块包装
│   │   └── sandbox-executor.ts   # 安全沙箱执行
│   ├── ai-tutor/                 # AI导师
│   │   ├── prompts.ts            # 系统Prompt模板
│   │   ├── safety-filter.ts      # 内容安全过滤
│   │   └── response-parser.ts    # 响应解析
│   ├── courses/                  # 课程引擎
│   │   ├── lesson-schema.ts      # 课程JSON Schema (Zod)
│   │   ├── lesson-loader.ts      # 课程加载器
│   │   └── validator.ts          # 代码验证器
│   └── utils/                    # 通用工具
│       ├── animations.ts
│       ├── audio-feedback.ts     # 音效（拖拽咔哒声等）
│       └── accessibility.ts      # 无障碍辅助
│
├── store/                        # Zustand状态管理
│   ├── user-store.ts             # 用户信息、认证状态
│   ├── lesson-store.ts           # 当前课程状态
│   ├── progress-store.ts         # 学习进度
│   ├── runtime-store.ts          # Python运行时状态
│   └── ai-store.ts               # AI导师对话状态
│
├── public/
│   ├── courses/                  # 课程JSON资源 (SSG)
│   │   ├── level-1/
│   │   │   ├── lesson-001.json
│   │   │   └── ...
│   │   └── level-2/
│   ├── mascot/                   # 小海龟吉祥物资源
│   │   ├── turtle-happy.png
│   │   ├── turtle-confused.png   # 错误状态
│   │   ├── turtle-running.gif    # 加载状态
│   │   └── turtle-celebrate.gif  # 庆祝状态
│   └── audio/                    # 音效资源
│       ├── block-snap.mp3
│       ├── success.mp3
│       └── error-gentle.mp3
│
├── types/                        # TypeScript类型定义
│   ├── lesson.ts
│   ├── user.ts
│   ├── progress.ts
│   └── blockly.d.ts
│
└── next.config.js
```

### 2.3 核心引擎详细设计

#### 2.3.1 BlockFade 引擎

```typescript
// lib/blockfade/phase-detector.ts

export type Phase = 'block' | 'hybrid' | 'hint' | 'code';

export interface PhaseConfig {
  phase: Phase;
  lessonRange: [number, number]; // [start, end] 课程范围
  blockOpacity: number;           // 积木透明度 (1.0 = 完全不透明)
  codeEditable: boolean;          // 代码区是否可编辑
  showAutocomplete: boolean;      // 是否显示代码自动补全
  aiHintsEnabled: boolean;        // 是否启用AI提示
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  { phase: 'block',   lessonRange: [1, 15],  blockOpacity: 1.0,  codeEditable: false, showAutocomplete: false, aiHintsEnabled: true },
  { phase: 'hybrid',  lessonRange: [16, 30], blockOpacity: 0.5,  codeEditable: true,  showAutocomplete: false, aiHintsEnabled: true },
  { phase: 'hint',    lessonRange: [31, 50], blockOpacity: 0.2,  codeEditable: true,  showAutocomplete: true,  aiHintsEnabled: true },
  { phase: 'code',    lessonRange: [51, 100],blockOpacity: 0.0,  codeEditable: true,  showAutocomplete: true,  aiHintsEnabled: true },
];

export function detectPhase(lessonNumber: number, userPreference?: Phase): PhaseConfig {
  if (userPreference) {
    // 允许用户手动切换阶段（如果孩子准备好提前进阶）
    return PHASE_CONFIGS.find(p => p.phase === userPreference)!;
  }
  return PHASE_CONFIGS.find(p =>
    lessonNumber >= p.lessonRange[0] && lessonNumber <= p.lessonRange[1]
  )!;
}
```

```typescript
// lib/blockly/python-generator.ts — 自定义 Python 代码生成器

import { pythonGenerator } from 'blockly/python';

// 自定义积木块定义
const PYBUDDY_BLOCKS = {
  turtle_import: {
    init(this: any) {
      this.appendDummyInput().appendField('import turtle');
      this.setNextStatement(true);
      this.setColour(160); // Turtle 分类颜色
      this.setTooltip('导入海龟模块');
    },
  },
  turtle_forward: {
    init(this: any) {
      this.appendValueInput('DISTANCE')
        .setCheck('Number')
        .appendField('小海龟前进');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
      this.setTooltip('让海龟向前走指定的像素');
    },
  },
  turtle_right: {
    init(this: any) {
      this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField('右转');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
    },
  },
};

// 代码生成映射
const PYTHON_GENERATORS = {
  turtle_import: () => 'import turtle\nt = turtle.Turtle()\n',
  turtle_forward: (block: any) => {
    const distance = pythonGenerator.valueToCode(block, 'DISTANCE', pythonGenerator.ORDER_ATOMIC) || '100';
    return `t.forward(${distance})\n`;
  },
  turtle_right: (block: any) => {
    const angle = pythonGenerator.valueToCode(block, 'ANGLE', pythonGenerator.ORDER_ATOMIC) || '90';
    return `t.right(${angle})\n`;
  },
};
```

#### 2.3.2 Python 运行时封装

```typescript
// lib/runtime/skulpt-config.ts

import Sk from 'skulpt';

export interface RunResult {
  output: string[];
  error: string | null;
  canvasData: string | null;  // Turtle画布的base64图像
  executionTime: number;
}

export class SkulptRunner {
  private outputCallback: (text: string) => void;
  private canvasElement: HTMLCanvasElement | null;

  constructor(options: { onOutput: (text: string) => void; canvasEl: HTMLCanvasElement }) {
    this.outputCallback = options.onOutput;
    this.canvasElement = options.canvasEl;
  }

  async run(code: string): Promise<RunResult> {
    const output: string[] = [];
    const startTime = Date.now();

    // 配置 Skulpt
    Sk.configure({
      output: (text: string) => {
        output.push(text);
        this.outputCallback(text);
      },
      read: (x: string) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
          throw new Error(`File not found: '${x}'`);
        }
        return Sk.builtinFiles['files'][x];
      },
      __future__: Sk.python3,  // 使用Python 3语法
    });

    // 注入Turtle模块的Canvas支持
    this.setupTurtleCanvas();

    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody('<stdin>', false, code, true)
      );

      return {
        output,
        error: null,
        canvasData: this.getCanvasData(),
        executionTime: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        output,
        error: this.parseFriendlyError(err.toString()),
        canvasData: null,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /** 将Python错误转为儿童友好语言 */
  private parseFriendlyError(rawError: string): string {
    // SyntaxError: invalid syntax → "哎呀！这里有个拼写错误"
    if (rawError.includes('SyntaxError')) {
      if (rawError.includes('expected')) {
        return '哎呀！这里少了一个符号，检查一下冒号、括号或者引号？🔍';
      }
      if (rawError.includes('unexpected indent')) {
        return 'Python很在意对齐！这一行不需要缩进哦 📏';
      }
      if (rawError.includes('EOF')) {
        return '代码还没写完呢！是不是少了括号或者引号？ 🧩';
      }
      return '哎呀！代码里有个小错误，让我帮你看看 🔧';
    }

    // NameError: name 'xxx' is not defined
    if (rawError.includes('NameError')) {
      const match = rawError.match(/name '(.+?)'/);
      const name = match ? match[1] : '这个变量';
      return `Python说不认识"${name}"哦！你是不是忘记先定义它了？ 🤔`;
    }

    // TypeError
    if (rawError.includes('TypeError')) {
      return '类型不太匹配！就像不能把苹果和数字相加一样 🍎➕🔢';
    }

    return '代码遇到了一点小问题，不要急，我们再试试！ 💪';
  }

  private setupTurtleCanvas(): void {
    if (this.canvasElement) {
      // 将Skulpt的Turtle输出绑定到我们的Canvas
      (window as any).__PYBUDDY_CANVAS__ = this.canvasElement;
    }
  }

  private getCanvasData(): string | null {
    if (this.canvasElement) {
      return this.canvasElement.toDataURL('image/png');
    }
    return null;
  }
}
```

#### 2.3.3 AI 导师安全护栏

```typescript
// lib/ai-tutor/safety-filter.ts

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BLOCKED_TOPICS = [
  '暴力', '恐怖', '色情', '自杀', '武器', '毒品',
  'password', 'credit card', 'address', 'phone number',
];

const SYSTEM_PROMPT = `你是一位耐心的编程老师，教7-10岁小朋友学Python。

规则：
1. 用比喻和故事解释概念，不用专业术语
2. 不要直接给答案，用问题引导孩子思考
3. 解释错误时用儿童能懂的语言
4. 每次回复不超过3句话
5. 用emoji增加亲和力
6. 只回答与Python编程相关的问题
7. 如果孩子问无关问题，友好地引导回编程话题
8. 永远不要给出完整答案，只提供提示和引导

错误解释示例：
- 缺少冒号: "哎呀！Python的for循环需要一个冒号(:)来'开门'，没有冒号，循环里面的代码就进不去哦！"
- 缩进错误: "Python很在意对齐！就像排队一样，在for里面的代码需要多缩进4个空格"
- 变量未定义: "Python说它不认识'name'这个小朋友。你是不是忘记先用 name = 'xxx' 来介绍它了？"`;

export class SafetyFilter {
  static checkInput(message: string): { safe: boolean; reason?: string } {
    const lower = message.toLowerCase();
    for (const topic of BLOCKED_TOPICS) {
      if (lower.includes(topic)) {
        return { safe: false, reason: '话题不适当' };
      }
    }
    return { safe: true };
  }

  static generateSystemPrompt(currentLesson: string, currentError?: string): string {
    let prompt = SYSTEM_PROMPT;
    prompt += `\n\n当前课程: ${currentLesson}`;
    if (currentError) {
      prompt += `\n当前错误: ${currentError}`;
    }
    return prompt;
  }
}
```

### 2.4 状态管理设计

```typescript
// store/lesson-store.ts

import { create } from 'zustand';
import { Phase } from '@/lib/blockfade/phase-detector';

interface LessonState {
  // 当前课程信息
  currentLessonId: string | null;
  currentLesson: Lesson | null;
  phase: Phase;

  // 代码状态
  blocklyCode: string;      // Blockly生成的XML
  textCode: string;         // 文本代码
  isRunning: boolean;

  // 运行结果
  lastResult: RunResult | null;
  hasError: boolean;

  // AI导师
  aiMessages: TutorMessage[];
  aiDailyQuota: number;     // 今日剩余AI次数

  // Actions
  setCurrentLesson: (id: string) => void;
  setPhase: (phase: Phase) => void;
  setBlocklyCode: (xml: string) => void;
  setTextCode: (code: string) => void;
  runCode: () => Promise<void>;
  addAiMessage: (msg: TutorMessage) => void;
  decrementAiQuota: () => void;
  resetLesson: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentLessonId: null,
  currentLesson: null,
  phase: 'block',
  blocklyCode: '',
  textCode: '',
  isRunning: false,
  lastResult: null,
  hasError: false,
  aiMessages: [],
  aiDailyQuota: 5,

  setCurrentLesson: async (id) => {
    const lesson = await loadLesson(id);
    set({
      currentLessonId: id,
      currentLesson: lesson,
      phase: detectPhase(lesson.number).phase,
      textCode: lesson.expected_code || '',
      hasError: false,
      lastResult: null,
    });
  },

  setPhase: (phase) => set({ phase }),

  setBlocklyCode: (xml) => {
    // 双向同步：Blockly → Python
    const python = blocklyToPython(xml);
    set({ blocklyCode: xml, textCode: python });
  },

  setTextCode: (code) => {
    // 双向同步：Python → Blockly (Phase 2)
    const xml = get().phase === 'hybrid' ? pythonToBlockly(code) : '';
    set({ textCode: code, blocklyCode: xml });
  },

  runCode: async () => {
    set({ isRunning: true, hasError: false });
    const result = await skulptRunner.run(get().textCode);
    set({
      isRunning: false,
      lastResult: result,
      hasError: result.error !== null,
    });

    if (result.error) {
      // 触发错误状态展示
      useUiStore.getState().showFriendlyError(result.error);
    } else {
      // 触发庆祝
      useUiStore.getState().showCelebration();
    }
  },

  addAiMessage: (msg) =>
    set((state) => ({ aiMessages: [...state.aiMessages, msg] })),

  decrementAiQuota: () =>
    set((state) => ({ aiDailyQuota: Math.max(0, state.aiDailyQuota - 1) })),

  resetLesson: () =>
    set({ textCode: get().currentLesson?.expected_code || '', hasError: false, lastResult: null }),
}));
```

---

## 三、后端架构

### 3.1 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| **框架** | FastAPI | 异步、自动生成OpenAPI文档、Python生态 |
| **数据库** | PostgreSQL 16 | 关系型、JSONB支持课程数据 |
| **缓存** | Redis | 会话缓存、AI响应缓存、限流 |
| **认证** | JWT + HTTPOnly Cookie | 安全、无状态 |
| **AI代理** | OpenAI GPT-4o-mini API | 便宜、快速、支持system prompt |
| **对象存储** | AWS S3 / Cloudflare R2 | 作品截图、用户头像 |
| **部署** | Render / Railway | 一键部署、自动HTTPS |

### 3.2 API 设计

```
# 认证模块
POST   /api/v1/auth/register          # 注册（家长账号）
POST   /api/v1/auth/login             # 登录
POST   /api/v1/auth/child/create      # 创建孩子档案
GET    /api/v1/auth/me                # 获取当前用户信息

# 课程模块
GET    /api/v1/courses                # 获取课程列表
GET    /api/v1/courses/{level}        # 获取某级别的课程
GET    /api/v1/lessons/{lesson_id}    # 获取单课详情（JSON Schema）

# 进度模块
GET    /api/v1/progress               # 获取学习进度
POST   /api/v1/progress/record        # 记录学习行为
GET    /api/v1/progress/report/weekly # 周报数据
GET    /api/v1/progress/report/monthly# 月报数据
POST   /api/v1/progress/phase         # 更新BlockFade阶段

# AI 导师（通过后端代理，保护API Key）
POST   /api/v1/ai/tutor               # AI导师对话（限流+安全过滤）
GET    /api/v1/ai/quota               # 查询今日AI剩余次数

# 作品模块
POST   /api/v1/projects               # 保存作品（截图+代码）
GET    /api/v1/projects               # 获取作品列表
POST   /api/v1/projects/{id}/share    # 生成分享链接

# 家长面板
GET    /api/v1/parent/dashboard       # 家长总览数据
PUT    /api/v1/parent/settings        # 更新家长设置（屏幕时间等）
GET    /api/v1/parent/analytics       # 学习分析数据
```

### 3.3 数据库 Schema

```sql
-- 用户表（家长）
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100),
    role            VARCHAR(20) DEFAULT 'parent',  -- parent | teacher | admin
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 孩子档案
CREATE TABLE children (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname        VARCHAR(50) NOT NULL,
    avatar_id       VARCHAR(50),  -- 头像编号 1-12
    age             INTEGER,
    current_level   INTEGER DEFAULT 1,
    current_lesson  INTEGER DEFAULT 1,
    total_stars     INTEGER DEFAULT 0,
    streak_days     INTEGER DEFAULT 0,
    last_active     DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 课程表
CREATE TABLE lessons (
    id              VARCHAR(20) PRIMARY KEY,  -- "lesson_001"
    level           INTEGER NOT NULL,         -- 1-4
    number          INTEGER NOT NULL,         -- 课程序号
    title           VARCHAR(200) NOT NULL,
    phase           VARCHAR(20) NOT NULL,     -- block | hybrid | hint | code
    objectives      JSONB,                    -- 学习目标
    story           TEXT,                     -- 故事引入
    expected_code   TEXT,                     -- 预期代码
    validation_rules JSONB,                   -- 验证规则
    hints           JSONB,                    -- AI提示列表
    visual_config   JSONB,                    -- 视觉输出配置
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(level, number)
);

-- 学习进度
CREATE TABLE progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID REFERENCES children(id) ON DELETE CASCADE,
    lesson_id       VARCHAR(20) REFERENCES lessons(id),
    status          VARCHAR(20) DEFAULT 'in_progress',  -- not_started | in_progress | completed
    stars_earned    INTEGER DEFAULT 0,        -- 0-3星
    attempts        INTEGER DEFAULT 0,        -- 尝试次数
    time_spent      INTERVAL,                 -- 用时
    code_snapshot   TEXT,                     -- 提交的代码
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, lesson_id)
);

-- 学习事件（用于分析）
CREATE TABLE learning_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID REFERENCES children(id) ON DELETE CASCADE,
    event_type      VARCHAR(50) NOT NULL,  -- lesson_start | code_run | error | success | ai_request | phase_change
    lesson_id       VARCHAR(20),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 作品
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID REFERENCES children(id) ON DELETE CASCADE,
    lesson_id       VARCHAR(20) REFERENCES lessons(id),
    title           VARCHAR(200),
    code            TEXT,
    screenshot_url  VARCHAR(500),
    is_shared       BOOLEAN DEFAULT FALSE,
    share_token     VARCHAR(50) UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI 使用记录（限流）
CREATE TABLE ai_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID REFERENCES children(id) ON DELETE CASCADE,
    request_date    DATE DEFAULT CURRENT_DATE,
    request_count   INTEGER DEFAULT 0,
    UNIQUE(child_id, request_date)
);

-- 家长设置
CREATE TABLE parent_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_time_limit INTEGER DEFAULT 30,     -- 分钟
    notifications   JSONB DEFAULT '{"weekly_report": true, "achievement": true}',
    subscription    VARCHAR(20) DEFAULT 'free',  -- free | family | education
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 FastAPI 项目结构

```
pybuddy-api/
├── app/
│   ├── main.py                 # FastAPI 入口
│   ├── config.py               # 配置管理
│   ├── dependencies.py         # 依赖注入
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py     # 路由注册
│   │   │   ├── auth.py         # 认证路由
│   │   │   ├── courses.py      # 课程路由
│   │   │   ├── progress.py     # 进度路由
│   │   │   ├── ai_tutor.py     # AI代理路由
│   │   │   ├── projects.py     # 作品路由
│   │   │   └── parent.py       # 家长面板路由
│   │
│   ├── core/
│   │   ├── security.py         # JWT、密码哈希
│   │   ├── ai_proxy.py         # AI安全代理（限流+过滤）
│   │   └── cache.py            # Redis缓存
│   │
│   ├── models/                  # SQLAlchemy ORM
│   │   ├── user.py
│   │   ├── child.py
│   │   ├── lesson.py
│   │   ├── progress.py
│   │   └── project.py
│   │
│   ├── schemas/                 # Pydantic Schema
│   │   ├── auth.py
│   │   ├── lesson.py
│   │   ├── progress.py
│   │   └── parent.py
│   │
│   ├── services/                # 业务逻辑层
│   │   ├── lesson_service.py
│   │   ├── progress_service.py
│   │   ├── analytics_service.py  # 学习分析
│   │   └── ai_service.py         # AI交互服务
│   │
│   └── db/
│       ├── session.py            # DB连接
│       └── migrations/           # Alembic迁移
│
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

### 3.5 AI 代理端点（安全网关）

```python
# app/api/v1/ai_tutor.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.ai_proxy import AISafetyProxy, AILimiter
from app.schemas.progress import TutorRequest, TutorResponse

router = APIRouter(prefix="/ai", tags=["ai-tutor"])

@router.post("/tutor", response_model=TutorResponse)
async def chat_with_tutor(
    request: TutorRequest,
    child = Depends(get_current_child),
    limiter = Depends(AILimiter),
    proxy = Depends(AISafetyProxy),
):
    # 1. 检查今日额度
    if not limiter.check_quota(child.id):
        raise HTTPException(
            status_code=429,
            detail="今日AI导师次数已用完，明天再来哦！🌙"
        )

    # 2. 安全过滤（输入）
    safety_check = proxy.check_input(request.message)
    if not safety_check.safe:
        return TutorResponse(
            message="这个问题我们换个话题吧！不如问问编程相关的内容？🐢"
        )

    # 3. 构建上下文
    system_prompt = proxy.build_system_prompt(
        current_lesson=request.lesson_id,
        current_error=request.current_error,
        phase=request.phase,
    )

    # 4. 调用 OpenAI API
    response = await proxy.call_openai(
        system_prompt=system_prompt,
        user_message=request.message,
        conversation_history=request.history[-10:],  # 最近10条
    )

    # 5. 安全过滤（输出）
    safe_response = proxy.check_output(response)

    # 6. 记录使用
    limiter.record_usage(child.id)
    proxy.log_interaction(child.id, request, safe_response)

    return TutorResponse(message=safe_response)
```

---

## 四、课程数据格式 (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PyBuddy Lesson",
  "type": "object",
  "required": ["id", "level", "number", "title", "phase"],
  "properties": {
    "id": { "type": "string", "pattern": "^lesson_\\d{3}$" },
    "level": { "type": "integer", "minimum": 1, "maximum": 4 },
    "number": { "type": "integer", "minimum": 1, "maximum": 100 },
    "title": { "type": "string", "maxLength": 200 },
    "phase": { "type": "string", "enum": ["block", "hybrid", "hint", "code"] },
    "objectives": {
      "type": "array",
      "items": { "type": "string" },
      "description": "本课学习目标列表"
    },
    "story": {
      "type": "string",
      "description": "故事引入文本（30秒阅读量）"
    },
    "story_illustration": {
      "type": "string",
      "description": "故事插图文件名"
    },
    "blocks": {
      "type": "object",
      "properties": {
        "available": { "type": "array", "items": { "type": "string" } },
        "locked": { "type": "array", "items": { "type": "string" } }
      },
      "description": "可用的积木列表"
    },
    "expected_code": {
      "type": "string",
      "description": "预期代码（用于对照和自动补全）"
    },
    "visual": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "enum": ["turtle_canvas", "animation", "game"] },
        "expected_result": { "type": "string" },
        "config": { "type": "object" }
      }
    },
    "hints": {
      "type": "array",
      "items": { "type": "string" },
      "description": "AI导师预设提示列表"
    },
    "validation": {
      "type": "object",
      "properties": {
        "must_contain": { "type": "array", "items": { "type": "string" } },
        "must_not_contain": { "type": "array", "items": { "type": "string" } },
        "run_test": { "type": "boolean" },
        "visual_check": { "type": "string" }
      }
    },
    "debug_mode": {
      "type": "object",
      "properties": {
        "has_bug": { "type": "boolean" },
        "bug_description": { "type": "string" },
        "hint": { "type": "string" }
      },
      "description": "Bug猎人模式（故意留bug让孩子调试）"
    }
  }
}
```

示例课程数据：

```json
{
  "id": "lesson_006",
  "level": 1,
  "number": 6,
  "title": "Turtle向前走",
  "phase": "block",
  "objectives": ["学会 import turtle", "使用 turtle.forward() 让海龟移动"],
  "story": "有一只小海龟🐢，它想在沙滩上散步。你能告诉它走多远吗？",
  "story_illustration": "turtle-beach.png",
  "blocks": {
    "available": ["import", "forward", "right", "left", "color"],
    "locked": ["backward", "pen_up", "pen_down"]
  },
  "expected_code": "import turtle\nt = turtle.Turtle()\nt.forward(100)",
  "visual": {
    "type": "turtle_canvas",
    "expected_result": "海龟向右移动100像素",
    "config": { "canvas_size": [400, 300], "turtle_shape": "turtle" }
  },
  "hints": [
    "试试把数字改成200，看看海龟走多远！",
    "你知道t.right(90)会让海龟转什么方向吗？"
  ],
  "validation": {
    "must_contain": ["import turtle", "forward"],
    "run_test": true,
    "visual_check": "turtle_moved"
  }
}
```

---

## 五、MVP 交付物清单

### Week 1-2: 项目搭建

- [ ] Next.js 14 项目初始化 (TypeScript + Tailwind)
- [ ] Google Blockly 集成 + 自定义 Python Generator
- [ ] Skulpt 集成 + Turtle 画布渲染验证
- [ ] 基础 UI 框架（KidLayout + ParentLayout）
- [ ] Zustand 状态管理搭建

### Week 3-4: 核心引擎

- [ ] BlockFade Phase 1 实现（100%积木 + Python预览）
- [ ] 课程 JSON Schema 定义 + Zod 验证
- [ ] 前15课课程内容制作（JSON文件）
- [ ] 基础代码验证系统（must_contain 检查）
- [ ] SkulptRunner 封装 + 错误友好解析

### Week 5-6: AI + 用户系统

- [ ] FastAPI 后端初始化 + PostgreSQL 连接
- [ ] JWT 认证 + 家长/孩子档案
- [ ] OpenAI API 集成 + AI Safety Proxy
- [ ] 错误友好提示组件 (FriendlyError)
- [ ] 进度记录 API + IndexedDB 本地缓存

### Week 7-8: 完善 + 测试

- [ ] 完整 MVP 功能端到端测试
- [ ] 响应式适配（iPad + 桌面）
- [ ] 加载动画组件 + 音效
- [ ] 庆祝效果 (Framer Motion)
- [ ] 8岁儿童可用性测试（5-10个样本）

### Week 9-10: 上线

- [ ] Vercel 前端部署 + Render 后端部署
- [ ] PWA Service Worker 缓存课程资源
- [ ] 监控接入（Sentry + Vercel Analytics）
- [ ] 内测用户招募

---

## 六、关键路径风险与缓解

| 风险 | 影响 | 缓解方案 | 负责人 |
|------|------|----------|--------|
| Blockly Python Generator 定制复杂 | 积木→代码不工作 | 参考 EduBlocks + BlockMirror 开源实现 | 前端 |
| Skulpt Python 3 支持不完整 | 部分语法报错 | 限制课程只使用 Skulpt 支持的子集 | 课程组 |
| AI 响应延迟（2-5秒） | 孩子等不及 | 预设 hint 优先展示，AI 异步加载 | AI组 |
| 8岁孩子注意力短 | 完成率差 | 每课≤5分钟、进度自动保存 | 产品 |
| 家长不买账 | 无法转化付费 | 免费版25课足够体验价值、周报展示 | 市场 |

---

## 七、部署架构

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   CDN + WAF     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼────────┐
     │   Vercel        │          │   Render         │
     │   (Next.js)     │          │   (FastAPI)      │
     │                 │          │                  │
     │  - SSR/SSG      │          │  - API Server    │
     │  - Static files │          │  - AI Proxy      │
     │  - PWA SW       │          │  - Auth          │
     └────────┬────────┘          └────────┬─────────┘
              │                            │
              │                    ┌───────▼────────┐
              │                    │   PostgreSQL   │
              │                    │   (Supabase)   │
              │                    └────────────────┘
              │                    ┌────────────────┐
              │                    │   Redis        │
              │                    │   (Upstash)    │
              │                    └────────────────┘
              │                    ┌────────────────┐
              │                    │   S3 / R2      │
              │                    │   (作品存储)    │
              │                    └────────────────┘
              │
     ┌────────▼────────┐
     │   Client        │
     │   (Browser)     │
     │                 │
     │  - Skulpt WASM  │
     │  - Blockly      │
     │  - IndexedDB    │
     └─────────────────┘
```

---

*文档版本: v1.0 | 创建日期: 2026-05-20*
*配套文档: docs/product-plan-pybuddy.md (产品方案) | Stitch MCP (UI设计)*
