import debug from 'debug';
import { minimatch } from 'minimatch';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import {
  type ASTAndDefiniteProgram,
  ensureAbsolutePath,
  getCanonicalFileName,
} from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

const log = debug(
  'typescript-eslint:typescript-estree:useProgramFromProjectService',
);

export function useProgramFromProjectService(
  { allowDefaultProjectForFiles, service }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
): ASTAndDefiniteProgram | undefined {
  const filePath = getCanonicalFileName(parseSettings.filePath);
  log('Opening project service file for: %s', filePath);

  const opened = service.openClientFile(
    ensureAbsolutePath(filePath, service.host.getCurrentDirectory()),
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  log('Opened project service file: %o', opened);

  if (hasFullTypeInformation) {
    log(
      'Project service type information enabled; checking for file path match on: %o',
      allowDefaultProjectForFiles,
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
  }

  log('Retrieving scripti nfo and then program for: %s', filePath);

  const scriptInfo = service.getScriptInfo(filePath);
  const program = service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();

  if (!program) {
    log('Could not find project service program for: %s', filePath);
    return undefined;
  }

  log('Found project service program for: %s', filePath);

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
