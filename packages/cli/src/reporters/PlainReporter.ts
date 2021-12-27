import { TSESLint } from '@typescript-eslint/experimental-utils';

import { LogLevel } from '../commands/Command';
import type { Reporter } from './Reporter';
import { ReporterBase } from './Reporter';

class PlainReporter extends ReporterBase implements Reporter {
  log(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.info)) {
      return;
    }
    this.console.log(...args);
  }

  error(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.error)) {
      return;
    }
    this.console.error(...args);
  }

  debug(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.debug)) {
      return;
    }
    this.console.log(...args);
  }

  updateProgress(): void {
    // plain reporter intentionally hides progress reports
  }

  async logLintResult(
    _id: string,
    results: TSESLint.ESLint.LintResult[],
  ): Promise<void> {
    const eslint = new TSESLint.ESLint();
    const formatter = await eslint.loadFormatter();
    const result = formatter.format(results);
    if (result !== '') {
      this.log();
    }
  }

  cleanup(): void {
    // nothing to cleanup
  }
}

export { PlainReporter };
