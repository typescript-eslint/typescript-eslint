'use strict';

import path from 'path';
import ts from 'typescript';
import { Extra } from './temp-types-based-on-js-source';

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Maps tsconfig paths to their corresponding file contents and resulting watches
 * @type {Map<string, ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>>}
 */
const knownWatchProgramMap = new Map<
  string,
  ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram>
>();

/**
 * Maps file paths to their set of corresponding watch callbacks
 * There may be more than one per file if a file is shared between projects
 * @type {Map<string, ts.FileWatcherCallback>}
 */
const watchCallbackTrackingMap = new Map<string, ts.FileWatcherCallback>();

/**
 * Holds information about the file currently being linted
 * @type {{code: string, filePath: string}}
 */
const currentLintOperationState = {
  code: '',
  filePath: ''
};

/**
 * Appropriately report issues found when reading a config file
 * @param {ts.Diagnostic} diagnostic The diagnostic raised when creating a program
 * @returns {void}
 */
function diagnosticReporter(diagnostic: ts.Diagnostic): void {
  throw new Error(
    ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine)
  );
}

const noopFileWatcher = { close: () => {} };

/**
 * Calculate project environments using options provided by consumer and paths from config
 * @param {string} code The code being linted
 * @param {string} filePath The path of the file being parsed
 * @param {string} extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param {string[]} extra.project Provided tsconfig paths
 * @returns {ts.Program[]} The programs corresponding to the supplied tsconfig paths
 */
export default function calculateProjectParserOptions(
  code: string,
  filePath: string,
  extra: Extra
): ts.Program[] {
  const results = [];
  const tsconfigRootDir = extra.tsconfigRootDir;

  // preserve reference to code and file being linted
  currentLintOperationState.code = code;
  currentLintOperationState.filePath = filePath;

  // Update file version if necessary
  // TODO: only update when necessary, currently marks as changed on every lint
  const watchCallback = watchCallbackTrackingMap.get(filePath);
  if (typeof watchCallback !== 'undefined') {
    watchCallback(filePath, ts.FileWatcherEventKind.Changed);
  }

  for (let tsconfigPath of extra.projects) {
    // if absolute paths aren't provided, make relative to tsconfigRootDir
    if (!path.isAbsolute(tsconfigPath)) {
      tsconfigPath = path.join(tsconfigRootDir, tsconfigPath);
    }

    const existingWatch = knownWatchProgramMap.get(tsconfigPath);

    if (typeof existingWatch !== 'undefined') {
      // get new program (updated if necessary)
      results.push(existingWatch.getProgram().getProgram());
      continue;
    }

    // create compiler host
    const watchCompilerHost = ts.createWatchCompilerHost(
      tsconfigPath,
      /*optionsToExtend*/ undefined,
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      diagnosticReporter,
      /*reportWatchStatus*/ () => {}
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
            diag.category === ts.DiagnosticCategory.Error && diag.code !== 18003
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
        }
      };
    };

    // ensure fileWatchers aren't created for directories
    watchCompilerHost.watchDirectory = () => noopFileWatcher;

    // create program
    const programWatch = ts.createWatchProgram(watchCompilerHost);
    const program = programWatch.getProgram().getProgram();

    // cache watch program and return current program
    knownWatchProgramMap.set(tsconfigPath, programWatch);
    results.push(program);
  }

  return results;
}
