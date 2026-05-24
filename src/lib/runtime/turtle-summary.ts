import type { TurtleRunSummary } from '@/types/runtime';

const EMPTY_SUMMARY: TurtleRunSummary = {
  imported: false,
  created: false,
  movementCount: 0,
  turnCount: 0,
  circleCount: 0,
  colorCount: 0,
  penCount: 0,
  repeatCount: 0,
};

function countMatches(code: string, pattern: RegExp) {
  return code.match(pattern)?.length || 0;
}

export function summarizeTurtleCode(code: string): TurtleRunSummary {
  return {
    imported: /\bimport\s+turtle\b/.test(code),
    created: /\bturtle\.Turtle\s*\(/.test(code),
    movementCount: countMatches(code, /\.(?:forward|backward)\s*\(/g),
    turnCount: countMatches(code, /\.(?:right|left)\s*\(/g),
    circleCount: countMatches(code, /\.circle\s*\(/g),
    colorCount: countMatches(code, /\.color\s*\(/g),
    penCount: countMatches(code, /\.(?:penup|pendown)\s*\(/g),
    repeatCount: countMatches(code, /\bfor\s+\w+\s+in\s+(?:range\s*\(|\w+)/g),
  };
}

export function emptyTurtleSummary(): TurtleRunSummary {
  return { ...EMPTY_SUMMARY };
}
