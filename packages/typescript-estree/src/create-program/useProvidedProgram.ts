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
  projectDirectory: string = path.dirname(configFile),
): ts.Program {
  const config = ts.readConfigFile(configFile, ts.sys.readFile);
  if (config.error !== undefined) {
    throw new Error(
      ts.formatDiagnostics([config.error], {
        getCanonicalFileName: f => f,
        getCurrentDirectory: process.cwd,
        getNewLine: () => '\n',
      }),
    );
  }
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => fs.readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    parseConfigHost,
    path.resolve(projectDirectory),
    { noEmit: true },
  );
  if (parsed.errors.length) {
    throw new Error(
      ts.formatDiagnostics(parsed.errors, {
        getCanonicalFileName: f => f,
        getCurrentDirectory: process.cwd,
        getNewLine: () => '\n',
      }),
    );
  }
  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);

  return program;
}

export { useProvidedProgram, createProgramFromConfigFile };
