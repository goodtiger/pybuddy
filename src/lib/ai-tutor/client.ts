import { generateTutorReply } from '@/lib/ai-tutor/safety-filter';
import type { Lesson } from '@/types/lesson';

interface TutorClientInput {
  message: string;
  lesson: Lesson;
  currentCode: string;
  currentError?: string | null;
}

export async function askTutor(input: TutorClientInput): Promise<string> {
  try {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
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
