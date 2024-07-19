import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-magic-numbers';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
      options: [{ ignoreNumericLiteralTypes: true, ignore: [1] }],
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
      options: [{ ignoreEnums: false, ignore: [1000, -1, 2] }],
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
          ignoreReadonlyClassProperties: false,
          ignore: [1, 2, 3, 4, -5, 6, '100n', '-2000n'],
        },
      ],
    },
    {
      code: 'type Foo = Bar[0];',
      options: [{ ignoreTypeIndexes: false, ignore: [0] }],
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
      options: [{ ignoreTypeIndexes: true, ignore: [0, 3] }],
    },
  ],

  invalid: [
    {
      code: 'type Foo = 1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '2',
          },
          line: 1,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '3',
          },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'type Foo = 1 | -1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
interface Foo {
  bar: 1;
}
      `,
      options: [{ ignoreNumericLiteralTypes: true }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 3,
          column: 8,
        },
      ],
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
      options: [{ ignoreEnums: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1000',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 5,
          column: 9,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 6,
          column: 10,
        },
      ],
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
      options: [{ ignoreReadonlyClassProperties: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 3,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '2',
          },
          line: 4,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '3',
          },
          line: 5,
          column: 30,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '4',
          },
          line: 6,
          column: 23,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-5',
          },
          line: 7,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '6',
          },
          line: 8,
          column: 17,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '100n',
          },
          line: 9,
          column: 24,
        },
      ],
    },
    {
      code: 'type Foo = Bar[0];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[-1];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[0xab];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0xab',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[5.6e1];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '5.6e1',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[10n];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '10n',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[1 | -2];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-2',
          },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'type Foo = Bar[1 & -2];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-2',
          },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'type Foo = Bar[1 & number];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'type Foo = Bar[((1 & -2) | 3) | 4];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-2',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '3',
          },
          line: 1,
          column: 28,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '4',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = Parameters<Bar>[2];',
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '2',
          },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: `
type Others = [['a'], ['b']];

type Foo = {
  [K in keyof Others[0]]: Others[K];
};
      `,
      options: [{ ignoreTypeIndexes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0',
          },
          line: 5,
          column: 22,
        },
      ],
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
      options: [{ ignoreTypeIndexes: true }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0',
          },
          line: 3,
          column: 4,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '3',
          },
          line: 3,
          column: 8,
        },
      ],
    },
    {
      code: `
type Foo = {
  [K in 0 | 1 | 2]: 0;
};
      `,
      options: [{ ignoreTypeIndexes: true }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0',
          },
          line: 3,
          column: 9,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 3,
          column: 13,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '2',
          },
          line: 3,
          column: 17,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '0',
          },
          line: 3,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = 1;',
      options: [{ ignore: [-1] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -2;',
      options: [{ ignore: [2] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-2',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 3n;',
      options: [{ ignore: ['-3n'] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '3n',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -4n;',
      options: [{ ignore: ['4n'] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-4n',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 5.6;',
      options: [{ ignore: [-5.6] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '5.6',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -7.8;',
      options: [{ ignore: [7.8] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-7.8',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 0x0a;',
      options: [{ ignore: [-0x0a] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '0x0a',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -0xbc;',
      options: [{ ignore: [0xbc] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-0xbc',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 1e2;',
      options: [{ ignore: [-1e2] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1e2',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -3e4;',
      options: [{ ignore: [3e4] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-3e4',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 5e-6;',
      options: [{ ignore: [-5e-6] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '5e-6',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -7e-8;',
      options: [{ ignore: [7e-8] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-7e-8',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 1.1e2;',
      options: [{ ignore: [-1.1e2] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1.1e2',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -3.1e4;',
      options: [{ ignore: [3.1e4] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-3.1e4',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 5.1e-6;',
      options: [{ ignore: [-5.1e-6] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '5.1e-6',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -7.1e-8;',
      options: [{ ignore: [7.1e-8] }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-7.1e-8',
          },
          line: 1,
          column: 12,
        },
      ],
    },
  ],
});
