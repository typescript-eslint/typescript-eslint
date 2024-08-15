import * as path from 'node:path';

import debug from 'debug';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import { getParsedConfigFile } from './getParsedConfigFile';
import type { ASTAndDefiniteProgram } from './shared';
import { getAstFromProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:useProvidedProgram');

function useProvidedPrograms(
  programInstances: Iterable<ts.Program>,
  parseSettings: ParseSettings,
): ASTAndDefiniteProgram | undefined {
  log(
    'Retrieving ast for %s from provided program instance(s)',
    parseSettings.filePath,
  );

  let astAndProgram: ASTAndDefiniteProgram | undefined;
  for (const programInstance of programInstances) {
    astAndProgram = getAstFromProgram(programInstance, parseSettings.filePath);
    // Stop at the first applicable program instance
    if (astAndProgram) {
      break;
    }
  }

  if (astAndProgram) {
    astAndProgram.program.getTypeChecker(); // ensure parent pointers are set in source files
    return astAndProgram;
  }

  const relativeFilePath = path.relative(
    parseSettings.tsconfigRootDir,
    parseSettings.filePath,
  );

  const [typeSource, typeSources] =
    parseSettings.projects.size > 0
      ? ['project', 'project(s)']
      : ['programs', 'program instance(s)'];

  const errorLines = [
    `"parserOptions.${typeSource}" has been provided for @typescript-eslint/parser.`,
    `The file was not found in any of the provided ${typeSources}: ${relativeFilePath}`,
  ];

  throw new Error(errorLines.join('\n'));
}

/**
 * Utility offered by parser to help consumers construct their own program instance.
 *
 * @param configFile the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
function createProgramFromConfigFile(
  configFile: string,
  projectDirectory?: string,
): ts.Program {
  const parsed = getParsedConfigFile(ts, configFile, projectDirectory);
  const host = ts.createCompilerHost(parsed.options, true);
  return ts.createProgram(parsed.fileNames, parsed.options, host);
}

export { useProvidedPrograms, createProgramFromConfigFile };
