import debug from 'debug';
import path from 'path';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndProgram } from './shared';
import {
  createDefaultCompilerOptionsFromExtra,
  getModuleResolver,
} from './shared';

const log = debug('typescript-eslint:typescript-estree:createDefaultProgram');

/**
 * @param parseSettings Internal settings for parsing the file
 * @returns If found, returns the source file corresponding to the code and the containing program
 */
function createDefaultProgram(
  parseSettings: ParseSettings,
): ASTAndProgram | undefined {
  log(
    'Getting default program for: %s',
    parseSettings.filePath || 'unnamed file',
  );

  if (parseSettings.projects?.length !== 1) {
    return undefined;
  }

  const tsconfigPath = parseSettings.projects[0];

  const commandLine = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    createDefaultCompilerOptionsFromExtra(parseSettings),
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );

  if (!commandLine) {
    return undefined;
  }

  const compilerHost = ts.createCompilerHost(
    commandLine.options,
    /* setParentNodes */ true,
  );

  if (parseSettings.moduleResolver) {
    // eslint-disable-next-line deprecation/deprecation -- intentional for older TS versions
    compilerHost.resolveModuleNames = getModuleResolver(
      parseSettings.moduleResolver,
    ).resolveModuleNames;
  }

  const oldReadFile = compilerHost.readFile;
  compilerHost.readFile = (fileName: string): string | undefined =>
    path.normalize(fileName) === path.normalize(parseSettings.filePath)
      ? parseSettings.code
      : oldReadFile(fileName);

  const program = ts.createProgram(
    [parseSettings.filePath],
    commandLine.options,
    compilerHost,
  );
  const ast = program.getSourceFile(parseSettings.filePath);

  return ast && { ast, program };
}

export { createDefaultProgram };
