import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import { getScriptKind } from './getScriptKind';
import type { CanonicalPath, FileHash, TSConfigCanonicalPath } from './shared';
import {
  createDefaultCompilerOptionsFromExtra,
  createHash,
  getCanonicalFileName,
  registerAdditionalCacheClearer,
  useCaseSensitiveFileNames,
} from './shared';

const log = debug(
  'typescript-eslint:typescript-estree:getLanguageServiceProgram',
);

type KnownLanguageService = Readonly<{
  configFile: ts.ParsedCommandLine;
  fileList: ReadonlySet<CanonicalPath>;
  languageService: ts.LanguageService;
}>;
/**
 * Maps tsconfig paths to their corresponding file contents and resulting watches
 */
const knownLanguageServiceMap = new Map<
  TSConfigCanonicalPath,
  KnownLanguageService
>();

type CachedFile = Readonly<{
  hash: FileHash;
  snapshot: ts.IScriptSnapshot;
  // starts at 0 and increments each time we see new text for the file
  version: number;
}>;
/**
 * Stores the hashes of files so we know if we need to inform TS of file changes.
 */
const parsedFileCache = new Map<CanonicalPath, CachedFile>();

registerAdditionalCacheClearer(() => {
  knownLanguageServiceMap.clear();
  parsedFileCache.clear();
  documentRegistry = null;
});

/**
 * Holds information about the file currently being linted
 */
const currentLintOperationState: { code: string; filePath: CanonicalPath } = {
  code: '',
  filePath: '' as CanonicalPath,
};

/**
 * Persistent text document registry that shares text documents across programs to
 * reduce memory overhead.
 *
 * We don't initialize this until the first time we run the code.
 */
let documentRegistry: ts.DocumentRegistry | null;

function maybeUpdateFile(
  filePath: CanonicalPath,
  fileContents: string | undefined,
  parseSettings: ParseSettings,
): boolean {
  if (fileContents == null || documentRegistry == null) {
    return false;
  }

  const newCodeHash = createHash(fileContents);
  const cachedParsedFile = parsedFileCache.get(filePath);
  if (cachedParsedFile?.hash === newCodeHash) {
    // nothing needs updating
    return false;
  }

  const snapshot = ts.ScriptSnapshot.fromString(fileContents);
  const version = (cachedParsedFile?.version ?? 0) + 1;
  parsedFileCache.set(filePath, {
    hash: newCodeHash,
    snapshot,
    version,
  });

  for (const { configFile } of knownLanguageServiceMap.values()) {
    /*
    TODO - this isn't safe or correct.

    When the user edits a file IDE integrations will run ESLint on the unsaved text.
    This will cause us to update our registry with the new "dirty" text content.

    If the user saves the file, then dirty becomes clean and we're happy because
    when the user edits the next file we've already updated our state.

    However if the user closes the file without saving, then the registry will be
    stuck with the dirty text, which could cause issues that can only be fixed by
    either (a) restarting the IDE or (b) opening the clean file again.

    This is the reason that the builder program version doesn't re-use the
    current parsed text any longer than the duration of the current parse.

    Problem notes:
    - we can't attach disk watchers because we don't know if we're in a CLI or an
      IDE environment. This means we don't know when a change is committed for a
      file.
    - ESLint has there's no mechanism to tell us when the lint run is done, so
      we don't know when it's safe to roll-back the update.
        - maybe this doesn't matter and we can just roll-back the change after
          we finish the current parse (i.e. return the dirty program?).
    - we don't own the IDE integration so we don't know when a file closes in a
      dirty state, nor do we know when a file is opened in a clean state.

    TODO for now. Will need to solve before we can consider releasing.
    */
    documentRegistry.updateDocument(
      filePath,
      configFile.options,
      snapshot,
      version.toString(),
      getScriptKind(filePath, parseSettings.jsx),
    );
  }

  return true;
}

export function getLanguageServiceProgram(
  parseSettings: ParseSettings,
): ts.Program[] {
  if (!documentRegistry) {
    documentRegistry = ts.createDocumentRegistry(
      useCaseSensitiveFileNames,
      process.cwd(),
    );
  }

  const filePath = getCanonicalFileName(parseSettings.filePath);

  // preserve reference to code and file being linted
  currentLintOperationState.code = parseSettings.code;
  currentLintOperationState.filePath = filePath;

  // Update file version if necessary
  maybeUpdateFile(filePath, parseSettings.code, parseSettings);

  const currentProjectsFromSettings = new Set(parseSettings.projects);

  /*
   * before we go into the process of attempting to find and update every program
   * see if we know of a program that contains this file
   */
  for (const [
    tsconfigPath,
    { fileList, languageService },
  ] of knownLanguageServiceMap.entries()) {
    if (!currentProjectsFromSettings.has(tsconfigPath)) {
      // the current parser run doesn't specify this tsconfig in parserOptions.project
      // so we don't want to consider it for caching purposes.
      //
      // if we did consider it we might return a program for a project
      // that wasn't specified in the current parser run (which is obv bad!).
      continue;
    }

    if (fileList.has(filePath)) {
      log('Found existing language service - %s', tsconfigPath);

      const updatedProgram = languageService.getProgram();
      if (!updatedProgram) {
        log(
          'Could not get program from language service for project %s',
          tsconfigPath,
        );
        continue;
      }
      // TODO - do we need this?
      // sets parent pointers in source files
      // updatedProgram.getTypeChecker();

      return [updatedProgram];
    }
  }
  log(
    'File did not belong to any existing language services, moving to create/update. %s',
    filePath,
  );

  const results = [];

  /*
   * We don't know of a program that contains the file, this means that either:
   * - the required program hasn't been created yet, or
   * - the file is new/renamed, and the program hasn't been updated.
   */
  for (const tsconfigPath of parseSettings.projects) {
    const existingLanguageService = knownLanguageServiceMap.get(tsconfigPath);

    if (existingLanguageService) {
      const result = createLanguageService(tsconfigPath, parseSettings);
      if (result == null) {
        log('could not update language service %s', tsconfigPath);
        continue;
      }
      const updatedProgram = result.program;

      // TODO - do we need this?
      // sets parent pointers in source files
      // updatedProgram.getTypeChecker();

      // cache and check the file list
      const fileList = existingLanguageService.fileList;
      if (fileList.has(filePath)) {
        log('Found updated program %s', tsconfigPath);
        // we can return early because we know this program contains the file
        return [updatedProgram];
      }

      results.push(updatedProgram);
      continue;
    }

    const result = createLanguageService(tsconfigPath, parseSettings);
    if (result == null) {
      continue;
    }

    const { fileList, program } = result;

    // cache and check the file list
    if (fileList.has(filePath)) {
      log('Found program for file. %s', filePath);
      // we can return early because we know this program contains the file
      return [program];
    }

    results.push(program);
  }

  return results;
}

function createLanguageService(
  tsconfigPath: TSConfigCanonicalPath,
  parseSettings: ParseSettings,
): { fileList: ReadonlySet<CanonicalPath>; program: ts.Program } | null {
  const configFile = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    createDefaultCompilerOptionsFromExtra(parseSettings),
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: diagnostic => {
        throw new Error(
          ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            ts.sys.newLine,
          ),
        );
      },
    },
  );
  if (configFile == null) {
    // this should be unreachable because we throw on unrecoverable diagnostics
    log('Unable to parse config file %s', tsconfigPath);
    return null;
  }

  const host: ts.LanguageServiceHost = {
    ...ts.sys,
    getCompilationSettings: () => configFile.options,
    getScriptFileNames: () => configFile.fileNames,
    getScriptVersion: filePathIn => {
      const filePath = getCanonicalFileName(filePathIn);
      return parsedFileCache.get(filePath)?.version.toString(10) ?? '0';
    },
    getScriptSnapshot: filePathIn => {
      const filePath = getCanonicalFileName(filePathIn);
      const cached = parsedFileCache.get(filePath);
      if (cached) {
        return cached.snapshot;
      }

      const contents = host.readFile(filePathIn);
      if (contents == null) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(contents);
    },
    getDefaultLibFileName: ts.getDefaultLibFileName,
    readFile: (filePathIn, encoding) => {
      const filePath = getCanonicalFileName(filePathIn);
      const cached = parsedFileCache.get(filePath);
      if (cached) {
        return cached.snapshot.getText(0, cached.snapshot.getLength());
      }

      const fileContent =
        filePath === currentLintOperationState.filePath
          ? currentLintOperationState.code
          : ts.sys.readFile(filePath, encoding);
      maybeUpdateFile(filePath, fileContent, parseSettings);
      return fileContent;
    },
    useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
  };

  if (documentRegistry == null) {
    // should be impossible to reach
    throw new Error(
      'Unexpected state - document registry was not initialized.',
    );
  }

  const languageService = ts.createLanguageService(host, documentRegistry);
  const fileList = new Set(configFile.fileNames.map(getCanonicalFileName));
  knownLanguageServiceMap.set(tsconfigPath, {
    configFile,
    fileList,
    languageService,
  });

  const program = languageService.getProgram();
  if (program == null) {
    log(
      'Unable to get program from language service for config %s',
      tsconfigPath,
    );
    return null;
  }

  return { fileList, program };
}
