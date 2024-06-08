import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import { CORE_COMPILER_OPTIONS } from './shared';

/**
 * Utility offered by parser to help consumers read a config file.
 *
 * @param configFilePath the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
function getParsedConfigFile(
  configFilePath: string,
  projectDirectory?: string,
): ts.ParsedCommandLine {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ts.sys === undefined) {
    throw new Error(
      '`createProgramFromConfigFile` is only supported in a Node-like environment.',
    );
  }

  const parsed = ts.getParsedCommandLineOfConfigFile(
    configFilePath,
    CORE_COMPILER_OPTIONS,
    {
      onUnRecoverableConfigFileDiagnostic: diag => {
        throw new Error(formatDiagnostics([diag])); // ensures that `parsed` is defined.
      },
      fileExists: fs.existsSync,
      getCurrentDirectory: () =>
        (projectDirectory && path.resolve(projectDirectory)) || process.cwd(),
      readDirectory: ts.sys.readDirectory,
      readFile: file => fs.readFileSync(file, 'utf-8'),
      useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    },
  );
  // parsed is not undefined, since we throw on failure.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const result = parsed!;
  if (result.errors.length) {
    throw new Error(formatDiagnostics(result.errors));
  }
  return result;
}

function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: f => f,
    getCurrentDirectory: process.cwd,
    getNewLine: () => '\n',
  });
}

export { getParsedConfigFile };
