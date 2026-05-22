'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TRIVIA = [
  { question: '你知道吗？', answer: 'Python 的名字其实来自 BBC 著名的喜剧团体 Monty Python，而不是蛇哦！创始人 Guido van Rossum 在创造它时希望能保持有趣和幽默。' },
  { question: '你知道吗？', answer: 'Python 是世界上最受欢迎的编程语言之一！很多大公司都在使用它，比如 Google、NASA、Netflix。' },
  { question: '你知道吗？', answer: 'Python 的代码非常简洁！同样的功能，Python 代码通常比其他语言少 3-5 倍。' },
  { question: '你知道吗？', answer: '世界上第一个程序员 Ada Lovelace 是英国诗人拜伦的女儿！她生活在 1800 年代。' },
];

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [message, setMessage] = useState('正在准备你的代码世界...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 3;
        if (next >= 100) {
          clearInterval(interval);
          setMessage('准备好啦！');
          setTimeout(() => {
            window.location.href = '/map';
          }, 500);
          return 100;
        }
        return next;
      });
    }, 150);

    const triviaInterval = setInterval(() => {
      setTriviaIndex((i) => (i + 1) % TRIVIA.length);
    }, 4000);

    return () => { clearInterval(interval); clearInterval(triviaInterval); };
  }, []);

  return (
    <div className="min-h-screen bg-[#E8F0FE] bg-dot-grid flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <span className="text-[16px] font-quicksand font-bold text-[#3B82F6]">TurtleCode</span>
        <div className="flex items-center gap-3">
          <button className="w-7 h-7 rounded-full border-[1.5px] border-[#9CA3AF] flex items-center justify-center text-[#9CA3AF] text-[12px]">?</button>
          <button className="w-7 h-7 rounded-full border-[1.5px] border-[#9CA3AF] flex items-center justify-center text-[#9CA3AF] text-[12px]">⚙</button>
        </div>
      </div>

      {/* Center stack */}
      <div className="flex flex-col items-center gap-4 mt-12">
        {/* Speech bubble */}
        <motion.div
          className="speech-bubble text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-[20px] font-quicksand font-bold text-[#1F2937]">{message}</p>
        </motion.div>

        {/* Percentage badge */}
        <motion.span
          className="rounded-full bg-[#F59E0B] px-3 py-1 text-[14px] font-quicksand font-bold text-[#1F2937]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {Math.round(progress)}%
        </motion.span>

        {/* Turtle character on pedestal */}
        <motion.div
          className="relative"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-[140px] h-[140px] rounded-[16px] bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <span className="text-[80px] animate-turtle-wave">🐢</span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-[320px] h-4 bg-white rounded-full overflow-hidden shadow-sm">
          <motion.div
            className="h-full bg-[#16A34A] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Trivia card */}
        <motion.div
          key={triviaIndex}
          className="bg-white rounded-[20px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-w-md w-full flex items-start gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-12 h-12 rounded-[12px] bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
            <span className="text-[24px]">💡</span>
          </div>
          <div>
            <p className="text-[15px] font-quicksand font-bold text-[#1F2937] mb-1">{TRIVIA[triviaIndex].question}</p>
            <p className="text-[13px] font-quicksand text-[#4B5563] leading-relaxed">{TRIVIA[triviaIndex].answer}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
