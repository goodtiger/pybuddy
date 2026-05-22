import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-primary-container/30 flex items-center justify-center p-kid-md">
      <Card className="w-full max-w-lg p-kid-lg text-center">
        <MascotAvatar expression="running" size="xl" className="inline-block animate-bounce" />
        <h1 className="mt-4 text-kid-xl font-heading font-bold text-primary">小海龟正在准备...</h1>
        <p className="mt-2 text-kid-base text-gray-600">Python 小知识：缩进就像排队，属于循环的代码要站在里面。</p>
        <div className="mt-6">
          <ProgressBar value={72} max={100} />
        </div>
      </Card>
    </div>
  );
}
