'use client';

import { usePathname } from 'next/navigation';
import { LearnLessonPage } from '@/components/learning/LearnLessonPage';

function parseLevelFromPath(pathname: string) {
  const match = pathname.match(/\/learn\/level-(\d+)\//);
  return match ? Number(match[1]) : 1;
}

function parseLessonIdFromPath(pathname: string) {
  const match = pathname.match(/\/learn\/level-\d+\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : 'lesson_001';
}

export default function LevelLearnPage({ params }: { params: { lessonId?: string } }) {
  const pathname = usePathname();
  return (
    <LearnLessonPage
      lessonId={params.lessonId || parseLessonIdFromPath(pathname)}
      level={parseLevelFromPath(pathname)}
    />
  );
}
