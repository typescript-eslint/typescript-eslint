/* eslint-disable eslint-comments/no-use */
// this rule tests the new lines, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import rule from '../../src/rules/key-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('key-spacing', rule, {
  valid: [
    // align: value
    {
      code: 'interface X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a: number;\n  abc: string; c: number;\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a: number;\n  abc: string; c: number; de: boolean;\n  abcef: number;\n};',
      options: [{ align: 'colon' }],
    },
    {
      code: 'interface X {\n  a?:  number;\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  // Some comment\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  // Some comment\n  // on multiple lines\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  /**\n   * Doc comment\n  */\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'interface X {\n  a: number;\n\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'class X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'class X {\n  a?:  number;\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'class X {\n  x:     number;\n  z = 1;\n  xbcef: number;\n  }',
      options: [{ align: 'value' }],
    },
    {
      code: 'class X {\n  a: number;\n\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'type X = {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'type X = {\n  a: number;\n\n  abc: string\n};',
      options: [{ align: 'value' }],
    },
    {
      code: 'type X = {\n  a :  number;\n  abc: string\n};',
      options: [{ align: 'value', mode: 'minimum' }],
    },
    {
      code: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  };
  abc: string
}
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
class X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  };
  abc: string
  x = 1;
  d:   number;
  z:   number = 1;
  ef:  string;
}
      `,
      options: [{ align: 'value' }],
    },
    // align: colon
    {
      code: 'interface X {\n  a  : number;\n  abc: string\n};',
      options: [{ align: 'colon' }],
    },
    {
      code: 'interface X {\n  a  :number;\n  abc:string\n};',
      options: [{ align: 'colon', afterColon: false }],
    },
    {
      code: 'interface X {\n  a  :   number;\n  abc: string\n};',
      options: [{ align: 'colon', mode: 'minimum' }],
    },
    // no align
    {
      code: 'interface X {\n  a: number;\n  abc: string\n};',
      options: [{}],
    },
    {
      code: 'interface X {\n  a : number;\n  abc : string\n};',
      options: [{ beforeColon: true }],
    },
    // singleLine / multiLine
    {
      code: 'interface X {\n  a : number;\n  abc : string\n};',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
    },
    {
      code: 'interface X {\n  a :   number;\n  abc : string\n};',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true, align: 'value' },
        },
      ],
    },
    {
      code: 'interface X {\n  a   : number;\n  abc : string\n};',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: {
            beforeColon: true,
            afterColon: true,
            align: {
              on: 'colon',
              mode: 'strict',
              afterColon: true,
              beforeColon: true,
            },
          },
        },
      ],
    },
    {
      code: 'interface X {\n  a  : number;\n  abc: string\n\n  xadzd : number;\n};',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: {
            beforeColon: true,
            afterColon: true,
            align: {
              on: 'colon',
              mode: 'strict',
              afterColon: true,
              beforeColon: false,
            },
          },
        },
      ],
    },
    {
      code: 'interface X { a:number; abc:string; };',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
    },
  ],
  invalid: [
    // align: value
    {
      code: 'interface X {\n  a: number;\n  abc: string\n};',
      output: 'interface X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'class X {\n  a: number;\n  abc: string\n};',
      output: 'class X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'class X {\n  a: number;\n  abc: string\n};',
      output: 'class X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value', mode: 'minimum' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'type X = {\n  a: number;\n  abc: string\n};',
      output: 'type X = {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  abc:  string\n};',
      output: 'interface X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: 'class X {\n  a:   number;\n  abc:  string\n};',
      output: 'class X {\n  a:   number;\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: 'class X {\n  x:   number;\n  z = 1;\n  xbcef: number;\n  }',
      output: 'class X {\n  x:     number;\n  z = 1;\n  xbcef: number;\n  }',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'interface X {\n  a:   number;\n\n  abc     : string\n};',
      output: 'interface X {\n  a: number;\n\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }, { messageId: 'extraKey' }],
    },
    {
      code: 'class X {\n  a:   number;\n\n  abc     : string\n};',
      output: 'class X {\n  a: number;\n\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }, { messageId: 'extraKey' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  // Some comment\n\n  // interrupted in the middle\n  abc: string\n};',
      output:
        'interface X {\n  a: number;\n  // Some comment\n\n  // interrupted in the middle\n  abc: string\n};',
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
interface X {
  a:   number;
  prop: {
    abc: number;
    a:   number;
  },
  abc: string
}
      `,
      output: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  },
  abc: string
}
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:  number;
  },
  abc: string
}
      `,
      output: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  },
  abc: string
}
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  },
  abc:  string
}
      `,
      output: `
interface X {
  a:    number;
  prop: {
    abc: number;
    a:   number;
  },
  abc: string
}
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
class X {
  a:      number;
  prop: {
    abc: number;
    a?: number;
  };
  abc: string;
  x = 1;
  d: number;
  z:  number = 1;
  ef: string;
}
      `,
      output: `
class X {
  a:    number;
  prop: {
    abc: number;
    a?:  number;
  };
  abc: string;
  x = 1;
  d:   number;
  z:   number = 1;
  ef:  string;
}
      `,
      options: [{ align: 'value' }],
      errors: [
        { messageId: 'extraValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
      ],
    },
    // align: colon
    {
      code: 'interface X {\n  a   : number;\n  abc: string\n};',
      output: 'interface X {\n  a  : number;\n  abc: string\n};',
      options: [{ align: 'colon' }],
      errors: [{ messageId: 'extraKey' }],
    },
    // no align
    {
      code: 'interface X {\n  [x: number]:  string;\n}',
      output: 'interface X {\n  [x: number]: string;\n}',
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: 'interface X {\n  [x: number]:string;\n}',
      output: 'interface X {\n  [x: number]: string;\n}',
      errors: [{ messageId: 'missingValue' }],
    },
    // singleLine / multiLine
    {
      code: 'interface X {\n  a:number;\n  abc:string\n};',
      output: 'interface X {\n  a : number;\n  abc : string\n};',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
      errors: [
        { messageId: 'missingKey' },
        { messageId: 'missingValue' },
        { messageId: 'missingKey' },
        { messageId: 'missingValue' },
      ],
    },
    {
      code: 'interface X { a : number; abc : string; };',
      output: 'interface X { a:number; abc:string; };',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
      errors: [
        { messageId: 'extraKey' },
        { messageId: 'extraValue' },
        { messageId: 'extraKey' },
        { messageId: 'extraValue' },
      ],
    },
    {
      code: 'interface X { a : number; abc : string; };',
      output: 'interface X { a: number; abc: string; };',
      options: [
        {
          singleLine: { beforeColon: false, afterColon: true },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
      errors: [{ messageId: 'extraKey' }, { messageId: 'extraKey' }],
    },
  ],
});
