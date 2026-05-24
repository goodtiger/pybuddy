import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkTutorInput, generateTutorReply } from '@/lib/ai-tutor/safety-filter';
import { checkRateLimit, estimateTokens, recordRequest } from '@/lib/ai-tutor/rate-limiter';
import { LessonSchema } from '@/lib/courses/lesson-schema';

export const runtime = 'nodejs';

const TutorRequestSchema = z.object({
  message: z.string().min(1).max(240),
  lesson: LessonSchema,
  currentCode: z.string().max(4000),
  currentError: z.string().nullable().optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(500) }))
    .max(10)
    .optional(),
});

const AI_BASE_URL =
  process.env.AI_BASE_URL || 'https://api.openai.com/v1';

const systemPrompt = [
  '你是 PyBuddy 的儿童 Python 导师，服务对象是 6-12 岁孩子。',
  '只回答当前课程相关的 Python、Blockly、turtle、调试问题。',
  '不要直接给完整答案；给一个小提示、下一步或反问，引导孩子自己完成。',
  '使用简短中文，语气温和，每次不超过 80 个汉字。',
].join('\n');

function buildOpenaiRequestBody(
  model: string,
  contextContent: string,
  historyMessages: Array<{ role: string; content: string }>,
  userMessage: string,
) {
  return {
    model,
    instructions: systemPrompt,
    input: [
      { role: 'user', content: contextContent },
      ...historyMessages,
      { role: 'user', content: userMessage },
    ],
  };
}

function buildChatCompletionsRequestBody(
  model: string,
  contextContent: string,
  historyMessages: Array<{ role: string; content: string }>,
  userMessage: string,
) {
  return {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextContent },
      ...historyMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ],
  };
}

function extractResponseText(data: unknown): string | null {
  const record = data as Record<string, unknown>;
  if (
    data &&
    typeof data === 'object' &&
    'output_text' in data &&
    typeof data.output_text === 'string'
  ) {
    return data.output_text.trim();
  }

  if (
    'choices' in record &&
    Array.isArray(record.choices) &&
    record.choices.length > 0
  ) {
    const first = (record.choices[0] as Record<string, unknown>)
      ?.message as Record<string, unknown> | undefined;
    if (first?.content && typeof first.content === 'string') {
      return first.content.trim();
    }
  }

  return null;
}

function getIdentifier(request: Request): string {
  const learnerId = request.headers.get('x-learner-id');
  if (learnerId) return learnerId;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous';
}

function localReply(payload: z.infer<typeof TutorRequestSchema>) {
  return generateTutorReply({
    message: payload.message,
    lesson: payload.lesson,
    currentCode: payload.currentCode,
    currentError: payload.currentError,
  });
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

  const identifier = getIdentifier(request);
  const limit = checkRateLimit(identifier);
  if (!limit.allowed) {
    return NextResponse.json(
      { reply: '小老师需要休息一下，请稍等再问吧。', source: 'rate-limited' },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
  }

  try {
    const contextContent = [
      `课程：${parsed.data.lesson.title}`,
      `目标：${parsed.data.lesson.objectives.join('；')}`,
      `提示：${parsed.data.lesson.hints.join('；')}`,
      `当前代码：\n${parsed.data.currentCode || '(空)'}`,
      `当前错误：${parsed.data.currentError || '(无)'}`,
    ].join('\n\n');

    const historyMessages = (parsed.data.history || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content,
    }));

    const isResponsesApi = process.env.AI_API_ENDPOINT === 'responses' ||
      (!process.env.AI_API_ENDPOINT && AI_BASE_URL.includes('api.openai.com'));

    const apiEndpoint = process.env.AI_API_ENDPOINT === 'chat' ? '/chat/completions' :
      isResponsesApi ? '/responses' : '/chat/completions';

    const requestBody = apiEndpoint === '/responses'
      ? buildOpenaiRequestBody(
          process.env.OPENAI_TUTOR_MODEL || 'gpt-4.1-mini',
          contextContent,
          historyMessages,
          parsed.data.message,
        )
      : buildChatCompletionsRequestBody(
          process.env.OPENAI_TUTOR_MODEL || 'gpt-4.1-mini',
          contextContent,
          historyMessages,
          parsed.data.message,
        );

    const response = await fetch(`${AI_BASE_URL}${apiEndpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
    }

    const data = await response.json();
    const reply = extractResponseText(data);

    const inputTokens = estimateTokens(parsed.data.message);
    const outputTokens = reply ? estimateTokens(reply) : 0;
    recordRequest(identifier, inputTokens + outputTokens);

    return NextResponse.json({
      reply: reply || localReply(parsed.data),
      source: reply ? 'openai' : 'local',
    });
  } catch {
    return NextResponse.json({ reply: localReply(parsed.data), source: 'local' });
  }
}
