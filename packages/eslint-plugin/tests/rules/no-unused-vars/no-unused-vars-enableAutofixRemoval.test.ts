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

  ruleTester.run('enableAutofixRemoval.functions = true', rule, {
    invalid: [
      {
        code: `
function unused() {}
export {};
        `,
        errors: [
          {
            column: 10,
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [{ enableAutofixRemoval: { functions: true } }],
        output: `
export {};
        `,
      },
      {
        code: `
declare function unused(): void;
export {};
        `,
        errors: [
          {
            column: 18,
            endColumn: 24,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [{ enableAutofixRemoval: { functions: true } }],
        output: `
export {};
        `,
      },
      {
        // sole body of an if -- removing it leaves `if (maybe)` dangling
        code: `
declare const maybe: boolean;
if (maybe) function unused() {}
export {};
        `,
        errors: [
          {
            column: 21,
            endColumn: 27,
            endLine: 3,
            line: 3,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { functions: true } }],
      },
    ],
    valid: [
      {
        code: `
export function used() {}
        `,
        options: [{ enableAutofixRemoval: { functions: true } }],
      },
      {
        // the name of a function *expression* is never reported -- which is just
        // as well, since the node to remove would be the expression itself
        code: `
export const used = function unused() {};
        `,
        options: [{ enableAutofixRemoval: { functions: true } }],
      },
    ],
  });

  ruleTester.run('enableAutofixRemoval.functions = false', rule, {
    invalid: [
      {
        code: `
function unused() {}
export {};
        `,
        errors: [
          {
            column: 10,
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { functions: false } }],
        output: null,
      },
    ],
    valid: [],
  });

  ruleTester.run('enableAutofixRemoval.variables = true', rule, {
    invalid: [
      {
        code: `
const unused = () => {};
export {};
        `,
        errors: [
          {
            column: 7,
            endColumn: 13,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
        output: `
export {};
        `,
      },
      {
        code: `
let unused;
export {};
        `,
        errors: [
          {
            column: 5,
            endColumn: 11,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
        output: `
export {};
        `,
      },
      {
        // multiple declarators would need comma surgery -- not implemented
        code: `
let unused, used;
used = 1;
export { used };
        `,
        errors: [
          {
            column: 5,
            endColumn: 11,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
      },
      {
        // destructuring: siblings may be used, so the whole declaration must stay
        code: `
declare const obj: { a: string; b: string };
const { a: unused, b: used } = obj;
export { used };
        `,
        errors: [
          {
            column: 12,
            endColumn: 18,
            endLine: 3,
            line: 3,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
      },
      {
        // removing a `using` declaration would drop the resource's disposal
        code: `
export function open(): any {
  return null;
}
{
  using unused = open();
}
        `,
        errors: [
          {
            column: 9,
            endColumn: 15,
            endLine: 6,
            line: 6,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
      },
      {
        // the declaration is a `for` head -- removing it is a syntax error
        code: `
declare const items: string[];
for (const unused of items) {
}
export {};
        `,
        errors: [
          {
            column: 12,
            endColumn: 18,
            endLine: 3,
            line: 3,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { variables: true } }],
      },
    ],
    valid: [
      {
        code: `
export const used = 1;
        `,
        options: [{ enableAutofixRemoval: { variables: true } }],
      },
    ],
  });

  ruleTester.run('enableAutofixRemoval.variables = false', rule, {
    invalid: [
      {
        code: `
const unused = () => {};
export {};
        `,
        errors: [
          {
            column: 7,
            endColumn: 13,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
            suggestions: null,
          },
        ],
        options: [{ enableAutofixRemoval: { variables: false } }],
        output: null,
      },
    ],
    valid: [],
  });
});
