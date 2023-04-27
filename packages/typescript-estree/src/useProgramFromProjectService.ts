import path from 'path';
import type * as ts from 'typescript';
import type { server } from 'typescript/lib/tsserverlibrary';

import { createProjectProgram } from './create-program/createProjectProgram';
import {
  type ASTAndDefiniteProgram,
  getCanonicalFileName,
} from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  projectService: server.ProjectService,
  parseSettings: Readonly<MutableParseSettings>,
): ASTAndDefiniteProgram | undefined {
  const opened = projectService.openClientFile(
    absolutify(parseSettings.filePath),
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.projects[0],
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

  const configFilePath = program.getCompilerOptions().configFilePath as string;
  if (
    !parseSettings.projects
      .map(absolutify)
      .map(getCanonicalFileName)
      .includes(getCanonicalFileName(configFilePath))
  ) {
    throw new Error(`Cannot read file '${parseSettings.projects[0]}'`);
  }

  return createProjectProgram(parseSettings, [program as ts.Program]);

  function absolutify(filePath: string): string {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(projectService.host.getCurrentDirectory(), filePath);
  }
}
