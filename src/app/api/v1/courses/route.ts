import { ok, apiError } from '@/lib/api/responses';
import { listCourseLevels } from '@/lib/courses/lesson-loader';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await listCourseLevels();
    return ok(courses);
  } catch {
    return apiError(500, 'course_list_failed', 'Unable to load courses');
  }
}
