import chokidar from 'chokidar';
import path from 'path';
import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports
import { Extra } from './parser-options';
import { WatchCompilerHostOfConfigFile } from './WatchCompilerHostOfConfigFile';

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
  noEmit: true,
  // extendedDiagnostics: true,
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
const watchCallbackTrackingMap = new Map<string, Set<ts.FileWatcherCallback>>();

/**
 * Tracks the ts.sys.watchFile watchers that we've opened for config files.
 * We store these so we can clean up our handles if required.
 */
const configSystemFileWatcherTrackingSet = new Set<ts.FileWatcher>();
/**
 * Tracks the ts.sys.watchDirectory watchers that we've opened for project folders.
 * We store these so we can clean up our handles if required.
 */
const directorySystemFileWatcherTrackingSet = new Set<ts.FileWatcher>();

const parsedFilesSeen = new Set<string>();

/**
 * Clear all of the parser caches.
 * This should only be used in testing to ensure the parser is clean between tests.
 */
export function clearCaches(): void {
  knownWatchProgramMap.clear();
  watchCallbackTrackingMap.clear();
  parsedFilesSeen.clear();

  // stop tracking config files
  configSystemFileWatcherTrackingSet.forEach(cb => cb.close());
  configSystemFileWatcherTrackingSet.clear();

  // stop tracking folders
  directorySystemFileWatcherTrackingSet.forEach(cb => cb.close());
  directorySystemFileWatcherTrackingSet.clear();
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

function getTsconfigPath(tsconfigPath: string, extra: Extra): string {
  return path.isAbsolute(tsconfigPath)
    ? tsconfigPath
    : path.join(extra.tsconfigRootDir || process.cwd(), tsconfigPath);
}

interface Watcher {
  close(): void;
  on(evt: 'add', listener: (file: string) => void): void;
  on(evt: 'change', listener: (file: string) => void): void;
}
/**
 * Watches a file or directory for changes
 */
function watch(
  path: string,
  options: chokidar.WatchOptions,
  extra: Extra,
): Watcher {
  // an escape hatch to disable the file watchers as they can take a bit to initialise in some cases
  // this also supports an env variable so it's easy to switch on/off from the CLI
  if (process.env.PARSER_NO_WATCH === 'true' || extra.noWatch === true) {
    return {
      close: (): void => {},
      on: (): void => {},
    };
  }

  return chokidar.watch(path, {
    ignoreInitial: true,
    persistent: false,
    useFsEvents: false,
    ...options,
  });
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
  const watchCallbacks = watchCallbackTrackingMap.get(filePath);
  if (
    parsedFilesSeen.has(filePath) &&
    watchCallbacks &&
    watchCallbacks.size > 0
  ) {
    watchCallbacks.forEach(cb => cb(filePath, ts.FileWatcherEventKind.Changed));
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
    ) as WatchCompilerHostOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>;

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

    // in watch mode, eslint will give us the latest file contents
    // store the watch callback so we can trigger an update with eslint's content
    watchCompilerHost.watchFile = (
      fileName,
      callback,
      interval,
    ): ts.FileWatcher => {
      // specifically (and separately) watch the tsconfig file
      // this allows us to react to changes in the tsconfig's include/exclude options
      let watcher: Watcher | null = null;
      if (fileName.includes(tsconfigPath)) {
        watcher = watch(
          fileName,
          {
            interval,
          },
          extra,
        );
        watcher.on('change', path => {
          callback(path, ts.FileWatcherEventKind.Changed);
        });
        configSystemFileWatcherTrackingSet.add(watcher);
      }

      const normalizedFileName = path.normalize(fileName);
      const watchers = ((): Set<ts.FileWatcherCallback> => {
        let watchers = watchCallbackTrackingMap.get(normalizedFileName);
        if (!watchers) {
          watchers = new Set();
          watchCallbackTrackingMap.set(normalizedFileName, watchers);
        }
        return watchers;
      })();
      watchers.add(callback);

      return {
        close: (): void => {
          watchers.delete(callback);

          if (watcher) {
            watcher.close();
            configSystemFileWatcherTrackingSet.delete(watcher);
          }
        },
      };
    };

    // when new files are added in watch mode, we need to tell typescript about those files
    // if we don't then typescript will act like they don't exist.
    watchCompilerHost.watchDirectory = (
      dirPath,
      callback,
      recursive,
    ): ts.FileWatcher => {
      const watcher = watch(
        dirPath,
        {
          depth: recursive ? 0 : undefined,
          interval: 250,
        },
        extra,
      );
      watcher.on('add', path => {
        callback(path);
      });
      directorySystemFileWatcherTrackingSet.add(watcher);

      return {
        close(): void {
          watcher.close();
          directorySystemFileWatcherTrackingSet.delete(watcher);
        },
      };
    };

    // allow files with custom extensions to be included in program (uses internal ts api)
    const oldOnDirectoryStructureHostCreate =
      watchCompilerHost.onCachedDirectoryStructureHostCreate;
    watchCompilerHost.onCachedDirectoryStructureHostCreate = (host): void => {
      const oldReadDirectory = host.readDirectory;
      host.readDirectory = (
        path,
        extensions,
        exclude,
        include,
        depth,
      ): string[] =>
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
