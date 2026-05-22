import { ok, apiError } from '@/lib/api/responses';
import { loadCourseLevel } from '@/lib/courses/lesson-loader';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { level: string } }) {
  const level = Number(params.level);
  if (!Number.isInteger(level) || level <= 0) {
    return apiError(400, 'invalid_level', 'Level must be a positive integer');
  }

  try {
    const course = await loadCourseLevel(level);
    return ok(course);
  } catch {
    return apiError(404, 'course_not_found', 'Course level not found');
  }
}
