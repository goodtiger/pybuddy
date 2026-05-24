import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkTutorInput, generateTutorReply } from '@/lib/ai-tutor/safety-filter';
import { LessonSchema } from '@/lib/courses/lesson-schema';

export const runtime = 'nodejs';

const TutorRequestSchema = z.object({
  message: z.string().min(1).max(240),
  lesson: LessonSchema,
  currentCode: z.string().max(4000),
  currentError: z.string().nullable().optional(),
});

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

function localReply(payload: z.infer<typeof TutorRequestSchema>) {
  return generateTutorReply({
    message: payload.message,
    lesson: payload.lesson,
    currentCode: payload.currentCode,
    currentError: payload.currentError,
  });
}

function extractResponseText(data: unknown): string | null {
  if (
    data &&
    typeof data === 'object' &&
    'output_text' in data &&
    typeof data.output_text === 'string'
  ) {
    return data.output_text.trim();
  }

  return null;
}

export async function POST(request: Request) {
  const parsed = TutorRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid tutor request' }, { status: 400 });
  }

  const safety = checkTutorInput(parsed.data.message);
  if (!safety.safe) {
    return NextResponse.json({
      reply: safety.reason || '我们先回到这节 Python 课吧。',
      source: 'safety',
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TUTOR_MODEL || 'gpt-4.1-mini',
        instructions: [
          '你是 PyBuddy 的儿童 Python 导师，服务对象是 6-12 岁孩子。',
          '只回答当前课程相关的 Python、Blockly、turtle、调试问题。',
          '不要直接给完整答案；给一个小提示、下一步或反问，引导孩子自己完成。',
          '使用简短中文，语气温和，每次不超过 80 个汉字。',
        ].join('\n'),
        input: [
          `课程：${parsed.data.lesson.title}`,
          `目标：${parsed.data.lesson.objectives.join('；')}`,
          `提示：${parsed.data.lesson.hints.join('；')}`,
          `当前代码：\n${parsed.data.currentCode || '(空)'}`,
          `当前错误：${parsed.data.currentError || '(无)'}`,
          `孩子的问题：${parsed.data.message}`,
        ].join('\n\n'),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
    }

    const data = await response.json();
    const reply = extractResponseText(data);

    return NextResponse.json({
      reply: reply || localReply(parsed.data),
      source: reply ? 'openai' : 'local',
    });
  } catch {
    return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
  }
}
