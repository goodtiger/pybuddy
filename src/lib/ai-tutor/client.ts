import { generateTutorReply } from '@/lib/ai-tutor/safety-filter';
import type { Lesson } from '@/types/lesson';

interface TutorMessage {
  role: string;
  content: string;
}

interface TutorClientInput {
  message: string;
  lesson: Lesson;
  currentCode: string;
  currentError?: string | null;
  history?: TutorMessage[];
}

export async function askTutor(input: TutorClientInput): Promise<string> {
  try {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.message,
        lesson: input.lesson,
        currentCode: input.currentCode,
        currentError: input.currentError,
        history: input.history,
      }),
    });

    if (!response.ok) {
      throw new Error('Tutor API failed');
    }

    const data = (await response.json()) as { reply?: string };
    if (data.reply) {
      return data.reply;
    }
  } catch {
    // Keep the child experience available offline or without a configured API key.
  }

  return generateTutorReply({
    message: input.message,
    lesson: input.lesson,
    currentCode: input.currentCode,
    currentError: input.currentError,
  });
}

export interface TutorStreamResult {
  source: 'openai' | 'local' | 'safety';
}

export async function askTutorStream(
  input: TutorClientInput & { history?: Array<{ role: string; content: string }> },
  onChunk: (chunk: string) => void
): Promise<TutorStreamResult> {
  const response = await fetch('/api/tutor/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      lesson: input.lesson,
      currentCode: input.currentCode,
      currentError: input.currentError,
      history: input.history,
    }),
  });

  if (!response.ok) {
    onChunk('小老师暂时无法回复，请稍后再试。');
    return { source: 'local' };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onChunk('小老师暂时无法回复，请稍后再试。');
    return { source: 'local' };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let source: TutorStreamResult['source'] = 'openai';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event: ')) {
          const eventType = trimmed.slice(7).trim();
          if (eventType === 'done') {
            // Next data line will contain source
            continue;
          }
          if (eventType === 'error') {
            return { source: 'safety' };
          }
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          try {
            const data = JSON.parse(dataStr) as { text?: string; source?: string };
            if (data.text) {
              onChunk(data.text);
            }
            if (data.source) {
              source = data.source as TutorStreamResult['source'];
            }
          } catch {
            // skip non-JSON data
          }
        }
      }
    }
  } catch {
    // Stream error — already received chunks remain valid
  } finally {
    reader.releaseLock();
  }

  return { source };
}
