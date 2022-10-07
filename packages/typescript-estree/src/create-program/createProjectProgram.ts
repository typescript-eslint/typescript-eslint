import debug from 'debug';
import path from 'path';
import * as ts from 'typescript';

import { firstDefined } from '../node-utils';
import type { Extra } from '../parser-options';
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
 * @param code The code of the file being linted
 * @param createDefaultProgram True if the default program should be created
 * @param extra The config object
 * @returns If found, returns the source file corresponding to the code and the containing program
 */
function createProjectProgram(
  code: string,
  createDefaultProgram: boolean,
  extra: Extra,
): ASTAndProgram | undefined {
  log('Creating project program for: %s', extra.filePath);

  const programsForProjects = getProgramsForProjects(
    code,
    extra.filePath,
    extra,
  );
  const astAndProgram = firstDefined(programsForProjects, currentProgram =>
    getAstFromProgram(currentProgram, extra),
  );

  // The file was either matched within the tsconfig, or we allow creating a default program
  if (astAndProgram || createDefaultProgram) {
    return astAndProgram;
  }

  const describeFilePath = (filePath: string): string =>
    path.relative(extra.tsconfigRootDir || process.cwd(), filePath);

  const describedFilePath = describeFilePath(extra.filePath);
  const relativeProjects = extra.projects.map(describeFilePath);
  const describedPrograms =
    relativeProjects.length === 1
      ? relativeProjects[0]
      : `\n${relativeProjects.map(project => `- ${project}`).join('\n')}`;
  const errorLines = [
    `ESLint was configured to run on ${describedFilePath} using "parserOptions.project": ${describedPrograms}.`,
  ];
  let hasMatchedAnError = false;

  const extraFileExtensions = extra.extraFileExtensions || [];

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

  const fileExtension = path.extname(extra.filePath);
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
    const [describedInclusions, describedSpecifiers] =
      extra.projects.length === 1
        ? ['that TSConfig does not', 'that TSConfig']
        : ['none of those TSConfigs', 'one of those TSConfigs'];
    errorLines.push(
      `However, ${describedInclusions} include this file. Either:`,
      `- Change ESLint's list of included files to not include this file`,
      `- Change ${describedSpecifiers} to include this file`,
      `- Create a new TSConfig that includes this file and include it in your parserOptions.project`,
      `See the TypeScript ESLint docs for more info: https://typescript-eslint.io/docs/linting/troubleshooting#`,
    );
  }

  throw new Error(errorLines.join('\n'));
}

export { createProjectProgram };
