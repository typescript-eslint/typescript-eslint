import type * as ts from 'typescript/lib/tsserverlibrary';

import { getParsedConfigFile } from '@typescript-eslint/tsconfig-utils';

export function getParsedConfigFileFromTSServer(
  tsserver: typeof ts,
  defaultProject: string,
  throwOnFailure: boolean,
  tsconfigRootDir?: string,
) {
  try {
    return getParsedConfigFile(tsserver, defaultProject, tsconfigRootDir);
  } catch (error) {
    if (throwOnFailure) {
      throw new Error(
        `Could not read Project Service default project '${defaultProject}': ${(error as Error).message}`,
      );
    }
  }

  return undefined;
}
