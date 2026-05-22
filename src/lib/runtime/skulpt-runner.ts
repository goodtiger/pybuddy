declare global {
  interface Window {
    Sk: any;
  }
}

export interface RunResult {
  output: string[];
  error: string | null;
  canvasData: string | null;
  executionTime: number;
}

export class SkulptRunner {
  private output: string[] = [];
  private canvasElement: HTMLCanvasElement | null = null;

  setCanvas(el: HTMLCanvasElement) {
    this.canvasElement = el;
  }

  async run(code: string): Promise<RunResult> {
    this.output = [];
    const startTime = Date.now();
    const Sk = window.Sk;

    if (!Sk) {
      return {
        output: [],
        error: 'Python引擎未加载，请刷新页面重试 🔄',
        canvasData: null,
        executionTime: 0,
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

    if (this.canvasElement) {
      Sk.canvas = this.canvasElement;
    }

    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody('<stdin>', false, code, true)
      );
      return {
        output: this.output,
        error: null,
        canvasData: this.canvasElement ? this.canvasElement.toDataURL('image/png') : null,
        executionTime: Date.now() - startTime,
      };
    } catch (err: any) {
      const rawError = err.toString ? err.toString() : String(err);
      return {
        output: this.output,
        error: rawError,
        canvasData: null,
        executionTime: Date.now() - startTime,
      };
    }
  }
}

export const skulptRunner = new SkulptRunner();
