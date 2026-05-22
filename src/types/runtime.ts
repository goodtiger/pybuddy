export interface RunResult {
  output: string[];
  error: string | null;
  canvasData: string | null;
  executionTime: number;
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
