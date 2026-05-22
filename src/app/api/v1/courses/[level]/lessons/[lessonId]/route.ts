import { ok, apiError } from '@/lib/api/responses';
import { loadLesson } from '@/lib/courses/lesson-loader';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { level: string; lessonId: string } }) {
  const level = Number(params.level);
  if (!Number.isInteger(level) || level <= 0) {
    return apiError(400, 'invalid_level', 'Level must be a positive integer');
  }

  try {
    const lesson = await loadLesson(level, params.lessonId);
    return ok(lesson);
  } catch {
    return apiError(404, 'lesson_not_found', 'Lesson not found');
  }
}
