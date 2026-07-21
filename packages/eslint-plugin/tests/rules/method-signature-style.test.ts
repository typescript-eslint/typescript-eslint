import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/method-signature-style';

const ruleTester = new RuleTester();

ruleTester.run('method-signature-style', rule, {
  valid: [
    `
interface Test {
  f: (a: string) => number;
}
    `,
    `
interface Test {
  ['f']: (a: boolean) => void;
}
    `,
    `
interface Test {
  f: <T>(a: T) => T;
}
    `,
    `
interface Test {
  ['f']: <T extends {}>(a: T, b: T) => T;
}
    `,
    `
interface Test {
  'f!': </* a */ T>(/* b */ x: any /* c */) => void;
}
    `,
    `
interface Test {
  get f(): number;
}
    `,
    `
interface Test {
  set f(value: number): void;
}
    `,
    'type Test = { readonly f: (a: string) => number };',
    "type Test = { ['f']?: (a: boolean) => void };",
    'type Test = { readonly f?: <T>(a?: T) => T };',
    "type Test = { readonly ['f']?: <T>(a: T, b: T) => T };",
    'type Test = { get f(): number };',
    'type Test = { set f(value: number): void };',
    {
      code: `
        interface Test {
          f(a: string): number;
        }
      `,
      options: ['method'],
    },
    {
      code: `
        interface Test {
          ['f'](a: boolean): void;
        }
      `,
      options: ['method'],
    },
    {
      code: `
        interface Test {
          f<T>(a: T): T;
        }
      `,
      options: ['method'],
    },
    {
      code: `
        interface Test {
          ['f']<T extends {}>(a: T, b: T): T;
        }
      `,
      options: ['method'],
    },
    {
      code: `
        interface Test {
          'f!'</* a */ T>(/* b */ x: any /* c */): void;
        }
      `,
      options: ['method'],
    },
    {
      code: `
        type Test = { f(a: string): number };
      `,
      options: ['method'],
    },
    {
      code: `
        type Test = { ['f']?(a: boolean): void };
      `,
      options: ['method'],
    },
    {
      code: `
        type Test = { f?<T>(a?: T): T };
      `,
      options: ['method'],
    },
    {
      code: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
      options: ['method'],
    },
    `
      interface Test {
        get f(): number;
      }
    `,
    `
      interface Test {
        set f(value: number): void;
      }
    `,
    {
      code: `
        type Test = { get f(): number };
      `,
      options: ['method'],
    },
    {
      code: `
        type Test = { set f(value: number): void };
      `,
      options: ['method'],
    },
  ],
  invalid: [
    {
      code: `
        interface Test {
          f(a: string): number;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
        interface Test {
          f: (a: string) => number;
        }
      `,
    },
    {
      code: `
        interface Test {
          ['f'](a: boolean): void;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
        interface Test {
          ['f']: (a: boolean) => void;
        }
      `,
    },
    {
      code: `
        interface Test {
          f<T>(a: T): T;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
        interface Test {
          f: <T>(a: T) => T;
        }
      `,
    },
    {
      code: `
        interface Test {
          ['f']<T extends {}>(a: T, b: T): T;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
        interface Test {
          ['f']: <T extends {}>(a: T, b: T) => T;
        }
      `,
    },
    {
      code: `
        interface Test {
          'f!'</* a */ T>(/* b */ x: any /* c */): void;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 57,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
        interface Test {
          'f!': </* a */ T>(/* b */ x: any /* c */) => void;
        }
      `,
    },
    {
      code: `
        type Test = { f(a: string): number };
      `,
      errors: [
        {
          column: 23,
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'errorMethod',
        },
      ],
      output: `
        type Test = { f: (a: string) => number };
      `,
    },
    {
      code: `
        type Test = { ['f']?(a: boolean): void };
      `,
      errors: [
        {
          column: 23,
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'errorMethod',
        },
      ],
      output: `
        type Test = { ['f']?: (a: boolean) => void };
      `,
    },
    {
      code: `
        type Test = { f?<T>(a?: T): T };
      `,
      errors: [
        {
          column: 23,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'errorMethod',
        },
      ],
      output: `
        type Test = { f?: <T>(a?: T) => T };
      `,
    },
    {
      code: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
      errors: [
        {
          column: 23,
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'errorMethod',
        },
      ],
      output: `
        type Test = { ['f']?: <T>(a: T, b: T) => T };
      `,
    },
    {
      code: `
        interface Test {
          f: (a: string) => number;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        interface Test {
          f(a: string): number;
        }
      `,
    },
    {
      code: `
        interface Test {
          ['f']: (a: boolean) => void;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        interface Test {
          ['f'](a: boolean): void;
        }
      `,
    },
    {
      code: `
        interface Test {
          f: <T>(a: T) => T;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        interface Test {
          f<T>(a: T): T;
        }
      `,
    },
    {
      code: `
        interface Test {
          ['f']: <T extends {}>(a: T, b: T) => T;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        interface Test {
          ['f']<T extends {}>(a: T, b: T): T;
        }
      `,
    },
    {
      code: `
        interface Test {
          'f!': </* a */ T>(/* b */ x: any /* c */) => void;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 61,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        interface Test {
          'f!'</* a */ T>(/* b */ x: any /* c */): void;
        }
      `,
    },
    {
      code: `
        type Test = { f: (a: string) => number };
      `,
      errors: [
        {
          column: 23,
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        type Test = { f(a: string): number };
      `,
    },
    {
      code: `
        type Test = { ['f']?: (a: boolean) => void };
      `,
      errors: [
        {
          column: 23,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        type Test = { ['f']?(a: boolean): void };
      `,
    },
    {
      code: `
        type Test = { f?: <T>(a?: T) => T };
      `,
      errors: [
        {
          column: 23,
          endColumn: 42,
          endLine: 2,
          line: 2,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        type Test = { f?<T>(a?: T): T };
      `,
    },
    {
      code: `
        type Test = { ['f']?: <T>(a: T, b: T) => T };
      `,
      errors: [
        {
          column: 23,
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
    },
    {
      code: 'type Test = { readonly f: (a: string) => number };',
      errors: [
        {
          column: 15,
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'errorProperty',
          suggestions: [
            {
              messageId: 'convertToMethodSignature',
              output: 'type Test = { f(a: string): number };',
            },
          ],
        },
      ],
      options: ['method'],
      output: null,
    },
    {
      code: 'type Test = { readonly f?: <T>(a?: T) => T };',
      errors: [
        {
          column: 15,
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'errorProperty',
          suggestions: [
            {
              messageId: 'convertToMethodSignature',
              output: 'type Test = { f?<T>(a?: T): T };',
            },
          ],
        },
      ],
      options: ['method'],
      output: null,
    },
    {
      code: "type Test = { readonly ['f']?: <T>(a: T, b: T) => T };",
      errors: [
        {
          column: 15,
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'errorProperty',
          suggestions: [
            {
              messageId: 'convertToMethodSignature',
              output: "type Test = { ['f']?<T>(a: T, b: T): T };",
            },
          ],
        },
      ],
      options: ['method'],
      output: null,
    },
    {
      code: `
        interface Test {
          readonly f: (a: string) => number;
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
          suggestions: [
            {
              messageId: 'convertToMethodSignature',
              output: `
        interface Test {
          f(a: string): number;
        }
      `,
            },
          ],
        },
      ],
      options: ['method'],
      output: null,
    },
    {
      code: noFormat`
interface Foo {
  semi(arg: string): void;
  comma(arg: string): void,
  none(arg: string): void
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  semi: (arg: string) => void;
  comma: (arg: string) => void,
  none: (arg: string) => void
}
      `,
    },
    {
      code: noFormat`
interface Foo {
  semi: (arg: string) => void;
  comma: (arg: string) => void,
  none: (arg: string) => void
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'errorProperty',
        },
        {
          column: 3,
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'errorProperty',
        },
        {
          column: 3,
          endColumn: 30,
          endLine: 5,
          line: 5,
          messageId: 'errorProperty',
        },
      ],
      options: ['method'],
      output: `
interface Foo {
  semi(arg: string): void;
  comma(arg: string): void,
  none(arg: string): void
}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1857
    {
      code: noFormat`
interface Foo {
  x(
    args: Pick<
      Bar,
      'one' | 'two' | 'three'
    >,
  ): Baz;
  y(
    foo: string,
    bar: number,
  ): void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 10,
          endLine: 8,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 11,
          endLine: 12,
          line: 9,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  x: (
    args: Pick<
      Bar,
      'one' | 'two' | 'three'
    >,
  ) => Baz;
  y: (
    foo: string,
    bar: number,
  ) => void;
}
      `,
    },
    {
      code: `
interface Foo {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
    },
    {
      code: `
interface Foo {
  foo(bar: string): one;
  foo(bar: number, baz: string): two;
  foo(): three;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  foo: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
}
      `,
    },
    {
      code: `
interface Foo {
  [foo](bar: string): one;
  [foo](bar: number, baz: string): two;
  [foo](): three;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  [foo]: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
}
      `,
    },
    {
      code: `
interface Foo {
  [foo](bar: string): one;
  [foo](bar: number, baz: string): two;
  [foo](): three;
  bar(arg: string): void;
  bar(baz: number): Foo;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 26,
          endLine: 6,
          line: 6,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 25,
          endLine: 7,
          line: 7,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface Foo {
  [foo]: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
  bar: ((arg: string) => void) & ((baz: number) => Foo);
}
      `,
    },
    {
      code: noFormat`
        declare global {
          namespace jest {
            interface Matchers<R, T> {
              // Add overloads specific to the DOM
              toHaveProp<K extends keyof DomPropsOf<T>>(name: K, value?: DomPropsOf<T>[K]): R;
              toHaveProps(props: Partial<DomPropsOf<T>>): R;
            }
          }
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 95,
          endLine: 6,
          line: 6,
          messageId: 'errorMethod',
        },
        {
          column: 15,
          endColumn: 61,
          endLine: 7,
          line: 7,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
    {
      code: noFormat`
type Foo = {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
type Foo = {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
    },
    {
      code: noFormat`
declare const Foo: {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'errorMethod',
        },
      ],
      output: `
declare const Foo: {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2834
    {
      code: `
interface MyInterface {
  methodReturningImplicitAny();
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: `
interface MyInterface {
  methodReturningImplicitAny: () => any;
}
      `,
    },
    {
      code: `
interface Test {
  f(value: number): this;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
    {
      code: `
interface Test {
  foo(): this;
  foo(): Promise<this>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
    {
      code: `
interface Test {
  f(value: number): this | undefined;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
    {
      code: `
interface Test {
  f(value: number): Promise<this>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
    {
      code: `
interface Test {
  f(value: number): Promise<this | undefined>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'errorMethod',
        },
      ],
      output: null,
    },
  ],
});
