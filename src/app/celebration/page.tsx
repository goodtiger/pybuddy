'use client';

import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progress-store';
import { motion } from 'framer-motion';
import { TurtleMascot } from '@/components/ui/turtle-mascot';
import { StarIcon, ShareIcon, CheckIcon, TrophyIcon, MapPinIcon, ChartIcon } from '@/components/icons';
import { useEffect, useRef } from 'react';

const CONFETTI_COLORS = ['#FFEB3B', '#4CAF50', '#3B82F6', '#EF4444', '#F59E0B', '#E91E63'];

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cw = canvas.width;
    const ch = canvas.height;
    const context = ctx;

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vy: number;
      vx: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vy: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animId: number;
    function animate() {
      context.clearRect(0, 0, cw, ch);

      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotationSpeed;

        if (p.y > ch) {
          p.opacity -= 0.02;
          if (p.opacity <= 0) continue;
        }

        context.save();
        context.translate(p.x, p.y);
        context.rotate((p.rotation * Math.PI) / 180);
        context.globalAlpha = Math.max(0, p.opacity);
        context.fillStyle = p.color;
        context.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        context.restore();
      }

      if (particles.some((p) => p.opacity > 0)) {
        animId = requestAnimationFrame(animate);
      }
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function CelebrationPage() {
  const router = useRouter();
  const { currentLesson } = useProgressStore();
  const lessonNum = currentLesson || 1;
  const hasNext = lessonNum < 15;
  const nextLessonId = `lesson_${String(lessonNum + 1).padStart(3, '0')}`;

  const handleNext = () => {
    if (hasNext) {
      router.push(`/learn/${nextLessonId}`);
    } else {
      router.push('/map');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-noise-overlay flex relative overflow-hidden">
      {/* Left content area ~70% */}
      <div className="flex-[1.4] flex items-center justify-center p-8">
        <Confetti />

        {/* Capsule card */}
        <motion.div
          className="relative z-10 bg-white rounded-[9999px] px-12 py-12 shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-md w-full text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        >
          {/* Star + label */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <StarIcon className="w-5 h-5 text-[#F59E0B]" filled />
            <span className="text-[16px] font-quicksand font-bold text-[#374151]">课程完成</span>
          </div>

          {/* Hero checkmark circle */}
          <div className="relative inline-block mb-6">
            <div className="w-[96px] h-[96px] rounded-full bg-[#22C55E] flex items-center justify-center">
              <CheckIcon className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-[28px] h-[28px] rounded-full bg-[#F59E0B] border-2 border-white flex items-center justify-center">
              <TurtleMascot expression="happy" size="sm" animate={false} className="scale-75" />
            </div>
          </div>

          {/* Congratulatory text */}
          <h1 className="text-[24px] font-quicksand font-bold text-[#1F2937] mb-2">太棒了，代码大师！</h1>
          <p className="text-[14px] font-quicksand text-[#6B7280] mb-6">
            你成功解锁了{"\""}变量{"\""}的神秘力量，继续向前吧！
          </p>

          {/* Reward badges */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[13px] font-quicksand font-bold text-[#16A34A] flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              +10 XP
            </span>
            <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[13px] font-quicksand font-bold text-[#D97706] flex items-center gap-1">
              <StarIcon className="w-4 h-4" filled /> +1 星星
            </span>
            <span className="rounded-full bg-[#DBEAFE] px-3 py-1.5 text-[13px] font-quicksand font-bold text-[#2563EB] flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              3 天
            </span>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleNext}
            className="w-full rounded-full bg-[#0B6E3A] py-3 text-[16px] font-quicksand font-bold text-white shadow-[0_4px_8px_rgba(11,110,58,0.2)] transition-transform active:translate-y-0.5"
          >
            下一课 →
          </button>

          {/* Secondary actions */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => window.location.href = `/learn/lesson_${String(lessonNum).padStart(3, '0')}`}
              className="flex-1 rounded-full bg-[#3B82F6] py-2.5 text-[14px] font-quicksand font-bold text-white flex items-center justify-center gap-1"
            >
              🔄 回看一遍
            </button>
            <button className="flex-1 rounded-full bg-[#F59E0B] py-2.5 text-[14px] font-quicksand font-bold text-[#1F2937] flex items-center justify-center gap-1">
              📤 分享作品
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right sidebar ~30% */}
      <div className="flex-1 bg-[#F1F5F9] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[18px] font-quicksand font-bold text-[#3B82F6]">PyBuddy</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
              <span className="text-[14px]">😊</span>
            </div>
          </div>
        </div>

        {/* Avatar and stats */}
        <div className="flex flex-col items-center mt-8 mb-6">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-[48px] mb-3">😊</div>
          <p className="text-[16px] font-quicksand font-bold text-[#1F2937]">{lessonNum}/110 Lessons</p>
          <p className="text-[14px] text-[#6B7280] font-quicksand mt-1">🔥 3 Day Streak</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-4 mb-8">
          {[
            { name: 'Map', icon: '📍' },
            { name: 'Badges', icon: '🏆', active: true },
            { name: 'Stats', icon: '📊' },
          ].map((item) => (
            <div key={item.name} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-[12px] ${item.active ? 'bg-[#FEF3C7]' : ''}`}>
              <span className="text-[24px]">{item.icon}</span>
              <span className={`text-[13px] font-quicksand ${item.active ? 'font-bold text-[#1F2937]' : 'text-[#6B7280]'}`}>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={() => window.location.href = '/map'}
          className="mx-4 mb-6 rounded-full bg-[#0B6E3A] py-3 text-[15px] font-quicksand font-bold text-white shadow-[0_2px_8px_rgba(11,110,58,0.3)]"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}
