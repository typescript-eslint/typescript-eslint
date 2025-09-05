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
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorMethod' }],
      output: `
        type Test = { f: (a: string) => number };
      `,
    },
    {
      code: `
        type Test = { ['f']?(a: boolean): void };
      `,
      errors: [{ messageId: 'errorMethod' }],
      output: `
        type Test = { ['f']?: (a: boolean) => void };
      `,
    },
    {
      code: `
        type Test = { f?<T>(a?: T): T };
      `,
      errors: [{ messageId: 'errorMethod' }],
      output: `
        type Test = { f?: <T>(a?: T) => T };
      `,
    },
    {
      code: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
      errors: [{ messageId: 'errorMethod' }],
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
      errors: [{ messageId: 'errorProperty' }],
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
      errors: [{ messageId: 'errorProperty' }],
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
      errors: [{ messageId: 'errorProperty' }],
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
      errors: [{ messageId: 'errorProperty' }],
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
      errors: [{ messageId: 'errorProperty' }],
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
      errors: [{ messageId: 'errorProperty' }],
      options: ['method'],
      output: `
        type Test = { f(a: string): number };
      `,
    },
    {
      code: `
        type Test = { ['f']?: (a: boolean) => void };
      `,
      errors: [{ messageId: 'errorProperty' }],
      options: ['method'],
      output: `
        type Test = { ['f']?(a: boolean): void };
      `,
    },
    {
      code: `
        type Test = { f?: <T>(a?: T) => T };
      `,
      errors: [{ messageId: 'errorProperty' }],
      options: ['method'],
      output: `
        type Test = { f?<T>(a?: T): T };
      `,
    },
    {
      code: `
        type Test = { ['f']?: <T>(a: T, b: T) => T };
      `,
      errors: [{ messageId: 'errorProperty' }],
      options: ['method'],
      output: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorProperty',
        },
        {
          line: 4,
          messageId: 'errorProperty',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
          line: 5,
          messageId: 'errorMethod',
        },
        {
          line: 6,
          messageId: 'errorMethod',
        },
        {
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
          line: 6,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
          line: 3,
          messageId: 'errorMethod',
        },
        {
          line: 4,
          messageId: 'errorMethod',
        },
        {
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
  ],
});
