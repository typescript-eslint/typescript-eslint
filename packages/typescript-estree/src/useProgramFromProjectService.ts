import type * as ts from 'typescript';
import type { server } from 'typescript/lib/tsserverlibrary';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ASTAndDefiniteProgram } from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  projectService: server.ProjectService,
  parseSettings: Readonly<MutableParseSettings>,
): ASTAndDefiniteProgram | undefined {
  projectService.openClientFile(
    parseSettings.filePath,
    parseSettings.codeFullText,
  );

  const program = projectService
    .getScriptInfo(parseSettings.filePath)!
    .getDefaultProject()
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    return undefined;
  }

  return createProjectProgram(parseSettings, [program as ts.Program]);
}
