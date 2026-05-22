'use client';

import { useProgressStore } from '@/store/progress-store';
import { motion } from 'framer-motion';
import { useState } from 'react';

const BADGES = [
  { icon: '🖥️', label: '第一句代码', color: 'bg-[#22C55E]', unlocked: true },
  { icon: '🧩', label: '逻辑思维', color: 'bg-[#B5A642]', unlocked: true },
  { icon: '🎨', label: '彩色画笔', color: 'bg-[#22C55E]', unlocked: true },
  { icon: '🐢', label: '认识海龟', color: 'bg-[#EF4444]', unlocked: true },
  { icon: '🚀', label: '编程入门', color: 'bg-[#B5A642]', unlocked: true },
  { icon: '⚔️', label: '算法新手', color: 'bg-[#3B82F6]', unlocked: true },
  { icon: '🔒', label: '持续学习', color: 'bg-[#9CA3AF]', unlocked: false },
  { icon: '🔒', label: '探索传奇', color: 'bg-[#9CA3AF]', unlocked: false },
  { icon: '🔒', label: '创世神', color: 'bg-[#9CA3AF]', unlocked: false },
];

const PROJECTS = [
  { title: '火星人探险', tag: '小游戏', color: 'from-green-800 to-green-600', likes: 12 },
  { title: '太空冒险计划', tag: '动画', color: 'from-purple-800 to-purple-600', likes: 8 },
];

export default function ProfilePage() {
  const { completedLessons, totalStars, streakDays, lessonStars } = useProgressStore();
  const [activeNav, setActiveNav] = useState('成就');

  const navItems = [
    { name: '地图', icon: '📍' },
    { name: '成就', icon: '🏆' },
    { name: '作品', icon: '📁' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-[#E5E7EB]">
        <span className="text-[20px] font-quicksand font-bold text-[#3B82F6]">PyBuddy</span>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6]">🔔</button>
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[14px]">😊</div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Main content - left ~70% */}
        <main className="flex-1 p-4 max-w-5xl">
          {/* Profile card */}
          <motion.div
            className="rounded-[16px] bg-white p-4 shadow-sm mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-[48px]">
                  😊
                </div>
                <span className="absolute -bottom-1 -left-1 rounded-full bg-[#22C55E] px-2 py-0.5 text-[11px] font-quicksand font-bold text-white">Lv.8</span>
              </div>
              <div className="flex-1">
                <h1 className="text-[22px] font-quicksand font-bold text-[#1F2937]">小明</h1>
                <p className="text-[14px] text-[#6B7280] flex items-center gap-1">
                  <span className="text-[#3B82F6]">✓</span> 编程小达人
                </p>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-[#9CA3AF]">
                  <span>{completedLessons.length} 课程</span>
                  <span>·</span>
                  <span>{totalStars} XP</span>
                  <span>·</span>
                  <span>{Object.keys(lessonStars).length}K</span>
                </div>
              </div>
              <div className="w-48 bg-[#FEF3C7] rounded-[12px] p-3">
                <p className="text-[10px] text-[#374151] font-quicksand">Next Milestone</p>
                <div className="mt-1 h-2 bg-[#FDE68A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon: '📚', value: completedLessons.length.toString(), label: '课程' },
              { icon: '🏆', value: BADGES.filter(b => b.unlocked).length.toString(), label: '徽章' },
              { icon: '⭐', value: totalStars.toString(), label: '星星' },
              { icon: '🔥', value: streakDays.toString(), label: '天数' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-[12px] p-4 shadow-sm text-center">
                <div className="text-[24px] mb-1">{stat.icon}</div>
                <div className="text-[20px] font-quicksand font-bold text-[#1F2937]">{stat.value}</div>
                <div className="text-[12px] text-[#6B7280] font-quicksand">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Badge grid */}
          <div className="bg-white rounded-[16px] p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-quicksand font-bold text-[#1F2937]">徽章馆</h2>
              <button className="text-[13px] font-quicksand text-[#3B82F6] hover:underline">查看全部</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {BADGES.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-2">
                  <div className={`relative w-[56px] h-[56px] rounded-full ${badge.color} flex items-center justify-center text-[24px] shadow-sm`}>
                    {badge.icon}
                    {badge.unlocked && (
                      <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#22C55E] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">2x</span>
                    )}
                  </div>
                  <span className={`text-[12px] font-quicksand ${badge.unlocked ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent projects */}
          <div className="mb-6">
            <h2 className="text-[18px] font-quicksand font-bold text-[#1F2937] mb-4">我的作品</h2>
            <div className="grid grid-cols-2 gap-4">
              {PROJECTS.map((project) => (
                <div key={project.title} className="rounded-[16px] bg-white overflow-hidden shadow-sm">
                  <div className={`h-28 bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                    <span className="text-[48px] opacity-50">🚀</span>
                  </div>
                  <div className="p-3">
                    <span className="inline-block bg-[#F3F4F6] rounded-full px-2 py-0.5 text-[10px] font-quicksand text-[#6B7280] mb-1">{project.tag}</span>
                    <h3 className="text-[14px] font-quicksand font-bold text-[#1F2937]">{project.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#9CA3AF]">
                      <span>❤️ {project.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback bubble */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-[14px] text-white">🤖</div>
            <div className="rounded-[16px] bg-white p-4 shadow-sm flex-1">
                <p className="text-[14px] font-quicksand text-[#374151]">太棒了，小明！你已经完成了{completedLessons.length}个课程，特别是解锁{"\""}太空探险{"\""}徽章了！</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1 font-quicksand">瑞瑞老师</p>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-64 bg-white border-l border-[#E5E7EB] p-4 flex flex-col">
          <div className="flex-1">
            <div className="w-[64px] h-[64px] rounded-full bg-[#3B82F6] flex items-center justify-center text-[32px] text-white mx-auto mb-3">
              ⭐
            </div>
            <div className="text-center mb-4">
              <p className="text-[18px] font-quicksand font-bold text-[#1F2937]">{completedLessons.length}/100 Lessons</p>
              <p className="text-[14px] text-[#6B7280] font-quicksand">🔥 {streakDays} Day Streak</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === '地图') window.location.href = '/map';
                    if (item.name === '作品') window.location.href = '/profile';
                    setActiveNav(item.name);
                  }}
                  className={`w-full rounded-[12px] py-2.5 px-3 flex items-center gap-2 text-[15px] font-quicksand transition-colors ${
                    activeNav === item.name
                      ? 'bg-[#DCFCE7] text-[#0B6E3A] font-bold'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <span className="text-[18px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={() => window.location.href = '/map'}
            className="w-full rounded-full bg-[#3B82F6] py-3 text-[15px] font-quicksand font-bold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-transform active:translate-y-0.5"
          >
            Continue Learning
          </button>
        </aside>
      </div>
    </div>
  );
}
