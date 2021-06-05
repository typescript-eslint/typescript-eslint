import debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { Extra } from '../parser-options';
import { ASTAndProgram, getAstFromProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:useProvidedProgram');

function useProvidedProgram(
  programInstance: ts.Program,
  extra: Extra,
): ASTAndProgram | undefined {
  log('Retrieving ast for %s from provided program instance', extra.filePath);

  programInstance.getTypeChecker(); // ensure parent pointers are set in source files

  const astAndProgram = getAstFromProgram(programInstance, extra);

  if (!astAndProgram) {
    const relativeFilePath = path.relative(
      extra.tsconfigRootDir || process.cwd(),
      extra.filePath,
    );
    const errorLines = [
      '"parserOptions.program" has been provided for @typescript-eslint/parser.',
      `The file was not found in the provided program instance: ${relativeFilePath}`,
    ];

    throw new Error(errorLines.join('\n'));
  }

  return astAndProgram;
}

/**
 * Utility offered by parser to help consumers construct their own program instance.
 */
function createProgramFromConfigFile(
  configFile: string,
  projectDirectory?: string,
): ts.Program {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configFile,
    { noEmit: true },
    {
      onUnRecoverableConfigFileDiagnostic: diag => {
        throw new Error(formatDiagnostics([diag])); // ensures that `parsed` is defined.
      },
      fileExists: fs.existsSync,
      getCurrentDirectory: () =>
        (projectDirectory && path.resolve(projectDirectory)) || process.cwd(),
      readDirectory: ts.sys.readDirectory,
      readFile: file => fs.readFileSync(file, 'utf-8'),
      useCaseSensitiveFileNames: true,
    },
  );
  const result = parsed!; // parsed is not undefined, since we throw on failure.
  if (result.errors.length) {
    throw new Error(formatDiagnostics(result.errors));
  }
  const host = ts.createCompilerHost(result.options, true);
  return ts.createProgram(result.fileNames, result.options, host);
}

function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: f => f,
    getCurrentDirectory: process.cwd,
    getNewLine: () => '\n',
  });
}

export { useProvidedProgram, createProgramFromConfigFile };
