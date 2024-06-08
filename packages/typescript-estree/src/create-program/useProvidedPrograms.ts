import debug from 'debug';
import * as path from 'path';
import * as ts from 'typescript';

import type { ASTAndDefiniteProgram } from './shared';
import { getAstFromProgram } from './shared';
import { getParsedConfigFile } from './getParsedConfigFile';

const log = debug('typescript-eslint:typescript-estree:useProvidedProgram');

export interface ProvidedProgramsSettings {
  filePath: string;
  tsconfigRootDir: string;
}

function useProvidedPrograms(
  programInstances: Iterable<ts.Program>,
  { filePath, tsconfigRootDir }: ProvidedProgramsSettings,
): ASTAndDefiniteProgram | undefined {
  log('Retrieving ast for %s from provided program instance(s)', filePath);

  let astAndProgram: ASTAndDefiniteProgram | undefined;
  for (const programInstance of programInstances) {
    astAndProgram = getAstFromProgram(programInstance, filePath);
    // Stop at the first applicable program instance
    if (astAndProgram) {
      break;
    }
  }

  if (!astAndProgram) {
    const relativeFilePath = path.relative(
      tsconfigRootDir || process.cwd(),
      filePath,
    );
    const errorLines = [
      '"parserOptions.programs" has been provided for @typescript-eslint/parser.',
      `The file was not found in any of the provided program instance(s): ${relativeFilePath}`,
    ];

    throw new Error(errorLines.join('\n'));
  }

  astAndProgram.program.getTypeChecker(); // ensure parent pointers are set in source files

  return astAndProgram;
}

/**
 * Utility offered by parser to help consumers construct their own program instance.
 *
 * @param configFilePath the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
function createProgramFromConfigFile(
  configFilePath: string,
  projectDirectory?: string,
): ts.Program {
  const configFile = getParsedConfigFile(configFilePath, projectDirectory);
  const host = ts.createCompilerHost(configFile.options, true);
  return ts.createProgram(configFile.fileNames, configFile.options, host);
}

export { useProvidedPrograms, createProgramFromConfigFile };
