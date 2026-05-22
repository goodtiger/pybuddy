'use client';

import { useRef, useEffect } from 'react';
import { skulptRunner } from '@/lib/runtime/skulpt-runner';
import { useLessonStore } from '@/store/lesson-store';
import { parseFriendlyError } from '@/lib/runtime/error-parser';

export function TurtleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRunning = useLessonStore((s) => s.isRunning);
  const hasError = useLessonStore((s) => s.hasError);
  const lastResult = useLessonStore((s) => s.lastResult);

  useEffect(() => {
    if (canvasRef.current) {
      skulptRunner.setCanvas(canvasRef.current);
    }
  }, []);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-kid-sm font-heading font-bold text-primary">🎨 魔法画布</span>
        <button onClick={clearCanvas} className="text-kid-sm text-gray-400 hover:text-primary no-select">
          清空
        </button>
      </div>
      <div
        className="flex-1 rounded-kid-md border-2 border-primary-container overflow-hidden relative"
        style={{
          minHeight: '260px',
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle, rgba(74,144,226,0.16) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={560}
          className="w-full h-full"
        />
        {isRunning && (
          <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
            <span className="text-kid-lg">🐢 Python正在跑步...</span>
          </div>
        )}
        {!lastResult && !isRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-kid-base text-center px-6">
            <span className="text-5xl mb-3">🐢</span>
            <span>拖拽积木后点“运行代码”</span>
            <span className="text-kid-sm">小海龟会在这里画出结果</span>
          </div>
        )}
      </div>
      {lastResult && !hasError && (
        <div className="bg-secondary/10 border-2 border-secondary/30 rounded-kid-md p-3 text-kid-sm text-secondary-dark font-heading">
          ✓ 运行成功，用时 {lastResult.executionTime}ms
        </div>
      )}
      {hasError && lastResult?.error && (
        <div className="bg-red-50 border-2 border-error rounded-kid-md p-3 text-kid-base text-error">
          <span className="font-bold">😕 </span>
          {parseFriendlyError(lastResult.error)}
        </div>
      )}
    </div>
  );
}
