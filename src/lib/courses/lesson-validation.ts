import type { Lesson } from '@/types/lesson';
import type { RunResult, TurtleRunSummary } from '@/types/runtime';

export interface LessonValidationResult {
  passed: boolean;
  missingTokens: string[];
  blockedTokens: string[];
  message: string;
  stars: number;
}

function compact(value: string) {
  return value.replace(/\s+/g, '');
}

function includesToken(code: string, token: string) {
  return code.includes(token) || compact(code).includes(compact(token));
}

function checkTurtleActions(lesson: Lesson, summary?: TurtleRunSummary): string | null {
  const required = lesson.validation.turtle_actions;
  if (!required) return null;

  if (!summary) return '还没有看到小海龟动作。先从“导入海龟模块”积木开始。';
  if (required.imported && !summary.imported) return '还没有导入 turtle。先放上“导入海龟模块”积木。';
  if (required.created && !summary.created) return '还没有创建小海龟。先用导入海龟模块创建 t。';
  if ((required.min_colors || 0) > summary.colorCount) return '还没有设置画笔颜色。试试加入“画笔颜色”积木。';
  if ((required.min_repeats || 0) > summary.repeatCount) return '还没有使用重复积木。把动作放进“重复画”里面试试。';
  if ((required.min_movement || 0) > summary.movementCount) return '还没有让小海龟移动。试试加入“前进”或“后退”积木。';
  if ((required.min_turns || 0) > summary.turnCount) return '还没有让小海龟转弯。试试加入“右转”或“左转”积木。';
  if ((required.min_circles || 0) > summary.circleCount) return '还没有画圆。试试加入“画圆”积木。';
  if ((required.min_pen_changes || 0) > summary.penCount) return '还没有改变画笔状态。试试抬起或放下画笔。';

  return null;
}

export function validateLessonRun(
  lesson: Lesson,
  code: string,
  result: RunResult
): LessonValidationResult {
  if (lesson.validation.run_test && result.error) {
    return {
      passed: false,
      missingTokens: [],
      blockedTokens: [],
      message: '代码还没有跑通，先看错误提示，再试一次。',
      stars: 0,
    };
  }

  const missingTokens = lesson.validation.must_contain.filter((token) => !includesToken(code, token));
  const blockedTokens = (lesson.validation.must_not_contain || []).filter((token) => includesToken(code, token));

  if (missingTokens.length > 0) {
    return {
      passed: false,
      missingTokens,
      blockedTokens,
      message: `还差 ${missingTokens[0]}。先把这个积木或代码加进去。`,
      stars: 1,
    };
  }

  if (blockedTokens.length > 0) {
    return {
      passed: false,
      missingTokens,
      blockedTokens,
      message: `这节课暂时不能用 ${blockedTokens[0]}，换一种更简单的写法试试。`,
      stars: 1,
    };
  }

  if (lesson.validation.visual_check === 'text_output' && result.output.join('').trim().length === 0) {
    return {
      passed: false,
      missingTokens,
      blockedTokens,
      message: '运行成功了，但还没有看到输出。试试用 print 说一句话。',
      stars: 2,
    };
  }

  const outputText = result.output.join('').trim();
  const missingOutput = (lesson.validation.output_contains || []).find((token) => !outputText.includes(token));
  if (missingOutput) {
    return {
      passed: false,
      missingTokens,
      blockedTokens,
      message: `运行成功了，但输出里还没有看到“${missingOutput}”。检查 print 的内容再试试。`,
      stars: 2,
    };
  }

  if (lesson.validation.visual_check === 'turtle_canvas' && !result.canvasData) {
    return {
      passed: false,
      missingTokens,
      blockedTokens,
      message: '代码跑通了，但画布还没有作品。试试让小海龟前进、转弯或画圆。',
      stars: 2,
    };
  }

  if (lesson.validation.visual_check === 'turtle_canvas') {
    const turtleMessage = checkTurtleActions(lesson, result.turtleSummary);
    if (turtleMessage) {
      return {
        passed: false,
        missingTokens,
        blockedTokens,
        message: turtleMessage,
        stars: 2,
      };
    }
  }

  return {
    passed: true,
    missingTokens: [],
    blockedTokens: [],
    message: '任务完成！你可以继续下一课，或者保存这个作品。',
    stars: 3,
  };
}
