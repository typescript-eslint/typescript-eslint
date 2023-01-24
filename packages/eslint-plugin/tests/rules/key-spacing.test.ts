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
      code: `
interface X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  "a:b": number;
  abcde: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
let x: {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
let x: {
  a:   number;
  "𐌘": string;
  [𐌘]: Date;
  "🌷": "bar", // 2 code points
  "🎁": "baz", // 2 code points
  "🇮🇳": "qux", // 4 code points
  "🏳️‍🌈": "xyz", // 6 code points
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a: number;
  abc: string; c: number;
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a: number;
  abc: string; c: number; de: boolean;
  abcef: number;
};
      `,
      options: [{ align: 'colon' }],
    },
    {
      code: `
interface X {
  a?:  number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a:   number;
  // Some comment
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a:   number;
  // Some comment
  // on multiple lines
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a:   number;
  /**
   * Some comment
   * on multiple lines
   */
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a:   number;
  /**
   * Doc comment
  */
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  a: number;

  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
class X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
class X {
  a?:  number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
class X {
  x:     number;
  z = 1;
  xbcef: number;
  }
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
class X {
  a: number;

  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
type X = {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
type X = {
  a: number;

  abc: string
};
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
type X = {
  a :  number;
  abc: string
};
      `,
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
      code: `
interface X {
  a  : number;
  abc: string
};
      `,
      options: [{ align: 'colon' }],
    },
    {
      code: `
interface X {
  a  :number;
  abc:string
};
      `,
      options: [{ align: 'colon', afterColon: false }],
    },
    {
      code: `
interface X {
  a  :   number;
  abc: string
};
      `,
      options: [{ align: 'colon', mode: 'minimum' }],
    },
    // no align
    {
      code: `
interface X {
  a: number;
  abc: string
};
      `,
      options: [{}],
    },
    {
      code: `
interface X {
  a : number;
  abc : string
};
      `,
      options: [{ beforeColon: true }],
    },
    // singleLine / multiLine
    {
      code: `
interface X {
  a : number;
  abc : string
};
      `,
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
    },
    {
      code: `
interface X {
  a :   number;
  abc : string
};
      `,
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: true, afterColon: true, align: 'value' },
        },
      ],
    },
    {
      code: `
interface X {
  a   : number;
  abc : string
};
      `,
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
      code: `
interface X {
  a  : number;
  abc: string

  xadzd : number;
};
      `,
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
      code: `
interface X { a:number; abc:string; };
      `,
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
      code: `
interface X {
  a: number;
  abc: string
};
      `,
      output: `
interface X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
interface X {
  a: number;
  "a:c": string
};
      `,
      output: `
interface X {
  a:     number;
  "a:c": string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
let x: {
  a: number;
  abc: string
};
      `,
      output: `
let x: {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
let x: {
  a: number;
  "🌷": "bar", // 2 code points
  "🎁": "baz", // 2 code points
  "🇮🇳": "qux", // 4 code points
  "🏳️‍🌈": "xyz", // 6 code points
  [𐌘]: string
  "𐌘": string
};
      `,
      output: `
let x: {
  a:   number;
  "🌷": "bar", // 2 code points
  "🎁": "baz", // 2 code points
  "🇮🇳": "qux", // 4 code points
  "🏳️‍🌈": "xyz", // 6 code points
  [𐌘]: string
  "𐌘": string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
class X {
  a: number;
  abc: string
};
      `,
      output: `
class X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
class X {
  a: number;
  abc: string
};
      `,
      output: `
class X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value', mode: 'minimum' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
type X = {
  a: number;
  abc: string
};
      `,
      output: `
type X = {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
interface X {
  a:   number;
  abc:  string
};
      `,
      output: `
interface X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
class X {
  a:   number;
  abc:  string
};
      `,
      output: `
class X {
  a:   number;
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
class X {
  x:   number;
  z = 1;
  xbcef: number;
  }
      `,
      output: `
class X {
  x:     number;
  z = 1;
  xbcef: number;
  }
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: `
interface X {
  a:   number;

  abc     : string
};
      `,
      output: `
interface X {
  a: number;

  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }, { messageId: 'extraKey' }],
    },
    {
      code: `
class X {
  a:   number;

  abc     : string
};
      `,
      output: `
class X {
  a: number;

  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }, { messageId: 'extraKey' }],
    },
    {
      code: `
interface X {
  a:   number;
  // Some comment

  // interrupted in the middle
  abc: string
};
      `,
      output: `
interface X {
  a: number;
  // Some comment

  // interrupted in the middle
  abc: string
};
      `,
      options: [{ align: 'value' }],
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
interface X {
  a:   number;
  /**
   * Multiline comment
   */

  /** interrupted in the middle */
  abc: string
};
      `,
      output: `
interface X {
  a: number;
  /**
   * Multiline comment
   */

  /** interrupted in the middle */
  abc: string
};
      `,
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
      code: `
interface X {
  a   : number;
  abc: string
};
      `,
      output: `
interface X {
  a  : number;
  abc: string
};
      `,
      options: [{ align: 'colon' }],
      errors: [{ messageId: 'extraKey' }],
    },
    // no align
    {
      code: `
interface X {
  [x: number]:  string;
}
      `,
      output: `
interface X {
  [x: number]: string;
}
      `,
      errors: [{ messageId: 'extraValue' }],
    },
    {
      code: `
interface X {
  [x: number]:string;
}
      `,
      output: `
interface X {
  [x: number]: string;
}
      `,
      errors: [{ messageId: 'missingValue' }],
    },
    // singleLine / multiLine
    {
      code: `
interface X {
  a:number;
  abc:string
};
      `,
      output: `
interface X {
  a : number;
  abc : string
};
      `,
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
      code: `
interface X { a : number; abc : string; };
      `,
      output: `
interface X { a:number; abc:string; };
      `,
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
      code: `
interface X { a : number; abc : string; };
      `,
      output: `
interface X { a: number; abc: string; };
      `,
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
