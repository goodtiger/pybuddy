'use client';

import { useProgressStore } from '@/store/progress-store';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LEVEL_1_LESSON_COUNT, TOTAL_LESSON_COUNT } from '@/lib/courses/course-constants';
import { useProjectStore } from '@/store/project-store';
import { useUserStore } from '@/store/user-store';

const BADGES = [
  { icon: '🖥️', label: '第一句代码', color: 'bg-[#22C55E]', requiredLessons: 1 },
  { icon: '📦', label: '变量盒子', color: 'bg-[#B5A642]', requiredLessons: 2 },
  { icon: '🔢', label: '数字魔法', color: 'bg-[#3B82F6]', requiredLessons: 3 },
  { icon: '🐢', label: '认识海龟', color: 'bg-[#EF4444]', requiredLessons: 4 },
  { icon: '🎨', label: '彩色画笔', color: 'bg-[#22C55E]', requiredLessons: 8 },
  { icon: '🔁', label: '循环入门', color: 'bg-[#B5A642]', requiredLessons: 11 },
  { icon: '🌸', label: '图形创作', color: 'bg-[#3B82F6]', requiredLessons: 14 },
  { icon: '🏆', label: 'Level 1 完成', color: 'bg-[#22C55E]', requiredLessons: LEVEL_1_LESSON_COUNT },
  { icon: '🏝️', label: 'Level 2 完成', color: 'bg-[#B5A642]', requiredLessons: TOTAL_LESSON_COUNT },
];

export default function ProfilePage() {
  const { completedLessons, totalStars, streakDays, lessonStars } = useProgressStore();
  const projects = useProjectStore((state) => state.projects);
  const { nickname, users } = useUserStore();
  const [activeNav, setActiveNav] = useState('成就');
  const unlockedBadges = BADGES.filter((badge) => completedLessons.length >= badge.requiredLessons);
  const nextMilestone = BADGES.find((badge) => completedLessons.length < badge.requiredLessons);
  const progressPct = Math.min(100, Math.round((completedLessons.length / TOTAL_LESSON_COUNT) * 100));

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
          <button
            onClick={() => window.location.href = '/register'}
            className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-quicksand font-bold text-[#3B82F6]"
          >
            {users.length > 1 ? '切换学员' : '新增学员'}
          </button>
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
                <span className="absolute -bottom-1 -left-1 rounded-full bg-[#22C55E] px-2 py-0.5 text-[11px] font-quicksand font-bold text-white">
                  Lv.{Math.max(1, completedLessons.length)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-[22px] font-quicksand font-bold text-[#1F2937]">{nickname}</h1>
                <p className="text-[14px] text-[#6B7280] flex items-center gap-1">
                  <span className="text-[#3B82F6]">✓</span> 编程小达人
                </p>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-[#9CA3AF]">
                  <span>{completedLessons.length} 课程</span>
                  <span>·</span>
                  <span>{totalStars} 星星</span>
                  <span>·</span>
                  <span>{Object.keys(lessonStars).length} 个作品进度</span>
                </div>
              </div>
              <div className="w-48 bg-[#FEF3C7] rounded-[12px] p-3">
                <p className="text-[10px] text-[#374151] font-quicksand">下一个徽章</p>
                <p className="mt-1 text-[13px] font-quicksand font-bold text-[#1F2937]">
                  {nextMilestone ? nextMilestone.label : '全部解锁'}
                </p>
                <div className="mt-1 h-2 bg-[#FDE68A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon: '📚', value: completedLessons.length.toString(), label: '课程' },
              { icon: '🏆', value: unlockedBadges.length.toString(), label: '徽章' },
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
                    {completedLessons.length >= badge.requiredLessons ? badge.icon : '🔒'}
                    {completedLessons.length >= badge.requiredLessons && (
                      <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#22C55E] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">✓</span>
                    )}
                  </div>
                  <span className={`text-[12px] font-quicksand ${completedLessons.length >= badge.requiredLessons ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent projects */}
          <div className="mb-6">
            <h2 className="text-[18px] font-quicksand font-bold text-[#1F2937] mb-4">我的作品</h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="col-span-2 rounded-[16px] border-2 border-dashed border-[#DBEAFE] bg-white p-6 text-center shadow-sm">
                  <div className="text-[48px]">🐢</div>
                  <p className="mt-2 text-[15px] font-quicksand font-bold text-[#1F2937]">还没有保存作品</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">完成一节课后，代码和画布会自动保存到这里。</p>
                </div>
              ) : (
                projects.slice(0, 4).map((project) => (
                  <div key={project.id} className="overflow-hidden rounded-[16px] bg-white shadow-sm">
                    {project.screenshot ? (
                      <div
                        aria-label={`${project.lessonTitle} 作品截图`}
                        className="h-28 bg-white bg-contain bg-center bg-no-repeat"
                        role="img"
                        style={{ backgroundImage: `url(${project.screenshot})` }}
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-green-800 to-green-600">
                        <span className="text-[48px] opacity-60">⌨️</span>
                      </div>
                    )}
                    <div className="p-3">
                      <span className="mb-1 inline-block rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-quicksand text-[#6B7280]">
                        {project.approvedForSharing ? '已批准分享' : '待家长审核'}
                      </span>
                      <h3 className="text-[14px] font-quicksand font-bold text-[#1F2937]">{project.lessonTitle}</h3>
                      <div className="mt-1 text-[11px] text-[#9CA3AF]">
                        {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback bubble */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-[14px] text-white">🤖</div>
            <div className="rounded-[16px] bg-white p-4 shadow-sm flex-1">
                <p className="text-[14px] font-quicksand text-[#374151]">
                  {completedLessons.length === 0
                    ? `${nickname}，从第一句 print 开始吧。完成课程后这里会记录你的成长。`
                    : `太棒了，${nickname}！你已经完成了 ${completedLessons.length} 个课程，继续向下一座 Python 小岛前进。`}
                </p>
              <p className="text-[12px] text-[#9CA3AF] mt-1 font-quicksand">PyBuddy 老师</p>
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
              <p className="text-[18px] font-quicksand font-bold text-[#1F2937]">
                {completedLessons.length}/{TOTAL_LESSON_COUNT} 课程
              </p>
              <p className="text-[14px] text-[#6B7280] font-quicksand">🔥 连续 {streakDays} 天</p>
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
            继续学习
          </button>
        </aside>
      </div>
    </div>
  );
}
