import type * as ts from 'typescript';

import debug from 'debug';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndDefiniteProgram } from './shared';

import { firstDefined } from '../node-utils';
import { createProjectProgramError } from './createProjectProgramError';
import { getAstFromProgram } from './shared';

const log = debug(
  'typescript-eslint:typescript-estree:create-program:createProjectProgram',
);

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
