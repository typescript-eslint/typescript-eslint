import debug from 'debug';
import path from 'path';
import * as ts from 'typescript';

import { firstDefined } from '../node-utils';
import type { ParseSettings } from '../parseSettings';
import { getWatchProgramsForProjects } from './getWatchProgramsForProjects';
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
 * @param parseSettings Internal settings for parsing the file
 * @returns If found, the source file corresponding to the code and the containing program
 */
function createProjectProgram(
  parseSettings: ParseSettings,
): ASTAndProgram | undefined {
  log('Creating project program for: %s', parseSettings.filePath);

  const programsForProjects = getWatchProgramsForProjects(parseSettings);
  const astAndProgram = firstDefined(programsForProjects, currentProgram =>
    getAstFromProgram(currentProgram, parseSettings),
  );

  // The file was either matched within the tsconfig, or we allow creating a default program
  if (astAndProgram || parseSettings.createDefaultProgram) {
    return astAndProgram;
  }

  const describeFilePath = (filePath: string): string => {
    const relative = path.relative(
      parseSettings.tsconfigRootDir || process.cwd(),
      filePath,
    );
    if (parseSettings.tsconfigRootDir) {
      return `<tsconfigRootDir>/${relative}`;
    }
    return `<cwd>/${relative}`;
  };

  const describedFilePath = describeFilePath(parseSettings.filePath);
  const relativeProjects = parseSettings.projects.map(describeFilePath);
  const describedPrograms =
    relativeProjects.length === 1
      ? relativeProjects[0]
      : `\n${relativeProjects.map(project => `- ${project}`).join('\n')}`;
  const errorLines = [
    `ESLint was configured to run on \`${describedFilePath}\` using \`parserOptions.project\`: ${describedPrograms}`,
  ];
  let hasMatchedAnError = false;

  const extraFileExtensions = parseSettings.extraFileExtensions || [];

  extraFileExtensions.forEach(extraExtension => {
    if (!extraExtension.startsWith('.')) {
      errorLines.push(
        `Found unexpected extension \`${extraExtension}\` specified with the \`parserOptions.extraFileExtensions\` option. Did you mean \`.${extraExtension}\`?`,
      );
    }
    if (DEFAULT_EXTRA_FILE_EXTENSIONS.includes(extraExtension)) {
      errorLines.push(
        `You unnecessarily included the extension \`${extraExtension}\` with the \`parserOptions.extraFileExtensions\` option. This extension is already handled by the parser by default.`,
      );
    }
  });

  const fileExtension = path.extname(parseSettings.filePath);
  if (!DEFAULT_EXTRA_FILE_EXTENSIONS.includes(fileExtension)) {
    const nonStandardExt = `The extension for the file (\`${fileExtension}\`) is non-standard`;
    if (extraFileExtensions.length > 0) {
      if (!extraFileExtensions.includes(fileExtension)) {
        errorLines.push(
          `${nonStandardExt}. It should be added to your existing \`parserOptions.extraFileExtensions\`.`,
        );
        hasMatchedAnError = true;
      }
    } else {
      errorLines.push(
        `${nonStandardExt}. You should add \`parserOptions.extraFileExtensions\` to your config.`,
      );
      hasMatchedAnError = true;
    }
  }

  if (!hasMatchedAnError) {
    const [describedInclusions, describedSpecifiers] =
      parseSettings.projects.length === 1
        ? ['that TSConfig does not', 'that TSConfig']
        : ['none of those TSConfigs', 'one of those TSConfigs'];
    errorLines.push(
      `However, ${describedInclusions} include this file. Either:`,
      `- Change ESLint's list of included files to not include this file`,
      `- Change ${describedSpecifiers} to include this file`,
      `- Create a new TSConfig that includes this file and include it in your parserOptions.project`,
      `See the typescript-eslint docs for more info: https://typescript-eslint.io/linting/troubleshooting##i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file`,
    );
  }

  throw new Error(errorLines.join('\n'));
}

export { createProjectProgram };
