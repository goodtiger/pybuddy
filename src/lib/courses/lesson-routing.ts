export function formatLessonId(number: number) {
  return `lesson_${String(number).padStart(3, '0')}`;
}

export function getLearnPath(level: number, lessonId: string) {
  return level === 1 ? `/learn/${lessonId}` : `/learn/level-${level}/${lessonId}`;
}
