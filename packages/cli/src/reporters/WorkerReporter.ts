/**
 * This reporter is used by workers to ensure they log in a consistent, parsable format that can be sent
 * across the thread boundary.
 */

import { LogLevel } from '../commands/Command';
import type { ThrottledFunction } from '../throttle';
import { throttle } from '../throttle';
import type { Reporter } from './Reporter';
import { ReporterBase } from './Reporter';

interface WorkerMessageBase {
  readonly id: string;
}

interface WorkerMessageLog extends WorkerMessageBase {
  readonly type: 'log';
  readonly messages: readonly unknown[];
}
interface WorkerMessageDebug extends WorkerMessageBase {
  readonly type: 'debug';
  readonly messages: readonly unknown[];
}
interface WorkerMessageUpdateProgress extends WorkerMessageBase {
  readonly type: 'update-progress';
  readonly current: number;
  readonly max: number;
}
interface WorkerMessageError extends WorkerMessageBase {
  readonly type: 'error';
  readonly error: {
    readonly message: string;
    readonly stack: string;
  };
}
type WorkerMessage =
  | WorkerMessageLog
  | WorkerMessageDebug
  | WorkerMessageUpdateProgress
  | WorkerMessageError;

class WorkerReporter extends ReporterBase {
  readonly #id: string;

  constructor(id: string, logLevel: LogLevel) {
    super(logLevel);
    this.#id = id;
  }

  static handleMessage(raw: Buffer, reporter: Reporter): void {
    const messages = raw.toString('utf8').trim();
    for (const rawMessage of messages.split('\n')) {
      try {
        const message = JSON.parse(rawMessage) as WorkerMessage;
        switch (message.type) {
          case 'log':
            reporter.log(`[${message.id}]`, ...message.messages);
            break;

          case 'debug':
            reporter.debug(`[${message.id}]`, ...message.messages);
            break;

          case 'error':
            reporter.error(`[${message.id}]`, message.error);
            break;

          case 'update-progress':
            reporter.updateProgress(message.id, message.current, message.max);
            break;
        }
      } catch (ex) {
        reporter.error(rawMessage, '\n', ex);
      }
    }
  }

  log(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.info)) {
      return;
    }

    const message: WorkerMessageLog = {
      id: this.#id,
      type: 'log',
      messages: args,
    };
    this.console.log(JSON.stringify(message));
  }

  error(error: Error): void {
    if (!this.isLogLevel(LogLevel.error)) {
      return;
    }

    const message: WorkerMessageError = {
      id: this.#id,
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack!,
      },
    };
    this.console.log(JSON.stringify(message));
  }

  debug(...args: readonly unknown[]): void {
    if (!this.isLogLevel(LogLevel.debug)) {
      return;
    }

    const message: WorkerMessageDebug = {
      id: this.#id,
      type: 'debug',
      messages: args,
    };
    this.console.log(JSON.stringify(message));
  }

  // throttle so that we don't overflow the log buffer if the main thread can't keep up
  updateProgress: ThrottledFunction<[number, number]> = throttle(
    (current: number, max: number): void => {
      const message: WorkerMessageUpdateProgress = {
        id: this.#id,
        type: 'update-progress',
        current,
        max,
      };
      this.console.log(JSON.stringify(message));
    },
    0,
  );
}

export { WorkerReporter };
