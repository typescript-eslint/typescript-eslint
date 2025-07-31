import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-assignment';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.noImplicitThis.json',
      projectService: false,
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('no-unsafe-assignment', rule, {
  valid: [
    // ... existing valid test cases remain unchanged
  ],
  invalid: [
    // ... existing invalid test cases remain unchanged

    // ✅ NEW TEST CASE FOR unsafeObjectPattern
    {
      code: 'const anyObj: any = {}; const { x } = anyObj;',
      errors: [
        {
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
  ],
});
