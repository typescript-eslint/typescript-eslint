import debug from 'debug';
import { minimatch } from 'minimatch';
import path from 'path';
import * as ts from 'typescript';

import { createProjectProgram } from './create-program/createProjectProgram';
import type { ProjectServiceSettings } from './create-program/createProjectService';
import type { ASTAndDefiniteProgram } from './create-program/shared';
import { DEFAULT_PROJECT_FILES_ERROR_EXPLANATION } from './create-program/validateDefaultProjectForFilesGlob';
import type { MutableParseSettings } from './parseSettings';

const log = debug(
  'typescript-eslint:typescript-estree:useProgramFromProjectService',
);

const union = <T>(self: Set<T>, other: Set<T>): Set<T> =>
  new Set([...self, ...other]);
const difference = <T>(self: Set<T>, other: Set<T>): Set<T> =>
  new Set([...self].filter(elem => !other.has(elem)));
const symmetricDifference = <T>(self: Set<T>, other: Set<T>): Set<T> =>
  union(difference(self, other), difference(other, self));

const updateExtraFileExtensions = (
  service: ts.server.ProjectService & {
    __extra_file_extensions?: Set<string>;
  },
  extraFileExtensions: string[],
): void => {
  const uniqExtraFileExtensions = new Set(extraFileExtensions);
  if (
    (service.__extra_file_extensions === undefined &&
      uniqExtraFileExtensions.size > 0) ||
    (service.__extra_file_extensions !== undefined &&
      symmetricDifference(
        service.__extra_file_extensions,
        uniqExtraFileExtensions,
      ).size > 0)
  ) {
    log(
      'Updating extra file extensions: %s: %s',
      extraFileExtensions,
      uniqExtraFileExtensions,
    );
    service.setHostConfiguration({
      extraFileExtensions: [...uniqExtraFileExtensions].map(extension => ({
        extension,
        isMixedContent: false,
        scriptKind: ts.ScriptKind.Deferred,
      })),
    });
    service.__extra_file_extensions = uniqExtraFileExtensions;
    log('Extra file extensions updated: %o', service.__extra_file_extensions);
  }
};

export function useProgramFromProjectService(
  {
    allowDefaultProject,
    maximumDefaultProjectFileMatchCount,
    service,
  }: ProjectServiceSettings,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndDefiniteProgram | undefined {
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

  const opened = service.openClientFile(
    filePathAbsolute,
    parseSettings.codeFullText,
    /* scriptKind */ undefined,
    parseSettings.tsconfigRootDir,
  );

  log('Opened project service file: %o', opened);

  if (hasFullTypeInformation) {
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
