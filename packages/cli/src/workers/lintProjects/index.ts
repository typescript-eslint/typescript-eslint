import { Worker as JestWorker } from 'jest-worker';
import path from 'path';

import type { LogLevel } from '../../commands/Command';
import type { AbsolutePath } from '../../path';
import type { Reporter } from '../../reporters/Reporter';
import { WorkerReporter } from '../../reporters/WorkerReporter';
import type * as lintProjectWorker from './lintProjectWorker';

// the value is also reported as the exit code
const enum LintReturnState {
  Success = 0,
  Warning = 1,
  Error = 2,
  Fatal = 3,
}

async function lintProjects(
  {
    cwd,
    logLevel,
    projects,
  }: {
    readonly cwd: string;
    readonly logLevel: LogLevel;
    readonly projects: readonly AbsolutePath[];
  },
  reporter: Reporter,
): Promise<LintReturnState> {
  const worker = new JestWorker(require.resolve('./lintProjectWorker'), {
    enableWorkerThreads: false,
    forkOptions:
      process.env.USE_TS_ESLINT_SRC == null
        ? {}
        : { execArgv: ['-r', 'ts-node/register/transpile-only'] },
    exposedMethods: ['processProject'],
    maxRetries: 0,
    numWorkers: projects.length,
  }) as JestWorker & {
    processProject: typeof lintProjectWorker.processProject;
  };

  worker.getStdout().on('data', (data: Buffer) => {
    WorkerReporter.handleMessage(data, reporter);
  });
  worker.getStderr().on('data', (data: Buffer) => {
    reporter.error(data.toString('utf8'));
  });

  const promises: Promise<LintReturnState>[] = [];
  for (const project of projects) {
    promises.push(
      (async (): Promise<LintReturnState> => {
        try {
          const id = path.relative(cwd, project);
          const results = await worker.processProject({
            cwd,
            id,
            logLevel,
            project,
          });
          await reporter.logLintResult(id, results);

          if (results.find(r => r.messages.find(m => m.fatal === true))) {
            return LintReturnState.Fatal;
          }
          if (results.find(r => r.errorCount > 0)) {
            return LintReturnState.Error;
          }
          // TODO - implement "max-warnings" option from ESLint
          if (results.find(r => r.warningCount > 0)) {
            return LintReturnState.Warning;
          }
          return LintReturnState.Success;
        } catch (ex: unknown) {
          reporter.error(
            `An error occurred when linting project ${project}:`,
            (ex as object).toString(),
          );
          return LintReturnState.Fatal;
        }
      })(),
    );
  }

  let maxReturnState = LintReturnState.Success;
  for (const report of await Promise.all(promises)) {
    maxReturnState = Math.max(report, maxReturnState);
  }
  // as per jest-worker docs - intentionally not awaiting the end
  void worker.end();

  return maxReturnState;
}

export { lintProjects };
