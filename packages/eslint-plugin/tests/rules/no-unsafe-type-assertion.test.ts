import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-type-assertion';
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

ruleTester.run('no-unsafe-member-access', rule, {
  valid: [
    `
declare const a: string;
const b = a as string | number;
    `,
    `
declare const a: string;
const b = a as unknown;
    `,
    `
declare const a: () => boolean;
const b = a() as boolean | number;
    `,
    `
declare const a: string;
const b = a as string;
    `,
    `
declare const a: string;
const b = <string | number>a;
    `,
    `
declare const a: string;
const b = <unknown>a;
    `,
    `
declare const a: () => boolean;
const b = <boolean | number>a();
    `,
    `
declare const a: string;
const b = <string>a;
    `,
  ],
  invalid: [
    {
      code: `
declare const a: string | number;
const b = a as string;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 22,
          data: {
            type: 'string | number',
            asserted: 'string',
          },
        },
      ],
    },
    {
      code: `
declare const a: string | number;
const b = <string>a;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 20,
          data: {
            type: 'string | number',
            asserted: 'string',
          },
        },
      ],
    },
    {
      code: `
declare const a: string;
const b = a as unknown as number;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 33,
          data: {
            type: 'unknown',
            asserted: 'number',
          },
        },
      ],
    },
    {
      code: `
declare const a: string | undefined;
const b = a as string | boolean;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 11,
          endColumn: 32,
          data: {
            type: 'string | undefined',
            asserted: 'string | boolean',
          },
        },
      ],
    },
    {
      code: `
function f(t: number | string) {
  return t as number | boolean;
}
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 3,
          column: 10,
          endColumn: 31,
          data: {
            type: 'string | number',
            asserted: 'number | boolean',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
  bas: string;
}

var foo = {} as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 11,
          endColumn: 20,
          data: {
            type: '{}',
            asserted: 'Foo',
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: number;
}

// no additional properties are allowed
export const foo = { bar: 1, bazz: 1 } as Foo;
      `,
      errors: [
        {
          messageId: 'unsafeTypeAssertion',
          line: 7,
          column: 20,
          endColumn: 46,
          data: {
            type: '{ bar: number; bazz: number; }',
            asserted: 'Foo',
          },
        },
      ],
    },
  ],
});
