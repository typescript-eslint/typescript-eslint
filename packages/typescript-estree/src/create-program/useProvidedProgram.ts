import debug from 'debug';
import { Program } from 'typescript';
import { Extra } from '../parser-options';
import { ASTAndProgram, getAstFromProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:useProvidedProgram');

function useProvidedProgram(
  programInstance: Program,
  extra: Extra,
): ASTAndProgram | undefined {
  log('Retrieving ast for %s from provided program instance', extra.filePath);

  const astAndProgram = getAstFromProgram(programInstance, extra);

  if (!astAndProgram) {
    const errorLines = [
      '"parserOptions.program" has been provided for @typescript-eslint/parser.',
      `The file was not found in the provided program instance: ${extra.filePath}`,
    ];

    throw new Error(errorLines.join('\n'));
  }

  return astAndProgram;
}

export { useProvidedProgram };
