import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-circular-import';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
  },
});

const filename = './no-circular-import/entry.ts';

ruleTester.run('no-circular-import', rule, {
  valid: [
    {
      code: "import './isolated-circular-a';",
      filename,
    },
    {
      code: "import * as ts from 'typescript';",
      filename,
    },
    {
      code: "import foo from './no-circular';",
      filename,
    },
    {
      code: `
import { TypeOnly } from './type-only';
export const entry = 1;
      `,
      filename,
    },
    {
      code: `
import type { one } from './depth-one';
export const entry = 1;
      `,
      filename,
    },
    {
      code: `
import { type one } from './depth-one';
export const entry = 1;
      `,
      filename,
    },
  ],
  invalid: [
    {
      code: `
import { one } from './depth-one';
export const entry = 1;
      `,
      filename,
      errors: [
        {
          messageId: 'noCircularImport',
          line: 2,
          data: {
            paths: './depth-one',
          },
        },
      ],
    },
    {
      code: `
import { two } from './depth-two';
export const entry = 1;
      `,
      filename,
      errors: [
        {
          messageId: 'noCircularImport',
          line: 2,
          data: {
            paths: './depth-two ... ./depth-one',
          },
        },
      ],
    },
    {
      code: `
import { three } from './depth-three';
export const entry = 1;
      `,
      filename,
      errors: [
        {
          messageId: 'noCircularImport',
          line: 2,
          data: {
            paths: './depth-three ... ./depth-one',
          },
        },
      ],
    },
  ],
});
