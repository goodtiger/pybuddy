'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as Blockly from 'blockly';
import { defineTurtleBlocks } from '@/lib/blockly/block-definitions';
import { setupPythonGenerator, pythonGenerator } from '@/lib/blockly/python-generator';
import { kidTheme } from '@/lib/blockly/kid-theme';
import { useLessonStore } from '@/store/lesson-store';

const ALL_BLOCKS = [
  { kind: 'block', type: 'print_text' },
  { kind: 'block', type: 'print_number' },
  { kind: 'block', type: 'variable_set_name' },
  { kind: 'block', type: 'variable_print_name' },
  { kind: 'block', type: 'math_add_print' },
  { kind: 'block', type: 'repeat_square' },
  { kind: 'block', type: 'turtle_import' },
  { kind: 'block', type: 'turtle_forward' },
  { kind: 'block', type: 'turtle_backward' },
  { kind: 'block', type: 'turtle_right' },
  { kind: 'block', type: 'turtle_left' },
  { kind: 'block', type: 'turtle_color' },
  { kind: 'block', type: 'turtle_pen_up' },
  { kind: 'block', type: 'turtle_pen_down' },
  { kind: 'block', type: 'turtle_circle' },
];

const BLOCK_ALIASES: Record<string, string[]> = {
  print: ['print_text', 'print_number'],
  variable: ['variable_set_name', 'variable_print_name'],
  math: ['math_add_print'],
};

export function BlockEditor({ onCodeChange, showPreview = true }: { onCodeChange?: (code: string) => void; showPreview?: boolean }) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onCodeChangeRef = useRef(onCodeChange);
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const pythonCode = useLessonStore((s) => s.pythonCode);
  const lessonId = currentLesson?.id;
  const availableBlocks = useMemo(() => currentLesson?.blocks?.available || [], [currentLesson?.blocks?.available]);

  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    defineTurtleBlocks();
    setupPythonGenerator();

    const expandedAvailable = new Set(
      availableBlocks.flatMap((type) => BLOCK_ALIASES[type] || [type])
    );
    const contents = ALL_BLOCKS.filter((b) => availableBlocks.length === 0 || expandedAvailable.has(b.type));

    const toolbox = {
      kind: 'flyoutToolbox',
      contents,
    };

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      theme: kidTheme,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: false, startScale: 0.8, maxScale: 1.5, minScale: 0.5 },
      trashcan: true,
      media: '/blockly-media/',
      sounds: false,
      renderer: 'zelos',
    });

    workspaceRef.current = workspace;

    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.UI) return;
      const code = pythonGenerator.workspaceToCode(workspace);
      useLessonStore.getState().setPythonCode(code);
      onCodeChangeRef.current?.(code);
    });

    return () => {
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [lessonId, availableBlocks]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        ref={blocklyDiv}
        className="flex-1 rounded-kid-md overflow-hidden border-2 border-primary-container"
        style={{ minHeight: '300px' }}
      />
      {showPreview && (pythonCode || currentLesson?.expected_code) && (
        <div className="bg-gray-900 text-green-400 font-code text-kid-sm p-3 rounded-kid-md overflow-auto max-h-32">
          <div className="text-gray-400 mb-1 text-xs">Python 代码预览：</div>
          <pre className="whitespace-pre-wrap">{pythonCode || currentLesson?.expected_code || '# 拖拽积木到左边生成代码'}</pre>
        </div>
      )}
    </div>
  );
}
