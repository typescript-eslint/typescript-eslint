import debug from 'debug';
import path from 'path';
import { getProgramsForProjects } from './createWatchProgram';
import { firstDefined } from '../node-utils';
import { Extra } from '../parser-options';
import { ASTAndProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:createProjectProgram');

/**
 * @param code The code of the file being linted
 * @param options The config object
 * @returns If found, returns the source file corresponding to the code and the containing program
 */
function createProjectProgram(
  code: string,
  createDefaultProgram: boolean,
  extra: Extra,
): ASTAndProgram | undefined {
  log('Attempting to get AST from project(s) for: %s', extra.filePath);

  const astAndProgram = firstDefined(
    getProgramsForProjects(code, extra.filePath, extra),
    currentProgram => {
      const ast = currentProgram.getSourceFile(extra.filePath);
      return ast && { ast, program: currentProgram };
    },
  );

  if (!astAndProgram && !createDefaultProgram) {
    // the file was either not matched within the tsconfig, or the extension wasn't expected
    const errorLines = [
      '"parserOptions.project" has been set for @typescript-eslint/parser.',
      `The file does not match your project config: ${extra.filePath}.`,
    ];
    let hasMatchedAnError = false;

    const fileExtension = path.extname(extra.filePath);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExtension)) {
      const nonStandardExt = `The extension for the file (${fileExtension}) is non-standard`;
      if (extra.extraFileExtensions && extra.extraFileExtensions.length > 0) {
        if (!extra.extraFileExtensions.includes(fileExtension)) {
          errorLines.push(
            `${nonStandardExt}. It should be added to your existing "parserOptions.extraFileExtensions".`,
          );
          hasMatchedAnError = true;
        }
      } else {
        errorLines.push(
          `${nonStandardExt}. You should add "parserOptions.extraFileExtensions" to your config.`,
        );
        hasMatchedAnError = true;
      }
    }

    if (!hasMatchedAnError) {
      errorLines.push(
        'The file must be included in at least one of the projects provided.',
      );
      hasMatchedAnError = true;
    }

    throw new Error(errorLines.join('\n'));
  }

  return astAndProgram;
}

export { createProjectProgram };
