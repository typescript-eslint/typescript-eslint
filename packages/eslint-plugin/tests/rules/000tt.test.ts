import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-parameters';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-unnecessary-type-parameters', rule, {
  valid: [],

  invalid: [
    {
      code: `
        function getLength<T>(array: Array<T>) {
          return array.length;
        }
      `,
      errors: [{ messageId: 'sole', data: { name: 'T' } }],
    },
  ],
});
