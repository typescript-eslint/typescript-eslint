import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as ink from 'ink';
import React from 'react';

import { LogLevel } from '../../commands/Command';
import { throttle } from '../../throttle';
import type { Reporter } from '../Reporter';
import { ReporterBase } from '../Reporter';
import type { InkCLUIProps } from './InkCLUI';
import { InkCLUI } from './InkCLUI';

class InkReporter extends ReporterBase implements Reporter {
  #state: InkCLUIProps = {
    logLevel: LogLevel.error,
    logLines: [],
    progress: {},
    lintResult: {},
  };

  readonly #inkInstance: ink.Instance;

  constructor(logLevel: LogLevel) {
    super(logLevel);
    this.#state.logLevel = logLevel;

    this.#inkInstance = ink.render(<ink.Text>Initializing...</ink.Text>);
  }

  #prepareLog(
    type: InkCLUIProps['logLines'][number]['type'],
    args: readonly unknown[],
  ): InkCLUIProps['logLines'][number][] {
    return args
      .map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      })
      .join(' ')
      .split('\n')
      .map(line => ({
        type,
        line,
      }));
  }

  log(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.info)) {
      return;
    }
    this.#state.logLines = this.#state.logLines.concat(
      this.#prepareLog('log', args),
    );
    this.#render();
  }

  error(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.error)) {
      return;
    }
    this.#state.logLines = this.#state.logLines.concat(
      this.#prepareLog('error', args),
    );
    this.#render();
  }

  debug(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.debug)) {
      return;
    }
    this.#state.logLines = this.#state.logLines.concat(
      this.#prepareLog('debug', args),
    );
    this.#render();
  }

  updateProgress(id: string, current: number, max: number): void {
    this.#state.progress = {
      ...this.#state.progress,
      [id]: { current, max },
    };
    this.#render();
  }

  async logLintResult(
    id: string,
    results: TSESLint.ESLint.LintResult[],
  ): Promise<void> {
    const eslint = new TSESLint.ESLint();
    const formatter = await eslint.loadFormatter();
    const result = formatter.format(results);
    this.#state.lintResult = {
      ...this.#state.lintResult,
      [id]: result === '' ? '\n\u2714 No Lint Reports\n' : result,
    };
    this.#render();
  }

  #render = throttle(
    (): void => {
      this.#inkInstance.rerender(<InkCLUI {...this.#state} />);
    },
    // at most 30 times a second
    1000 / 30,
  );

  cleanup(): void {
    // ensure no more throttled renders occur
    this.#render.cleanup();

    // do one final render without the progress bar before cleaning up ink
    this.#inkInstance.rerender(
      <InkCLUI {...this.#state} hideProgress={true} />,
    );
    this.#inkInstance.cleanup();
  }
}

export { InkReporter };
