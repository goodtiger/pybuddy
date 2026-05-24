import { summarizeTurtleCode } from '@/lib/runtime/turtle-summary';
import type { RunResult } from '@/types/runtime';

declare global {
  interface Window {
    Sk: any;
  }
}

export class SkulptRunner {
  private output: string[] = [];
  private canvasElement: HTMLCanvasElement | null = null;
  private turtleTarget: HTMLElement | null = null;

  setCanvas(el: HTMLCanvasElement) {
    this.canvasElement = el;
  }

  setTurtleTarget(el: HTMLElement) {
    this.turtleTarget = el;
    this.canvasElement = null;
  }

  async run(code: string): Promise<RunResult> {
    this.output = [];
    const startTime = Date.now();
    const Sk = window.Sk;
    const turtleSummary = summarizeTurtleCode(code);

    if (!Sk) {
      return {
        output: [],
        error: 'Python引擎未加载，请刷新页面重试 🔄',
        canvasData: null,
        executionTime: 0,
        turtleSummary,
      };
    }

    Sk.configure({
      output: (text: string) => {
        this.output.push(text);
      },
      read: (x: string) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
          throw new Error(`File not found: '${x}'`);
        }
        return Sk.builtinFiles['files'][x];
      },
      __future__: Sk.python3,
    });

    if (this.turtleTarget) {
      Sk.TurtleGraphics = {
        ...(Sk.TurtleGraphics || {}),
        target: this.turtleTarget,
        width: this.turtleTarget.clientWidth || 900,
        height: this.turtleTarget.clientHeight || 560,
        animate: false,
      };
    } else if (this.canvasElement) {
      Sk.canvas = this.canvasElement;
    }

    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody('<stdin>', false, code, true)
      );
      return {
        output: this.output,
        error: null,
        canvasData: this.captureCanvasData(),
        executionTime: Date.now() - startTime,
        turtleSummary,
      };
    } catch (err: any) {
      const rawError = err.toString ? err.toString() : String(err);
      return {
        output: this.output,
        error: rawError,
        canvasData: null,
        executionTime: Date.now() - startTime,
        turtleSummary,
      };
    }
  }

  private captureCanvasData() {
    const canvas =
      this.canvasElement ||
      this.turtleTarget?.querySelector<HTMLCanvasElement>('canvas');

    return canvas ? canvas.toDataURL('image/png') : null;
  }
}

export const skulptRunner = new SkulptRunner();
