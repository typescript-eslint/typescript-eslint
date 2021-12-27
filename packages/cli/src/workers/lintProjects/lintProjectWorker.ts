import { TSESLint } from '@typescript-eslint/experimental-utils';
import debugLogger from 'debug';
import * as ts from 'typescript';

import type { LogLevel } from '../../commands/Command';
import { FileEnumerator } from '../../FileEnumerator';
import type { AbsolutePath } from '../../path';
import { getAbsolutePath } from '../../path';
import { WorkerReporter } from '../../reporters/WorkerReporter';

async function processProject({
  cwd,
  id,
  logLevel,
  project,
}: {
  cwd: string;
  id: string;
  logLevel: LogLevel;
  project: AbsolutePath;
}): Promise<TSESLint.ESLint.LintResult[]> {
  const reporter = new WorkerReporter(id, logLevel);
  // ensure the debug package logs to our debug channel
  debugLogger.log = reporter.debug.bind(reporter);

  const tsconfig = ts.getParsedCommandLineOfConfigFile(
    project,
    {},
    {
      fileExists: ts.sys.fileExists,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      readDirectory: ts.sys.readDirectory,
      readFile: ts.sys.readFile,
      useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
      onUnRecoverableConfigFileDiagnostic: diagnostic => {
        throw new Error(
          ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            ts.sys.newLine,
          ),
        );
      },
    },
  );

  if (tsconfig == null) {
    throw new Error(`Unable to parse the project "${project}"`);
  }

  reporter.debug(tsconfig.fileNames.length, 'files included in the tsconfig');

  // TODO - handling for --fix

  // force single-run inference
  process.env.TSESTREE_SINGLE_RUN = 'true';
  const eslint = new TSESLint.ESLint({
    cwd,
    overrideConfig: {
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: [project],
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      },
    },
  });

  let count = 0;
  reporter.updateProgress.immediate(0, tsconfig.fileNames.length);

  const absFilenames = tsconfig.fileNames.map(f => getAbsolutePath(f));
  const enumerator = new FileEnumerator({
    cwd,
  });

  const results: Promise<TSESLint.ESLint.LintResult[]>[] = [];
  for (const { filePath, ignored } of enumerator.iterateFiles(absFilenames)) {
    if (ignored) {
      reporter.updateProgress(++count, tsconfig.fileNames.length);
      continue;
    }
    results.push(
      (async (): Promise<TSESLint.ESLint.LintResult[]> => {
        try {
          const result = await eslint.lintFiles(filePath);
          reporter.updateProgress(++count, tsconfig.fileNames.length);
          return result;
        } catch (ex: unknown) {
          // eslint will sometimes report exceptions with the current AST node
          // if that happens it'll crash the IPC because the AST contains circular references
          if (isObject(ex) && isObject(ex.currentNode)) {
            const { parent: _, ...currentNode } = ex.currentNode;
            ex.currentNode = currentNode;
            throw ex;
          }

          throw ex;
        }
      })(),
    );
  }
  const flattenedResults = (await Promise.all(results)).flat();

  // ensure the updates are fully flushed
  reporter.updateProgress.flush();

  return flattenedResults;
}

function isObject(thing: unknown): thing is Record<string, unknown> {
  return typeof thing === 'object' && thing != null;
}

export { processProject };
