'use client';

import { LearnLessonPage } from '@/components/learning/LearnLessonPage';

export default function LearnPage({ params }: { params: { lessonId: string } }) {
  return <LearnLessonPage lessonId={params.lessonId} level={1} />;
}
