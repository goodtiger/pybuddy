import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { CourseLevelSchema, LessonSchema, type CourseLevel } from '@/lib/courses/lesson-schema';
import type { Lesson } from '@/types/lesson';

const COURSE_ROOT = path.join(process.cwd(), 'public', 'courses');

const LEVEL_META: Record<number, Pick<CourseLevel, 'title' | 'description'>> = {
  1: {
    title: '积木启蒙岛',
    description: '从第一句 print 开始，解锁变量、海龟画图、循环和第一幅作品。',
  },
  2: {
    title: '判断小游戏岛',
    description: '学习 if/else、比较、随机、列表和函数，把 Python 变成会做决定的小助手。',
  },
  3: {
    title: 'Python 魔法岛',
    description: '学习 while 循环、input、字符串方法、字典和 f-string，完成更像真实程序的小游戏与创作项目。',
  },
};

function getLevelDirectory(level: number) {
  return path.join(COURSE_ROOT, `level-${level}`);
}

async function readLessonFile(filePath: string): Promise<Lesson> {
  const raw = await readFile(filePath, 'utf8');
  return LessonSchema.parse(JSON.parse(raw));
}

export async function listCourseLevels() {
  const entries = await readdir(COURSE_ROOT, { withFileTypes: true });
  const levels = entries
    .filter((entry) => entry.isDirectory() && /^level-\d+$/.test(entry.name))
    .map((entry) => Number(entry.name.replace('level-', '')))
    .sort((a, b) => a - b);

  const courses = await Promise.all(levels.map((level) => loadCourseLevel(level)));

  return courses.map(({ lessons, ...course }) => ({
    ...course,
    lesson_count: lessons.length,
  }));
}

export async function loadCourseLevel(level: number): Promise<CourseLevel> {
  const levelDir = getLevelDirectory(level);
  const files = await readdir(levelDir);
  const lessons = await Promise.all(
    files
      .filter((file) => /^lesson_\d+\.json$/.test(file))
      .sort()
      .map((file) => readLessonFile(path.join(levelDir, file)))
  );
  const meta = LEVEL_META[level] || {
    title: `Level ${level}`,
    description: 'Python 学习课程',
  };

  return CourseLevelSchema.parse({
    level,
    title: meta.title,
    description: meta.description,
    lesson_count: lessons.length,
    lessons,
  });
}

export async function loadLesson(level: number, lessonId: string) {
  const normalizedLessonId = lessonId.endsWith('.json') ? lessonId.slice(0, -5) : lessonId;
  const filePath = path.join(getLevelDirectory(level), `${normalizedLessonId}.json`);
  return readLessonFile(filePath);
}
