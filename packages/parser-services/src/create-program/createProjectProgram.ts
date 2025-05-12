import type * as ts from 'typescript';

import debug from 'debug';

import type { ASTAndDefiniteProgram } from './shared';

import { createProjectProgramError } from './createProjectProgramError';
import { getAstFromProgram } from './shared';
import { ParseSettings } from '../parseSettings';
import { firstDefined } from './utils';

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

  // TODO: switch to .find()?
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
