import type {
  InvalidTestCase,
  SuggestionOutput,
} from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type { MessageIds, Options } from '../../src/rules/no-explicit-any';

import rule from '../../src/rules/no-explicit-any';

type RuleInvalidTestCase = InvalidTestCase<MessageIds, Options>;
type RuleSuggestionOutput = SuggestionOutput<MessageIds>;

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
  invalid: (
    [
      {
        code: 'const number: any = 1',
        errors: [
          {
            column: 15,
            line: 1,
            messageId: 'unexpectedAny',
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
                output:
                  'function generic(param: Array<unknown>): Array<any> {}',
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
                output:
                  'function generic(param: Array<any>): Array<unknown> {}',
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
            column: 30,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 26,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 26,
            line: 3,
            messageId: 'unexpectedAny',
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
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: any;
}
            `,
        errors: [
          {
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: Array<any>;
}
            `,
        errors: [
          {
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: any[];
}
            `,
        errors: [
          {
            column: 14,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: Array<Array<any>>;
}
            `,
        errors: [
          {
            column: 26,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: Array<any[]>;
}
            `,
        errors: [
          {
            column: 20,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string | any;
}
            `,
        errors: [
          {
            column: 23,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string | Array<any>;
}
            `,
        errors: [
          {
            column: 29,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string | any[];
}
            `,
        errors: [
          {
            column: 23,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string | Array<Array<any>>;
}
            `,
        errors: [
          {
            column: 35,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string | Array<any[]>;
}
            `,
        errors: [
          {
            column: 29,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string & any;
}
            `,
        errors: [
          {
            column: 23,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string & Array<any>;
}
            `,
        errors: [
          {
            column: 29,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string & any[];
}
            `,
        errors: [
          {
            column: 23,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string & Array<Array<any>>;
}
            `,
        errors: [
          {
            column: 35,
            line: 3,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: `
type obj = {
    message: string & Array<any[]>;
}
            `,
        errors: [
          {
            column: 29,
            line: 3,
            messageId: 'unexpectedAny',
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
        code: 'new Foo<any>()',
        errors: [
          {
            column: 9,
            line: 1,
            messageId: 'unexpectedAny',
          },
        ],
      },
      {
        code: 'Foo<any>()',
        errors: [
          {
            column: 5,
            line: 1,
            messageId: 'unexpectedAny',
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
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'const bar5 = function (...args: any) {}',
        errors: [
          {
            column: 33,
            line: 1,
            messageId: 'unexpectedAny',
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'const baz5 = (...args: any) => {}',
        errors: [
          {
            column: 24,
            line: 1,
            messageId: 'unexpectedAny',
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'interface Qux5 { (...args: any): void; }',
        errors: [
          {
            column: 28,
            line: 1,
            messageId: 'unexpectedAny',
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
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'function quuz5(): ((...args: any) => void) {}',
        errors: [
          {
            column: 30,
            line: 1,
            messageId: 'unexpectedAny',
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'type Fred5 = (...args: any) => void;',
        errors: [
          {
            column: 24,
            line: 1,
            messageId: 'unexpectedAny',
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
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'interface Grault5 { new (...args: any): void; }',
        errors: [
          {
            column: 35,
            line: 1,
            messageId: 'unexpectedAny',
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
      {
        code: 'interface Garply5 { f(...args: any): void; }',
        errors: [
          {
            column: 32,
            line: 1,
            messageId: 'unexpectedAny',
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
          },
        ],
        options: [{ ignoreRestArgs: true }],
      },
    ] as RuleInvalidTestCase[]
  ).flatMap(testCase => {
    const suggestions = (code: string): RuleSuggestionOutput[] => [
      {
        messageId: 'suggestUnknown',
        output: code.replace(/any/, 'unknown'),
      },
      {
        messageId: 'suggestNever',
        output: code.replace(/any/, 'never'),
      },
    ];
    const code = `// fixToUnknown: true\n${testCase.code}`;
    return [
      {
        ...testCase,
        errors: testCase.errors.map(e => ({
          ...e,
          suggestions: e.suggestions ?? suggestions(testCase.code),
        })),
      },
      {
        code,
        errors: testCase.errors.map(err => {
          if (err.line == null) {
            return err;
          }

          return {
            ...err,
            line: err.line + 1,
            suggestions:
              err.suggestions?.map(
                (s): RuleSuggestionOutput => ({
                  ...s,
                  output: `// fixToUnknown: true\n${s.output}`,
                }),
              ) ?? suggestions(code),
          };
        }),
        options: [{ ...testCase.options?.[0], fixToUnknown: true }],
        output: code.replaceAll('any', 'unknown'),
      },
    ];
  }),
});
