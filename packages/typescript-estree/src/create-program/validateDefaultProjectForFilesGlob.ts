import type { ProjectServiceOptions } from '../parser-options';

export const DEFAULT_PROJECT_FILES_ERROR_EXPLANATION = `

Having many files run with the default project is known to cause performance issues and slow down linting.

See https://typescript-eslint.io/troubleshooting/#allowdefaultprojectforfiles-glob-too-wide
`;

export function validateDefaultProjectForFilesGlob(
  options: ProjectServiceOptions,
): void {
  if (!options.allowDefaultProjectForFiles?.length) {
    return;
  }

  for (const glob of options.allowDefaultProjectForFiles) {
    if (glob === '*') {
      throw new Error(
        `allowDefaultProjectForFiles contains the overly wide '*'.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}`,
      );
    }
    if (glob.includes('**')) {
      throw new Error(
        `allowDefaultProjectForFiles glob '${glob}' contains a disallowed '**'.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}`,
      );
    }
  }
}
