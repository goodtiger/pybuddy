'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { getProjectShareUrl } from '@/lib/projects/share-url';
import { TOTAL_LESSON_COUNT } from '@/lib/courses/course-constants';
import { useParentSettingsStore } from '@/store/parent-settings-store';
import { useProgressStore } from '@/store/progress-store';
import { useProjectStore } from '@/store/project-store';
import { useUserStore } from '@/store/user-store';

const SKILL_MILESTONES = [
  { name: '序列', startLesson: 1, completeLesson: 5, color: 'bg-primary' },
  { name: '变量', startLesson: 2, completeLesson: 2, color: 'bg-secondary' },
  { name: '海龟绘图', startLesson: 4, completeLesson: 8, color: 'bg-accent' },
  { name: '循环', startLesson: 7, completeLesson: 14, color: 'bg-error' },
];

const LEARNED_MILESTONES = [
  { lesson: 1, text: '用 print 输出文字' },
  { lesson: 2, text: '用变量保存名字' },
  { lesson: 4, text: '导入 turtle 并设置画笔' },
  { lesson: 5, text: '用 turtle 画线条' },
  { lesson: 7, text: '通过循环减少重复代码' },
  { lesson: 12, text: '用 circle 画圆形' },
  { lesson: 15, text: '完成第一幅 Python 作品' },
];

export default function ParentDashboardPage() {
  const { completedLessons, totalStars, streakDays } = useProgressStore();
  const { nickname, users } = useUserStore();
  const {
    dailyTimeLimit,
    weeklyReportEnabled,
    achievementAlertsEnabled,
    subscription,
    setDailyTimeLimit,
    toggleWeeklyReport,
    toggleAchievementAlerts,
    setSubscription,
  } = useParentSettingsStore();
  const { projects, toggleShareApproval } = useProjectStore();
  const completedCount = completedLessons.length;
  const minutes = completedCount * 6;
  const learnedItems = LEARNED_MILESTONES.filter((item) => completedCount >= item.lesson);
  const skills = SKILL_MILESTONES.map((skill) => {
    const span = Math.max(1, skill.completeLesson - skill.startLesson + 1);
    const completedInSkill = Math.min(span, Math.max(0, completedCount - skill.startLesson + 1));
    return {
      ...skill,
      value: Math.round((completedInSkill / span) * 100),
    };
  });
  const copyShareUrl = async (shareId: string) => {
    const url = getProjectShareUrl(shareId);
    await navigator.clipboard?.writeText(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-primary-container/60 bg-surface/95 p-kid-sm shadow-kid backdrop-blur">
        <button onClick={() => window.location.href = '/map'} className="flex items-center gap-2">
          <MascotAvatar expression="happy" size="sm" />
          <span className="text-kid-lg font-heading font-bold text-primary">PyBuddy 家长面板 · {nickname}</span>
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => window.location.href = '/settings'}>设置</Button>
          <Button variant="ghost" onClick={() => window.location.href = '/register'}>
            {users.length > 1 ? '切换学员' : '家庭档案'}
          </Button>
          <Badge variant="star">⭐ {totalStars}</Badge>
          <Badge variant="streak">🔥 {streakDays}</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-kid-sm p-kid-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-kid-md">
        <Card className="border-2 border-primary-container p-kid-md">
          <p className="text-kid-sm font-heading font-bold text-primary">本周学习总览</p>
          <h1 className="mt-2 text-kid-xl font-heading font-bold text-gray-950">{nickname} 正在稳步前进</h1>
          <div className="mt-kid-md grid gap-3 sm:grid-cols-3">
            <div className="rounded-kid-lg bg-primary-container p-kid-sm">
              <p className="text-kid-sm font-heading font-bold text-primary">学习时间</p>
              <p className="mt-2 text-kid-xl font-heading font-bold">{minutes} 分钟</p>
            </div>
            <div className="rounded-kid-lg bg-green-100 p-kid-sm">
              <p className="text-kid-sm font-heading font-bold text-secondary">完成课程</p>
              <p className="mt-2 text-kid-xl font-heading font-bold">
                {completedCount}/{TOTAL_LESSON_COUNT}
              </p>
            </div>
            <div className="rounded-kid-lg bg-yellow-100 p-kid-sm">
              <p className="text-kid-sm font-heading font-bold text-yellow-700">获得星星</p>
              <p className="mt-2 text-kid-xl font-heading font-bold">{totalStars}</p>
            </div>
          </div>
          <div className="mt-kid-md">
            <div className="mb-2 flex justify-between text-kid-sm font-heading font-bold text-gray-500">
              <span>总课程进度</span>
              <span>{completedCount}/{TOTAL_LESSON_COUNT}</span>
            </div>
            <ProgressBar value={completedCount} max={TOTAL_LESSON_COUNT} />
          </div>
        </Card>

        <Card className="border-2 border-accent/70 bg-accent/20 p-kid-md">
          <p className="text-kid-sm font-heading font-bold text-gray-600">本周学会了</p>
          <div className="mt-4 space-y-3">
            {learnedItems.length === 0 ? (
              <div className="rounded-kid-md bg-surface p-4 text-kid-base font-heading font-bold text-gray-600 shadow-kid">
                完成第一课后，这里会自动记录孩子学会的内容。
              </div>
            ) : (
              learnedItems.map((item) => (
                <div key={item.text} className="rounded-kid-md bg-surface p-4 text-kid-base font-heading font-bold shadow-kid">
                  ✓ {item.text}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-kid-md">
          <p className="text-kid-sm font-heading font-bold text-primary">技能掌握</p>
          <div className="mt-4 space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex justify-between text-kid-sm font-heading font-bold">
                  <span>{skill.name}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-kid-full bg-gray-100">
                  <div className={`h-full rounded-kid-full ${skill.color}`} style={{ width: `${skill.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-kid-md">
          <p className="text-kid-sm font-heading font-bold text-primary">屏幕时间与订阅</p>
          <div className="mt-4 rounded-kid-lg bg-primary-container/60 p-kid-sm">
            <div className="flex items-center justify-between">
              <span className="text-kid-base font-heading font-bold">每日学习上限</span>
              <span className="text-kid-lg font-heading font-bold text-primary">{dailyTimeLimit} 分钟</span>
            </div>
            <input
              aria-label="每日学习上限"
              className="mt-4 w-full accent-secondary"
              type="range"
              min="5"
              max="90"
              step="5"
              value={dailyTimeLimit}
              onChange={(event) => setDailyTimeLimit(Number(event.target.value))}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-kid-lg bg-surface p-4 shadow-kid">
              <span className="text-kid-sm font-heading font-bold">每周报告</span>
              <input type="checkbox" checked={weeklyReportEnabled} onChange={toggleWeeklyReport} className="h-5 w-5 accent-secondary" />
            </label>
            <label className="flex items-center justify-between rounded-kid-lg bg-surface p-4 shadow-kid">
              <span className="text-kid-sm font-heading font-bold">成就提醒</span>
              <input type="checkbox" checked={achievementAlertsEnabled} onChange={toggleAchievementAlerts} className="h-5 w-5 accent-secondary" />
            </label>
          </div>
          <div className="mt-4 rounded-kid-lg border-2 border-secondary bg-green-50 p-kid-sm">
            <p className="text-kid-base font-heading font-bold text-secondary">
              {subscription === 'free' ? '免费版' : subscription === 'family' ? '家庭版' : '教育版'}
            </p>
            <p className="mt-1 text-kid-sm text-gray-600">
              前{TOTAL_LESSON_COUNT}课、基础AI导师、Turtle画布已开放。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['free', 'family', 'education'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSubscription(plan)}
                  className={`rounded-kid-full px-4 py-2 text-kid-sm font-heading font-bold ${
                    subscription === plan ? 'bg-secondary text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {plan === 'free' ? '免费' : plan === 'family' ? '家庭' : '教育'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-kid-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-kid-sm font-heading font-bold text-primary">作品审核</p>
              <h2 className="text-kid-lg font-heading font-bold text-gray-950">家长批准后才能分享</h2>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/profile'}>查看作品墙</Button>
          </div>
          {projects.length === 0 ? (
            <div className="mt-4 rounded-kid-lg border-2 border-dashed border-primary-container bg-primary/5 p-kid-md text-center">
              <MascotAvatar expression="confused" size="md" />
              <p className="mt-2 text-kid-base font-heading font-bold text-gray-700">还没有作品</p>
              <p className="mt-1 text-kid-sm text-gray-500">完成第一课后，这里会出现孩子的代码作品。</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="rounded-kid-lg border-2 border-primary-container bg-surface p-4 shadow-kid">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-kid-base font-heading font-bold text-gray-900">{project.lessonTitle}</p>
                      <p className="text-kid-sm text-gray-500">{new Date(project.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <button
                      onClick={() => toggleShareApproval(project.id)}
                      className={`rounded-kid-full px-3 py-1 text-kid-sm font-heading font-bold ${
                        project.approvedForSharing ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {project.approvedForSharing ? '已批准' : '待审核'}
                    </button>
                  </div>
                  <pre className="mt-3 max-h-24 overflow-auto rounded-kid-md bg-gray-900 p-3 font-code text-kid-sm text-green-300">
                    {project.code}
                  </pre>
                  {project.shareId && (
                    <div className="mt-3 rounded-kid-md bg-green-50 p-3">
                      <p className="text-kid-sm font-heading font-bold text-secondary">分享链接已生成</p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => window.location.href = `/share/${project.shareId}`}
                          className="rounded-kid-full bg-secondary px-4 py-2 text-kid-sm font-heading font-bold text-white"
                        >
                          预览分享页
                        </button>
                        <button
                          onClick={() => copyShareUrl(project.shareId!)}
                          className="rounded-kid-full bg-white px-4 py-2 text-kid-sm font-heading font-bold text-secondary"
                        >
                          复制链接
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
