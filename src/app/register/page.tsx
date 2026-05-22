'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { useUserStore } from '@/store/user-store';

const AVATARS = [
  { id: 1, label: '海龟', icon: '🐢', color: 'bg-green-100 text-secondary' },
  { id: 2, label: '星星', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  { id: 3, label: '火箭', icon: '🚀', color: 'bg-blue-100 text-primary' },
  { id: 4, label: '画笔', icon: '🎨', color: 'bg-pink-100 text-pink-600' },
];

export default function RegisterPage() {
  const { nickname, avatarId, childAge, parentEmail, registerFamily } = useUserStore();
  const [form, setForm] = useState({
    nickname,
    avatarId,
    childAge,
    parentEmail,
  });
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nickname.trim()) {
      setError('请给小程序员起一个昵称');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.parentEmail.trim())) {
      setError('请输入家长邮箱，用来接收学习报告');
      return;
    }

    registerFamily(form);
    window.location.href = '/map';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-container via-background to-green-50 p-kid-sm lg:p-kid-md">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-kid-md lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <button onClick={() => window.location.href = '/map'} className="mb-kid-sm flex items-center gap-2 text-kid-base font-heading font-bold text-primary">
            <MascotAvatar expression="happy" size="sm" />
            返回 PyBuddy
          </button>
          <div className="rounded-[32px] border-2 border-primary-container bg-white p-kid-md shadow-kid-lg">
            <div className="rounded-kid-lg bg-[#e9f8ff] p-kid-md text-center">
              <MascotAvatar expression="celebrating" size="xl" />
              <h1 className="mt-4 text-kid-xl font-heading font-bold text-primary">创建家庭学习档案</h1>
              <p className="mt-2 text-kid-base text-gray-600">
                保存孩子的课程进度、作品墙和家长报告设置。当前版本先在本机安全保存。
              </p>
            </div>
            <div className="mt-kid-sm grid grid-cols-2 gap-3">
              <div className="rounded-kid-md bg-green-100 p-4 font-heading font-bold text-secondary">学习进度</div>
              <div className="rounded-kid-md bg-yellow-100 p-4 font-heading font-bold text-yellow-700">星星奖励</div>
              <div className="rounded-kid-md bg-blue-100 p-4 font-heading font-bold text-primary">家长报告</div>
              <div className="rounded-kid-md bg-pink-100 p-4 font-heading font-bold text-pink-600">作品审核</div>
            </div>
          </div>
        </section>

        <Card className="border-2 border-primary-container p-kid-md">
          <form onSubmit={handleSubmit} className="space-y-kid-sm">
            <div>
              <p className="text-kid-sm font-heading font-bold text-primary">第一步</p>
              <h2 className="text-kid-xl font-heading font-bold text-gray-950">告诉小海龟怎么称呼你</h2>
            </div>

            <label className="block">
              <span className="text-kid-sm font-heading font-bold text-gray-600">孩子昵称</span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                className="mt-2 h-14 w-full rounded-kid-lg border-2 border-primary-container bg-white px-4 text-kid-base font-heading font-bold outline-none focus:border-primary"
                maxLength={12}
              />
            </label>

            <div>
              <span className="text-kid-sm font-heading font-bold text-gray-600">头像</span>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    aria-label={avatar.label}
                    onClick={() => setForm((current) => ({ ...current, avatarId: avatar.id }))}
                    className={`h-20 rounded-kid-lg border-2 text-4xl shadow-kid transition active:scale-95 ${
                      form.avatarId === avatar.id ? 'border-primary bg-white' : `border-transparent ${avatar.color}`
                    }`}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>

            <label className="block rounded-kid-lg bg-primary-container/60 p-kid-sm">
              <div className="flex items-center justify-between">
                <span className="text-kid-base font-heading font-bold">年龄</span>
                <span className="text-kid-lg font-heading font-bold text-primary">{form.childAge} 岁</span>
              </div>
              <input
                aria-label="孩子年龄"
                className="mt-4 w-full accent-secondary"
                type="range"
                min="6"
                max="12"
                value={form.childAge}
                onChange={(event) => setForm((current) => ({ ...current, childAge: Number(event.target.value) }))}
              />
            </label>

            <label className="block">
              <span className="text-kid-sm font-heading font-bold text-gray-600">家长邮箱</span>
              <input
                value={form.parentEmail}
                onChange={(event) => setForm((current) => ({ ...current, parentEmail: event.target.value }))}
                className="mt-2 h-14 w-full rounded-kid-lg border-2 border-primary-container bg-white px-4 text-kid-base outline-none focus:border-primary"
                inputMode="email"
                placeholder="parent@example.com"
              />
            </label>

            {error && (
              <div className="rounded-kid-md bg-red-50 p-3 text-kid-sm font-heading font-bold text-error">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="secondary" size="lg" className="flex-1">
                保存并开始
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => window.location.href = '/map'}>
                稍后再说
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
