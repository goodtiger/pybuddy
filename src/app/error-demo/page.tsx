'use client';

import { motion } from 'framer-motion';

export default function ErrorDemoPage() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 py-3">
        <span className="text-[16px] font-quicksand text-[#6B7280]">TurtleCode</span>
        <div className="flex items-center gap-3">
          <button className="w-7 h-7 rounded-full border-[1.5px] border-[#9CA3AF] flex items-center justify-center text-[#9CA3AF] text-[12px]">?</button>
          <button className="w-7 h-7 rounded-full border-[1.5px] border-[#9CA3AF] flex items-center justify-center text-[#9CA3AF] text-[12px]">⚙</button>
        </div>
      </header>

      {/* Center stack */}
      <div className="flex flex-col items-center gap-6 mt-4">
        {/* Error speech bubble */}
        <motion.div
          className="speech-bubble text-center max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[18px] font-quicksand font-bold text-[#0D9488]">
            哎呀！这里少了个冒号哦！
          </p>
          <p className="mt-1 text-[14px] font-quicksand text-[#6B7280] cursor-pointer hover:text-[#3B82F6]">
            点我看看怎么修 🔍
          </p>
        </motion.div>

        {/* Turtle character */}
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          <div className="w-[160px] h-[160px] rounded-[20px] bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <div className="relative">
              <span className="text-[96px]">🐢</span>
              <span className="absolute -top-1 -right-1 text-[24px]">🎓</span>
            </div>
          </div>
        </motion.div>

        {/* Fix button */}
        <motion.button
          className="rounded-full bg-[#0B6E3A] px-8 py-3 text-[16px] font-quicksand font-bold text-white shadow-[0_4px_8px_rgba(11,110,58,0.2)] flex items-center gap-2 transition-transform active:translate-y-0.5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          🔧 点我修复
        </motion.button>

        {/* Info cards side by side */}
        <motion.div
          className="grid grid-cols-2 gap-4 max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Tips card */}
          <div className="rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-[1px] border-[#E5E7EB]">
            <h3 className="text-[14px] font-quicksand font-bold text-[#374151] flex items-center gap-1 mb-2">
              💡 温馨小贴士
            </h3>
            <p className="text-[12px] font-quicksand text-[#6B7280] leading-relaxed">
              在循环或判断语句后，别忘了加上这个可爱的冒号: 哦！🐢
            </p>
          </div>

          {/* Quest card */}
          <div className="rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-[1px] border-[#E5E7EB]">
            <h3 className="text-[14px] font-quicksand font-bold text-[#374151] flex items-center gap-1 mb-2">
              ⭐ 进阶任务
            </h3>
            <p className="text-[12px] font-quicksand text-[#6B7280] leading-relaxed">
              修复这个问题，你将获得 10 个经验点数，离成为编程大师又近了一步！
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-[0_-2px_8px_rgba(0,0,0,0.05)] px-6 py-3 flex justify-around">
        {[
          { icon: '📖', label: 'Lessons' },
          { icon: '</>', label: 'Code', active: true },
          { icon: '📁', label: 'Projects' },
          { icon: '🏆', label: 'Awards' },
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-0.5">
            <span className={`text-[20px] ${item.active ? 'bg-[#3B82F6] rounded-full w-8 h-8 flex items-center justify-center text-white text-xs' : ''}`}>
              {item.active ? '</>' : item.icon}
            </span>
            <span className={`text-[11px] font-quicksand ${item.active ? 'text-[#3B82F6] font-bold' : 'text-[#9CA3AF]'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
