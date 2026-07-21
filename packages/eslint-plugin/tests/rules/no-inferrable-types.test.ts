import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-inferrable-types';

const ruleTester = new RuleTester();

ruleTester.run('no-inferrable-types', rule, {
  valid: [
    'const a = 10n;',
    'const a = -10n;',
    'const a = BigInt(10);',
    'const a = -BigInt(10);',
    'const a = BigInt?.(10);',
    'const a = -BigInt?.(10);',
    'const a = false;',
    'const a = true;',
    'const a = Boolean(null);',
    'const a = Boolean?.(null);',
    'const a = !0;',
    'const a = 10;',
    'const a = +10;',
    'const a = -10;',
    "const a = Number('1');",
    "const a = +Number('1');",
    "const a = -Number('1');",
    "const a = Number?.('1');",
    "const a = +Number?.('1');",
    "const a = -Number?.('1');",
    'const a = Infinity;',
    'const a = +Infinity;',
    'const a = -Infinity;',
    'const a = NaN;',
    'const a = +NaN;',
    'const a = -NaN;',
    'const a = null;',
    'const a = /a/;',
    "const a = RegExp('a');",
    "const a = RegExp?.('a');",
    "const a = new RegExp('a');",
    "const a = 'str';",
    'const a = `str`;',
    'const a = String(1);',
    'const a = String?.(1);',
    "const a = Symbol('a');",
    "const a = Symbol?.('a');",
    'const a = undefined;',
    'const a = void someValue;',

    "const fn = (a = 5, b = true, c = 'foo') => {};",
    "const fn = function (a = 5, b = true, c = 'foo') {};",
    "function fn(a = 5, b = true, c = 'foo') {}",
    'function fn(a: number, b: boolean, c: string) {}',

    `
class Foo {
  a = 5;
  b = true;
  c = 'foo';
}
    `,
    `
class Foo {
  readonly a: number = 5;
}
    `,
    `
class Foo {
  accessor a = 5;
}
    `,

    'const a: any = 5;',
    "const fn = function (a: any = 5, b: any = true, c: any = 'foo') {};",

    {
      code: "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {};",
      options: [{ ignoreParameters: true }],
    },
    {
      code: "function fn(a: number = 5, b: boolean = true, c: string = 'foo') {}",
      options: [{ ignoreParameters: true }],
    },
    {
      code: "const fn = function (a: number = 5, b: boolean = true, c: string = 'foo') {};",
      options: [{ ignoreParameters: true }],
    },
    {
      code: `
class Foo {
  a: number = 5;
  b: boolean = true;
  c: string = 'foo';
}
      `,
      options: [{ ignoreProperties: true }],
    },
    {
      code: `
class Foo {
  accessor a: number = 5;
}
      `,
      options: [{ ignoreProperties: true }],
    },
    {
      code: `
class Foo {
  a?: number = 5;
  b?: boolean = true;
  c?: string = 'foo';
}
      `,
    },
    {
      code: `
class Foo {
  constructor(public a = true) {}
}
      `,
    },
  ],

  invalid: [
    {
      code: 'const a: bigint = 10n;',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = 10n;',
    },
    {
      code: 'const a: bigint = -10n;',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -10n;',
    },
    {
      code: 'const a: bigint = BigInt(10);',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = BigInt(10);',
    },
    {
      code: 'const a: bigint = -BigInt(10);',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -BigInt(10);',
    },
    {
      code: 'const a: bigint = BigInt?.(10);',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = BigInt?.(10);',
    },
    {
      code: 'const a: bigint = -BigInt?.(10);',
      errors: [
        {
          column: 7,
          data: {
            type: 'bigint',
          },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -BigInt?.(10);',
    },
    {
      code: 'const a: boolean = false;',
      errors: [
        {
          column: 7,
          data: {
            type: 'boolean',
          },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = false;',
    },
    {
      code: 'const a: boolean = true;',
      errors: [
        {
          column: 7,
          data: {
            type: 'boolean',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = true;',
    },
    {
      code: 'const a: boolean = Boolean(null);',
      errors: [
        {
          column: 7,
          data: {
            type: 'boolean',
          },
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = Boolean(null);',
    },
    {
      code: 'const a: boolean = Boolean?.(null);',
      errors: [
        {
          column: 7,
          data: {
            type: 'boolean',
          },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = Boolean?.(null);',
    },
    {
      code: 'const a: boolean = !0;',
      errors: [
        {
          column: 7,
          data: {
            type: 'boolean',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = !0;',
    },
    {
      code: 'const a: number = 10;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = 10;',
    },
    {
      code: 'const a: number = +10;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = +10;',
    },
    {
      code: 'const a: number = -10;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -10;',
    },
    {
      code: "const a: number = Number('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = Number('1');",
    },
    {
      code: "const a: number = +Number('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = +Number('1');",
    },
    {
      code: "const a: number = -Number('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = -Number('1');",
    },
    {
      code: "const a: number = Number?.('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = Number?.('1');",
    },
    {
      code: "const a: number = +Number?.('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = +Number?.('1');",
    },
    {
      code: "const a: number = -Number?.('1');",
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = -Number?.('1');",
    },
    {
      code: 'const a: number = Infinity;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = Infinity;',
    },
    {
      code: 'const a: number = +Infinity;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = +Infinity;',
    },
    {
      code: 'const a: number = -Infinity;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -Infinity;',
    },
    {
      code: 'const a: number = NaN;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = NaN;',
    },
    {
      code: 'const a: number = +NaN;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = +NaN;',
    },
    {
      code: 'const a: number = -NaN;',
      errors: [
        {
          column: 7,
          data: {
            type: 'number',
          },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = -NaN;',
    },
    {
      code: 'const a: null = null;',
      errors: [
        {
          column: 7,
          data: {
            type: 'null',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = null;',
    },
    {
      code: 'const a: RegExp = /a/;',
      errors: [
        {
          column: 7,
          data: {
            type: 'RegExp',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = /a/;',
    },
    {
      code: "const a: RegExp = RegExp('a');",
      errors: [
        {
          column: 7,
          data: {
            type: 'RegExp',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = RegExp('a');",
    },
    {
      code: "const a: RegExp = RegExp?.('a');",
      errors: [
        {
          column: 7,
          data: {
            type: 'RegExp',
          },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = RegExp?.('a');",
    },
    {
      code: "const a: RegExp = new RegExp('a');",
      errors: [
        {
          column: 7,
          data: {
            type: 'RegExp',
          },
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = new RegExp('a');",
    },
    {
      code: "const a: string = 'str';",
      errors: [
        {
          column: 7,
          data: {
            type: 'string',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = 'str';",
    },
    {
      code: 'const a: string = `str`;',
      errors: [
        {
          column: 7,
          data: {
            type: 'string',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = `str`;',
    },
    {
      code: 'const a: string = String(1);',
      errors: [
        {
          column: 7,
          data: {
            type: 'string',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = String(1);',
    },
    {
      code: 'const a: string = String?.(1);',
      errors: [
        {
          column: 7,
          data: {
            type: 'string',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = String?.(1);',
    },
    {
      code: "const a: symbol = Symbol('a');",
      errors: [
        {
          column: 7,
          data: {
            type: 'symbol',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = Symbol('a');",
    },
    {
      code: "const a: symbol = Symbol?.('a');",
      errors: [
        {
          column: 7,
          data: {
            type: 'symbol',
          },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: "const a = Symbol?.('a');",
    },
    {
      code: 'const a: undefined = undefined;',
      errors: [
        {
          column: 7,
          data: {
            type: 'undefined',
          },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = undefined;',
    },
    {
      code: 'const a: undefined = void someValue;',
      errors: [
        {
          column: 7,
          data: {
            type: 'undefined',
          },
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: 'const a = void someValue;',
    },

    {
      // This is invalid TS semantic, but it's trivial to make valid anyway
      code: 'const fn = (a?: number = 5) => {};',
      errors: [
        {
          column: 13,
          data: {
            type: 'number',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      options: [
        {
          ignoreParameters: false,
        },
      ],
      output: 'const fn = (a = 5) => {};',
    },
    {
      code: "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {};",
      errors: [
        {
          column: 13,
          data: {
            type: 'number',
          },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
        {
          column: 28,
          data: {
            type: 'boolean',
          },
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
        {
          column: 47,
          data: {
            type: 'string',
          },
          endColumn: 64,
          endLine: 1,
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      options: [
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],
      output: "const fn = (a = 5, b = true, c = 'foo') => {};",
    },
    {
      code: `
class Foo {
  a: number = 5;
  b: boolean = true;
  c: string = 'foo';
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: 'number',
          },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'noInferrableType',
        },
        {
          column: 3,
          data: {
            type: 'boolean',
          },
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'noInferrableType',
        },
        {
          column: 3,
          data: {
            type: 'string',
          },
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'noInferrableType',
        },
      ],
      options: [
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],
      output: `
class Foo {
  a = 5;
  b = true;
  c = 'foo';
}
      `,
    },
    {
      code: `
class Foo {
  constructor(public a: boolean = true) {}
}
      `,
      errors: [
        {
          column: 22,
          data: {
            type: 'boolean',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'noInferrableType',
        },
      ],
      options: [
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],
      output: `
class Foo {
  constructor(public a = true) {}
}
      `,
    },
    {
      code: `
class Foo {
  accessor a: number = 5;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: 'number',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'noInferrableType',
        },
      ],
      output: `
class Foo {
  accessor a = 5;
}
      `,
    },
  ],
});
