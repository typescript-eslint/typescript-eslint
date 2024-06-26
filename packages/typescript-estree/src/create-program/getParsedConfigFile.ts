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
  configFile: string,
  projectDirectory?: string,
): ts.ParsedCommandLine {
  // We import this lazily to avoid its cost for users who don't use the service
  // TODO: Once we drop support for TS<5.3 we can import from "typescript" directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tsserver = require('typescript/lib/tsserverlibrary') as typeof ts;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (tsserver.sys === undefined) {
    throw new Error(
      '`createProgramFromConfigFile` is only supported in a Node-like environment.',
    );
  }

  const parsed = tsserver.getParsedCommandLineOfConfigFile(
    configFile,
    CORE_COMPILER_OPTIONS,
    {
      onUnRecoverableConfigFileDiagnostic: diag => {
        throw new Error(formatDiagnostics([diag])); // ensures that `parsed` is defined.
      },
      fileExists: fs.existsSync,
      getCurrentDirectory: () =>
        (projectDirectory && path.resolve(projectDirectory)) || process.cwd(),
      readDirectory: tsserver.sys.readDirectory,
      readFile: file => fs.readFileSync(file, 'utf-8'),
      useCaseSensitiveFileNames: tsserver.sys.useCaseSensitiveFileNames,
    },
  );

  // parsed is not undefined, since we throw on failure.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const result = parsed!;
  if (result.errors.length) {
    throw new Error(formatDiagnostics(result.errors));
  }

  return result;

  function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
    return tsserver.formatDiagnostics(diagnostics, {
      getCanonicalFileName: f => f,
      getCurrentDirectory: process.cwd,
      getNewLine: () => '\n',
    });
  }
}

export { getParsedConfigFile };
