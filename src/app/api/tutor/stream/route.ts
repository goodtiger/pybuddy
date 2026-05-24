import { z } from 'zod';
import { checkTutorInput, generateTutorReply } from '@/lib/ai-tutor/safety-filter';
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

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

const systemPrompt = [
  '你是 PyBuddy 的儿童 Python 导师，服务对象是 6-12 岁孩子。',
  '只回答当前课程相关的 Python、Blockly、turtle、调试问题。',
  '不要直接给完整答案；给一个小提示、下一步或反问，引导孩子自己完成。',
  '使用简短中文，语气温和，每次不超过 80 个汉字。',
].join('\n');

function sseEncode(data: string): string {
  return `data: ${data}\n\n`;
}

function sseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
}

function sendLocalSseReply(payload: z.infer<typeof TutorRequestSchema>, source: string): Response {
  const localReply = generateTutorReply({
    message: payload.message,
    lesson: payload.lesson,
    currentCode: payload.currentCode,
    currentError: payload.currentError,
  });
  return new Response(
    `${sseEncode(JSON.stringify({ text: localReply }))}event: done\n${sseEncode(JSON.stringify({ source }))}`,
    { headers: sseHeaders() },
  );
}

function chooseApiEndpoint(): '/responses' | '/chat/completions' {
  if (process.env.AI_API_ENDPOINT === 'chat') return '/chat/completions';
  if (process.env.AI_API_ENDPOINT === 'responses') return '/responses';
  return AI_BASE_URL.includes('api.openai.com') ? '/responses' : '/chat/completions';
}

function buildStreamBody(payload: z.infer<typeof TutorRequestSchema>, endpoint: string) {
  const contextContent = [
    `课程：${payload.lesson.title}`,
    `目标：${payload.lesson.objectives.join('；')}`,
    `提示：${payload.lesson.hints.join('；')}`,
    `当前代码：\n${payload.currentCode || '(空)'}`,
    `当前错误：${payload.currentError || '(无)'}`,
  ].join('\n\n');

  const historyMessages = (payload.history || []).map((msg) => ({
    role: msg.role === 'user' ? 'user' : (endpoint === '/responses' ? 'model' : 'assistant'),
    content: msg.content,
  }));

  const model = process.env.OPENAI_TUTOR_MODEL || 'gpt-4.1-mini';

  if (endpoint === '/responses') {
    return {
      model,
      stream: true,
      instructions: systemPrompt,
      input: [
        { role: 'user', content: contextContent },
        ...historyMessages,
        { role: 'user', content: payload.message },
      ],
    };
  }

  return {
    model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextContent },
      ...historyMessages,
      { role: 'user', content: payload.message },
    ],
  };
}

function parseChatCompletionsChunk(raw: string): string | null {
  if (raw === '[DONE]') return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const choices = parsed.choices as Array<Record<string, unknown>> | undefined;
    if (choices?.[0]?.delta) {
      const delta = choices[0].delta as Record<string, unknown>;
      if (typeof delta.content === 'string') return delta.content;
    }
  } catch {
    return null;
  }
  return null;
}

function parseResponsesApiChunk(raw: string): string | null | 'done' {
  if (raw === '[DONE]') return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const type = parsed.type as string | undefined;
    if (type === 'output_text.delta') {
      const delta = parsed.delta as string | undefined;
      return typeof delta === 'string' ? delta : null;
    }
    if (type === 'output_text.done') return 'done';
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  const parsed = TutorRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return new Response(sseEncode(JSON.stringify({ text: '请求参数无效' })), {
      headers: sseHeaders(),
    });
  }

  const safety = checkTutorInput(parsed.data.message);
  if (!safety.safe) {
    return new Response(
      `event: error\n${sseEncode(JSON.stringify({ text: safety.reason || '我们先回到这节 Python 课吧。' }))}`,
      { headers: sseHeaders() },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return sendLocalSseReply(parsed.data, 'local');

  try {
    const endpoint = chooseApiEndpoint();
    const requestBody = buildStreamBody(parsed.data, endpoint);

    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) return sendLocalSseReply(parsed.data, 'local');

    const openAiStream = response.body;
    if (!openAiStream) {
      return new Response(sseEncode(JSON.stringify({ text: '服务器响应异常' })), {
        headers: sseHeaders(),
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';

    const isChatCompletions = endpoint === '/chat/completions';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openAiStream as unknown as AsyncIterable<Uint8Array>) {
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(':')) continue;

              if (!trimmed.startsWith('data: ')) continue;
              const dataStr = trimmed.slice(6);

              const delta = isChatCompletions
                ? parseChatCompletionsChunk(dataStr)
                : parseResponsesApiChunk(dataStr);

              if (delta === 'done') {
                controller.enqueue(
                  encoder.encode(`event: done\n${sseEncode(JSON.stringify({ source: 'openai' }))}`),
                );
                controller.close();
                return;
              }
              if (delta) {
                controller.enqueue(encoder.encode(sseEncode(JSON.stringify({ text: delta }))));
              }
            }
          }

          controller.enqueue(
            encoder.encode(`event: done\n${sseEncode(JSON.stringify({ source: 'openai' }))}`),
          );
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(sseEncode(JSON.stringify({ text: generateTutorReply({
            message: parsed.data.message,
            lesson: parsed.data.lesson,
            currentCode: parsed.data.currentCode,
            currentError: parsed.data.currentError,
          }) }))));
          controller.enqueue(
            encoder.encode(`event: done\n${sseEncode(JSON.stringify({ source: 'local' }))}`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch {
    return sendLocalSseReply(parsed.data, 'local');
  }
}
