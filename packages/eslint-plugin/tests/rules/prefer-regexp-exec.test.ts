import path from 'path';
import rule from '../../src/rules/prefer-regexp-exec';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-regexp-exec', rule, {
  valid: [
    '"something".match();',
    '"something".match(/thing/g);',
    `
const text = "something";
const search = /thing/g;
text.match(search);
`,
  ],
  invalid: [
    {
      code: '"something".match(/thing/);',
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
const text = "something";
const search = /thing/;
text.match(search);
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 1,
        },
      ],
    },
  ],
});
