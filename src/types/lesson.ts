export type Phase = 'block' | 'hybrid' | 'hint' | 'code';

export interface LessonBlock {
  type: string;
  category: string;
}

export interface Lesson {
  id: string;
  level: number;
  number: number;
  title: string;
  phase: Phase;
  objectives: string[];
  story: string;
  story_illustration?: string;
  blocks: {
    available: string[];
    locked?: string[];
  };
  expected_code: string;
  visual: {
    type: 'text_output' | 'turtle_canvas' | 'animation' | 'game';
    expected_result: string;
    config?: Record<string, unknown>;
  };
  hints: string[];
  validation: {
    must_contain: string[];
    must_not_contain?: string[];
    run_test: boolean;
    visual_check?: string;
    turtle_actions?: {
      imported?: boolean;
      created?: boolean;
      min_movement?: number;
      min_turns?: number;
      min_circles?: number;
      min_colors?: number;
      min_pen_changes?: number;
      min_repeats?: number;
    };
    output_contains?: string[];
  };
  debug_mode?: {
    has_bug: boolean;
    bug_description?: string;
    hint?: string;
  };
}
