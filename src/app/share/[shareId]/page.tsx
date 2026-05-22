'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { getSharedProject, type SavedProject } from '@/store/project-store';

interface ShareProjectPageProps {
  params: {
    shareId: string;
  };
}

export default function ShareProjectPage({ params }: ShareProjectPageProps) {
  const [project, setProject] = useState<SavedProject | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProject(getSharedProject(params.shareId));
    setLoaded(true);
  }, [params.shareId]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-primary-container/40 p-kid-md">
        <Card className="mx-auto mt-kid-lg max-w-xl p-kid-lg text-center">
          <MascotAvatar expression="running" size="xl" className="animate-bounce" />
          <p className="mt-4 text-kid-lg font-heading font-bold text-primary">正在打开作品...</p>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-container/60 to-background p-kid-sm lg:p-kid-md">
        <Card className="mx-auto mt-kid-lg max-w-xl border-2 border-primary-container p-kid-md text-center">
          <MascotAvatar expression="confused" size="xl" />
          <h1 className="mt-4 text-kid-xl font-heading font-bold text-primary">作品暂时不可查看</h1>
          <p className="mt-2 text-kid-base text-gray-600">
            这个作品可能还没有得到家长批准，或者分享已经撤销。
          </p>
          <Button className="mt-5" onClick={() => window.location.href = '/map'}>
            去 PyBuddy 学习
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-container/50 via-background to-green-50 p-kid-sm lg:p-kid-md">
      <div className="mx-auto max-w-5xl">
        <header className="mb-kid-sm flex flex-wrap items-center justify-between gap-3 rounded-kid-lg bg-surface p-kid-sm shadow-kid">
          <button onClick={() => window.location.href = '/map'} className="flex items-center gap-2">
            <MascotAvatar expression="happy" size="sm" />
            <span className="text-kid-lg font-heading font-bold text-primary">PyBuddy 作品展</span>
          </button>
          <span className="rounded-kid-full bg-accent px-4 py-2 text-kid-sm font-heading font-bold text-gray-900">
            家长已批准
          </span>
        </header>

        <main className="grid gap-kid-sm lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-2 border-primary-container p-kid-md">
            <p className="text-kid-sm font-heading font-bold text-primary">分享作品</p>
            <h1 className="mt-2 text-kid-xl font-heading font-bold text-gray-950">{project.lessonTitle}</h1>
            <p className="mt-2 text-kid-base text-gray-600">
              创作时间：{new Date(project.createdAt).toLocaleString('zh-CN')}
            </p>

            {project.screenshot ? (
              <div
                aria-label={`${project.lessonTitle} 作品截图`}
                className="mt-kid-sm aspect-video w-full rounded-kid-lg border-2 border-primary-container bg-white bg-contain bg-center bg-no-repeat shadow-kid"
                role="img"
                style={{ backgroundImage: `url(${project.screenshot})` }}
              />
            ) : (
              <div className="mt-kid-sm rounded-kid-lg border-2 border-primary-container bg-[#e9f8ff] p-kid-md text-center">
                <MascotAvatar expression="happy" size="xl" />
                <p className="mt-3 text-kid-base font-heading font-bold text-primary">这是一个代码输出作品</p>
              </div>
            )}
          </Card>

          <div className="space-y-kid-sm">
            <Card className="border-2 border-accent/70 p-kid-md">
              <p className="text-kid-sm font-heading font-bold text-primary">Python 代码</p>
              <pre className="mt-3 max-h-72 overflow-auto rounded-kid-md bg-gray-900 p-4 font-code text-kid-sm text-green-300">
                {project.code}
              </pre>
            </Card>

            <Card className="p-kid-md">
              <p className="text-kid-sm font-heading font-bold text-primary">运行输出</p>
              <pre className="mt-3 min-h-20 whitespace-pre-wrap rounded-kid-md bg-primary-container/60 p-4 font-code text-kid-sm text-gray-800">
                {project.output || '这个作品主要展示在画布上。'}
              </pre>
            </Card>

            <Card className="bg-green-50 p-kid-md">
              <div className="flex gap-3">
                <MascotAvatar expression="celebrating" size="md" />
                <div>
                  <p className="text-kid-base font-heading font-bold text-secondary">继续创作</p>
                  <p className="mt-1 text-kid-sm text-gray-600">回到课程地图，做出更多海龟图形和 Python 小作品。</p>
                </div>
              </div>
              <Button variant="secondary" className="mt-4 w-full" onClick={() => window.location.href = '/map'}>
                打开课程地图
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
