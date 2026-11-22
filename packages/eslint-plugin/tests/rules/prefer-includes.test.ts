import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-includes';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-includes', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
function f(a: string): void {
  a.indexOf(b);
}
    `,
    `
function f(a: string): void {
  a.indexOf(b) + 0;
}
    `,
    `
function f(a: string | { value: string }): void {
  a.indexOf(b) !== -1;
}
    `,
    `
type UserDefined = {
  indexOf(x: any): number; // don't have 'includes'
};
function f(a: UserDefined): void {
  a.indexOf(b) !== -1;
}
    `,
    `
type UserDefined = {
  indexOf(x: any, fromIndex?: number): number;
  includes(x: any): boolean; // different parameters
};
function f(a: UserDefined): void {
  a.indexOf(b) !== -1;
}
    `,
    `
type UserDefined = {
  indexOf(x: any, fromIndex?: number): number;
  includes(x: any, fromIndex: number): boolean; // different parameters
};
function f(a: UserDefined): void {
  a.indexOf(b) !== -1;
}
    `,
    `
type UserDefined = {
  indexOf(x: any, fromIndex?: number): number;
  includes: boolean; // different type
};
function f(a: UserDefined): void {
  a.indexOf(b) !== -1;
}
    `,
    `
function f(a: string): void {
  /bar/i.test(a);
}
    `,
    `
function f(a: string): void {
  /ba[rz]/.test(a);
}
    `,
    `
function f(a: string): void {
  /foo|bar/.test(a);
}
    `,
    `
function f(a: string): void {
  /bar/.test();
}
    `,
    `
function f(a: string): void {
  something.test(a);
}
    `,
    `
const pattern = new RegExp('bar');
function f(a) {
  return pattern.test(a);
}
    `,
    `
function f(a: string): void {
  /bar/y.test(a);
}
    `,
    `
function f(a: string): void {
  /bar/gy.test(a);
}
    `,
    // a stored global regex starts at its `lastIndex`, which may not be 0
    `
const pattern = /bar/g;
function f(a: string): void {
  pattern.test(a);
}
    `,
    `
const pattern = /bar/g;
function f(a: string): void {
  RegExp(pattern).test(a);
}
    `,
    `
const pattern = /bar/g;
function f(a: string): void {
  (0, pattern).test(a);
}
    `,
    `
function f(a: string): void {
  a.lastIndexOf(b) !== -1;
}
    `,
    `
declare const a: {
  indexOf: (x: string) => number;
  includes(x: string): boolean;
};
a.indexOf(b) !== -1;
    `,
  ],
  invalid: [
    {
      code: noFormat`
function f(a: string): void {
  (a.indexOf(b)) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  (a.includes(b));
}
      `,
    },
    {
      code: noFormat`
function f(a: string): void {
  (a.indexOf(b)) === -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  (!a.includes(b));
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/g.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  new RegExp('bar', 'g').test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  (0, /bar/g).test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  (/bar/g as RegExp).test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /\\ud800/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('\\ud800');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /\\udc00/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('\\udc00');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /\\ud83d\\ude00/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('😀');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /\\x001/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('\\x001');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /'1/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('\\'1');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/?.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a?.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/.test('foo');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  'foo'.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/.test(\`foo\`);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  \`foo\`.includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/.test([a][0]);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  [a][0].includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /bar/.test(a.trim());
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.trim().includes('bar');
}
      `,
    },
    {
      code: `
declare const a: {
  indexOf(x: string): number;
  includes(x: number): boolean;
  includes(x: string): boolean;
};
a.indexOf(b) !== -1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'preferIncludes',
        },
      ],
      output: `
declare const a: {
  indexOf(x: string): number;
  includes(x: number): boolean;
  includes(x: string): boolean;
};
a.includes(b);
      `,
    },
    // positive
    {
      code: `
function f(a: string): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) != -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) > -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) >= 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes(b);
}
      `,
    },

    // negative
    {
      code: `
function f(a: string): void {
  a.indexOf(b) === -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  !a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) == -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  !a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) <= -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  !a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: string): void {
  a.indexOf(b) < 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: string): void {
  !a.includes(b);
}
      `,
    },
    {
      code: `
function f(a?: string): void {
  a?.indexOf(b) === -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: null,
    },
    {
      code: `
function f(a?: string): void {
  a?.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: null,
    },

    // RegExp#test
    {
      code: `
function f(a: string): void {
  /bar/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    // test SequenceExpression
    {
      code: `
function f(a: string): void {
  /bar/.test((1 + 1, a));
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  (1 + 1, a).includes('bar');
}
      `,
    },
    {
      code: `
function f(a: string): void {
  /\\0'\\\\\\n\\r\\v\\t\\f/.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
function f(a: string): void {
  a.includes('\\0\\'\\\\\\n\\r\\v\\t\\f');
}
      `,
    },
    {
      code: `
const pattern = new RegExp('bar');
function f(a: string): void {
  pattern.test(a);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
const pattern = new RegExp('bar');
function f(a: string): void {
  a.includes('bar');
}
      `,
    },
    {
      code: `
const pattern = /bar/;
function f(a: string, b: string): void {
  pattern.test(a + b);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'preferStringIncludes',
        },
      ],
      output: `
const pattern = /bar/;
function f(a: string, b: string): void {
  (a + b).includes('bar');
}
      `,
    },

    // type variation
    {
      code: `
function f(a: any[]): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: any[]): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: ReadonlyArray<any>): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: ReadonlyArray<any>): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Int8Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Int8Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Int16Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Int16Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Int32Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Int32Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Uint8Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Uint8Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Uint16Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Uint16Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Uint32Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Uint32Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Float32Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Float32Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Float64Array): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Float64Array): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f<T>(a: T[] | ReadonlyArray<T>): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f<T>(a: T[] | ReadonlyArray<T>): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f<
  T,
  U extends
    | T[]
    | ReadonlyArray<T>
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array,
>(a: U): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 16,
          line: 16,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f<
  T,
  U extends
    | T[]
    | ReadonlyArray<T>
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array,
>(a: U): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
type UserDefined = {
  indexOf(x: any): number;
  includes(x: any): boolean;
};
function f(a: UserDefined): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 7,
          line: 7,
          messageId: 'preferIncludes',
        },
      ],
      output: `
type UserDefined = {
  indexOf(x: any): number;
  includes(x: any): boolean;
};
function f(a: UserDefined): void {
  a.includes(b);
}
      `,
    },
    {
      code: `
function f(a: Readonly<any[]>): void {
  a.indexOf(b) !== -1;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferIncludes',
        },
      ],
      output: `
function f(a: Readonly<any[]>): void {
  a.includes(b);
}
      `,
    },
  ],
});
