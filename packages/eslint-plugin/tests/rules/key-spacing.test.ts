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
    // non-applicable
    {
      code: `
interface X {
  x:
    | number
    | string;
}
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  x:
    | number
    | string;
}
      `,
      options: [{}],
    },
    {
      code: `
interface X {
  abcdef: string;
  x:
    | number
    | string;
  defgh: string;
}
      `,
      options: [{ align: 'value' }],
    },
    {
      code: `
interface X {
  x:
    | number; abcd: string;
}
      `,
      options: [{ align: 'value' }],
    },
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
  a    : number;
  abc;
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
type X = {
  a :  number;
  abc: string
};
      `,
      options: [
        {
          align: {
            on: 'value',
            mode: 'minimum',
            beforeColon: false,
            afterColon: true,
          },
        },
      ],
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
          align: { on: 'value', beforeColon: true, afterColon: true },
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: false, afterColon: false },
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
          align: { beforeColon: true, afterColon: true }, // defaults to 'colon'
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: { beforeColon: false, afterColon: false },
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
  a   : number;
  abc : string
};
      `,
      options: [
        {
          beforeColon: true,
          afterColon: true,
          align: {
            on: 'colon',
            mode: 'strict',
            afterColon: true,
            beforeColon: true,
          },
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
          beforeColon: true,
          afterColon: true,
          align: {
            mode: 'strict',
            afterColon: true,
            beforeColon: true,
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
            mode: 'strict',
            align: {
              on: 'colon',
              afterColon: true,
              beforeColon: false,
            },
          },
        },
      ],
    },
    {
      code: `
interface X {
  a  :    number;
  abc: string

  xadzd :    number;
};
      `,
      options: [
        {
          singleLine: { beforeColon: false, afterColon: false },
          multiLine: {
            beforeColon: true,
            afterColon: true,
            mode: 'minimum',
            align: {
              on: 'colon',
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
  abc: string
};
      `,
      output: `
let x: {
  a:   number;
  abc: string
};
      `,
      options: [{ align: { on: 'value' } }],
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
class X {
  a: number;
  b;
  abc: string
};
      `,
      output: `
class X {
  a:   number;
  b;
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
      options: [{ align: { on: 'colon' } }],
      errors: [{ messageId: 'extraKey' }],
    },
    {
      code: `
interface X {
  a   : number;
  abc: string
};
      `,
      output: `
interface X {
  a   : number;
  abc : string
};
      `,
      options: [{ align: 'colon', beforeColon: true, afterColon: true }],
      errors: [{ messageId: 'missingKey' }],
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
    {
      code: `
interface X { a:number; abc:string; };
      `,
      output: `
interface X { a : number; abc : string; };
      `,
      options: [
        {
          singleLine: { beforeColon: true, afterColon: true, mode: 'strict' },
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
interface X { a:number; abc:   string; };
      `,
      output: `
interface X { a : number; abc :   string; };
      `,
      options: [
        {
          singleLine: { beforeColon: true, afterColon: true, mode: 'minimum' },
          multiLine: { beforeColon: true, afterColon: true },
        },
      ],
      errors: [
        { messageId: 'missingKey' },
        { messageId: 'missingValue' },
        { messageId: 'missingKey' },
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
          beforeColon: false,
          afterColon: false,
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
interface X { a:number; abc:string; };
      `,
      output: `
interface X { a : number; abc : string; };
      `,
      options: [
        {
          beforeColon: true,
          afterColon: true,
          mode: 'strict',
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
type Wacky = {
    a: number;
    b: string;
    agc: number;
    middle: Date | {
        inner: {
            a: boolean;
            bc: boolean;
            "🌷": "rose";
        }
        [x: number]: string;
        abc: boolean;
    }
} & {
    a: "string";
    abc: number;
}
      `,
      output: `
type Wacky = {
    a:      number;
    b:      string;
    agc:    number;
    middle: Date | {
        inner: {
            a:   boolean;
            bc:  boolean;
            "🌷": "rose";
        }
        [x: number]: string;
        abc:         boolean;
    }
} & {
    a:   "string";
    abc: number;
}
      `,
      options: [{ align: 'value' }],
      errors: [
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
      ],
    },
    {
      code: `
class Wacky {
    a: number;
    b?: string;
    public z: number;
    abc = 10;
    private override xy: number;
    static x = "test";
    static abcdef: number = 1;
    get fn(): number { return 0; };
    inter: number;
    get fn2(): number {
      return 1;
    };
    agc: number;
    middle: Date | {
        inner: {
            a: boolean;
            bc: boolean;
            "🌷": "rose";
        }
        [x: number]: string;
        abc: boolean;
    }
}
      `,
      output: `
class Wacky {
    a:                   number;
    b?:                  string;
    public z:            number;
    abc = 10;
    private override xy: number;
    static x = "test";
    static abcdef:       number = 1;
    get fn(): number { return 0; };
    inter:               number;
    get fn2(): number {
      return 1;
    };
    agc:    number;
    middle: Date | {
        inner: {
            a:   boolean;
            bc:  boolean;
            "🌷": "rose";
        }
        [x: number]: string;
        abc:         boolean;
    }
}
      `,
      options: [{ align: 'value' }],
      errors: [
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
        { messageId: 'missingValue' },
      ],
    },
  ],
});
