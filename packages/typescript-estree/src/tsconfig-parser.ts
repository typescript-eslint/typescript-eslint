import path from 'path';
import ts from 'typescript';
import { Extra } from './parser-options';

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Default compiler options for program generation from single root file
 */
const defaultCompilerOptions: ts.CompilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
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

const noopFileWatcher = { close: () => {} };

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
 * @param extra.project Provided tsconfig paths
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

  for (let rawTsconfigPath of extra.projects) {
    const tsconfigPath = getTsconfigPath(rawTsconfigPath, extra);

    const existingWatch = knownWatchProgramMap.get(tsconfigPath);

    if (typeof existingWatch !== 'undefined') {
      // get new program (updated if necessary)
      results.push(existingWatch.getProgram().getProgram());
      continue;
    }

    // create compiler host
    const watchCompilerHost = ts.createWatchCompilerHost(
      tsconfigPath,
      /*optionsToExtend*/ { allowNonTsExtensions: true } as ts.CompilerOptions,
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      diagnosticReporter,
      /*reportWatchStatus*/ () => {},
    );

    // ensure readFile reads the code being linted instead of the copy on disk
    const oldReadFile = watchCompilerHost.readFile;
    watchCompilerHost.readFile = (filePath, encoding) =>
      path.normalize(filePath) ===
      path.normalize(currentLintOperationState.filePath)
        ? currentLintOperationState.code
        : oldReadFile(filePath, encoding);

    // ensure process reports error on failure instead of exiting process immediately
    watchCompilerHost.onUnRecoverableConfigFileDiagnostic = diagnosticReporter;

    // ensure process doesn't emit programs
    watchCompilerHost.afterProgramCreate = program => {
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
    watchCompilerHost.watchFile = (fileName, callback) => {
      const normalizedFileName = path.normalize(fileName);
      watchCallbackTrackingMap.set(normalizedFileName, callback);
      return {
        close: () => {
          watchCallbackTrackingMap.delete(normalizedFileName);
        },
      };
    };

    // ensure fileWatchers aren't created for directories
    watchCompilerHost.watchDirectory = () => noopFileWatcher;

    // allow files with custom extensions to be included in program (uses internal ts api)
    const oldOnDirectoryStructureHostCreate = (watchCompilerHost as any)
      .onCachedDirectoryStructureHostCreate;
    (watchCompilerHost as any).onCachedDirectoryStructureHostCreate = (
      host: any,
    ) => {
      const oldReadDirectory = host.readDirectory;
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
 * @param extra.project Provided tsconfig paths
 * @returns The program containing just the file being linted and associated library files
 */
export function createProgram(code: string, filePath: string, extra: Extra) {
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
  compilerHost.readFile = (fileName: string) =>
    path.normalize(fileName) === path.normalize(filePath)
      ? code
      : oldReadFile(fileName);

  return ts.createProgram([filePath], commandLine.options, compilerHost);
}
