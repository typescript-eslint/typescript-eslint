import chokidar from 'chokidar';
import debug from 'debug';
import path from 'path';
import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports
import { Extra } from '../parser-options';
import { WatchCompilerHostOfConfigFile } from '../WatchCompilerHostOfConfigFile';
import { getTsconfigPath, DEFAULT_COMPILER_OPTIONS } from './shared';

const log = debug('typescript-eslint:typescript-estree:tsconfig-parser');

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

interface Watcher {
  close(): void;
  forceClose(): void;
  on(evt: 'add', listener: (file: string) => void): void;
  on(evt: 'change', listener: (file: string) => void): void;
  trackWatcher(): void;
}
/**
 * Tracks the ts.sys.watchDirectory watchers that we've opened for project folders.
 * We store these so we can clean up our handles if required.
 */
const fileWatcherTrackingSet = new Map<string, Watcher>();

const parsedFilesSeen = new Set<string>();

/**
 * Clear all of the parser caches.
 * This should only be used in testing to ensure the parser is clean between tests.
 */
function clearCaches(): void {
  knownWatchProgramMap.clear();
  watchCallbackTrackingMap.clear();
  parsedFilesSeen.clear();

  // stop tracking config files
  fileWatcherTrackingSet.forEach(cb => cb.forceClose());
  fileWatcherTrackingSet.clear();
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

const EMPTY_WATCHER: Watcher = {
  close: (): void => {},
  forceClose: (): void => {},
  on: (): void => {},
  trackWatcher: (): void => {},
};

/**
 * Watches a file or directory for changes
 */
function watch(
  watchPath: string,
  options: chokidar.WatchOptions,
  extra: Extra,
): Watcher {
  // an escape hatch to disable the file watchers as they can take a bit to initialise in some cases
  // this also supports an env variable so it's easy to switch on/off from the CLI
  const blockWatchers =
    process.env.PARSER_NO_WATCH === 'false'
      ? false
      : process.env.PARSER_NO_WATCH === 'true' || extra.noWatch === true;
  if (blockWatchers) {
    return EMPTY_WATCHER;
  }

  // reuse watchers in case typescript asks us to watch the same file/directory multiple times
  if (fileWatcherTrackingSet.has(watchPath)) {
    const watcher = fileWatcherTrackingSet.get(watchPath)!;
    watcher.trackWatcher();
    return watcher;
  }

  let fsWatcher: chokidar.FSWatcher;
  try {
    log('setting up watcher on path: %s', watchPath);
    fsWatcher = chokidar.watch(watchPath, {
      ignoreInitial: true,
      persistent: false,
      useFsEvents: false,
      ...options,
    });
  } catch (e) {
    log(
      'error occurred using file watcher, setting up polling watcher instead: %s',
      watchPath,
    );
    // https://github.com/microsoft/TypeScript/blob/c9d407b52ad92370cd116105c33d618195de8070/src/compiler/sys.ts#L1232-L1237
    // Catch the exception and use polling instead
    // Eg. on linux the number of watches are limited and one could easily exhaust watches and the exception ENOSPC is thrown when creating watcher at that point
    // so instead of throwing error, use fs.watchFile
    fsWatcher = chokidar.watch(watchPath, {
      ignoreInitial: true,
      persistent: false,
      useFsEvents: false,
      ...options,
      usePolling: true,
    });
  }

  let counter = 1;
  const watcher = {
    close: (): void => {
      counter -= 1;
      if (counter <= 0) {
        fsWatcher.close();
        fileWatcherTrackingSet.delete(watchPath);
      }
    },
    forceClose: fsWatcher.close.bind(fsWatcher),
    on: fsWatcher.on.bind(fsWatcher),
    trackWatcher: (): void => {
      counter += 1;
    },
  };

  fileWatcherTrackingSet.set(watchPath, watcher);

  return watcher;
}

/**
 * Calculate project environments using options provided by consumer and paths from config
 * @param code The code being linted
 * @param filePath The path of the file being parsed
 * @param extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param extra.projects Provided tsconfig paths
 * @returns The programs corresponding to the supplied tsconfig paths
 */
function getProgramsForProjects(
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

    const programWatch = createWatchProgram(tsconfigPath, extra);
    const program = programWatch.getProgram().getProgram();

    // cache watch program and return current program
    knownWatchProgramMap.set(tsconfigPath, programWatch);
    results.push(program);
  }

  // fallback case in case the file should exist within one of the projects, but doesn't because the program is cached
  //////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// TODO //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////

  parsedFilesSeen.add(filePath);
  return results;
}

function createWatchProgram(
  tsconfigPath: string,
  extra: Extra,
): ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram> {
  // create compiler host
  const watchCompilerHost = ts.createWatchCompilerHost(
    tsconfigPath,
    DEFAULT_COMPILER_OPTIONS,
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
          diag.category === ts.DiagnosticCategory.Error && diag.code !== 18003,
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

    return {
      close: watcher.close,
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
        !extensions ? undefined : extensions.concat(extra.extraFileExtensions),
        exclude,
        include,
        depth,
      );
    oldOnDirectoryStructureHostCreate(host);
  };

  return ts.createWatchProgram(watchCompilerHost);
}

export { clearCaches, createWatchProgram, getProgramsForProjects };
