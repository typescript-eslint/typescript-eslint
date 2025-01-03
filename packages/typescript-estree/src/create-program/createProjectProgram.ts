import type * as ts from 'typescript';

import { debugForFile } from '@typescript-eslint/debug-for-file';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndDefiniteProgram } from './shared';

import { firstDefined } from '../node-utils';
import { createProjectProgramError } from './createProjectProgramError';
import { getAstFromProgram } from './shared';

const log = debugForFile(__filename);

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
