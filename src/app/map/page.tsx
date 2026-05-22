'use client';

import { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '@/store/progress-store';
import { TurtleMascot } from '@/components/ui/turtle-mascot';
import { StarIcon, LockIcon } from '@/components/icons';
import { motion } from 'framer-motion';

const LESSONS = [
  { id: 'lesson_001', title: '你好，世界！' },
  { id: 'lesson_002', title: '我的名字是...' },
  { id: 'lesson_003', title: '数字魔法' },
  { id: 'lesson_004', title: '认识小海龟' },
  { id: 'lesson_005', title: '小海龟向前走' },
  { id: 'lesson_006', title: '转个弯' },
  { id: 'lesson_007', title: '画正方形' },
  { id: 'lesson_008', title: '彩色画笔' },
  { id: 'lesson_009', title: '画三角形' },
  { id: 'lesson_010', title: '画五角星' },
  { id: 'lesson_011', title: '循环入门' },
  { id: 'lesson_012', title: '循环画圆' },
  { id: 'lesson_013', title: '画螺旋' },
  { id: 'lesson_014', title: '画花朵' },
  { id: 'lesson_015', title: '自由创作' },
];

const ZONES = [
  { name: 'Zone 1: 基础语法', color: '#8B5CF6', start: 0, end: 4 },
  { name: 'Zone 2: 程序结构', color: '#34D399', start: 4, end: 8 },
  { name: 'Zone 3: 数据类型', color: '#B5A642', start: 8, end: 12 },
  { name: 'Zone 4: 综合应用', color: '#3B82F6', start: 12, end: 15 },
];

// Generate path and node positions dynamically
const SPACING = 220;
const PATH_D = LESSONS.map((_, i) => {
  const y = 50 + i * SPACING;
  const x = 256 + Math.sin(i * 0.9) * 100;
  if (i === 0) return `M ${x} ${y}`;
  const prevX = 256 + Math.sin((i - 1) * 0.9) * 100;
  const prevY = 50 + (i - 1) * SPACING;
  const midY = (prevY + y) / 2;
  return `C ${prevX} ${midY} ${x} ${midY} ${x} ${y}`;
}).join('\n  ');

const SVG_HEIGHT = 50 + (LESSONS.length - 1) * SPACING + 200;

const NODE_POSITIONS = LESSONS.map((_, i) => ({
  x: 256 + Math.sin(i * 0.9) * 100,
  y: 50 + i * SPACING,
}));

export default function MapPage() {
  const { completedLessons, lessonStars, currentLesson, streakDays, totalStars } = useProgressStore();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [pathOffset, setPathOffset] = useState(2000);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
      const handleScroll = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scrollProgress = Math.min(1, Math.max(0, -rect.top / (SVG_HEIGHT - window.innerHeight)));
      const pathLength = SVG_HEIGHT * 1.2;
      setPathOffset(pathLength - scrollProgress * pathLength);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-noise-overlay">
      {/* Stats card - floating top-right */}
      <div className="fixed right-6 top-6 z-30 w-64 rounded-[16px] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
        <div className="mb-3 h-12 w-full rounded-[8px] bg-gradient-to-br from-[#3B82F6]/20 to-[#22C55E]/20" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="w-4 h-4 text-[#F59E0B]" filled />
            <span className="font-quicksand font-bold text-[#1F2937]">{totalStars} 星星</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#EF4444]">🔥</span>
            <span className="font-quicksand text-[#6B7280]">{streakDays} 天连续</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#3B82F6]">📚</span>
            <span className="font-quicksand text-[#6B7280]">{completedLessons.length}/100 课程</span>
          </div>
        </div>
        <button
          onClick={() => {
            const next = LESSONS.find((l) => !completedLessons.includes(l.id));
            if (next) window.location.href = `/learn/${next.id}`;
          }}
          className="mt-4 w-full rounded-full bg-[#3B82F6] py-2.5 text-center text-[15px] font-quicksand font-bold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-transform active:translate-y-0.5"
        >
          继续学习 →
        </button>
      </div>

      {/* Map container with colored zones and full vertical SVG path */}
      <div className="relative" style={{ height: `${SVG_HEIGHT}px` }}>
        {/* Colored zone backgrounds */}
        {ZONES.map((zone) => (
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

        {/* SVG path overlay */}
        <svg
          ref={svgRef}
          className="absolute left-1/2 top-0 w-[512px] -translate-x-1/2 pointer-events-none"
          style={{ height: `${SVG_HEIGHT}px`, zIndex: 1 }}
          viewBox={`0 0 512 ${SVG_HEIGHT}`}
          fill="none"
        >
          {/* Background dashed path */}
          <path
            d="M 256 50 L 256 2600"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
          {/* Curved S-path */}
          <path
            d={PATH_D}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset={pathOffset}
            className="transition-none"
          />
        </svg>

        {/* All lesson nodes positioned along the path */}
        {LESSONS.map((lesson, i) => {
          const pos = NODE_POSITIONS[i];
          if (!pos) return null;
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = i + 1 === currentLesson && !completedLessons.includes(lesson.id);
          const isLocked = i + 1 > currentLesson;

          return (
            <motion.button
              key={lesson.id}
              onClick={() => !isLocked && setSelectedLesson(lesson.id)}
              disabled={isLocked}
              className={`absolute z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 text-[13px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-transform no-select active:scale-95 ${
                isCompleted
                  ? 'border-white bg-white text-[#1F2937]'
                  : isCurrent
                  ? 'border-white bg-white text-[#1F2937] map-node-current ring-4 ring-white/30'
                  : 'border-white/40 bg-white/20 text-white backdrop-blur-sm cursor-not-allowed'
              }`}
              style={{ left: `calc(50% + ${pos.x - 256 - 26}px)`, top: `${pos.y}px` }}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ type: 'spring', delay: i * 0.05 }}
            >
              {isCompleted ? (
                <StarIcon className="w-5 h-5" filled />
              ) : isCurrent ? (
                <TurtleMascot expression="happy" size="sm" animate={false} className="scale-50" />
              ) : (
                <LockIcon className="w-5 h-5 text-white/60" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Lesson selection modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
          >
            <h3 className="mb-3 text-center text-[20px] font-quicksand font-bold text-[#1F2937]">开始这节课？</h3>
            <p className="mb-4 text-center text-[16px] text-[#6B7280]">
              {LESSONS.find((l) => l.id === selectedLesson)?.title}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedLesson(null)}
                className="flex-1 rounded-full bg-[#E5E7EB] py-3 text-[15px] font-quicksand font-bold text-[#6B7280] transition-colors hover:bg-[#D1D5DB]"
              >
                取消
              </button>
              <button
                onClick={() => {
                  useProgressStore.getState().setCurrentLesson(parseInt(selectedLesson.split('_')[1]), 1);
                  window.location.href = `/learn/${selectedLesson}`;
                }}
                className="flex-1 rounded-full bg-[#16A34A] py-3 text-[15px] font-quicksand font-bold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)] transition-transform active:translate-y-0.5"
              >
                开始！🚀
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

