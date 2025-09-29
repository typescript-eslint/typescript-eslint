import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-explicit-any';

const ruleTester = new RuleTester();

ruleTester.run('no-explicit-any', rule, {
  valid: [
    'const number: number = 1;',
    'function greet(): string {}',
    'function greet(): Array<string> {}',
    'function greet(): string[] {}',
    'function greet(): Array<Array<string>> {}',
    'function greet(): Array<string[]> {}',
    'function greet(param: Array<string>): Array<string> {}',
    `
class Greeter {
  message: string;
}
    `,
    `
class Greeter {
  message: Array<string>;
}
    `,
    `
class Greeter {
  message: string[];
}
    `,
    `
class Greeter {
  message: Array<Array<string>>;
}
    `,
    `
class Greeter {
  message: Array<string[]>;
}
    `,
    `
interface Greeter {
  message: string;
}
    `,
    `
interface Greeter {
  message: Array<string>;
}
    `,
    `
interface Greeter {
  message: string[];
}
    `,
    `
interface Greeter {
  message: Array<Array<string>>;
}
    `,
    `
interface Greeter {
  message: Array<string[]>;
}
    `,
    `
type obj = {
  message: string;
};
    `,
    `
type obj = {
  message: Array<string>;
};
    `,
    `
type obj = {
  message: string[];
};
    `,
    `
type obj = {
  message: Array<Array<string>>;
};
    `,
    `
type obj = {
  message: Array<string[]>;
};
    `,
    `
type obj = {
  message: string | number;
};
    `,
    `
type obj = {
  message: string | Array<string>;
};
    `,
    `
type obj = {
  message: string | string[];
};
    `,
    `
type obj = {
  message: string | Array<Array<string>>;
};
    `,
    `
type obj = {
  message: string & number;
};
    `,
    `
type obj = {
  message: string & Array<string>;
};
    `,
    `
type obj = {
  message: string & string[];
};
    `,
    `
type obj = {
  message: string & Array<Array<string>>;
};
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/397
    {
      code: `
        function foo(a: number, ...rest: any[]): void {
          return;
        }
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function foo1(...args: any[]) {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const bar1 = function (...args: any[]) {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const baz1 = (...args: any[]) => {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function foo2(...args: readonly any[]) {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const bar2 = function (...args: readonly any[]) {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const baz2 = (...args: readonly any[]) => {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function foo3(...args: Array<any>) {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const bar3 = function (...args: Array<any>) {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const baz3 = (...args: Array<any>) => {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function foo4(...args: ReadonlyArray<any>) {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const bar4 = function (...args: ReadonlyArray<any>) {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const baz4 = (...args: ReadonlyArray<any>) => {};',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Qux1 {
  (...args: any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Qux2 {
  (...args: readonly any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Qux3 {
  (...args: Array<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Qux4 {
  (...args: ReadonlyArray<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quux1(fn: (...args: any[]) => void): void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quux2(fn: (...args: readonly any[]) => void): void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quux3(fn: (...args: Array<any>) => void): void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quux4(fn: (...args: ReadonlyArray<any>) => void): void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quuz1(): (...args: any[]) => void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quuz2(): (...args: readonly any[]) => void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quuz3(): (...args: Array<any>) => void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quuz4(): (...args: ReadonlyArray<any>) => void {}',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Fred1 = (...args: any[]) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Fred2 = (...args: readonly any[]) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Fred3 = (...args: Array<any>) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Fred4 = (...args: ReadonlyArray<any>) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Corge1 = new (...args: any[]) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Corge2 = new (...args: readonly any[]) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Corge3 = new (...args: Array<any>) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Corge4 = new (...args: ReadonlyArray<any>) => void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Grault1 {
  new (...args: any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Grault2 {
  new (...args: readonly any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Grault3 {
  new (...args: Array<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Grault4 {
  new (...args: ReadonlyArray<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Garply1 {
  f(...args: any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Garply2 {
  f(...args: readonly any[]): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Garply3 {
  f(...args: Array<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Garply4 {
  f(...args: ReadonlyArray<any>): void;
}
      `,
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'declare function waldo1(...args: any[]): void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'declare function waldo2(...args: readonly any[]): void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'declare function waldo3(...args: Array<any>): void;',
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'declare function waldo4(...args: ReadonlyArray<any>): void;',
      options: [{ ignoreRestArgs: true }],
    },
  ],
  invalid: [
    {
      code: 'const number: any = 1;',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'const number: unknown = 1;',
            },
            {
              messageId: 'suggestNever',
              output: 'const number: never = 1;',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(): any {}',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(): unknown {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(): never {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(): Array<any> {}',
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(): Array<unknown> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(): Array<never> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(): any[] {}',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(): unknown[] {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(): never[] {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(param: Array<any>): number {}',
      errors: [
        {
          column: 31,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(param: Array<unknown>): number {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(param: Array<never>): number {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(param: any[]): number {}',
      errors: [
        {
          column: 25,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(param: unknown[]): number {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(param: never[]): number {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(param: Array<any>): Array<any> {}',
      errors: [
        {
          column: 31,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(param: Array<unknown>): Array<any> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(param: Array<never>): Array<any> {}',
            },
          ],
        },
        {
          column: 44,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(param: Array<any>): Array<unknown> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(param: Array<any>): Array<never> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(): Array<Array<any>> {}',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(): Array<Array<unknown>> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(): Array<Array<never>> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function generic(): Array<any[]> {}',
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function generic(): Array<unknown[]> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function generic(): Array<never[]> {}',
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  constructor(param: Array<any>) {}
}
      `,
      errors: [
        {
          column: 28,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  constructor(param: Array<unknown>) {}
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  constructor(param: Array<never>) {}
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  message: any;
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  message: unknown;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  message: never;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  message: Array<any>;
}
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  message: Array<unknown>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  message: Array<never>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  message: any[];
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  message: unknown[];
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  message: never[];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  message: Array<Array<any>>;
}
      `,
      errors: [
        {
          column: 24,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  message: Array<Array<unknown>>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  message: Array<Array<never>>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Greeter {
  message: Array<any[]>;
}
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
class Greeter {
  message: Array<unknown[]>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
class Greeter {
  message: Array<never[]>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Greeter {
  message: any;
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Greeter {
  message: unknown;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Greeter {
  message: never;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Greeter {
  message: Array<any>;
}
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Greeter {
  message: Array<unknown>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Greeter {
  message: Array<never>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Greeter {
  message: any[];
}
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Greeter {
  message: unknown[];
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Greeter {
  message: never[];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Greeter {
  message: Array<Array<any>>;
}
      `,
      errors: [
        {
          column: 24,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Greeter {
  message: Array<Array<unknown>>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Greeter {
  message: Array<Array<never>>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Greeter {
  message: Array<any[]>;
}
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Greeter {
  message: Array<unknown[]>;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Greeter {
  message: Array<never[]>;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: any;
};
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: unknown;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: never;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: Array<any>;
};
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: Array<unknown>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: Array<never>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: any[];
};
      `,
      errors: [
        {
          column: 12,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: unknown[];
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: never[];
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: Array<Array<any>>;
};
      `,
      errors: [
        {
          column: 24,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: Array<Array<unknown>>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: Array<Array<never>>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: Array<any[]>;
};
      `,
      errors: [
        {
          column: 18,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: Array<unknown[]>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: Array<never[]>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string | any;
};
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string | unknown;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string | never;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string | Array<any>;
};
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string | Array<unknown>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string | Array<never>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string | any[];
};
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string | unknown[];
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string | never[];
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string | Array<Array<any>>;
};
      `,
      errors: [
        {
          column: 33,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string | Array<Array<unknown>>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string | Array<Array<never>>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string | Array<any[]>;
};
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string | Array<unknown[]>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string | Array<never[]>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string & any;
};
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string & unknown;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string & never;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string & Array<any>;
};
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string & Array<unknown>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string & Array<never>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string & any[];
};
      `,
      errors: [
        {
          column: 21,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string & unknown[];
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string & never[];
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string & Array<Array<any>>;
};
      `,
      errors: [
        {
          column: 33,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string & Array<Array<unknown>>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string & Array<Array<never>>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type obj = {
  message: string & Array<any[]>;
};
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
type obj = {
  message: string & Array<unknown[]>;
};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
type obj = {
  message: string & Array<never[]>;
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'class Foo<t = any> extends Bar<any> {}',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'class Foo<t = unknown> extends Bar<any> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'class Foo<t = never> extends Bar<any> {}',
            },
          ],
        },
        {
          column: 32,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'class Foo<t = any> extends Bar<unknown> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'class Foo<t = any> extends Bar<never> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'abstract class Foo<t = any> extends Bar<any> {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'abstract class Foo<t = unknown> extends Bar<any> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'abstract class Foo<t = never> extends Bar<any> {}',
            },
          ],
        },
        {
          column: 41,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'abstract class Foo<t = any> extends Bar<unknown> {}',
            },
            {
              messageId: 'suggestNever',
              output: 'abstract class Foo<t = any> extends Bar<never> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'abstract class Foo<t = any> implements Bar<any>, Baz<any> {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output:
                'abstract class Foo<t = unknown> implements Bar<any>, Baz<any> {}',
            },
            {
              messageId: 'suggestNever',
              output:
                'abstract class Foo<t = never> implements Bar<any>, Baz<any> {}',
            },
          ],
        },
        {
          column: 44,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output:
                'abstract class Foo<t = any> implements Bar<unknown>, Baz<any> {}',
            },
            {
              messageId: 'suggestNever',
              output:
                'abstract class Foo<t = any> implements Bar<never>, Baz<any> {}',
            },
          ],
        },
        {
          column: 54,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output:
                'abstract class Foo<t = any> implements Bar<any>, Baz<unknown> {}',
            },
            {
              messageId: 'suggestNever',
              output:
                'abstract class Foo<t = any> implements Bar<any>, Baz<never> {}',
            },
          ],
        },
      ],
    },
    {
      code: 'new Foo<any>();',
      errors: [
        {
          column: 9,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'new Foo<unknown>();',
            },
            {
              messageId: 'suggestNever',
              output: 'new Foo<never>();',
            },
          ],
        },
      ],
    },
    {
      code: 'Foo<any>();',
      errors: [
        {
          column: 5,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'Foo<unknown>();',
            },
            {
              messageId: 'suggestNever',
              output: 'Foo<never>();',
            },
          ],
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/64
      code: `
function test<T extends Partial<any>>() {}
const test = <T extends Partial<any>>() => {};
      `,
      errors: [
        {
          column: 33,
          line: 2,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
function test<T extends Partial<unknown>>() {}
const test = <T extends Partial<any>>() => {};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
function test<T extends Partial<never>>() {}
const test = <T extends Partial<any>>() => {};
      `,
            },
          ],
        },
        {
          column: 33,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
function test<T extends Partial<any>>() {}
const test = <T extends Partial<unknown>>() => {};
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
function test<T extends Partial<any>>() {}
const test = <T extends Partial<never>>() => {};
      `,
            },
          ],
        },
      ],
    },
    {
      // https://github.com/eslint/typescript-eslint-parser/issues/397
      code: `
        function foo(a: number, ...rest: any[]): void {
          return;
        }
      `,
      errors: [
        {
          column: 42,
          line: 2,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
        function foo(a: number, ...rest: unknown[]): void {
          return;
        }
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
        function foo(a: number, ...rest: never[]): void {
          return;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'type Any = any;',
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'type Any = unknown;',
            },
            {
              messageId: 'suggestNever',
              output: 'type Any = never;',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function foo5(...args: any) {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function foo5(...args: unknown) {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function foo5(...args: never) {}',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const bar5 = function (...args: any) {};',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'const bar5 = function (...args: unknown) {};',
            },
            {
              messageId: 'suggestNever',
              output: 'const bar5 = function (...args: never) {};',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'const baz5 = (...args: any) => {};',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'const baz5 = (...args: unknown) => {};',
            },
            {
              messageId: 'suggestNever',
              output: 'const baz5 = (...args: never) => {};',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Qux5 {
  (...args: any): void;
}
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Qux5 {
  (...args: unknown): void;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Qux5 {
  (...args: never): void;
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quux5(fn: (...args: any) => void): void {}',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function quux5(fn: (...args: unknown) => void): void {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function quux5(fn: (...args: never) => void): void {}',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'function quuz5(): (...args: any) => void {}',
      errors: [
        {
          column: 29,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'function quuz5(): (...args: unknown) => void {}',
            },
            {
              messageId: 'suggestNever',
              output: 'function quuz5(): (...args: never) => void {}',
            },
          ],
        },
      ],
    },
    {
      code: 'type Fred5 = (...args: any) => void;',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'type Fred5 = (...args: unknown) => void;',
            },
            {
              messageId: 'suggestNever',
              output: 'type Fred5 = (...args: never) => void;',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Corge5 = new (...args: any) => void;',
      errors: [
        {
          column: 29,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'type Corge5 = new (...args: unknown) => void;',
            },
            {
              messageId: 'suggestNever',
              output: 'type Corge5 = new (...args: never) => void;',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Grault5 {
  new (...args: any): void;
}
      `,
      errors: [
        {
          column: 17,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Grault5 {
  new (...args: unknown): void;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Grault5 {
  new (...args: never): void;
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: `
interface Garply5 {
  f(...args: any): void;
}
      `,
      errors: [
        {
          column: 14,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
interface Garply5 {
  f(...args: unknown): void;
}
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
interface Garply5 {
  f(...args: never): void;
}
      `,
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'declare function waldo5(...args: any): void;',
      errors: [
        {
          column: 34,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: 'declare function waldo5(...args: unknown): void;',
            },
            {
              messageId: 'suggestNever',
              output: 'declare function waldo5(...args: never): void;',
            },
          ],
        },
      ],
      options: [{ ignoreRestArgs: true }],
    },
    {
      code: 'type Keys = keyof any;',
      errors: [
        {
          column: 19,
          line: 1,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestPropertyKey',
              output: 'type Keys = PropertyKey;',
            },
          ],
        },
      ],
    },
    {
      code: `
const integer = <
  TKey extends keyof any,
  TTarget extends { [K in TKey]: number },
>(
  target: TTarget,
  key: TKey,
) => {
  /* ... */
};
      `,
      errors: [
        {
          column: 22,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestPropertyKey',
              output: `
const integer = <
  TKey extends PropertyKey,
  TTarget extends { [K in TKey]: number },
>(
  target: TTarget,
  key: TKey,
) => {
  /* ... */
};
      `,
            },
          ],
        },
      ],
    },
    {
      code: '// fixToUnknown: true\ntype Keys = keyof any;',
      errors: [
        {
          column: 19,
          line: 2,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestPropertyKey',
              output: '// fixToUnknown: true\ntype Keys = PropertyKey;',
            },
          ],
        },
      ],
      options: [{ fixToUnknown: true }],
      output: '// fixToUnknown: true\ntype Keys = PropertyKey;',
    },
    {
      code: `
// fixToUnknown: true
const integer = <
  TKey extends keyof any,
  TTarget extends { [K in TKey]: number },
>(
  target: TTarget,
  key: TKey,
) => {
  /* ... */
};
      `,
      errors: [
        {
          column: 22,
          line: 4,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestPropertyKey',
              output: `
// fixToUnknown: true
const integer = <
  TKey extends PropertyKey,
  TTarget extends { [K in TKey]: number },
>(
  target: TTarget,
  key: TKey,
) => {
  /* ... */
};
      `,
            },
          ],
        },
      ],
      options: [{ fixToUnknown: true }],
      output: `
// fixToUnknown: true
const integer = <
  TKey extends PropertyKey,
  TTarget extends { [K in TKey]: number },
>(
  target: TTarget,
  key: TKey,
) => {
  /* ... */
};
      `,
    },
    {
      code: `
// fixToUnknown: true
const number: any = 1;
      `,
      errors: [
        {
          column: 15,
          line: 3,
          messageId: 'unexpectedAny',
          suggestions: [
            {
              messageId: 'suggestUnknown',
              output: `
// fixToUnknown: true
const number: unknown = 1;
      `,
            },
            {
              messageId: 'suggestNever',
              output: `
// fixToUnknown: true
const number: never = 1;
      `,
            },
          ],
        },
      ],
      options: [{ fixToUnknown: true }],
      output: `
// fixToUnknown: true
const number: unknown = 1;
      `,
    },
  ],
});
