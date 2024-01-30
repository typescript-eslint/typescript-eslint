import { minimatch } from 'minimatch';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import { createNoProgram } from './create-program/createSourceFile';
import type {
  ASTAndDefiniteProgram,
  ASTAndNoProgram,
  ASTAndProgram,
} from './create-program/shared';
import {
  ensureAbsolutePath,
  getCanonicalFileName,
} from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
): ASTAndProgram | undefined;
export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: true,
): ASTAndDefiniteProgram | undefined;
export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: false,
): ASTAndNoProgram | undefined;
export function useProgramFromProjectService(
  { allowDefaultProjectForFiles, service }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
): ASTAndDefiniteProgram | ASTAndNoProgram | undefined {
  const filePath = getCanonicalFileName(parseSettings.filePath);

  if (hasFullTypeInformation) {
    const opened = service.openClientFile(
      ensureAbsolutePath(filePath, service.host.getCurrentDirectory()),
      parseSettings.codeFullText,
      /* scriptKind */ undefined,
      parseSettings.tsconfigRootDir,
    );
    if (opened.configFileName) {
      if (filePathMatchedBy(filePath, allowDefaultProjectForFiles)) {
        throw new Error(
          `${filePath} was included by allowDefaultProjectForFiles but also was found in the project service. Consider removing it from allowDefaultProjectForFiles.`,
        );
      }
    } else if (!filePathMatchedBy(filePath, allowDefaultProjectForFiles)) {
      throw new Error(
        `${filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProjectForFiles.`,
      );
    }
  } else {
    // Type-aware linting is disabled for this file. However, type aware lint rules might still rely on the contents of this file.
    // We should check if the project service knows about this file, and open it (to inform it of changes)
    // This ensures that:
    // - if the file is not part of a project, we don't waste time creating a program (fast non-type-aware linting)
    // - otherwise, we refresh the file in the project service (moderately fast, since the project is already loaded)
    if (service.getScriptInfo(filePath)) {
      service.openClientFile(
        ensureAbsolutePath(filePath, service.host.getCurrentDirectory()),
        parseSettings.codeFullText,
        /* scriptKind */ undefined,
        parseSettings.tsconfigRootDir,
      );
    }
    // don't bother creating a program
    return createNoProgram(parseSettings);
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

function filePathMatchedBy(
  filePath: string,
  allowDefaultProjectForFiles: string[] | undefined,
): boolean {
  return !!allowDefaultProjectForFiles?.some(pattern =>
    minimatch(filePath, pattern),
  );
}
