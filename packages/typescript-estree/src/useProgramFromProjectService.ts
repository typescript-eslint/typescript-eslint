import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import {
  type ASTAndDefiniteProgram,
  ensureAbsolutePath,
  getCanonicalFileName,
} from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  { allowDefaultProjectForFiles, service }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
): ASTAndDefiniteProgram | undefined {
  const filePath = getCanonicalFileName(parseSettings.filePath);

  const opened = service.openClientFile(
    ensureAbsolutePath(filePath, service.host.getCurrentDirectory()),
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  if (hasFullTypeInformation) {
    if (opened.configFileName) {
      if (allowDefaultProjectForFiles.has(filePath)) {
        throw new Error(
          `${filePath} was included by allowDefaultProjectForFiles but also was found in the project service. Consider removing it from allowDefaultProjectForFiles.`,
        );
      }
    } else if (!allowDefaultProjectForFiles.has(filePath)) {
      throw new Error(
        `${filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProjectForFiles.`,
      );
    }
  }

  const scriptInfo = service.getScriptInfo(filePath);
  const program = service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    return undefined;
  }

  return createProjectProgram(parseSettings, [program]);
}
