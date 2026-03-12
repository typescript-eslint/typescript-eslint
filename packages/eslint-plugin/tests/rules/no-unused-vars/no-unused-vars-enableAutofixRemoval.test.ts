import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import { describe } from 'vitest';

import rule from '../../../src/rules/no-unused-vars';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {},
      ecmaVersion: 6,
      sourceType: 'module',
    },
  },
});

describe('no-unused-vars', () => {
  ruleTester.run('enableAutofixRemoval.imports = true', rule, {
    invalid: [
      {
        code: `
import * as Unused from 'module';
export {};
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import Unused from 'module';
export {};
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused } from 'module';
export {};
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused, Unused2 } from 'module';
export {};
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used } from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import { Used, Unused, } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused, Used2 } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Unused, { Unused2 } from 'module';
export {};
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import Unused, { Used } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  { Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import Used, { Unused } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import Used, { Unused, } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used from 'module';
export { Used };
        `,
      },
      {
        code: `
import Used, { Used2, Unused } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used, { Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Used, { Unused, Used2 } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used, {  Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Unused, { Unused2, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import Unused, { Used, Unused2 } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            messageId: 'unusedVar',
          },
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  { Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Unused as Unused1, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused as Unused1 } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used } from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import { Used, Unused as Unused1, } from 'module';
export { Used };
        `,
        errors: [
          {
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, } from 'module';
export { Used };
        `,
      },
      {
        code: `
/* this is an important comment */ import assert from 'assert';
        `,
        errors: [
          {
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
/* this is an important comment */ 
        `,
      },
      {
        code: `
import assert from 'assert'; /* this is an important comment */
        `,
        errors: [
          {
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
 /* this is an important comment */
        `,
      },
    ],
    valid: [],
  });
});
