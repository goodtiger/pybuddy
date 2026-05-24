export interface TurtleRunSummary {
  imported: boolean;
  created: boolean;
  movementCount: number;
  turnCount: number;
  circleCount: number;
  colorCount: number;
  penCount: number;
  repeatCount: number;
}

export interface RunResult {
  output: string[];
  error: string | null;
  canvasData: string | null;
  executionTime: number;
  turtleSummary?: TurtleRunSummary;
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
