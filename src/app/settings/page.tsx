'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { useAppSettingsStore } from '@/store/app-settings-store';
import { useParentSettingsStore } from '@/store/parent-settings-store';
import { useUserStore } from '@/store/user-store';

const FONT_OPTIONS = [
  { id: 'normal', label: '标准', sample: 'Aa' },
  { id: 'large', label: '大字', sample: 'Aa' },
  { id: 'extra', label: '超大', sample: 'Aa' },
] as const;

const COLOR_OPTIONS = [
  { id: 'bright', label: '明亮', className: 'bg-[#e9f8ff] text-primary border-primary-container' },
  { id: 'eye-care', label: '护眼', className: 'bg-[#f3f7e8] text-secondary border-green-200' },
  { id: 'contrast', label: '高对比', className: 'bg-white text-gray-950 border-gray-900' },
  { id: 'dark', label: '深色', className: 'bg-[#0F172A] text-gray-200 border-gray-700' },
] as const;

export default function SettingsPage() {
  const { nickname, childAge, parentEmail } = useUserStore();
  const {
    fontScale,
    colorMode,
    narrationEnabled,
    soundEffectsEnabled,
    reducedMotion,
    setFontScale,
    setColorMode,
    toggleNarration,
    toggleSoundEffects,
    toggleReducedMotion,
  } = useAppSettingsStore();
  const { dailyTimeLimit, setDailyTimeLimit } = useParentSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-container/60 via-background to-green-50 p-kid-sm lg:p-kid-md">
      <div className="mx-auto max-w-6xl">
        <header className="mb-kid-sm flex flex-wrap items-center justify-between gap-3 rounded-kid-lg bg-surface p-kid-sm shadow-kid">
          <button onClick={() => window.location.href = '/map'} className="flex items-center gap-2">
            <MascotAvatar expression="happy" size="sm" />
            <span className="text-kid-lg font-heading font-bold text-primary">学习设置</span>
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => window.location.href = '/register'}>家庭档案</Button>
            <Button variant="ghost" onClick={() => window.location.href = '/parent'}>家长面板</Button>
          </div>
        </header>

        <main className="grid gap-kid-sm lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-2 border-primary-container p-kid-md">
            <div className="rounded-kid-lg bg-[#e9f8ff] p-kid-md text-center">
              <MascotAvatar expression="happy" size="xl" />
              <h1 className="mt-4 text-kid-xl font-heading font-bold text-primary">给 {nickname} 调整学习体验</h1>
              <p className="mt-2 text-kid-base text-gray-600">这些设置会保存在当前设备上，重新打开应用也会继续生效。</p>
            </div>
            <div className="mt-kid-sm grid gap-3 sm:grid-cols-3">
              <div className="rounded-kid-md bg-green-100 p-4">
                <p className="text-kid-sm font-heading font-bold text-secondary">年龄</p>
                <p className="mt-1 text-kid-lg font-heading font-bold">{childAge} 岁</p>
              </div>
              <div className="rounded-kid-md bg-yellow-100 p-4">
                <p className="text-kid-sm font-heading font-bold text-yellow-700">每日上限</p>
                <p className="mt-1 text-kid-lg font-heading font-bold">{dailyTimeLimit} 分钟</p>
              </div>
              <div className="rounded-kid-md bg-blue-100 p-4">
                <p className="text-kid-sm font-heading font-bold text-primary">报告</p>
                <p className="mt-1 truncate text-kid-sm font-heading font-bold">{parentEmail || '未设置'}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-kid-sm">
            <Card className="border-2 border-primary-container p-kid-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-kid-sm font-heading font-bold text-primary">阅读</p>
                  <h2 className="text-kid-lg font-heading font-bold text-gray-950">文字大小</h2>
                </div>
                <Badge variant="level">{FONT_OPTIONS.find((item) => item.id === fontScale)?.label}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {FONT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFontScale(option.id)}
                    className={`rounded-kid-lg border-2 p-4 text-center shadow-kid ${
                      fontScale === option.id ? 'border-primary bg-primary-container' : 'border-transparent bg-white'
                    }`}
                  >
                    <div className={`${option.id === 'normal' ? 'text-kid-base' : option.id === 'large' ? 'text-kid-lg' : 'text-kid-xl'} font-heading font-bold`}>
                      {option.sample}
                    </div>
                    <p className="mt-2 text-kid-sm font-heading font-bold">{option.label}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-2 border-accent/70 p-kid-md">
              <p className="text-kid-sm font-heading font-bold text-primary">视觉</p>
              <h2 className="text-kid-lg font-heading font-bold text-gray-950">颜色模式</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setColorMode(option.id)}
                    className={`h-24 rounded-kid-lg border-2 p-4 text-left shadow-kid ${option.className} ${
                      colorMode === option.id ? 'ring-4 ring-accent' : ''
                    }`}
                  >
                    <span className="text-kid-base font-heading font-bold">{option.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-kid-md">
              <p className="text-kid-sm font-heading font-bold text-primary">声音与动画</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="flex items-center justify-between rounded-kid-lg bg-primary-container/60 p-4 shadow-kid">
                  <span className="text-kid-sm font-heading font-bold">语音提示</span>
                  <input type="checkbox" checked={narrationEnabled} onChange={toggleNarration} className="h-5 w-5 accent-secondary" />
                </label>
                <label className="flex items-center justify-between rounded-kid-lg bg-green-100 p-4 shadow-kid">
                  <span className="text-kid-sm font-heading font-bold">音效</span>
                  <input type="checkbox" checked={soundEffectsEnabled} onChange={toggleSoundEffects} className="h-5 w-5 accent-secondary" />
                </label>
                <label className="flex items-center justify-between rounded-kid-lg bg-yellow-100 p-4 shadow-kid">
                  <span className="text-kid-sm font-heading font-bold">减少动画</span>
                  <input type="checkbox" checked={reducedMotion} onChange={toggleReducedMotion} className="h-5 w-5 accent-secondary" />
                </label>
              </div>
            </Card>

            <Card className="p-kid-md">
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
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
