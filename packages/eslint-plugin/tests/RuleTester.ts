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

  // If the test has requested a specific project, disable projectService.
  // Otherwise, default to using projectService for types
  // See: https://github.com/typescript-eslint/typescript-eslint/issues/11676
  parserOptions.projectService ??= !parserOptions.project;

  return new RuleTester({
    languageOptions: { parserOptions },
  });
}

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}
