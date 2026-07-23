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
            column: 13,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 19,
            endLine: 2,
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
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
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
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
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
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
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
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
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
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 23,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 29,
            endLine: 2,
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
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
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
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
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
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 24,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 31,
            endLine: 2,
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
            column: 20,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 27,
            endLine: 2,
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
            column: 26,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 33,
            endLine: 2,
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
            column: 26,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 33,
            endLine: 2,
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
            column: 43,
            endColumn: 49,
            endLine: 2,
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
            column: 8,
            endColumn: 14,
            endLine: 2,
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
