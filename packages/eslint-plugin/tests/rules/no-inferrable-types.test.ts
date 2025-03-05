import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

import rule from '../../src/rules/no-inferrable-types';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const testCases = [
  {
    code: [
      '10n',
      '-10n',
      'BigInt(10)',
      '-BigInt(10)',
      'BigInt?.(10)',
      '-BigInt?.(10)',
    ],
    type: 'bigint',
  },
  {
    code: ['false', 'true', 'Boolean(null)', 'Boolean?.(null)', '!0'],
    type: 'boolean',
  },
  {
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
    type: 'number',
  },
  {
    code: ['null'],
    type: 'null',
  },
  {
    code: ['/a/', 'RegExp("a")', 'RegExp?.("a")', 'new RegExp("a")'],
    type: 'RegExp',
  },
  {
    code: ['"str"', "'str'", '`str`', 'String(1)', 'String?.(1)'],
    type: 'string',
  },
  {
    code: ['Symbol("a")', 'Symbol?.("a")'],
    type: 'symbol',
  },
  {
    code: ['undefined', 'void someValue'],
    type: 'undefined',
  },
];
const validTestCases = testCases.flatMap(c =>
  c.code.map(code => `const a = ${code}`),
);
const invalidTestCases: InvalidTestCase<MessageIds, Options>[] =
  testCases.flatMap(cas =>
    cas.code.map(code => ({
      code: `const a: ${cas.type} = ${code}`,
      errors: [
        {
          column: 7,
          data: {
            type: cas.type,
          },
          line: 1,
          messageId: 'noInferrableType',
        },
      ],
      output: `const a = ${code}`,
    })),
  );

const ruleTester = new RuleTester();

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
    ...invalidTestCases,
    {
      // This is invalid TS semantic, but it's trivial to make valid anyway
      code: 'const fn = (a?: number = 5) => {};',
      errors: [
        {
          column: 13,
          data: {
            type: 'number',
          },
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
      // This is invalid TS semantic, but it's trivial to make valid anyway
      code: `
class A {
  a!: number = 1;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: 'number',
          },
          line: 3,
          messageId: 'noInferrableType',
        },
      ],
      options: [
        {
          ignoreProperties: false,
        },
      ],
      output: `
class A {
  a = 1;
}
      `,
    },
    {
      code: "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {};",
      errors: [
        {
          column: 13,
          data: {
            type: 'number',
          },
          line: 1,
          messageId: 'noInferrableType',
        },
        {
          column: 28,
          data: {
            type: 'boolean',
          },
          line: 1,
          messageId: 'noInferrableType',
        },
        {
          column: 47,
          data: {
            type: 'string',
          },
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
          line: 3,
          messageId: 'noInferrableType',
        },
        {
          column: 3,
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'noInferrableType',
        },
        {
          column: 3,
          data: {
            type: 'string',
          },
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
