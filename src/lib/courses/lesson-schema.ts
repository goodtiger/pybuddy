import { z } from 'zod';
import type { Lesson } from '@/types/lesson';

export const PhaseSchema = z.enum(['block', 'hybrid', 'hint', 'code']);

export const LessonSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().positive(),
  number: z.number().int().positive(),
  title: z.string().min(1),
  phase: PhaseSchema,
  objectives: z.array(z.string().min(1)).min(1),
  story: z.string().min(1),
  story_illustration: z.string().optional(),
  blocks: z.object({
    available: z.array(z.string().min(1)),
    locked: z.array(z.string().min(1)).optional(),
  }),
  expected_code: z.string(),
  visual: z.object({
    type: z.enum(['text_output', 'turtle_canvas', 'animation', 'game']),
    expected_result: z.string().min(1),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
  hints: z.array(z.string().min(1)).min(1),
  validation: z.object({
    must_contain: z.array(z.string()),
    must_not_contain: z.array(z.string()).optional(),
    run_test: z.boolean(),
    visual_check: z.string().optional(),
    turtle_actions: z.object({
      imported: z.boolean().optional(),
      created: z.boolean().optional(),
      min_movement: z.number().int().nonnegative().optional(),
      min_turns: z.number().int().nonnegative().optional(),
      min_circles: z.number().int().nonnegative().optional(),
      min_colors: z.number().int().nonnegative().optional(),
      min_pen_changes: z.number().int().nonnegative().optional(),
      min_repeats: z.number().int().nonnegative().optional(),
    }).optional(),
    output_contains: z.array(z.string()).optional(),
  }),
  debug_mode: z.object({
    has_bug: z.boolean(),
    bug_description: z.string().optional(),
    hint: z.string().optional(),
  }).optional(),
}) satisfies z.ZodType<Lesson>;

export const CourseLevelSchema = z.object({
  level: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  lesson_count: z.number().int().nonnegative(),
  lessons: z.array(LessonSchema),
});

export type CourseLevel = z.infer<typeof CourseLevelSchema>;
