import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-inferrable-types';
import { RuleTester } from '../RuleTester';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, a) => acc.concat(a), []);
}
const testCases = [
  {
    type: 'bigint',
    code: [
      '10n',
      '-10n',
      'BigInt(10)',
      '-BigInt(10)',
      'BigInt?.(10)',
      '-BigInt?.(10)',
    ],
  },
  {
    type: 'boolean',
    code: ['false', 'true', 'Boolean(null)', 'Boolean?.(null)', '!0'],
  },
  {
    type: 'number',
    code: [
      '10',
      '+10',
      '-10',
      'Number("1")',
      '+Number("1")',
      '-Number("1")',
      'Number?.("1")',
      '+Number?.("1")',
      '-Number?.("1")',
      'Infinity',
      '+Infinity',
      '-Infinity',
      'NaN',
      '+NaN',
      '-NaN',
    ],
  },
  {
    type: 'null',
    code: ['null'],
  },
  {
    type: 'RegExp',
    code: ['/a/', 'RegExp("a")', 'RegExp?.("a")', 'new RegExp("a")'],
  },
  {
    type: 'string',
    code: ['"str"', "'str'", '`str`', 'String(1)', 'String?.(1)'],
  },
  {
    type: 'symbol',
    code: ['Symbol("a")', 'Symbol?.("a")'],
  },
  {
    type: 'undefined',
    code: ['undefined', 'void someValue'],
  },
];
const validTestCases = flatten(
  testCases.map(c => c.code.map(code => `const a = ${code}`)),
);
const invalidTestCases: TSESLint.InvalidTestCase<
  MessageIds,
  Options
>[] = flatten(
  testCases.map(cas =>
    cas.code.map(code => ({
      code: `const a: ${cas.type} = ${code}`,
      output: `const a = ${code}`,
      errors: [
        {
          messageId: 'noInferrableType',
          data: {
            type: cas.type,
          },
          line: 1,
          column: 7,
        },
      ],
    })),
  ),
);

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-inferrable-types', rule, {
  valid: [
    ...validTestCases,

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

    'const a: any = 5;',
    "const fn = function (a: any = 5, b: any = true, c: any = 'foo') {};",

    {
      code:
        "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {};",
      options: [{ ignoreParameters: true }],
    },
    {
      code:
        "function fn(a: number = 5, b: boolean = true, c: string = 'foo') {}",
      options: [{ ignoreParameters: true }],
    },
    {
      code:
        "const fn = function (a: number = 5, b: boolean = true, c: string = 'foo') {};",
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
  a?: number = 5;
  b?: boolean = true;
  c?: string = 'foo';
}
      `,
    },
  ],

  invalid: [
    ...invalidTestCases,

    {
      code:
        "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {};",
      output: "const fn = (a = 5, b = true, c = 'foo') => {};",
      options: [
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],
      errors: [
        {
          messageId: 'noInferrableType',
          data: {
            type: 'number',
          },
          line: 1,
          column: 13,
        },
        {
          messageId: 'noInferrableType',
          data: {
            type: 'boolean',
          },
          line: 1,
          column: 28,
        },
        {
          messageId: 'noInferrableType',
          data: {
            type: 'string',
          },
          line: 1,
          column: 47,
        },
      ],
    },
    {
      code: `
class Foo {
  a: number = 5;
  b: boolean = true;
  c: string = 'foo';
}
      `,
      output: `
class Foo {
  a = 5;
  b = true;
  c = 'foo';
}
      `,
      options: [
        {
          ignoreParameters: false,
          ignoreProperties: false,
        },
      ],
      errors: [
        {
          messageId: 'noInferrableType',
          data: {
            type: 'number',
          },
          line: 3,
          column: 3,
        },
        {
          messageId: 'noInferrableType',
          data: {
            type: 'boolean',
          },
          line: 4,
          column: 3,
        },
        {
          messageId: 'noInferrableType',
          data: {
            type: 'string',
          },
          line: 5,
          column: 3,
        },
      ],
    },
  ],
});
