import type * as ts from 'typescript';

import path from 'node:path';

import type { ParseSettings } from '../parseSettings';

import { describeFilePath } from './describeFilePath';
import { DEFAULT_EXTRA_FILE_EXTENSIONS } from './shared';

export function createProjectProgramError(
  parseSettings: ParseSettings,
  programsForProjects: readonly ts.Program[],
): string[] {
  const describedFilePath = describeFilePath(
    parseSettings.filePath,
    parseSettings.tsconfigRootDir,
  );

  return [
    getErrorStart(describedFilePath, parseSettings),
    ...getErrorDetails(describedFilePath, parseSettings, programsForProjects),
  ];
}

function getErrorStart(
  describedFilePath: string,
  parseSettings: ParseSettings,
): string {
  const relativeProjects = [...parseSettings.projects.values()].map(
    projectFile => describeFilePath(projectFile, parseSettings.tsconfigRootDir),
  );

  const describedPrograms =
    relativeProjects.length === 1
      ? ` ${relativeProjects[0]}`
      : `\n${relativeProjects.map(project => `- ${project}`).join('\n')}`;

  return `ESLint was configured to run on \`${describedFilePath}\` using \`parserOptions.project\`:${describedPrograms}`;
}

function getErrorDetails(
  describedFilePath: string,
  parseSettings: ParseSettings,
  programsForProjects: readonly ts.Program[],
): string[] {
  if (
    programsForProjects.length === 1 &&
    programsForProjects[0].getProjectReferences()?.length
  ) {
    return [
      `That TSConfig uses project "references" and doesn't include \`${describedFilePath}\` directly, which is not supported by \`parserOptions.project\`.`,
      `Either:`,
      `- Switch to \`parserOptions.projectService\``,
      `- Use an ESLint-specific TSConfig`,
      `See the typescript-eslint docs for more info: https://tseslint.com/are-project-references-supported`,
    ];
  }

  const { extraFileExtensions } = parseSettings;
  const details: string[] = [];

  for (const extraExtension of extraFileExtensions) {
    if (!extraExtension.startsWith('.')) {
      details.push(
        `Found unexpected extension \`${extraExtension}\` specified with the \`parserOptions.extraFileExtensions\` option. Did you mean \`.${extraExtension}\`?`,
      );
    }
    if (DEFAULT_EXTRA_FILE_EXTENSIONS.has(extraExtension)) {
      details.push(
        `You unnecessarily included the extension \`${extraExtension}\` with the \`parserOptions.extraFileExtensions\` option. This extension is already handled by the parser by default.`,
      );
    }
  }

  const fileExtension = path.extname(parseSettings.filePath);
  if (!DEFAULT_EXTRA_FILE_EXTENSIONS.has(fileExtension)) {
    const nonStandardExt = `The extension for the file (\`${fileExtension}\`) is non-standard`;
    if (extraFileExtensions.length > 0) {
      if (!extraFileExtensions.includes(fileExtension)) {
        return [
          ...details,
          `${nonStandardExt}. It should be added to your existing \`parserOptions.extraFileExtensions\`.`,
        ];
      }
    } else {
      return [
        ...details,
        `${nonStandardExt}. You should add \`parserOptions.extraFileExtensions\` to your config.`,
      ];
    }
  }

  const [describedInclusions, describedSpecifiers] =
    parseSettings.projects.size === 1
      ? ['that TSConfig does not', 'that TSConfig']
      : ['none of those TSConfigs', 'one of those TSConfigs'];

  return [
    ...details,
    `However, ${describedInclusions} include this file. Either:`,
    `- Change ESLint's list of included files to not include this file`,
    `- Change ${describedSpecifiers} to include this file`,
    `- Create a new TSConfig that includes this file and include it in your parserOptions.project`,
    `See the typescript-eslint docs for more info: https://tseslint.com/none-of-those-tsconfigs-include-this-file`,
  ];
}
