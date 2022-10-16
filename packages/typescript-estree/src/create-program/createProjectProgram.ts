import debug from 'debug';
import path from 'path';
import * as ts from 'typescript';

import { firstDefined } from '../node-utils';
import type { ParseSettings } from '../parseSettings';
import { getProgramsForProjects } from './createWatchProgram';
import type { ASTAndProgram } from './shared';
import { getAstFromProgram } from './shared';

const log = debug('typescript-eslint:typescript-estree:createProjectProgram');

const DEFAULT_EXTRA_FILE_EXTENSIONS = [
  ts.Extension.Ts,
  ts.Extension.Tsx,
  ts.Extension.Js,
  ts.Extension.Jsx,
  ts.Extension.Mjs,
  ts.Extension.Mts,
  ts.Extension.Cjs,
  ts.Extension.Cts,
] as readonly string[];

/**
 * @param parseSettings.code Code of the file being parsed
 * @param parseSettings.createDefaultProgram Whether the default program should be created
 * @param parseSettings Internal settings for parsing the file
 * @returns If found, the source file corresponding to the code and the containing program
 */
function createProjectProgram(
  parseSettings: ParseSettings,
): ASTAndProgram | undefined {
  log('Creating project program for: %s', parseSettings.filePath);

  const astAndProgram = firstDefined(
    getProgramsForProjects(parseSettings),
    currentProgram => getAstFromProgram(currentProgram, parseSettings),
  );

  if (!astAndProgram && !parseSettings.createDefaultProgram) {
    // the file was either not matched within the tsconfig, or the extension wasn't expected
    const errorLines = [
      '"parserOptions.project" has been set for @typescript-eslint/parser.',
      `The file does not match your project config: ${path.relative(
        parseSettings.tsconfigRootDir || process.cwd(),
        parseSettings.filePath,
      )}.`,
    ];
    let hasMatchedAnError = false;

    const extraFileExtensions = parseSettings.extraFileExtensions || [];

    extraFileExtensions.forEach(extraExtension => {
      if (!extraExtension.startsWith('.')) {
        errorLines.push(
          `Found unexpected extension "${extraExtension}" specified with the "extraFileExtensions" option. Did you mean ".${extraExtension}"?`,
        );
      }
      if (DEFAULT_EXTRA_FILE_EXTENSIONS.includes(extraExtension)) {
        errorLines.push(
          `You unnecessarily included the extension "${extraExtension}" with the "extraFileExtensions" option. This extension is already handled by the parser by default.`,
        );
      }
    });

    const fileExtension = path.extname(parseSettings.filePath);
    if (!DEFAULT_EXTRA_FILE_EXTENSIONS.includes(fileExtension)) {
      const nonStandardExt = `The extension for the file (${fileExtension}) is non-standard`;
      if (extraFileExtensions.length > 0) {
        if (!extraFileExtensions.includes(fileExtension)) {
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
    }

    throw new Error(errorLines.join('\n'));
  }

  return astAndProgram;
}

export { createProjectProgram };
