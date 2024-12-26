export const DEFAULT_PROJECT_FILES_ERROR_EXPLANATION = `

Having many files run with the default project is known to cause performance issues and slow down linting.

See https://typescript-eslint.io/troubleshooting/typed-linting#allowdefaultproject-glob-too-wide
`;

export function validateDefaultProjectForFilesGlob(
  allowDefaultProject: string[] | undefined,
): void {
  if (!allowDefaultProject?.length) {
    return;
  }

  for (const glob of allowDefaultProject) {
    if (glob === '*') {
      throw new Error(
        `allowDefaultProject contains the overly wide '*'.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}`,
      );
    }
    if (glob.includes('**')) {
      throw new Error(
        `allowDefaultProject glob '${glob}' contains a disallowed '**'.${DEFAULT_PROJECT_FILES_ERROR_EXPLANATION}`,
      );
    }
  }
}
