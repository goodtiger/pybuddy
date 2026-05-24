export const LEVEL_LESSON_COUNTS: Record<number, number> = {
  1: 15,
  2: 12,
};

export const LEVEL_1_LESSON_COUNT = LEVEL_LESSON_COUNTS[1];
export const LEVEL_2_LESSON_COUNT = LEVEL_LESSON_COUNTS[2];
export const TOTAL_LESSON_COUNT = Object.values(LEVEL_LESSON_COUNTS).reduce((total, count) => total + count, 0);

export function getLessonCountForLevel(level: number) {
  return LEVEL_LESSON_COUNTS[level] || LEVEL_1_LESSON_COUNT;
}

export function getProgressLessonKey(level: number, lessonId: string) {
  return `level_${level}:${lessonId}`;
}

export function parseProgressLessonKey(key: string) {
  const match = key.match(/^level_(\d+):(.+)$/);
  if (!match) return { level: 1, lessonId: key };
  return { level: Number(match[1]), lessonId: match[2] };
}

export function normalizeProgressLessonKey(key: string) {
  const { level, lessonId } = parseProgressLessonKey(key);
  return getProgressLessonKey(level, lessonId);
}
