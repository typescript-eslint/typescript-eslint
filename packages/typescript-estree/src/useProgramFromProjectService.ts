import { minimatch } from 'minimatch';
import path from 'path';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import { type ASTAndDefiniteProgram } from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  { allowDefaultProjectForFiles, service }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
): ASTAndDefiniteProgram | undefined {
  const filePathAbsolute = absolutify(parseSettings.filePath);

  const opened = service.openClientFile(
    filePathAbsolute,
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  if (hasFullTypeInformation) {
    const isDefaultProjectAllowedPath = filePathMatchedBy(
      parseSettings.filePath,
      allowDefaultProjectForFiles,
    );

    if (opened.configFileName) {
      if (isDefaultProjectAllowedPath) {
        throw new Error(
          `${parseSettings.filePath} was included by allowDefaultProjectForFiles but also was found in the project service. Consider removing it from allowDefaultProjectForFiles.`,
        );
      }
    } else if (!isDefaultProjectAllowedPath) {
      throw new Error(
        `${parseSettings.filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProjectForFiles.`,
      );
    }
  }

  const scriptInfo = service.getScriptInfo(filePathAbsolute);
  const program = service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    return undefined;
  }

  return createProjectProgram(parseSettings, [program]);

  function absolutify(filePath: string): string {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(service.host.getCurrentDirectory(), filePath);
  }
}

function filePathMatchedBy(
  filePath: string,
  allowDefaultProjectForFiles: string[] | undefined,
): boolean {
  return !!allowDefaultProjectForFiles?.some(pattern =>
    minimatch(filePath, pattern),
  );
}
