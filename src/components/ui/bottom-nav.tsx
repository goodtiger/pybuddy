'use client';

import { usePathname } from 'next/navigation';
import { MapPinIcon, CodeIcon, TrophyIcon, SettingsIcon } from '@/components/icons';

const NAV_ITEMS = [
  { href: '/map', icon: MapPinIcon, label: '地图' },
  { href: '/learn/current', icon: CodeIcon, label: '学习' },
  { href: '/profile', icon: TrophyIcon, label: '成就' },
  { href: '/settings', icon: SettingsIcon, label: '设置' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-[#E5E7EB] py-2 lg:hidden safe-area-inset-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href) && (item.href !== '/learn/current' || pathname?.startsWith('/learn/'));
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href === '/learn/current' ? '/learn/lesson_001' : item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors no-select ${
              isActive ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
            <span className="text-[11px] font-quicksand font-bold">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
