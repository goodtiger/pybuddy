import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-kid-md">
      <Card className="max-w-lg border-2 border-primary-container p-kid-lg text-center">
        <MascotAvatar expression="confused" size="xl" />
        <h1 className="mt-4 text-kid-xl font-heading font-bold text-primary">小海龟迷路了</h1>
        <p className="mt-2 text-kid-base text-gray-600">这个页面像少了冒号一样没有打开。回到地图继续冒险吧。</p>
        <a
          href="/map"
          className="mt-6 inline-flex h-14 items-center justify-center rounded-kid-full bg-primary px-kid-md text-kid-lg font-heading font-bold text-white shadow-kid-3d transition-all active:translate-y-1 active:shadow-none"
        >
          返回地图
        </a>
      </Card>
    </div>
  );
}
