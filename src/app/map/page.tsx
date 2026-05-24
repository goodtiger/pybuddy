'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LockIcon, StarIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { TurtleMascot } from '@/components/ui/turtle-mascot';
import { getProgressLessonKey } from '@/lib/courses/course-constants';
import { getLearnPath } from '@/lib/courses/lesson-routing';
import { useProgressStore } from '@/store/progress-store';
import { useUserStore } from '@/store/user-store';
import type { Lesson } from '@/types/lesson';

const SPACING = 220;
const ZONE_COLORS = ['#8B5CF6', '#34D399', '#B5A642', '#3B82F6'];
const ZONE_LABELS: Record<number, string[]> = {
  1: ['基础语法', '海龟入门', '循环图形', '综合创作'],
  2: ['条件判断', '随机与列表', '函数魔法', '综合项目'],
};

interface CourseLevelResponse {
  data?: {
    level: number;
    title: string;
    description: string;
    lesson_count: number;
    lessons: Lesson[];
  };
}

function lessonNumberFromId(id: string) {
  return Number(id.split('_')[1] || 0);
}

function buildZones(total: number, level: number) {
  const labels = ZONE_LABELS[level] || ZONE_LABELS[1];
  const zoneSize = Math.max(1, Math.ceil(total / labels.length));

  return labels
    .map((label, index) => ({
      name: `Zone ${index + 1}: ${label}`,
      color: ZONE_COLORS[index],
      start: index * zoneSize,
      end: Math.min(total, (index + 1) * zoneSize),
    }))
    .filter((zone) => zone.start < total);
}

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completedLessons, lessonStars, currentLevel, currentLesson, streakDays, totalStars } = useProgressStore();
  const { nickname, users } = useUserStore();
  const selectedLevel = Number(searchParams.get('level') || 1);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseLevel, setCourseLevel] = useState(selectedLevel);
  const [courseTitle, setCourseTitle] = useState('积木启蒙岛');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [pathOffset, setPathOffset] = useState(2000);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        const response = await fetch(`/api/v1/courses/${selectedLevel}`);
        if (!response.ok) throw new Error('Course request failed');
        const payload = (await response.json()) as CourseLevelResponse;
        if (!payload.data) throw new Error('Course payload missing');
        if (!cancelled) {
          setLessons(payload.data.lessons);
          setCourseLevel(payload.data.level);
          setCourseTitle(payload.data.title);
        }
      } catch {
        if (!cancelled) setLoadError('课程地图加载失败，请稍后再试。');
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [selectedLevel]);

  const svgHeight = useMemo(() => 50 + Math.max(0, lessons.length - 1) * SPACING + 200, [lessons.length]);
  const zones = useMemo(() => buildZones(lessons.length, courseLevel), [lessons.length, courseLevel]);
  const nodePositions = useMemo(
    () =>
      lessons.map((_, index) => ({
        x: 256 + Math.sin(index * 0.9) * 100,
        y: 50 + index * SPACING,
      })),
    [lessons]
  );
  const pathD = useMemo(
    () =>
      lessons
        .map((_, index) => {
          const y = 50 + index * SPACING;
          const x = 256 + Math.sin(index * 0.9) * 100;
          if (index === 0) return `M ${x} ${y}`;
          const prevX = 256 + Math.sin((index - 1) * 0.9) * 100;
          const prevY = 50 + (index - 1) * SPACING;
          const midY = (prevY + y) / 2;
          return `C ${prevX} ${midY} ${x} ${midY} ${x} ${y}`;
        })
        .join('\n  '),
    [lessons]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scrollProgress = Math.min(1, Math.max(0, -rect.top / Math.max(1, svgHeight - window.innerHeight)));
      const pathLength = svgHeight * 1.2;
      setPathOffset(pathLength - scrollProgress * pathLength);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [svgHeight]);

  const completedInLevel = useMemo(
    () => lessons.filter((lesson) => completedLessons.includes(getProgressLessonKey(lesson.level, lesson.id))),
    [completedLessons, lessons]
  );
  const displayedCurrentLesson =
    currentLevel === courseLevel ? currentLesson : Math.min(completedInLevel.length + 1, Math.max(1, lessons.length));
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(getProgressLessonKey(lesson.level, lesson.id))) || lessons[lessons.length - 1];

  if (loadError) {
    return (
      <div className="min-h-screen bg-background p-kid-md">
        <Card className="mx-auto mt-kid-lg max-w-xl border-2 border-error/40 p-kid-md text-center">
          <MascotAvatar expression="confused" size="xl" />
          <h1 className="mt-4 text-kid-xl font-heading font-bold text-error">地图打不开</h1>
          <p className="mt-2 text-kid-base text-gray-600">{loadError}</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </Card>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-kid-lg text-primary">🐢 正在铺好课程地图...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-noise-overlay">
      <Card className="fixed right-4 top-4 z-30 w-[min(18rem,calc(100vw-2rem))] rounded-[16px] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
        <div className="mb-3 flex items-center gap-3">
          <MascotAvatar expression="happy" size="md" />
          <div>
            <p className="text-[16px] font-quicksand font-bold text-[#1F2937]">Level {courseLevel}</p>
            <p className="text-[13px] text-[#6B7280]">{nickname} · {courseTitle}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="h-4 w-4 text-[#F59E0B]" filled />
            <span className="font-quicksand font-bold text-[#1F2937]">{totalStars} 星星</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#EF4444]">🔥</span>
            <span className="font-quicksand text-[#6B7280]">{streakDays} 天连续</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#3B82F6]">📚</span>
            <span className="font-quicksand text-[#6B7280]">
              {completedInLevel.length}/{lessons.length} 课程
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => router.push(`/map?level=${level}`)}
              className={`rounded-full px-3 py-2 text-[13px] font-quicksand font-bold ${
                level === courseLevel ? 'bg-[#3B82F6] text-white' : 'bg-[#EFF6FF] text-[#2563EB]'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (nextLesson) router.push(getLearnPath(nextLesson.level, nextLesson.id));
          }}
        >
          继续学习
        </Button>
        <Button className="mt-2 w-full" variant="ghost" onClick={() => router.push('/register')}>
          {users.length > 1 ? '切换学员' : '新增学员'}
        </Button>
      </Card>

      <div className="relative" style={{ height: `${svgHeight}px` }}>
        {zones.map((zone) => (
          <div
            key={zone.name}
            className="absolute w-full"
            style={{
              backgroundColor: zone.color,
              top: `${zone.start * SPACING}px`,
              height: `${(zone.end - zone.start) * SPACING}px`,
            }}
          >
            <h2 className="pt-4 text-center text-[22px] font-quicksand font-bold text-white drop-shadow-sm">
              {zone.name}
            </h2>
          </div>
        ))}

        <svg
          ref={svgRef}
          className="pointer-events-none absolute left-1/2 top-0 w-[512px] -translate-x-1/2"
          style={{ height: `${svgHeight}px`, zIndex: 1 }}
          viewBox={`0 0 512 ${svgHeight}`}
          fill="none"
        >
          <path
            d={`M 256 50 L 256 ${Math.max(50, svgHeight - 180)}`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
          <path
            d={pathD}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset={pathOffset}
            className="transition-none"
          />
        </svg>

        {lessons.map((lesson, index) => {
          const pos = nodePositions[index];
          const lessonNumber = lessonNumberFromId(lesson.id);
          const lessonKey = getProgressLessonKey(lesson.level, lesson.id);
          const isCompleted = completedLessons.includes(lessonKey);
          const isCurrent = lessonNumber === displayedCurrentLesson && !isCompleted;
          const isLocked = lessonNumber > displayedCurrentLesson;
          const stars = lessonStars[lessonKey] || 0;

          return (
            <motion.button
              key={lesson.id}
              onClick={() => !isLocked && setSelectedLesson(lesson)}
              disabled={isLocked}
              className={`absolute z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 text-[13px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-transform no-select active:scale-95 ${
                isCompleted
                  ? 'border-white bg-white text-[#1F2937]'
                  : isCurrent
                  ? 'map-node-current border-white bg-white text-[#1F2937] ring-4 ring-white/30'
                  : 'cursor-not-allowed border-white/40 bg-white/20 text-white backdrop-blur-sm'
              }`}
              style={{ left: `calc(50% + ${pos.x - 256 - 29}px)`, top: `${pos.y}px` }}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ type: 'spring', delay: index * 0.04 }}
              title={lesson.title}
            >
              {isCompleted ? (
                <div className="flex flex-col items-center">
                  <StarIcon className="h-5 w-5" filled />
                  <span className="text-[10px] text-[#F59E0B]">{stars}/3</span>
                </div>
              ) : isCurrent ? (
                <TurtleMascot expression="happy" size="sm" animate={false} className="scale-50" />
              ) : (
                <LockIcon className="h-5 w-5 text-white/60" />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
          >
            <p className="text-center text-[13px] font-quicksand font-bold text-[#3B82F6]">
              第 {selectedLesson.number} 课
            </p>
            <h3 className="mb-3 mt-1 text-center text-[20px] font-quicksand font-bold text-[#1F2937]">
              {selectedLesson.title}
            </h3>
            <p className="mb-4 text-center text-[15px] text-[#6B7280]">{selectedLesson.objectives.join(' / ')}</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedLesson(null)}>
                取消
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  useProgressStore.getState().setCurrentLesson(selectedLesson.number, selectedLesson.level);
                  router.push(getLearnPath(selectedLesson.level, selectedLesson.id));
                }}
              >
                开始
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
