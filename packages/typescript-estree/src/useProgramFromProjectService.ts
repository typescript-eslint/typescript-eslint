import type { ProjectServiceAndMetadata } from '@typescript-eslint/project-service';

import debug from 'debug';
import { minimatch } from 'minimatch';
import path from 'node:path';
import util from 'node:util';
import * as ts from 'typescript';

import type {
  ASTAndDefiniteProgram,
  ASTAndNoProgram,
  ASTAndProgram,
} from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';

import { createProjectProgram } from './create-program/createProjectProgram';
import { createNoProgram } from './create-program/createSourceFile';
import { DEFAULT_EXTRA_FILE_EXTENSIONS } from './create-program/shared';
import { DEFAULT_PROJECT_FILES_ERROR_EXPLANATION } from './create-program/validateDefaultProjectForFilesGlob';

const RELOAD_THROTTLE_MS = 250;

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

function openClientFileFromProjectService(
  defaultProjectMatchedFiles: Set<string>,
  isDefaultProjectAllowed: boolean,
  filePathAbsolute: string,
  parseSettings: Readonly<MutableParseSettings>,
  serviceAndSettings: ProjectServiceAndMetadata,
): ts.server.OpenConfiguredProjectResult {
  const opened = openClientFileAndMaybeReload();

  log('Result from attempting to open client file: %o', opened);

  log(
    'Default project allowed path: %s, based on config file: %s',
    isDefaultProjectAllowed,
    opened.configFileName,
  );

  if (opened.configFileName) {
    if (isDefaultProjectAllowed) {
      throw new Error(
        `${parseSettings.filePath} was included by allowDefaultProject but also was found in the project service. Consider removing it from allowDefaultProject.`,
      );
    }
  } else {
    const wasNotFound = `${parseSettings.filePath} was not found by the project service`;

    const fileExtension = path.extname(parseSettings.filePath);
    const extraFileExtensions = parseSettings.extraFileExtensions;
    if (
      !DEFAULT_EXTRA_FILE_EXTENSIONS.has(fileExtension) &&
      !extraFileExtensions.includes(fileExtension)
    ) {
      const nonStandardExt = `${wasNotFound} because the extension for the file (\`${fileExtension}\`) is non-standard`;
      if (extraFileExtensions.length > 0) {
        throw new Error(
          `${nonStandardExt}. It should be added to your existing \`parserOptions.extraFileExtensions\`.`,
        );
      } else {
        throw new Error(
          `${nonStandardExt}. You should add \`parserOptions.extraFileExtensions\` to your config.`,
        );
      }
    }

    if (!isDefaultProjectAllowed) {
      throw new Error(
        `${wasNotFound}. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`,
      );
    }
  }

  // No a configFileName indicates this file wasn't included in a TSConfig.
  // That means it must get its type information from the default project.
  if (!opened.configFileName) {
    defaultProjectMatchedFiles.add(filePathAbsolute);
    if (
      defaultProjectMatchedFiles.size >
      serviceAndSettings.maximumDefaultProjectFileMatchCount
    ) {
      const filePrintLimit = 20;
      const filesToPrint = [...defaultProjectMatchedFiles].slice(
        0,
        filePrintLimit,
      );
      const truncatedFileCount =
        defaultProjectMatchedFiles.size - filesToPrint.length;

      throw new Error(
        `Too many files (>${serviceAndSettings.maximumDefaultProjectFileMatchCount}) have matched the default project.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}
Matching files:
${filesToPrint.map(file => `- ${file}`).join('\n')}
${truncatedFileCount ? `...and ${truncatedFileCount} more files\n` : ''}
If you absolutely need more files included, set parserOptions.projectService.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING to a larger value.
`,
      );
    }
  }

  return opened;

  function openClientFile(): ts.server.OpenConfiguredProjectResult {
    return serviceAndSettings.service.openClientFile(
      filePathAbsolute,
      parseSettings.codeFullText,
      /* scriptKind */ undefined,
      parseSettings.tsconfigRootDir,
    );
  }

  function openClientFileAndMaybeReload(): ts.server.OpenConfiguredProjectResult {
    log('Opening project service client file at path: %s', filePathAbsolute);

    let opened = openClientFile();

    // If no project included the file and we're not in single-run mode,
    // we might be running in an editor with outdated file info.
    // We can try refreshing the project service - debounced for performance.
    if (
      !opened.configFileErrors &&
      !opened.configFileName &&
      !parseSettings.singleRun &&
      !isDefaultProjectAllowed &&
      performance.now() - serviceAndSettings.lastReloadTimestamp >
        RELOAD_THROTTLE_MS
    ) {
      log('No config file found; reloading project service and retrying.');
      serviceAndSettings.service.reloadProjects();
      opened = openClientFile();
      serviceAndSettings.lastReloadTimestamp = performance.now();
    }

    return opened;
  }
}

function createNoProgramWithProjectService(
  filePathAbsolute: string,
  parseSettings: Readonly<MutableParseSettings>,
  service: ts.server.ProjectService,
): ASTAndNoProgram {
  log('No project service information available. Creating no program.');

  // If the project service knows about this file, this informs if of changes.
  // Doing so ensures that:
  // - if the file is not part of a project, we don't waste time creating a program (fast non-type-aware linting)
  // - otherwise, we refresh the file in the project service (moderately fast, since the project is already loaded)
  if (service.getScriptInfo(filePathAbsolute)) {
    log('Script info available. Opening client file in project service.');
    service.openClientFile(
      filePathAbsolute,
      parseSettings.codeFullText,
      /* scriptKind */ undefined,
      parseSettings.tsconfigRootDir,
    );
  }

  return createNoProgram(parseSettings);
}

function retrieveASTAndProgramFor(
  filePathAbsolute: string,
  parseSettings: Readonly<MutableParseSettings>,
  serviceAndSettings: ProjectServiceAndMetadata,
): ASTAndDefiniteProgram | undefined {
  log('Retrieving script info and then program for: %s', filePathAbsolute);

  const scriptInfo = serviceAndSettings.service.getScriptInfo(filePathAbsolute);
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const program = serviceAndSettings.service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  if (!program) {
    log('Could not find project service program for: %s', filePathAbsolute);
    return undefined;
  }

  log('Found project service program for: %s', filePathAbsolute);

  return createProjectProgram(parseSettings, [program]);
}

export function useProgramFromProjectService(
  serviceAndSettings: ProjectServiceAndMetadata,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndProgram | undefined;
export function useProgramFromProjectService(
  serviceAndSettings: ProjectServiceAndMetadata,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: true,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndDefiniteProgram | undefined;
export function useProgramFromProjectService(
  serviceAndSettings: ProjectServiceAndMetadata,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: false,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndNoProgram | undefined;
export function useProgramFromProjectService(
  serviceAndSettings: ProjectServiceAndMetadata,
  parseSettings: Readonly<MutableParseSettings>,
  hasFullTypeInformation: boolean,
  defaultProjectMatchedFiles: Set<string>,
): ASTAndProgram | undefined {
  // NOTE: triggers a full project reload when changes are detected
  updateExtraFileExtensions(
    serviceAndSettings.service,
    parseSettings.extraFileExtensions,
  );

  // We don't canonicalize the filename because it caused a performance regression.
  // See https://github.com/typescript-eslint/typescript-eslint/issues/8519
  const filePathAbsolute = absolutify(
    parseSettings.filePath,
    serviceAndSettings,
  );
  log(
    'Opening project service file for: %s at absolute path %s',
    parseSettings.filePath,
    filePathAbsolute,
  );

  const filePathRelative = path.relative(
    parseSettings.tsconfigRootDir,
    filePathAbsolute,
  );
  const isDefaultProjectAllowed = filePathMatchedBy(
    filePathRelative,
    serviceAndSettings.allowDefaultProject,
  );

  // Type-aware linting is disabled for this file.
  // However, type-aware lint rules might still rely on its contents.
  if (!hasFullTypeInformation && !isDefaultProjectAllowed) {
    return createNoProgramWithProjectService(
      filePathAbsolute,
      parseSettings,
      serviceAndSettings.service,
    );
  }

  // If type info was requested, we attempt to open it in the project service.
  // By now, the file is known to be one of:
  // - in the project service (valid configuration)
  // - allowlisted in the default project (valid configuration)
  // - neither, which openClientFileFromProjectService will throw an error for
  const opened =
    hasFullTypeInformation &&
    openClientFileFromProjectService(
      defaultProjectMatchedFiles,
      isDefaultProjectAllowed,
      filePathAbsolute,
      parseSettings,
      serviceAndSettings,
    );

  log('Opened project service file: %o', opened);

  return retrieveASTAndProgramFor(
    filePathAbsolute,
    parseSettings,
    serviceAndSettings,
  );
}

function absolutify(
  filePath: string,
  serviceAndSettings: ProjectServiceAndMetadata,
): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(
        serviceAndSettings.service.host.getCurrentDirectory(),
        filePath,
      );
}

function filePathMatchedBy(
  filePath: string,
  allowDefaultProject: string[] | undefined,
): boolean {
  return !!allowDefaultProject?.some(pattern => minimatch(filePath, pattern));
}
