import * as fs from 'fs';
import * as path from 'path';
import type * as ts from 'typescript/lib/tsserverlibrary';

import { CORE_COMPILER_OPTIONS } from './shared';

/**
 * Utility offered by parser to help consumers parse a config file.
 *
 * @param configFile the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
function getParsedConfigFile(
  tsserver: typeof ts,
  configFile: string,
  projectDirectory?: string,
): ts.ParsedCommandLine | string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (tsserver.sys === undefined) {
    throw new Error(
      '`getParsedConfigFile` is only supported in a Node-like environment.',
    );
  }

  const getCurrentDirectory = (): string =>
    projectDirectory ? path.resolve(projectDirectory) : process.cwd();

  let parsingError: string | undefined;

  const parsed = tsserver.getParsedCommandLineOfConfigFile(
    configFile,
    CORE_COMPILER_OPTIONS,
    {
      onUnRecoverableConfigFileDiagnostic: diag => {
        parsingError = formatDiagnostics([diag]); // ensures that `parsed` is defined.
      },
      fileExists: fs.existsSync,
      getCurrentDirectory,
      readDirectory: tsserver.sys.readDirectory,
      readFile: file => fs.readFileSync(file, 'utf-8'),
      useCaseSensitiveFileNames: tsserver.sys.useCaseSensitiveFileNames,
    },
  );

  if (parsed?.errors.length) {
    parsingError = formatDiagnostics(parsed.errors);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return parsingError ?? parsed!;

  function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
    return tsserver.formatDiagnostics(diagnostics, {
      getCanonicalFileName: f => f,
      getCurrentDirectory,
      getNewLine: () => '\n',
    });
  }
}

export { getParsedConfigFile };
