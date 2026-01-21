import type * as ts from 'typescript/lib/tsserverlibrary';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { CORE_COMPILER_OPTIONS } from './compilerOptions';

/**
 * Parses a TSConfig file using the same logic as tsserver.
 *
 * @param configFile the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
export function getParsedConfigFile(
  tsserver: typeof ts,
  configFile: string,
  projectDirectory?: string,
): ts.ParsedCommandLine {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/internal/eqeq-nullish
  if (tsserver.sys === undefined) {
    throw new Error(
      '`getParsedConfigFile` is only supported in a Node-like environment.',
    );
  }

  const parsed = tsserver.getParsedCommandLineOfConfigFile(
    configFile,
    CORE_COMPILER_OPTIONS,
    {
      fileExists: fs.existsSync,
      getCurrentDirectory,
      onUnRecoverableConfigFileDiagnostic: diag => {
        throw new Error(formatDiagnostics([diag])); // ensures that `parsed` is defined.
      },
      readDirectory: tsserver.sys.readDirectory,
      readFile: file =>
        fs.readFileSync(
          path.isAbsolute(file) ? file : path.join(getCurrentDirectory(), file),
          'utf-8',
        ),
      useCaseSensitiveFileNames: tsserver.sys.useCaseSensitiveFileNames,
    },
  );

  if (parsed?.errors.length) {
    throw new Error(
      [
        "Unable to parse the specified 'tsconfig' file. Ensure it's correct and has valid syntax.",
        formatDiagnostics(parsed.errors),
      ].join('\n\n'),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return parsed!;

  function getCurrentDirectory(): string {
    return projectDirectory ? path.resolve(projectDirectory) : process.cwd();
  }

  function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
    return tsserver.formatDiagnostics(diagnostics, {
      getCanonicalFileName: f => f,
      getCurrentDirectory,
      getNewLine: () => '\n',
    });
  }
}
