'use client';

import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { defineTurtleBlocks } from '@/lib/blockly/block-definitions';
import { setupPythonGenerator, pythonGenerator } from '@/lib/blockly/python-generator';
import { kidTheme } from '@/lib/blockly/kid-theme';
import { useLessonStore } from '@/store/lesson-store';
import { useProgressStore } from '@/store/progress-store';
import { skulptRunner } from '@/lib/runtime/skulpt-runner';
import { parseFriendlyError } from '@/lib/runtime/error-parser';
import { playSuccess, playError, playBlockSnap } from '@/lib/audio/sound-effects';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { motion } from 'framer-motion';

const ALL_BLOCKS = [
  { type: 'turtle_import', label: 'import', color: 'bg-[#D97706]', icon: '📦' },
  { type: 'turtle_forward', label: 'forward', color: 'bg-[#22C55E]', icon: '➡️' },
  { type: 'turtle_backward', label: 'backward', color: 'bg-[#22C55E]', icon: '⬅️' },
  { type: 'turtle_right', label: 'right', color: 'bg-[#3B82F6]', icon: '↩️' },
  { type: 'turtle_left', label: 'left', color: 'bg-[#6B7280]', icon: '↪️' },
  { type: 'turtle_color', label: 'color', color: 'bg-[#EF4444]', icon: '🎨' },
  { type: 'turtle_pen_up', label: 'pen up', color: 'bg-[#8B5CF6]', icon: '✏️' },
  { type: 'turtle_pen_down', label: 'pen down', color: 'bg-[#8B5CF6]', icon: '✏️' },
  { type: 'turtle_circle', label: 'circle', color: 'bg-[#EC4899]', icon: '⭕' },
];

function BlockEditor({ onCodeChange }: { onCodeChange?: (code: string) => void }) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [pythonCode, setPythonCode] = useState('');
  const currentLesson = useLessonStore((s) => s.currentLesson);

  useEffect(() => {
    if (!blocklyDiv.current) return;
    defineTurtleBlocks();
    setupPythonGenerator();
    const available = currentLesson?.blocks?.available || [];
    const contents = ALL_BLOCKS.filter((b) => available.length === 0 || available.includes(b.type)).map((b) => ({ kind: 'block' as const, type: b.type }));
    const toolbox = { kind: 'flyoutToolbox', contents };
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox, theme: kidTheme,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: false, startScale: 0.8, maxScale: 1.5, minScale: 0.5 },
      trashcan: true, sounds: true, renderer: 'zelos',
    });
    workspaceRef.current = workspace;
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.UI) return;
      const code = pythonGenerator.workspaceToCode(workspace);
      setPythonCode(code);
      onCodeChange?.(code);
    });
    return () => { workspace.dispose(); workspaceRef.current = null; };
  }, [currentLesson?.id]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div ref={blocklyDiv} className="flex-1 rounded-[16px] overflow-hidden" style={{ minHeight: '300px' }} />
      {pythonCode && (
        <div className="bg-[#1E1E1E] text-green-400 font-mono text-sm p-3 rounded-[12px] overflow-auto max-h-32">
          <div className="text-gray-400 mb-1 text-xs">Python 代码预览：</div>
          <pre className="whitespace-pre-wrap">{pythonCode}</pre>
        </div>
      )}
    </div>
  );
}

function TurtleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRunning = useLessonStore((s) => s.isRunning);
  const hasError = useLessonStore((s) => s.hasError);
  const lastResult = useLessonStore((s) => s.lastResult);

  useEffect(() => {
    if (canvasRef.current) skulptRunner.setCanvas(canvasRef.current);
  }, []);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[14px] font-quicksand font-bold text-[#6B7280]">画布</span>
        <button onClick={() => { if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height); } } }} className="text-[14px] text-[#9CA3AF] hover:text-[#3B82F6] no-select">清空 🔄</button>
      </div>
      <div className="flex-1 bg-white rounded-[16px] border-[1px] border-[#E5E7EB] overflow-hidden relative" style={{ minHeight: '200px' }}>
        <canvas ref={canvasRef} width={400} height={300} className="w-full h-full block" />
        {isRunning && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="text-[18px] font-quicksand">🐢 运行中...</span></div>}
        {!lastResult && !isRunning && <div className="absolute inset-0 flex items-center justify-center text-[#D1D5DB] text-[16px] pointer-events-none">拖拽积木后点{"\""}运行{"\""}查看结果</div>}
      </div>
      {hasError && lastResult?.error && (
        <div className="bg-red-50 border-2 border-[#EF4444] rounded-[12px] p-3 text-[16px] text-[#EF4444]">😕 {parseFriendlyError(lastResult.error)}</div>
      )}
    </div>
  );
}

function BlockPalette() {
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const available = currentLesson?.blocks?.available || [];
  const blocks = ALL_BLOCKS.filter((b) => available.length === 0 || available.includes(b.type));

  return (
    <div>
      <p className="text-[12px] text-[#9CA3AF] mb-2 font-quicksand">代码积木</p>
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.type} className="flex items-center gap-2 rounded-[8px] border-[1px] border-[#E5E7EB] bg-white px-3 py-2.5 no-select">
            <span className={`w-[3px] h-6 rounded-full ${block.color}`} />
            <span className="text-[16px]">{block.icon}</span>
            <span className="text-[14px] font-quicksand text-[#374151]">{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LearnPage({ params }: { params: { lessonId: string } }) {
  const { currentLesson, pythonCode, isRunning, setRunning, setRunResult, setCurrentLesson } = useLessonStore();
  const { completeLesson } = useProgressStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch(`/courses/level-1/${params.lessonId}.json`);
        const lesson = await res.json();
        setCurrentLesson(lesson);
      } catch { /* fallback */ }
    }
    loadLesson();
  }, [params.lessonId]);

  const handleRun = async () => {
    if (!pythonCode) return;
    setRunning(true);
    const result = await skulptRunner.run(pythonCode);
    setRunning(false);
    setRunResult(result);
    if (!result.error && currentLesson) {
      playSuccess();
      completeLesson(currentLesson.id, 3);
      setShowCelebration(true);
    } else if (result.error) {
      playError();
    }
  };

  if (!currentLesson) return <div className="min-h-screen flex items-center justify-center text-[18px] font-quicksand text-[#3B82F6]">🐢 正在加载课程...</div>;

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FEF3C7] via-[#DBEAFE] to-[#F2F5F8] flex flex-col items-center justify-center gap-6 p-6">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}><span className="text-[96px]">🐢</span></motion.div>
        <motion.h1 className="text-[32px] font-quicksand font-bold text-[#22C55E]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>太棒了！🎉</motion.h1>
        <motion.p className="text-[18px] text-[#6B7280]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>{currentLesson.title} 完成！</motion.p>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.9, stiffness: 150 }}><span className="text-[32px] text-[#F59E0B]">★★★</span></motion.div>
        <motion.div className="flex gap-4 mt-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
          <button onClick={() => window.location.href = '/map'} className="rounded-full bg-transparent border-2 border-[#3B82F6] px-6 py-3 text-[15px] font-quicksand font-bold text-[#3B82F6]">🗺️ 返回地图</button>
          <button onClick={() => setShowCelebration(false)} className="rounded-full bg-[#16A34A] px-6 py-3 text-[15px] font-quicksand font-bold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)]">下一课 → 🚀</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5F8]">
      {/* Header - flat blue bar */}
      <header className="bg-[#3B82F6] px-4 py-3 flex items-center justify-between">
        <span className="text-[18px] font-quicksand font-bold text-white">PyBuddy</span>
        <span className="text-[16px] font-quicksand text-white/90">Level 6: {currentLesson.title}</span>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[14px] font-quicksand font-bold text-[#3B82F6]">6/15</span>
          <span className="rounded-full bg-[#F59E0B] text-white w-8 h-8 flex items-center justify-center text-[14px] font-bold">1</span>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white">⚙️</button>
        </div>
      </header>

      {/* Main responsive layout - mobile stacked, desktop 3-column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr_1.4fr] gap-4 p-4 min-h-[calc(100vh-56px)]">
        {/* Left sidebar - story + block editor */}
        <div className="bg-[#F3F4F6] rounded-[16px] p-4 flex flex-col gap-4">
          <div className="rounded-[16px] border-[1px] border-[#E5E7EB] bg-white p-4 flex flex-col items-center gap-3">
            <div className="w-[80px] h-[80px] rounded-full bg-[#DCFCE7] border-4 border-[#22C55E] flex items-center justify-center text-[48px]">🐢</div>
            <p className="text-[15px] font-quicksand text-[#374151] text-center">{currentLesson.story}</p>
          </div>
          <BlockEditor onCodeChange={(code) => useLessonStore.getState().setPythonCode(code)} />
        </div>

        {/* Center canvas */}
        <div className="bg-[#F3F4F6] rounded-[16px] p-4 flex flex-col gap-4">
          <div className="flex-1 rounded-[16px] border-[1px] border-[#E5E7EB] bg-white p-4">
            <TurtleCanvas />
          </div>
          <div className="text-center text-[12px] text-[#9CA3AF] font-quicksand">画布预览 (Canvas)</div>
        </div>

        {/* Right sidebar - code editor + run button */}
        <div className="bg-[#F3F4F6] rounded-[16px] p-4 flex flex-col gap-4">
          <div className="rounded-[16px] overflow-hidden bg-[#1E1E1E] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#2D2D2D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            </div>
            {pythonCode ? (
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                customStyle={{ margin: 0, background: 'transparent', fontSize: '13px' }}
                showLineNumbers
                wrapLines
              >
                {pythonCode}
              </SyntaxHighlighter>
            ) : (
              <pre className="p-3 text-[13px] font-mono text-[#6B7280]"># 拖拽积木生成代码</pre>
            )}
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full rounded-full bg-[#16A34A] py-3 text-[16px] font-quicksand font-bold text-white shadow-[0_4px_8px_rgba(22,163,74,0.2)] transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="bg-[#F59E0B] rounded-md w-6 h-6 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
            运行代码
          </button>

          {currentLesson.hints.length > 0 && (
            <div className="rounded-[12px] border-[1px] border-[#E5E7EB] bg-white p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <p className="text-[13px] font-quicksand text-[#374151]">{currentLesson.hints[hintIndex]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
