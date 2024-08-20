import debug from 'debug';
import type * as ts from 'typescript';

import { firstDefined } from '../node-utils';
import type { ParseSettings } from '../parseSettings';
import { createProjectProgramError } from './createProjectProgramError';
import type { ASTAndDefiniteProgram } from './shared';
import { getAstFromProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:createProjectProgram');

/**
 * @param parseSettings Internal settings for parsing the file
 * @returns If found, the source file corresponding to the code and the containing program
 */
export function createProjectProgram(
  parseSettings: ParseSettings,
  programsForProjects: readonly ts.Program[],
): ASTAndDefiniteProgram {
  log('Creating project program for: %s', parseSettings.filePath);

  const astAndProgram = firstDefined(programsForProjects, currentProgram =>
    getAstFromProgram(currentProgram, parseSettings.filePath),
  );

  if (!astAndProgram) {
    throw new Error(
      createProjectProgramError(parseSettings, programsForProjects).join('\n'),
    );
  }

  return astAndProgram;
}
