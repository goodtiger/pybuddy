'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user-store';

export default function Home() {
  const isFirstVisit = useUserStore((s) => s.isFirstVisit);

  useEffect(() => {
    if (isFirstVisit) {
      window.location.href = '/onboarding';
    } else {
      window.location.href = '/map';
    }
  }, [isFirstVisit]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-kid-lg text-primary">🐢 PyBuddy 加载中...</div>
    </div>
  );
}
