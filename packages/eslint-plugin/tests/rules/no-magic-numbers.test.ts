import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-magic-numbers';

const ruleTester = new RuleTester();

ruleTester.run('no-magic-numbers', rule, {
  valid: [
    {
      code: 'const FOO = 10;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: "type Foo = 'bar';",
    },
    {
      code: 'type Foo = true;',
    },
    {
      code: 'type Foo = 1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = -1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = 1 | -1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: `
        enum foo {
          SECOND = 1000,
          NUM = '0123456789',
          NEG = -1,
          POS = +1,
        }
      `,
      options: [{ ignoreEnums: true }],
    },
    {
      code: `
class Foo {
  readonly A = 1;
  readonly B = 2;
  public static readonly C = 1;
  static readonly D = 1;
  readonly E = -1;
  readonly F = +1;
  private readonly G = 100n;
}
      `,
      options: [{ ignoreReadonlyClassProperties: true }],
    },
    {
      code: 'type Foo = Bar[0];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[-1];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[0xab];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[5.6e1];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[10n];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[1 | -2];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[1 & -2];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[1 & number];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Bar[((1 & -2) | 3) | 4];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = Parameters<Bar>[2];',
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: "type Foo = Bar['baz'];",
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: "type Foo = Bar['baz'];",
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: `
type Others = [['a'], ['b']];

type Foo = {
  [K in keyof Others[0]]: Others[K];
};
      `,
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = 1;',
      options: [{ ignore: [1] }],
    },
    {
      code: 'type Foo = -2;',
      options: [{ ignore: [-2] }],
    },
    {
      code: 'type Foo = 3n;',
      options: [{ ignore: ['3n'] }],
    },
    {
      code: 'type Foo = -4n;',
      options: [{ ignore: ['-4n'] }],
    },
    {
      code: 'type Foo = 5.6;',
      options: [{ ignore: [5.6] }],
    },
    {
      code: 'type Foo = -7.8;',
      options: [{ ignore: [-7.8] }],
    },
    {
      code: 'type Foo = 0x0a;',
      options: [{ ignore: [0x0a] }],
    },
    {
      code: 'type Foo = -0xbc;',
      options: [{ ignore: [-0xbc] }],
    },
    {
      code: 'type Foo = 1e2;',
      options: [{ ignore: [1e2] }],
    },
    {
      code: 'type Foo = -3e4;',
      options: [{ ignore: [-3e4] }],
    },
    {
      code: 'type Foo = 5e-6;',
      options: [{ ignore: [5e-6] }],
    },
    {
      code: 'type Foo = -7e-8;',
      options: [{ ignore: [-7e-8] }],
    },
    {
      code: 'type Foo = 1.1e2;',
      options: [{ ignore: [1.1e2] }],
    },
    {
      code: 'type Foo = -3.1e4;',
      options: [{ ignore: [-3.1e4] }],
    },
    {
      code: 'type Foo = 5.1e-6;',
      options: [{ ignore: [5.1e-6] }],
    },
    {
      code: 'type Foo = -7.1e-8;',
      options: [{ ignore: [-7.1e-8] }],
    },
    {
      code: `
interface Foo {
  bar: 1;
}
      `,
      options: [{ ignore: [1], ignoreNumericLiteralTypes: true }],
    },
    {
      code: `
enum foo {
  SECOND = 1000,
  NUM = '0123456789',
  NEG = -1,
  POS = +2,
}
      `,
      options: [{ ignore: [1000, -1, 2], ignoreEnums: false }],
    },
    {
      code: `
class Foo {
  readonly A = 1;
  readonly B = 2;
  public static readonly C = 3;
  static readonly D = 4;
  readonly E = -5;
  readonly F = +6;
  private readonly G = 100n;
  private static readonly H = -2000n;
}
      `,
      options: [
        {
          ignore: [1, 2, 3, 4, -5, 6, '100n', '-2000n'],
          ignoreReadonlyClassProperties: false,
        },
      ],
    },
    {
      code: 'type Foo = Bar[0];',
      options: [{ ignore: [0], ignoreTypeIndexes: false }],
    },
    {
      code: `
type Other = {
  [0]: 3;
};

type Foo = {
  [K in keyof Other]: \`\${K & number}\`;
};
      `,
      options: [{ ignore: [0, 3], ignoreTypeIndexes: true }],
    },
  ],

  invalid: [
    {
      code: 'type Foo = 1;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreNumericLiteralTypes: false }],
    },
    {
      code: 'type Foo = -1;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreNumericLiteralTypes: false }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 16,
          data: {
            raw: '2',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 20,
          data: {
            raw: '3',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreNumericLiteralTypes: false }],
    },
    {
      code: 'type Foo = 1 | -1;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 16,
          data: {
            raw: '-1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreNumericLiteralTypes: false }],
    },
    {
      code: `
interface Foo {
  bar: 1;
}
      `,
      errors: [
        {
          column: 8,
          data: {
            raw: '1',
          },
          line: 3,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: `
enum foo {
  SECOND = 1000,
  NUM = '0123456789',
  NEG = -1,
  POS = +1,
}
      `,
      errors: [
        {
          column: 12,
          data: {
            raw: '1000',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 9,
          data: {
            raw: '-1',
          },
          line: 5,
          messageId: 'noMagic',
        },
        {
          column: 10,
          data: {
            raw: '1',
          },
          line: 6,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreEnums: false }],
    },
    {
      code: `
class Foo {
  readonly A = 1;
  readonly B = 2;
  public static readonly C = 3;
  static readonly D = 4;
  readonly E = -5;
  readonly F = +6;
  private readonly G = 100n;
}
      `,
      errors: [
        {
          column: 16,
          data: {
            raw: '1',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 16,
          data: {
            raw: '2',
          },
          line: 4,
          messageId: 'noMagic',
        },
        {
          column: 30,
          data: {
            raw: '3',
          },
          line: 5,
          messageId: 'noMagic',
        },
        {
          column: 23,
          data: {
            raw: '4',
          },
          line: 6,
          messageId: 'noMagic',
        },
        {
          column: 16,
          data: {
            raw: '-5',
          },
          line: 7,
          messageId: 'noMagic',
        },
        {
          column: 17,
          data: {
            raw: '6',
          },
          line: 8,
          messageId: 'noMagic',
        },
        {
          column: 24,
          data: {
            raw: '100n',
          },
          line: 9,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreReadonlyClassProperties: false }],
    },
    {
      code: 'type Foo = Bar[0];',
      errors: [
        {
          column: 16,
          data: {
            raw: '0',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[-1];',
      errors: [
        {
          column: 16,
          data: {
            raw: '-1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[0xab];',
      errors: [
        {
          column: 16,
          data: {
            raw: '0xab',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[5.6e1];',
      errors: [
        {
          column: 16,
          data: {
            raw: '5.6e1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[10n];',
      errors: [
        {
          column: 16,
          data: {
            raw: '10n',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[1 | -2];',
      errors: [
        {
          column: 16,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 20,
          data: {
            raw: '-2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[1 & -2];',
      errors: [
        {
          column: 16,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 20,
          data: {
            raw: '-2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[1 & number];',
      errors: [
        {
          column: 16,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Bar[((1 & -2) | 3) | 4];',
      errors: [
        {
          column: 18,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 22,
          data: {
            raw: '-2',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 28,
          data: {
            raw: '3',
          },
          line: 1,
          messageId: 'noMagic',
        },
        {
          column: 33,
          data: {
            raw: '4',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: 'type Foo = Parameters<Bar>[2];',
      errors: [
        {
          column: 28,
          data: {
            raw: '2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: `
type Others = [['a'], ['b']];

type Foo = {
  [K in keyof Others[0]]: Others[K];
};
      `,
      errors: [
        {
          column: 22,
          data: {
            raw: '0',
          },
          line: 5,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: false }],
    },
    {
      code: `
type Other = {
  [0]: 3;
};

type Foo = {
  [K in keyof Other]: \`\${K & number}\`;
};
      `,
      errors: [
        {
          column: 4,
          data: {
            raw: '0',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 8,
          data: {
            raw: '3',
          },
          line: 3,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: `
type Foo = {
  [K in 0 | 1 | 2]: 0;
};
      `,
      errors: [
        {
          column: 9,
          data: {
            raw: '0',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 13,
          data: {
            raw: '1',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 17,
          data: {
            raw: '2',
          },
          line: 3,
          messageId: 'noMagic',
        },
        {
          column: 21,
          data: {
            raw: '0',
          },
          line: 3,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignoreTypeIndexes: true }],
    },
    {
      code: 'type Foo = 1;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-1] }],
    },
    {
      code: 'type Foo = -2;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [2] }],
    },
    {
      code: 'type Foo = 3n;',
      errors: [
        {
          column: 12,
          data: {
            raw: '3n',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: ['-3n'] }],
    },
    {
      code: 'type Foo = -4n;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-4n',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: ['4n'] }],
    },
    {
      code: 'type Foo = 5.6;',
      errors: [
        {
          column: 12,
          data: {
            raw: '5.6',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-5.6] }],
    },
    {
      code: 'type Foo = -7.8;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-7.8',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [7.8] }],
    },
    {
      code: 'type Foo = 0x0a;',
      errors: [
        {
          column: 12,
          data: {
            raw: '0x0a',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-0x0a] }],
    },
    {
      code: 'type Foo = -0xbc;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-0xbc',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [0xbc] }],
    },
    {
      code: 'type Foo = 1e2;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1e2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-1e2] }],
    },
    {
      code: 'type Foo = -3e4;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-3e4',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [3e4] }],
    },
    {
      code: 'type Foo = 5e-6;',
      errors: [
        {
          column: 12,
          data: {
            raw: '5e-6',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-5e-6] }],
    },
    {
      code: 'type Foo = -7e-8;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-7e-8',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [7e-8] }],
    },
    {
      code: 'type Foo = 1.1e2;',
      errors: [
        {
          column: 12,
          data: {
            raw: '1.1e2',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-1.1e2] }],
    },
    {
      code: 'type Foo = -3.1e4;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-3.1e4',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [3.1e4] }],
    },
    {
      code: 'type Foo = 5.1e-6;',
      errors: [
        {
          column: 12,
          data: {
            raw: '5.1e-6',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [-5.1e-6] }],
    },
    {
      code: 'type Foo = -7.1e-8;',
      errors: [
        {
          column: 12,
          data: {
            raw: '-7.1e-8',
          },
          line: 1,
          messageId: 'noMagic',
        },
      ],
      options: [{ ignore: [7.1e-8] }],
    },
  ],
});
