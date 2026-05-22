'use client';

import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { TurtleMascot } from '@/components/ui/turtle-mascot';

export default function OnboardingPage() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const handleStart = () => {
    completeOnboarding();
    window.location.href = '/map';
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F2F5F8] bg-noise-overlay">
      {/* Decorative floating symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="deco-symbol" style={{ top: '12%', left: '10%', fontSize: '32px', opacity: 0.3 }}>{'<'}</span>
        <span className="deco-symbol" style={{ top: '18%', right: '12%', fontSize: '28px', opacity: 0.25 }}>
          {'</>'}
        </span>
        <span className="deco-symbol" style={{ bottom: '20%', left: '8%', fontSize: '24px', opacity: 0.2 }}>
          {'( )'}
        </span>
        <span className="deco-symbol" style={{ top: '40%', right: '6%', fontSize: '20px', opacity: 0.2 }}>
          {'{ }'}
        </span>
        <span className="deco-symbol" style={{ bottom: '35%', right: '15%', fontSize: '16px', opacity: 0.3 }}>
          {'#'}
        </span>
        <span className="deco-symbol" style={{ top: '65%', left: '14%', fontSize: '22px', opacity: 0.25 }}>
          {'*'}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Speech bubble */}
        <motion.div
          className="speech-bubble text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[28px] font-quicksand font-bold leading-snug text-[#1F2937]">
            你好！我是小海龟！
          </p>
          <p className="mt-1 text-[22px] font-quicksand text-[#4B5563]">
            我来教你写代码！
          </p>
        </motion.div>

        {/* Turtle mascot card with 3D perspective */}
        <motion.div
          className="perspective-scene flex h-[200px] w-[200px] items-center justify-center rounded-[20px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <TurtleMascot expression="happy" size="lg" className="turtle-3d" />
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          className="h-[52px] min-w-[200px] rounded-full bg-[#0B6E3A] px-8 text-[20px] font-quicksand font-bold text-white shadow-[0_4px_8px_rgba(11,110,58,0.2)] transition-transform active:translate-y-0.5 active:shadow-none"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          开始冒险！
        </motion.button>

        {/* Progress dots */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-[#0B6E3A]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]" />
        </motion.div>

        {/* Parent entry link */}
        <motion.div
          className="absolute bottom-6 right-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => window.location.href = '/parent'}
            className="text-sm font-quicksand text-[#9CA3AF] hover:text-[#3B82F6] transition-colors"
          >
            家长入口
          </button>
        </motion.div>
      </div>
    </div>
  );
}
