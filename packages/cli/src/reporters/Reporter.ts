import type { TSESLint } from '@typescript-eslint/experimental-utils';

import type { LogLevel } from '../commands/Command';

interface ReporterLogs {
  log(...args: readonly unknown[]): void;
  error(...args: readonly unknown[]): void;
  debug(...args: readonly unknown[]): void;
}

interface Reporter extends ReporterLogs {
  // called when a worker updates its status
  updateProgress(id: string, current: number, max: number): void;
  // called when lint results are ready
  logLintResult(
    id: string,
    results: TSESLint.ESLint.LintResult[],
  ): Promise<void>;
  // called at the end of the program
  cleanup(): void;
}

type OldConsole = Readonly<typeof console>;
const oldConsole: OldConsole = {
  ...console,
};

abstract class ReporterBase implements ReporterLogs {
  protected readonly console: OldConsole = oldConsole;
  protected readonly logLevel: LogLevel;

  constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;

    console.log = (...args): void => {
      this.log(...args);
    };
    console.info = (...args): void => {
      this.log(...args);
    };
    console.warn = (...args): void => {
      this.log('[WARN]', ...args);
    };
    console.error = (...args): void => {
      this.error(...args);
    };
  }

  abstract log(...args: readonly unknown[]): void;
  abstract error(...args: readonly unknown[]): void;
  abstract debug(...args: readonly unknown[]): void;

  protected isLogLevel(level: LogLevel): boolean {
    return this.logLevel >= level;
  }
}

export type { Reporter, ReporterLogs };
export { ReporterBase };
