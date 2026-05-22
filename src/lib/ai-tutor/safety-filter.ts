import type { Lesson } from '@/types/lesson';

const BLOCKED_TOPICS = [
  '暴力',
  '色情',
  '自杀',
  '武器',
  '毒品',
  '银行卡',
  '密码',
  '住址',
  '手机号',
  'password',
  'credit card',
  'address',
  'phone',
];

const OFF_TOPIC_HINTS = ['游戏外挂', '作业答案', '聊天', '视频', '买东西'];

export function checkTutorInput(message: string): { safe: boolean; reason?: string } {
  const normalized = message.toLowerCase();

  if (BLOCKED_TOPICS.some((topic) => normalized.includes(topic.toLowerCase()))) {
    return {
      safe: false,
      reason: '这个问题不适合在编程课里聊。我们可以继续帮小海龟写代码。',
    };
  }

  if (OFF_TOPIC_HINTS.some((topic) => normalized.includes(topic.toLowerCase()))) {
    return {
      safe: false,
      reason: '我现在只陪你解决这节 Python 课的问题。我们回到积木和代码吧。',
    };
  }

  return { safe: true };
}

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
  if (!safety.safe) return safety.reason || '我们先回到这节课的 Python 问题吧。';

  const lower = message.toLowerCase();
  const missingToken = lesson.validation.must_contain.find((token) => !currentCode.includes(token));

  if (currentError) {
    if (currentError.includes('还没有用到') || missingToken) {
      return `先找找有没有用到 ${missingToken || '这节课需要的积木'}。它像任务清单上的贴纸，贴上了才能过关。`;
    }
    return '先看错误提示里提到的那一行。你能找到少了哪个符号，或者哪一行没有排整齐吗？';
  }

  if (lower.includes('答案') || lower.includes('怎么写') || lower.includes('不会')) {
    return `试试从第一个目标开始：${lesson.objectives[0]}。你可以先拖一个最像这个目标的积木。`;
  }

  if (lower.includes('print') || message.includes('打印')) {
    return 'print 就像让 Python 大声说话。把你想说的话放进引号里，再运行看看。';
  }

  if (lower.includes('turtle') || message.includes('海龟')) {
    return '小海龟会按顺序听命令。先准备 turtle，再告诉它前进、转弯或换颜色。';
  }

  if (lower.includes('for') || message.includes('循环')) {
    return '循环像小复印机，会把里面的动作重复很多次。你可以先想：这个动作要重复几次？';
  }

  return lesson.hints[0] || '先试一个最小步骤：拖一个积木、运行一次，再观察画布发生了什么。';
}
