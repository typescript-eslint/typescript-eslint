/* eslint-disable @typescript-eslint/no-empty-function -- for TypeScript APIs*/
import * as fs from 'fs';
import { sync as globSync } from 'globby';
import type * as ts from 'typescript/lib/tsserverlibrary';

const doNothing = (): void => {};

const createStubFileWatcher = (): ts.FileWatcher => ({
  close: doNothing,
});

export type TypeScriptProjectService = ts.server.ProjectService;

export function createProjectService(
  allowDefaultProjectFallbackFilesGlobs: string[] = [],
): TypeScriptProjectService {
  // We import this lazily to avoid its cost for users who don't use the service
  const tsserver = require('typescript/lib/tsserverlibrary') as typeof ts;

  // TODO: see getWatchProgramsForProjects
  // We don't watch the disk, we just refer to these when ESLint calls us
  // there's a whole separate update pass in maybeInvalidateProgram at the bottom of getWatchProgramsForProjects
  // (this "goes nuclear on TypeScript")
  const system: ts.server.ServerHost = {
    ...tsserver.sys,
    clearImmediate,
    clearTimeout,
    setImmediate,
    setTimeout,
    watchDirectory: createStubFileWatcher,
    watchFile: createStubFileWatcher,
  };

  const service = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: (): boolean => false },
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    logger: {
      close: doNothing,
      endGroup: doNothing,
      getLogFileName: () => undefined,
      hasLevel: () => false,
      info: doNothing,
      loggingEnabled: () => false,
      msg: doNothing,
      perftrc: doNothing,
      startGroup: doNothing,
    },
    session: undefined,
  });

  for (const filesGlob of allowDefaultProjectFallbackFilesGlobs) {
    for (const fileName of globSync(filesGlob, { ignore: ['node_modules/'] })) {
      service.openClientFile(fileName, fs.readFileSync(fileName).toString());
    }
  }

  return service;
}
/* eslint-enable @typescript-eslint/no-empty-function */
