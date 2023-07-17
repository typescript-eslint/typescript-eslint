import path from 'path';
import type * as ts from 'typescript';
import type { server } from 'typescript/lib/tsserverlibrary';

import { createProjectProgram } from './create-program/createProjectProgram';
import { type ASTAndDefiniteProgram } from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  projectService: server.ProjectService,
  parseSettings: Readonly<MutableParseSettings>,
): ASTAndDefiniteProgram | undefined {
  const opened = projectService.openClientFile(
    absolutify(parseSettings.filePath),
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );
  if (!opened.configFileName) {
    return undefined;
  }

  const scriptInfo = projectService.getScriptInfo(parseSettings.filePath);
  const program = projectService
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    return undefined;
  }

  return createProjectProgram(parseSettings, [program as ts.Program]);

  function absolutify(filePath: string): string {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(projectService.host.getCurrentDirectory(), filePath);
  }
}
