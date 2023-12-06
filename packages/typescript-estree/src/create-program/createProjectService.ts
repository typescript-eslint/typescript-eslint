/* eslint-disable @typescript-eslint/no-empty-function -- for TypeScript APIs*/
import globby from 'globby';
import * as path from 'path';
import type * as ts from 'typescript/lib/tsserverlibrary';

import type { ProjectServiceOptions } from '../parser-options';
import { getCanonicalFileName } from './shared';

const doNothing = (): void => {};

const createStubFileWatcher = (): ts.FileWatcher => ({
  close: doNothing,
});

export type TypeScriptProjectService = ts.server.ProjectService;

export interface ProjectServiceSettings {
  allowDefaultProjectForFiles: ReadonlySet<string>;
  service: TypeScriptProjectService;
}

export function createProjectService(
  options: boolean | ProjectServiceOptions | undefined,
  jsDocParsingMode: ts.JSDocParsingMode | undefined,
  tsconfigRootDir: string,
): ProjectServiceSettings {
  // We import this lazily to avoid its cost for users who don't use the service
  // TODO: Once we drop support for TS<5.3 we can import from "typescript" directly
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
    jsDocParsingMode,
  });

  return {
    allowDefaultProjectForFiles: new Set(
      typeof options === 'object'
        ? options.allowDefaultProjectForFiles
            ?.flatMap(pattern => globby.sync(pattern))
            .map(filePath =>
              getCanonicalFileName(path.join(tsconfigRootDir, filePath)),
            )
        : undefined,
    ),
    service,
  };
}
