'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BlockEditor } from '@/components/engines/BlockEditor';
import { TurtleCanvas } from '@/components/engines/TurtleCanvas';
import { ConceptIntroCard } from '@/components/learning/ConceptIntroCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { askTutor } from '@/lib/ai-tutor/client';
import { playError, playSuccess } from '@/lib/audio/sound-effects';
import { validateLessonRun, type LessonValidationResult } from '@/lib/courses/lesson-validation';
import { getLessonCountForLevel, getProgressLessonKey } from '@/lib/courses/course-constants';
import { formatLessonId, getLearnPath } from '@/lib/courses/lesson-routing';
import { skulptRunner } from '@/lib/runtime/skulpt-runner';
import { useSkulpt } from '@/hooks/useSkulpt';
import { useLessonStore } from '@/store/lesson-store';
import { useProgressStore } from '@/store/progress-store';
import { useProjectStore } from '@/store/project-store';
import type { Lesson } from '@/types/lesson';

interface LessonResponse {
  data?: Lesson;
}

function getOutputText(output: string[]) {
  return output.join('').trim();
}

function TextOutputPanel({
  output,
  expectedResult,
  isRunning,
}: {
  output: string;
  expectedResult: string;
  isRunning: boolean;
}) {
  return (
    <div className="flex h-full min-h-[360px] flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[14px] font-quicksand font-bold text-[#3B82F6]">输出舞台</span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[12px] font-quicksand font-bold text-[#2563EB]">
          print
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center rounded-[18px] border-2 border-[#DBEAFE] bg-gradient-to-b from-white to-[#EFF6FF] p-6 text-center">
        <MascotAvatar expression={output ? 'celebrating' : 'happy'} size="xl" />
        <div className="mx-auto mt-5 w-full max-w-xl rounded-[16px] bg-[#111827] p-5 text-left shadow-[0_8px_20px_rgba(17,24,39,0.2)]">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            <span className="ml-2 text-[12px] text-white/60">Python 输出</span>
          </div>
          <pre className="min-h-[96px] whitespace-pre-wrap font-code text-[20px] leading-8 text-green-300">
            {isRunning ? 'Python 正在思考...' : output || '运行代码后，print 的结果会出现在这里。'}
          </pre>
        </div>
        <p className="mt-4 text-[14px] text-[#6B7280]">{expectedResult}</p>
      </div>
    </div>
  );
}

export function LearnLessonPage({ lessonId, level = 1 }: { lessonId: string; level?: number }) {
  const router = useRouter();
  const { loaded: skulptLoaded, error: skulptError } = useSkulpt();
  const {
    currentLesson,
    pythonCode,
    isRunning,
    lastResult,
    hints,
    currentHintIndex,
    aiMessages,
    aiDailyQuota,
    setRunning,
    setRunResult,
    setCurrentLesson,
    setPythonCode,
    nextHint,
    addAiMessage,
    decrementAiQuota,
  } = useLessonStore();
  const { completeLesson, totalStars } = useProgressStore();
  const { saveProject } = useProjectStore();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validation, setValidation] = useState<LessonValidationResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      setLoadError(null);
      setValidation(null);
      setShowCelebration(false);
      setLessonCompleted(false);
      setSavedProjectId(null);

      try {
        const response = await fetch(`/api/v1/courses/${level}/lessons/${lessonId}`);
        if (!response.ok) throw new Error('Lesson request failed');
        const payload = (await response.json()) as LessonResponse;
        if (!payload.data) throw new Error('Lesson payload missing');
        if (!cancelled) setCurrentLesson(payload.data);
      } catch {
        if (!cancelled) setLoadError('课程加载失败，请回到地图重新进入。');
      }
    }

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [level, lessonId, setCurrentLesson]);

  const progressLabel = useMemo(() => {
    if (!currentLesson) return '';
    return `${currentLesson.number}/${getLessonCountForLevel(currentLesson.level)}`;
  }, [currentLesson]);

  const runButtonLabel = useMemo(() => {
    if (isRunning) return '运行中...';
    if (!skulptLoaded) return '加载 Python 中';
    return '运行代码';
  }, [isRunning, skulptLoaded]);

  const outputText = getOutputText(lastResult?.output || []);

  const handleRun = async () => {
    if (!currentLesson || !pythonCode.trim() || !skulptLoaded) return;

    setValidation(null);
    setRunning(true);
    const result = await skulptRunner.run(pythonCode);
    setRunning(false);
    setRunResult(result);

    const nextValidation = validateLessonRun(currentLesson, pythonCode, result);
    setValidation(nextValidation);

    if (nextValidation.passed) {
      playSuccess();
      completeLesson(getProgressLessonKey(currentLesson.level, currentLesson.id), nextValidation.stars);
      const saved = saveProject({
        level: currentLesson.level,
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        code: pythonCode,
        output: getOutputText(result.output),
        screenshot: result.canvasData,
      });
      setSavedProjectId(saved.id);
      setLessonCompleted(true);
    } else {
      playError();
      setLessonCompleted(false);
    }
  };

  const handleAskTutor = async () => {
    if (!currentLesson || !tutorInput.trim() || tutorLoading || aiDailyQuota <= 0) return;

    const message = tutorInput.trim();
    setTutorInput('');
    setTutorLoading(true);
    addAiMessage({ role: 'user', content: message, timestamp: new Date() });
    decrementAiQuota();

    const reply = await askTutor({
      message,
      lesson: currentLesson,
      currentCode: pythonCode,
      currentError: lastResult?.error,
    });

    addAiMessage({ role: 'assistant', content: reply, timestamp: new Date() });
    setTutorLoading(false);
  };

  const handleResetLesson = () => {
    useLessonStore.getState().reset();
    setValidation(null);
    setShowCelebration(false);
    setLessonCompleted(false);
    setSavedProjectId(null);
    setEditorResetKey((value) => value + 1);
  };

  const goNextLesson = () => {
    if (!currentLesson) return;
    const lessonCount = getLessonCountForLevel(currentLesson.level);
    if (currentLesson.number >= lessonCount) {
      if (currentLesson.level >= 2) {
        router.push('/celebration');
        return;
      }
      router.push('/map?level=2');
      return;
    }
    router.push(getLearnPath(currentLesson.level, formatLessonId(currentLesson.number + 1)));
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-background p-kid-md">
        <Card className="mx-auto mt-kid-lg max-w-xl border-2 border-error/40 p-kid-md text-center">
          <MascotAvatar expression="confused" size="xl" />
          <h1 className="mt-4 text-kid-xl font-heading font-bold text-error">课程打不开</h1>
          <p className="mt-2 text-kid-base text-gray-600">{loadError}</p>
          <Button className="mt-5" onClick={() => router.push('/map')}>
            返回地图
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-kid-lg text-primary">🐢 正在加载课程...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5F8]">
      <header className="sticky top-0 z-30 bg-[#3B82F6] px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <button onClick={() => router.push('/map')} className="flex items-center gap-2 text-white">
            <MascotAvatar expression="happy" size="sm" />
            <span className="text-[18px] font-quicksand font-bold">PyBuddy</span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[16px] font-quicksand font-bold text-white">
              Level {currentLesson.level}: {currentLesson.title}
            </p>
            <p className="text-[12px] text-white/80">{currentLesson.phase === 'block' ? '积木模式' : '代码模式'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[14px] font-quicksand font-bold text-[#3B82F6]">
              {progressLabel}
            </span>
            <span className="rounded-full bg-[#F59E0B] px-3 py-1 text-[14px] font-quicksand font-bold text-white">
              {totalStars} 星
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1680px] grid-cols-1 gap-4 p-4 md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(520px,1fr)_390px]">
        <section className="hidden flex-col gap-4 md:sticky md:top-[82px] md:flex md:self-start">
          <Card className="border-2 border-primary-container p-4 shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
            <div className="flex items-start gap-3">
              <MascotAvatar expression="happy" size="md" />
              <div>
                <p className="text-[12px] font-quicksand font-bold uppercase tracking-wide text-[#3B82F6]">
                  今日任务
                </p>
                <h1 className="mt-1 text-[24px] font-quicksand font-bold text-[#1F2937]">{currentLesson.title}</h1>
                <p className="mt-2 text-[15px] text-[#374151]">{currentLesson.story}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {currentLesson.objectives.map((objective) => (
                <div key={objective} className="flex items-center gap-2 rounded-[10px] bg-[#DBEAFE]/70 px-3 py-2 text-[14px] text-[#1F2937]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                  {objective}
                </div>
              ))}
            </div>
          </Card>

          <ConceptIntroCard lesson={currentLesson} />

          <Card className="border-2 border-[#DBEAFE] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-quicksand font-bold text-[#3B82F6]">小提示</p>
              <button onClick={nextHint} className="text-[13px] font-quicksand font-bold text-[#16A34A]">
                换一个
              </button>
            </div>
            <p className="mt-2 min-h-[48px] text-[14px] text-[#374151]">
              {hints[currentHintIndex] || '先拖一个最像任务目标的积木，再运行看看。'}
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-4 md:hidden">
          <Card className="border-2 border-primary-container p-4 shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
            <div className="flex items-start gap-3">
              <MascotAvatar expression="happy" size="md" />
              <div>
                <p className="text-[12px] font-quicksand font-bold uppercase tracking-wide text-[#3B82F6]">
                  今日任务
                </p>
                <h1 className="mt-1 text-[24px] font-quicksand font-bold text-[#1F2937]">{currentLesson.title}</h1>
                <p className="mt-2 text-[15px] text-[#374151]">{currentLesson.story}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {currentLesson.objectives.map((objective) => (
                <div key={objective} className="flex items-center gap-2 rounded-[10px] bg-[#DBEAFE]/70 px-3 py-2 text-[14px] text-[#1F2937]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                  {objective}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="flex min-h-[calc(100vh-92px)] flex-col gap-4">
          <Card className="flex min-h-[430px] flex-[1.2] flex-col border-2 border-primary-container p-3 shadow-[0_10px_28px_rgba(59,130,246,0.1)] md:min-h-[520px]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-[15px] font-quicksand font-bold text-[#3B82F6]">拖拽积木区</p>
                <p className="text-[12px] text-[#6B7280]">把积木拖到白色工作区，右侧 Python 会同步更新。</p>
              </div>
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[12px] font-quicksand font-bold text-[#2563EB]">
                Blockly
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <BlockEditor key={`${currentLesson.id}-${editorResetKey}`} showPreview={false} />
            </div>
          </Card>

          <div className="flex flex-col gap-4 md:hidden">
            <ConceptIntroCard lesson={currentLesson} />

            <Card className="border-2 border-[#DBEAFE] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-quicksand font-bold text-[#3B82F6]">小提示</p>
                <button onClick={nextHint} className="text-[13px] font-quicksand font-bold text-[#16A34A]">
                  换一个
                </button>
              </div>
              <p className="mt-2 min-h-[48px] text-[14px] text-[#374151]">
                {hints[currentHintIndex] || '先拖一个最像任务目标的积木，再运行看看。'}
              </p>
            </Card>
          </div>

          <Card className="flex min-h-[300px] flex-col border-2 border-primary-container p-4">
            {currentLesson.visual.type === 'text_output' ? (
              <TextOutputPanel
                output={outputText}
                expectedResult={currentLesson.visual.expected_result}
                isRunning={isRunning}
              />
            ) : (
              <TurtleCanvas />
            )}
          </Card>

          <Card className="border-2 border-[#E5E7EB] p-4 shadow-[0_8px_20px_rgba(31,41,55,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-quicksand font-bold text-[#3B82F6]">运行输出</p>
                <p className="text-[12px] text-[#6B7280]">print 的结果和过关提示会显示在这里。</p>
              </div>
              {skulptError && <span className="text-[13px] text-[#EF4444]">{skulptError}</span>}
            </div>

            <pre className="mt-3 min-h-[84px] whitespace-pre-wrap rounded-[12px] bg-[#111827] p-3 font-code text-[14px] text-green-300">
              {lastResult?.error ? lastResult.error : outputText || '还没有输出。运行代码后看看 Python 说了什么。'}
            </pre>

            {validation && (
              <div
                className={`mt-3 rounded-[12px] border-2 p-3 text-[15px] font-quicksand font-bold ${
                  validation.passed
                    ? 'border-[#22C55E] bg-green-50 text-[#166534]'
                    : 'border-[#F59E0B] bg-amber-50 text-[#92400E]'
                }`}
              >
                {validation.message}
              </div>
            )}
            {lessonCompleted && (
              <div className="mt-3 flex flex-col gap-3 rounded-[14px] border-2 border-[#22C55E] bg-green-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-quicksand font-bold text-[#166534]">输出已经保留在这里，可以先检查结果。</p>
                  <p className="text-[13px] text-[#4B5563]">确认作品没问题后，再进入完成页或下一课。</p>
                </div>
                <Button variant="secondary" onClick={() => setShowCelebration(true)}>
                  完成这课
                </Button>
              </div>
            )}
          </Card>
        </section>

        <aside className="flex flex-col gap-4 md:col-start-2 xl:col-start-auto xl:sticky xl:top-[82px] xl:self-start">
          <Card className="overflow-hidden border-2 border-[#111827]/10 p-0 shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
            <div className="flex items-center gap-1.5 bg-[#2D2D2D] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              <span className="ml-2 text-[12px] font-quicksand text-white/70">Python 代码 · 可手动输入</span>
              <button
                className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[12px] font-quicksand font-bold text-white/80 hover:bg-white/20"
                onClick={() => setPythonCode(currentLesson.expected_code)}
              >
                填入示例
              </button>
            </div>
            <div className="grid min-h-[300px] grid-cols-[3rem_1fr] bg-[#1E1E1E]">
              <div
                aria-hidden="true"
                className="select-none border-r border-white/10 bg-[#252526] px-3 py-4 text-right font-code text-[13px] leading-6 text-white/35"
              >
                {(pythonCode || '\n').split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <textarea
                aria-label="Python 代码输入区"
                value={pythonCode}
                onChange={(event) => setPythonCode(event.target.value)}
                placeholder="# 从左边拖一个积木开始，也可以直接在这里输入 Python"
                spellCheck={false}
                className="min-h-[300px] resize-y bg-[#1E1E1E] px-4 py-4 font-code text-[13px] leading-6 text-[#D4D4D4] outline-none placeholder:text-white/35 focus:bg-[#1B1B1B]"
              />
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              aria-label="运行 Python 代码"
              className="col-span-2"
              disabled={!pythonCode.trim() || isRunning || !skulptLoaded}
              onClick={handleRun}
              size="lg"
              variant="secondary"
            >
              {runButtonLabel}
            </Button>
            <Button variant="ghost" onClick={handleResetLesson}>
              重来
            </Button>
            <Button aria-label="打开完成弹窗" variant="accent" disabled={!lessonCompleted} onClick={() => setShowCelebration(true)}>
              完成/继续
            </Button>
          </div>

          <Card className="flex flex-1 flex-col border-2 border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-quicksand font-bold text-[#3B82F6]">AI 小老师</p>
              <span className="text-[12px] text-[#6B7280]">剩余 {aiDailyQuota}</span>
            </div>
            <div className="mt-3 flex max-h-56 flex-1 flex-col gap-2 overflow-auto rounded-[12px] bg-[#F9FAFB] p-3">
              {aiMessages.length === 0 ? (
                <p className="text-[13px] text-[#6B7280]">卡住时可以问一句，例如“为什么没有画出来？”</p>
              ) : (
                aiMessages.map((message, index) => (
                  <div
                    key={`${message.timestamp.toString()}-${index}`}
                    className={`rounded-[12px] px-3 py-2 text-[13px] ${
                      message.role === 'user'
                        ? 'self-end bg-[#3B82F6] text-white'
                        : 'self-start bg-white text-[#374151] shadow-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                ))
              )}
              {tutorLoading && <p className="text-[13px] text-[#6B7280]">小老师正在想...</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={tutorInput}
                onChange={(event) => setTutorInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAskTutor();
                }}
                className="min-w-0 flex-1 rounded-[12px] border-2 border-[#E5E7EB] px-3 py-2 text-[14px] outline-none focus:border-[#3B82F6]"
                placeholder="问小老师..."
              />
              <Button disabled={tutorLoading || aiDailyQuota <= 0 || !tutorInput.trim()} onClick={handleAskTutor}>
                发送
              </Button>
            </div>
          </Card>
        </aside>
      </main>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[24px] bg-white p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
          >
            <MascotAvatar expression="celebrating" size="xl" />
            <h2 className="mt-3 text-[30px] font-quicksand font-bold text-[#16A34A]">太棒了！</h2>
            <p className="mt-2 text-[16px] text-[#4B5563]">{currentLesson.title} 已完成，获得 3 颗星。</p>
            {savedProjectId && (
              <p className="mt-2 text-[13px] text-[#6B7280]">作品已保存到个人作品夹，家长批准后可以分享。</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => router.push('/map')}>
                回地图
              </Button>
              <Button variant="secondary" onClick={goNextLesson}>
                {currentLesson.number >= getLessonCountForLevel(currentLesson.level) ? '下一阶段' : '下一课'}
              </Button>
            </div>
            <button className="mt-4 text-[13px] font-quicksand font-bold text-[#6B7280]" onClick={() => setShowCelebration(false)}>
              继续看看作品
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
