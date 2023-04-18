import type * as ts from 'typescript';
import type { server } from 'typescript/lib/tsserverlibrary';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ASTAndDefiniteProgram } from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  projectService: server.ProjectService,
  parseSettings: Readonly<MutableParseSettings>,
): ASTAndDefiniteProgram | undefined {
  projectService.setCompilerOptionsForInferredProjects({
    rootDir: parseSettings.tsconfigRootDir,
  });

  projectService.openClientFile(
    parseSettings.filePath,
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  const scriptInfo = projectService.getScriptInfo(parseSettings.filePath);
  const program = projectService
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    return undefined;
  }

  return createProjectProgram(parseSettings, [program as ts.Program]);
}
