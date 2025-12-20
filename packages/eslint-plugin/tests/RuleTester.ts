import type { ParserOptions } from '@typescript-eslint/utils/ts-eslint';

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

export function createRuleTesterWithTypes(
  providedParserOptions: ParserOptions | undefined = {},
): RuleTester {
  const parserOptions = {
    ...providedParserOptions,
    tsconfigRootDir:
      providedParserOptions.tsconfigRootDir ?? getFixturesRootDir(),
  };

  // If the test has requested a specific project, disable projectService
  // (regardless of whether it's being switched to by TYPESCRIPT_ESLINT_PROJECT_SERVICE)
  if (parserOptions.project) {
    parserOptions.projectService = false;
  }
  // Otherwise, use the project service for types if requested in the env
  else if (process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE) {
    parserOptions.projectService = true;
  }
  // Finally, default to project: true as the standard (legacy) behavior
  // See: https://github.com/typescript-eslint/typescript-eslint/issues/11676
  else {
    parserOptions.project = true;
  }

  return new RuleTester({
    languageOptions: { parserOptions },
  });
}

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}
