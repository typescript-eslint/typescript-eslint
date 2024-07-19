import path from 'node:path';
import util from 'node:util';

import debug from 'debug';
import { minimatch } from 'minimatch';
import * as ts from 'typescript';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import { createNoProgram } from './create-program/createSourceFile';
import type {
  ASTAndDefiniteProgram,
  ASTAndNoProgram,
  ASTAndProgram,
} from './create-program/shared';
import { DEFAULT_PROJECT_FILES_ERROR_EXPLANATION } from './create-program/validateDefaultProjectForFilesGlob';
import type { MutableParseSettings } from './parseSettings';

const log = debug(
  'typescript-eslint:typescript-estree:useProgramFromProjectService',
);

const serviceFileExtensions = new WeakMap<ts.server.ProjectService, string[]>();

const updateExtraFileExtensions = (
  service: ts.server.ProjectService,
  extraFileExtensions: string[],
): void => {
  const currentServiceFileExtensions = serviceFileExtensions.get(service) ?? [];
  if (
    !util.isDeepStrictEqual(currentServiceFileExtensions, extraFileExtensions)
  ) {
    log(
      'Updating extra file extensions: before=%s: after=%s',
      currentServiceFileExtensions,
      extraFileExtensions,
    );
    service.setHostConfiguration({
      extraFileExtensions: extraFileExtensions.map(extension => ({
        extension,
        isMixedContent: false,
        scriptKind: ts.ScriptKind.Deferred,
      })),
    });
    serviceFileExtensions.set(service, extraFileExtensions);
    log('Extra file extensions updated: %o', extraFileExtensions);
  }
};

export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndProgram | undefined;
export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: true,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndDefiniteProgram | undefined;
export function useProgramFromProjectService(
  settings: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: false,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndNoProgram | undefined;
export function useProgramFromProjectService(
  {
    allowDefaultProject,
    maximumDefaultProjectFileMatchCount,
    service,
  }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndProgram | undefined {
  // NOTE: triggers a full project reload when changes are detected
  updateExtraFileExtensions(service, parseSettings.extraFileExtensions);

  // We don't canonicalize the filename because it caused a performance regression.
  // See https://github.com/typescript-eslint/typescript-eslint/issues/8519
  const filePathAbsolute = absolutify(parseSettings.filePath);
  log(
    'Opening project service file for: %s at absolute path %s',
    parseSettings.filePath,
    filePathAbsolute,
  );

  // Type-aware linting is disabled for this file. However, type aware lint rules might still rely on the contents of this file.
  // We should check if the project service knows about this file, and open it (to inform it of changes)
  // This ensures that:
  // - if the file is not part of a project, we don't waste time creating a program (fast non-type-aware linting)
  // - otherwise, we refresh the file in the project service (moderately fast, since the project is already loaded)
  // TODO: account for the default project (defaultProjectMatchedFile)
  if (!hasFullTypeInformation) {
    if (service.getScriptInfo(filePathAbsolute)) {
      service.openClientFile(
        filePathAbsolute,
        parseSettings.codeFullText,
        /* scriptKind */ undefined,
        parseSettings.tsconfigRootDir,
      );
    }

    // don't bother creating a program
    return createNoProgram(parseSettings);
  }

  const opened = service.openClientFile(
    filePathAbsolute,
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  log('Opened project service file: %o', opened);

  log(
    'Project service type information enabled; checking for file path match on: %o',
    allowDefaultProject,
  );
  const isDefaultProjectAllowedPath = filePathMatchedBy(
    parseSettings.filePath,
    allowDefaultProject,
  );

  log(
    'Default project allowed path: %s, based on config file: %s',
    isDefaultProjectAllowedPath,
    opened.configFileName,
  );

  if (opened.configFileName) {
    if (isDefaultProjectAllowedPath) {
      throw new Error(
        `${parseSettings.filePath} was included by allowDefaultProject but also was found in the project service. Consider removing it from allowDefaultProject.`,
      );
    }
  } else if (!isDefaultProjectAllowedPath) {
    throw new Error(
      `${parseSettings.filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`,
    );
  }

  log('Retrieving script info and then program for: %s', filePathAbsolute);

  const scriptInfo = service.getScriptInfo(filePathAbsolute);
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const program = service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  if (!program) {
    log('Could not find project service program for: %s', filePathAbsolute);
    return undefined;
  }

  if (!opened.configFileName) {
    defaultProjectMatchedFiles.add(filePathAbsolute);
  }
  if (defaultProjectMatchedFiles.size > maximumDefaultProjectFileMatchCount) {
    const filePrintLimit = 20;
    const filesToPrint = Array.from(defaultProjectMatchedFiles).slice(
      0,
      filePrintLimit,
    );
    const truncatedFileCount =
      defaultProjectMatchedFiles.size - filesToPrint.length;

    throw new Error(
      `Too many files (>${maximumDefaultProjectFileMatchCount}) have matched the default project.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}
Matching files:
${filesToPrint.map(file => `- ${file}`).join('\n')}
${truncatedFileCount ? `...and ${truncatedFileCount} more files\n` : ''}
If you absolutely need more files included, set parserOptions.projectService.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING to a larger value.
`,
    );
  }

  log('Found project service program for: %s', filePathAbsolute);

  return createProjectProgram(parseSettings, [program]);

  function absolutify(filePath: string): string {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(service.host.getCurrentDirectory(), filePath);
  }
}

function filePathMatchedBy(
  filePath: string,
  allowDefaultProject: string[] | undefined,
): boolean {
  return !!allowDefaultProject?.some(pattern => minimatch(filePath, pattern));
}
