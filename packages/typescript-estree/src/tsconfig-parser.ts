import path from 'path';
import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports
import { Extra } from './parser-options';

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Default compiler options for program generation from single root file
 */
export const defaultCompilerOptions: ts.CompilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: true,
};

/**
 * Maps tsconfig paths to their corresponding file contents and resulting watches
 */
const knownWatchProgramMap = new Map<
  string,
  ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>
>();

/**
 * Maps file paths to their set of corresponding watch callbacks
 * There may be more than one per file if a file is shared between projects
 */
const watchCallbackTrackingMap = new Map<string, ts.FileWatcherCallback>();

const parsedFilesSeen = new Set<string>();

/**
 * Clear tsconfig caches.
 * Primarily used for testing.
 */
export function clearCaches(): void {
  knownWatchProgramMap.clear();
  watchCallbackTrackingMap.clear();
  parsedFilesSeen.clear();
}

/**
 * Holds information about the file currently being linted
 */
const currentLintOperationState = {
  code: '',
  filePath: '',
};

/**
 * Appropriately report issues found when reading a config file
 * @param diagnostic The diagnostic raised when creating a program
 */
function diagnosticReporter(diagnostic: ts.Diagnostic): void {
  throw new Error(
    ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine),
  );
}

const noopFileWatcher = { close: (): void => {} };

function getTsconfigPath(tsconfigPath: string, extra: Extra): string {
  return path.isAbsolute(tsconfigPath)
    ? tsconfigPath
    : path.join(extra.tsconfigRootDir || process.cwd(), tsconfigPath);
}

/**
 * Calculate project environments using options provided by consumer and paths from config
 * @param code The code being linted
 * @param filePath The path of the file being parsed
 * @param extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param extra.projects Provided tsconfig paths
 * @returns The programs corresponding to the supplied tsconfig paths
 */
export function calculateProjectParserOptions(
  code: string,
  filePath: string,
  extra: Extra,
): ts.Program[] {
  const results = [];

  // preserve reference to code and file being linted
  currentLintOperationState.code = code;
  currentLintOperationState.filePath = filePath;

  // Update file version if necessary
  // TODO: only update when necessary, currently marks as changed on every lint
  const watchCallback = watchCallbackTrackingMap.get(filePath);
  if (parsedFilesSeen.has(filePath) && typeof watchCallback !== 'undefined') {
    watchCallback(filePath, ts.FileWatcherEventKind.Changed);
  }

  for (const rawTsconfigPath of extra.projects) {
    const tsconfigPath = getTsconfigPath(rawTsconfigPath, extra);

    const existingWatch = knownWatchProgramMap.get(tsconfigPath);

    if (typeof existingWatch !== 'undefined') {
      // get new program (updated if necessary)
      const updatedProgram = existingWatch.getProgram().getProgram();
      updatedProgram.getTypeChecker(); // sets parent pointers in source files
      results.push(updatedProgram);

      continue;
    }

    // create compiler host
    const watchCompilerHost = ts.createWatchCompilerHost(
      tsconfigPath,
      defaultCompilerOptions,
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      diagnosticReporter,
      /*reportWatchStatus*/ () => {},
    );

    // ensure readFile reads the code being linted instead of the copy on disk
    const oldReadFile = watchCompilerHost.readFile;
    watchCompilerHost.readFile = (filePath, encoding): string | undefined =>
      path.normalize(filePath) ===
      path.normalize(currentLintOperationState.filePath)
        ? currentLintOperationState.code
        : oldReadFile(filePath, encoding);

    // ensure process reports error on failure instead of exiting process immediately
    watchCompilerHost.onUnRecoverableConfigFileDiagnostic = diagnosticReporter;

    // ensure process doesn't emit programs
    watchCompilerHost.afterProgramCreate = (program): void => {
      // report error if there are any errors in the config file
      const configFileDiagnostics = program
        .getConfigFileParsingDiagnostics()
        .filter(
          diag =>
            diag.category === ts.DiagnosticCategory.Error &&
            diag.code !== 18003,
        );
      if (configFileDiagnostics.length > 0) {
        diagnosticReporter(configFileDiagnostics[0]);
      }
    };

    // register callbacks to trigger program updates without using fileWatchers
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    watchCompilerHost.watchFile = (fileName, callback) => {
      const normalizedFileName = path.normalize(fileName);
      watchCallbackTrackingMap.set(normalizedFileName, callback);
      return {
        close: (): void => {
          watchCallbackTrackingMap.delete(normalizedFileName);
        },
      };
    };

    // ensure fileWatchers aren't created for directories
    watchCompilerHost.watchDirectory = (): typeof noopFileWatcher =>
      noopFileWatcher;

    // we're using internal typescript APIs which aren't on the types
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // allow files with custom extensions to be included in program (uses internal ts api)
    const oldOnDirectoryStructureHostCreate = (watchCompilerHost as any)
      .onCachedDirectoryStructureHostCreate;
    (watchCompilerHost as any).onCachedDirectoryStructureHostCreate = (
      host: any,
    ): void => {
      const oldReadDirectory = host.readDirectory;
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      host.readDirectory = (
        path: string,
        extensions?: readonly string[],
        exclude?: readonly string[],
        include?: readonly string[],
        depth?: number,
      ) =>
        oldReadDirectory(
          path,
          !extensions
            ? undefined
            : extensions.concat(extra.extraFileExtensions),
          exclude,
          include,
          depth,
        );
      oldOnDirectoryStructureHostCreate(host);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // create program
    const programWatch = ts.createWatchProgram(watchCompilerHost);
    const program = programWatch.getProgram().getProgram();

    // cache watch program and return current program
    knownWatchProgramMap.set(tsconfigPath, programWatch);
    results.push(program);
  }

  parsedFilesSeen.add(filePath);
  return results;
}

/**
 * Create program from single root file. Requires a single tsconfig to be specified.
 * @param code The code being linted
 * @param filePath The file being linted
 * @param extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param extra.projects Provided tsconfig paths
 * @returns The program containing just the file being linted and associated library files
 */
export function createProgram(
  code: string,
  filePath: string,
  extra: Extra,
): ts.Program | undefined {
  if (!extra.projects || extra.projects.length !== 1) {
    return undefined;
  }

  const tsconfigPath = getTsconfigPath(extra.projects[0], extra);

  const commandLine = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    defaultCompilerOptions,
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );

  if (!commandLine) {
    return undefined;
  }

  const compilerHost = ts.createCompilerHost(commandLine.options, true);
  const oldReadFile = compilerHost.readFile;
  compilerHost.readFile = (fileName: string): string | undefined =>
    path.normalize(fileName) === path.normalize(filePath)
      ? code
      : oldReadFile(fileName);

  return ts.createProgram([filePath], commandLine.options, compilerHost);
}
