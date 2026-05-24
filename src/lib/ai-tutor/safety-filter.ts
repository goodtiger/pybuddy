import type { Lesson } from '@/types/lesson';

// ─── Layer 1: Input Keyword Blocklist (30+ terms) ────────────────────────────

const BLOCKED_KEYWORDS = [
  // Violence
  '暴力', '打架', '杀人', '打死', '砍人', '伤害',
  // Sexual/Adult content
  '色情', '黄色', '裸体', '性行为', '成人内容', 'h 漫', 'av',
  // Self-harm
  '自杀', '自残', '割腕', '跳楼', '不想活', '活不下去',
  // Weapons
  '武器', '枪支', '炸弹', '炸药', '匕首', '刀剑', '枪',
  // Drugs
  '毒品', '大麻', '海洛因', '冰毒', '摇头丸', '吸毒',
  // Personal information
  '银行卡', '密码', '住址', '手机号', '身份证号', '家庭地址', '真实姓名',
  '电话号码', 'qq 号', '微信号',
  // Financial
  'credit card', '转账', '汇款', '洗钱',
  // Other inappropriate
  'password', 'address', 'phone', 'porn', 'sex', 'kill', 'bomb', 'gun', 'drug',
];

// ─── Layer 2: Regex patterns for evasion detection ───────────────────────────

const EVASION_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Spaced Chinese characters (e.g. "暴 力", "自 杀")
  { pattern: /暴\s*力/, label: '暴力' },
  { pattern: /色\s*情/, label: '色情' },
  { pattern: /自\s*[杀残]/, label: '自残' },
  { pattern: /枪\s*支?/, label: '武器' },
  { pattern: /炸\s*弹/, label: '武器' },
  { pattern: /毒\s*品/, label: '毒品' },
  { pattern: /黄\s*色/, label: '成人内容' },
  { pattern: /裸\s*体/, label: '成人内容' },
  { pattern: /杀\s*人/, label: '暴力' },
  { pattern: /打\s*架/, label: '暴力' },

  // Pinyin-based evasion
  { pattern: /\b(bao\s*li)\b/i, label: '暴力' },
  { pattern: /\b(se\s*qing)\b/i, label: '色情' },
  { pattern: /\b(zi\s*sha)\b/i, label: '自残' },
  { pattern: /\b(qiang)\b/i, label: '武器' },
  { pattern: /\b(zha\s*dan)\b/i, label: '武器' },
  { pattern: /\b(du\s*pin)\b/i, label: '毒品' },
  { pattern: /\b(se\s*qing|porn)\b/i, label: '成人内容' },
  { pattern: /\b(kill|bomb|gun)\b/i, label: '危险内容' },
];

// ─── Layer 3: Off-topic detection ────────────────────────────────────────────

const OFF_TOPIC_KEYWORDS = ['游戏外挂', '作业答案', '聊天', '视频', '买东西', '追星', '八卦'];

// ─── Child-friendly rejection messages ───────────────────────────────────────

const CHILD_FRIENDLY_BLOCKED =
  '这个问题可能不太适合我们的编程课呢～不如我们一起帮小海龟画出更漂亮的图案吧？';

const CHILD_FRIENDLY_OFF_TOPIC =
  '我现在只想陪你学 Python 哦！我们先回到这节课的积木和代码好吗？';

// ─── Output filtering: answer detection ──────────────────────────────────────

// Matches multi-line code blocks (Python/Blockly style)
const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

// Heuristic: detect if text contains 5+ consecutive lines that look like code
const CODE_LINE_PATTERN = /^( {2,}|\t|import |from |def |class |for |while |if |print\(|turtle\.|[\w_]+\s*=\s*)/m;

// ─── Frequency tracking (in-memory, per-session) ────────────────────────────

const recentMessages: { text: string; timestamp: number }[] = [];
const FREQUENCY_WINDOW_MS = 30_000;
const FREQUENCY_MAX_REPEATS = 3;

// ─── Public types ────────────────────────────────────────────────────────────

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  severity: 'blocked' | 'off-topic' | 'safe';
}

// ─── Input filtering ─────────────────────────────────────────────────────────

function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u00A0\u3000]+/g, ' ')
    .trim();
}

function checkKeywordMatch(normalized: string): string | null {
  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

function checkEvasionPatterns(original: string): string | null {
  for (const { pattern, label } of EVASION_PATTERNS) {
    if (pattern.test(original)) {
      return label;
    }
  }
  return null;
}

function checkLength(text: string): { ok: boolean; message?: string } {
  if (text.length > 240) {
    return {
      ok: false,
      message: '你的话有点长呢，可以简短一点再说一次吗？这样我能更好地帮你～',
    };
  }
  if (text.length === 0) {
    return {
      ok: false,
      message: '你还没有说话呢～试试告诉我你的 Python 问题吧。',
    };
  }
  return { ok: true };
}

function checkFrequency(text: string): boolean {
  const now = Date.now();
  while (
    recentMessages.length > 0 &&
    now - recentMessages[0].timestamp > FREQUENCY_WINDOW_MS
  ) {
    recentMessages.shift();
  }

  const normalized = text.trim().toLowerCase();
  const repeatCount = recentMessages.filter(
    (m) => m.text.toLowerCase() === normalized,
  ).length;

  if (repeatCount >= FREQUENCY_MAX_REPEATS) {
    return false;
  }

  recentMessages.push({ text: normalized, timestamp: now });
  return true;
}

export function checkTutorInput(message: string): SafetyCheckResult {
  const lengthCheck = checkLength(message);
  if (!lengthCheck.ok) {
    return {
      safe: false,
      reason: lengthCheck.message,
      severity: 'off-topic',
    };
  }

  const normalized = normalizeInput(message);

  const blockedKeyword = checkKeywordMatch(normalized);
  if (blockedKeyword) {
    return {
      safe: false,
      reason: CHILD_FRIENDLY_BLOCKED,
      severity: 'blocked',
    };
  }

  const evasionLabel = checkEvasionPatterns(message);
  if (evasionLabel) {
    return {
      safe: false,
      reason: CHILD_FRIENDLY_BLOCKED,
      severity: 'blocked',
    };
  }

  for (const topic of OFF_TOPIC_KEYWORDS) {
    if (normalized.includes(topic.toLowerCase())) {
      return {
        safe: false,
        reason: CHILD_FRIENDLY_OFF_TOPIC,
        severity: 'off-topic',
      };
    }
  }

  if (!checkFrequency(message)) {
    return {
      safe: false,
      reason: '你已经说过这句话几次啦～换个方式告诉我你的 Python 问题好吗？',
      severity: 'off-topic',
    };
  }

  return { safe: true, severity: 'safe' };
}

// ─── Output filtering ────────────────────────────────────────────────────────

function containsFullAnswer(text: string): boolean {
  const codeBlocks = text.match(CODE_BLOCK_PATTERN);
  if (codeBlocks) {
    for (const block of codeBlocks) {
      const inner = block.replace(/```\w*\n?/g, '').trim();
      const lines = inner.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length >= 5) {
        return true;
      }
    }
  }

  const lines = text.split('\n');
  let consecutiveCodeLines = 0;
  for (const line of lines) {
    if (line.trim().length === 0) {
      consecutiveCodeLines = 0;
      continue;
    }
    if (CODE_LINE_PATTERN.test(line)) {
      consecutiveCodeLines++;
      if (consecutiveCodeLines >= 5) {
        return true;
      }
    } else {
      consecutiveCodeLines = 0;
    }
  }

  return false;
}

function containsSensitiveContent(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

function truncateToMax(text: string, maxChars: number): string {
  let charCount = 0;
  let result = '';
  for (const char of text) {
    charCount++;
    if (charCount > maxChars) {
      break;
    }
    result += char;
  }
  if (charCount > maxChars) {
    result += '……';
  }
  return result;
}

export function filterTutorOutput(text: string): string {
  const sensitive = containsSensitiveContent(text);
  if (sensitive) {
    return '让我们换个话题，继续聊编程吧～你今天想写什么样的代码呢？';
  }

  if (containsFullAnswer(text)) {
    return '我不能直接把完整代码告诉你哦，这样你就学不到新本领了。不如先试试你最熟悉的那块积木？';
  }

  return truncateToMax(text, 120);
}

// ─── Tutor reply generation (scene-matching, 30+ templates) ──────────────────

// Scene: error types (8)
const ERROR_REPLIES: { match: (err: string) => boolean; reply: string }[] = [
  {
    match: (err) => err.includes('SyntaxError'),
    reply: '语法错误就像说话少了标点，Python 听不懂。看看提示里的行号，是不是少了冒号或引号？点进去那一行找找看。',
  },
  {
    match: (err) => err.includes('NameError'),
    reply: '这个变量名 Python 还不认识呢。先用积木给它取个名字吧！就像给盒子贴标签，贴好了才能装东西。',
  },
  {
    match: (err) => err.includes('TypeError'),
    reply: '类型不对哦。就像你想把苹果和数字相加。看看是不是用了错误的数据类型？把两边的积木检查一下。',
  },
  {
    match: (err) => err.includes('IndentationError'),
    reply: 'Python 很在意空格！每一行前面的空格数量要一致，就像排队一样整齐。检查一下有没有对齐。',
  },
  {
    match: (err) => err.includes('ValueError'),
    reply: '这个值不太对，Python 没法处理。看看是不是给了一个超出范围的数字？试试换个小的值。',
  },
  {
    match: (err) => err.includes('IndexError'),
    reply: '列表里没有这个位置的元素哦。就像你只有三本书却想拿第五本。先数数列表有多长吧！',
  },
  {
    match: (err) => err.includes('AttributeError'),
    reply: '这个对象没有你要的那个方法。就像你想让猫咪学狗叫。看看这个积木能不能用在这个对象上。',
  },
  {
    match: () => true,
    reply: '先看错误提示里提到的那一行。你能找到少了哪个符号，或者哪一行没有排整齐吗？点进去仔细看看。',
  },
];

// Scene: knowledge point explanations (15)
const KNOWLEDGE_REPLIES: { match: (msg: string, lower: string) => boolean; reply: string }[] = [
  {
    match: (_, lower) => lower.includes('print') || lower.includes('打印'),
    reply: 'print 就像让 Python 大声说话。把你想说的话放进引号里，运行看看！试试 print("你好")。',
  },
  {
    match: (_, lower) => lower.includes('input'),
    reply: 'input 让 Python 停下来听你说话。它会等你输入文字再按回车。试试 x = input("请输入")。',
  },
  {
    match: (msg) => msg.includes('变量') || msg.includes('名字') || msg.includes('赋值'),
    reply: '变量就像一个贴了标签的盒子。你把值放进盒子，以后随时可以拿出来。试试 name = "小明"。',
  },
  {
    match: (_, lower) => /[*+/\-]/.test(lower) && (lower.includes('算') || lower.includes('加减乘除') || lower.includes('数学')),
    reply: 'Python 会做数学！+ 是加，- 是减，* 是乘，/ 是除。试试看 print(2 + 3) 会输出什么？',
  },
  {
    match: (_, lower) => lower.includes('for') || lower.includes('循环'),
    reply: '循环像小复印机，会把里面的动作重复很多次。想想这个动作要重复几次？先写一个最小的循环试试。',
  },
  {
    match: (_, lower) => lower.includes('if') || lower.includes('else') || lower.includes('判断') || lower.includes('条件'),
    reply: 'if 就像做选择题。如果满足条件就做一件事，否则做另一件。先想清楚你的条件是什么？',
  },
  {
    match: (_, lower) => lower.includes('forward') || lower.includes('前进'),
    reply: '让小海龟向前走！括号里的数字是步数，试试 50 或 100，看看它走多远。',
  },
  {
    match: (_, lower) => (lower.includes('left') || lower.includes('right') || lower.includes('转弯')) && lower.includes('turtle'),
    reply: '让小海龟转弯！角度用数字表示，90 度就是直角。试试 turtle.left(90) 看它转过去没有。',
  },
  {
    match: (_, lower) => lower.includes('color') && lower.includes('turtle'),
    reply: '给小海龟换一支彩色笔！试试 "red"、"blue" 或者 "green"。你喜欢什么颜色？',
  },
  {
    match: (msg) => msg.includes('列表') || msg.includes('list') || (msg.includes('[') && msg.includes(']')),
    reply: '列表像购物清单，可以装很多东西。用方括号 [ ] 把它们包起来。试试 ["苹果", "香蕉"]。',
  },
  {
    match: (_, lower) => lower.includes('append') || lower.includes('添加') || lower.includes('加进去'),
    reply: 'append 就是往清单里加新东西。list.append("新物品") 就行！加完再打印看看清单变长了没。',
  },
  {
    match: (msg) => msg.includes('函数') || msg.includes('def') || msg.includes('定义'),
    reply: '函数像一个打包的小工具。你把步骤装进去，随时可以拿出来用。先想想这个工具要做什么？',
  },
  {
    match: (_, lower) => lower.includes('range'),
    reply: 'range 帮你数数。range(5) 就是从 0 数到 4，一共 5 个数。试试把它放进 for 循环里跑跑看。',
  },
  {
    match: (_, lower) => lower.includes('random') || lower.includes('随机'),
    reply: 'random 就像掷骰子，每次结果都不一样。试试 random.randint(1, 6)，看看能摇到几！',
  },
  {
    match: (_, lower) => lower.includes('len') || lower.includes('长度') || lower.includes('多少个'),
    reply: 'len 帮你数列表里有几个东西。就像数购物清单上有多少项。试试 len(["苹果", "香蕉"]) 会返回几？',
  },
];

// Scene: learning guidance (7)
const GUIDANCE_REPLIES: { match: (msg: string, lower: string) => boolean; reply: string }[] = [
  {
    match: (_, lower) => lower.includes('答案') || lower.includes('怎么写') || lower.includes('不会') || lower.includes('怎么做'),
    reply: '先试试最小的一步：拖一个积木，运行一次，看看发生了什么。每一步都是一个小实验！',
  },
  {
    match: (msg) => msg.includes('为什么错了') || msg.includes('为什么不行') || msg.includes('错在哪'),
    reply: '看看错误提示说了什么？它就像小海龟在告诉你哪里不舒服。点进那个行号，找找看少了什么。',
  },
  {
    match: (msg) => msg.includes('看不懂') || msg.includes('不明白') || msg.includes('不理解') || msg.includes('太难'),
    reply: '没关系，编程开始都觉得难。先把大目标拆成小步骤，一步一步来。你今天只想搞懂一件事就好。',
  },
  {
    match: (msg) => msg.includes('做完了') || msg.includes('成功了') || msg.includes('运行了') || msg.includes('好了'),
    reply: '太棒了！你做到了！要不要试试加一个新功能让它更酷？比如换个颜色或者多走几步？',
  },
  {
    match: (msg) => msg.includes('帮我写') || msg.includes('你写') || msg.includes('直接给我'),
    reply: '我不能帮你写哦，但我可以陪你一起想。你觉得第一步应该做什么？先告诉我最小的那个动作。',
  },
  {
    match: (msg) => msg.includes('什么意思') || msg.includes('是什么') || msg.includes('怎么用'),
    reply: '别急，我们一点一点来。你先把那个积木拖到代码区，运行一次，看看它做了什么变化。',
  },
  {
    match: () => true,
    reply: '先试一个最小步骤：拖一个积木、运行一次，再观察画布发生了什么。每一步都能学到新东西！',
  },
];

export function generateTutorReply({
  message,
  lesson,
  currentCode,
  currentError,
}: {
  message: string;
  lesson: Lesson;
  currentCode: string;
  currentError?: string | null;
}): string {
  const safety = checkTutorInput(message);
  if (!safety.safe) return safety.reason || '我们先回到这节 Python 课吧。';

  const lower = message.toLowerCase();

  // Priority 1: Error type matching
  if (currentError) {
    const missingToken = lesson.validation.must_contain.find(
      (token) => !currentCode.includes(token),
    );
    if (missingToken) {
      return `还没用到 ${missingToken} 呢。它像任务清单上的贴纸，找到了就拖上去试试吧。`;
    }
    for (const { match, reply } of ERROR_REPLIES) {
      if (match(currentError)) return reply;
    }
  }

  // Priority 2: Knowledge point explanations
  for (const { match, reply } of KNOWLEDGE_REPLIES) {
    if (match(message, lower)) return reply;
  }

  // Priority 3: Learning guidance
  for (const { match, reply } of GUIDANCE_REPLIES) {
    if (match(message, lower)) return reply;
  }

  // Fallback: lesson hint
  return lesson.hints[0] || '先试一个最小步骤：拖一个积木、运行一次，再观察画布发生了什么。';
}
