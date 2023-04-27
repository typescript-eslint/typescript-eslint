import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/method-signature-style';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
  'f!': </* a */>(/* b */ x: any /* c */) => void;
}
    `,
    {
      code: `
interface Test {
  get f(): number;
}
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      code: `
interface Test {
  set f(value: number): void;
}
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    'type Test = { readonly f: (a: string) => number };',
    "type Test = { ['f']?: (a: boolean) => void };",
    'type Test = { readonly f?: <T>(a?: T) => T };',
    "type Test = { readonly ['f']?: <T>(a: T, b: T) => T };",
    {
      code: 'type Test = { get f(): number };',
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      code: 'type Test = { set f(value: number): void };',
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      options: ['method'],
      code: `
        interface Test {
          f(a: string): number;
        }
      `,
    },
    {
      options: ['method'],
      code: `
        interface Test {
          ['f'](a: boolean): void;
        }
      `,
    },
    {
      options: ['method'],
      code: `
        interface Test {
          f<T>(a: T): T;
        }
      `,
    },
    {
      options: ['method'],
      code: `
        interface Test {
          ['f']<T extends {}>(a: T, b: T): T;
        }
      `,
    },
    {
      options: ['method'],
      code: `
        interface Test {
          'f!'</* a */>(/* b */ x: any /* c */): void;
        }
      `,
    },
    {
      options: ['method'],
      code: `
        type Test = { f(a: string): number };
      `,
    },
    {
      options: ['method'],
      code: `
        type Test = { ['f']?(a: boolean): void };
      `,
    },
    {
      options: ['method'],
      code: `
        type Test = { f?<T>(a?: T): T };
      `,
    },
    {
      options: ['method'],
      code: `
        type Test = { ['f']?<T>(a: T, b: T): T };
      `,
    },
    {
      options: ['method'],
      code: `
        interface Test {
          get f(): number;
        }
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      options: ['method'],
      code: `
        interface Test {
          set f(value: number): void;
        }
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      options: ['method'],
      code: `
        type Test = { get f(): number };
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
    },
    {
      options: ['method'],
      code: `
        type Test = { set f(value: number): void };
      `,
      dependencyConstraints: {
        typescript: '4.3',
      },
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
          'f!'</* a */>(/* b */ x: any /* c */): void;
        }
      `,
      errors: [{ messageId: 'errorMethod' }],
      output: `
        interface Test {
          'f!': </* a */>(/* b */ x: any /* c */) => void;
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
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
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
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
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
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
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
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
      output: `
        interface Test {
          ['f']<T extends {}>(a: T, b: T): T;
        }
      `,
    },
    {
      code: `
        interface Test {
          'f!': </* a */>(/* b */ x: any /* c */) => void;
        }
      `,
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
      output: `
        interface Test {
          'f!'</* a */>(/* b */ x: any /* c */): void;
        }
      `,
    },
    {
      code: `
        type Test = { f: (a: string) => number };
      `,
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
      output: `
        type Test = { f(a: string): number };
      `,
    },
    {
      code: `
        type Test = { ['f']?: (a: boolean) => void };
      `,
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
      output: `
        type Test = { ['f']?(a: boolean): void };
      `,
    },
    {
      code: `
        type Test = { f?: <T>(a?: T) => T };
      `,
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
      output: `
        type Test = { f?<T>(a?: T): T };
      `,
    },
    {
      code: `
        type Test = { ['f']?: <T>(a: T, b: T) => T };
      `,
      options: ['method'],
      errors: [{ messageId: 'errorProperty' }],
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
      output: `
interface Foo {
  semi: (arg: string) => void;
  comma: (arg: string) => void,
  none: (arg: string) => void
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    {
      code: noFormat`
interface Foo {
  semi: (arg: string) => void;
  comma: (arg: string) => void,
  none: (arg: string) => void
}
      `,
      output: `
interface Foo {
  semi(arg: string): void;
  comma(arg: string): void,
  none(arg: string): void
}
      `,
      options: ['method'],
      errors: [
        {
          messageId: 'errorProperty',
          line: 3,
        },
        {
          messageId: 'errorProperty',
          line: 4,
        },
        {
          messageId: 'errorProperty',
          line: 5,
        },
      ],
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
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 9,
        },
      ],
    },
    {
      code: noFormat`
interface Foo {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      output: `
interface Foo {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    {
      code: noFormat`
interface Foo {
  foo(bar: string): one;
  foo(bar: number, baz: string): two;
  foo(): three;
}
      `,
      output: `
interface Foo {
  foo: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    {
      code: noFormat`
interface Foo {
  [foo](bar: string): one;
  [foo](bar: number, baz: string): two;
  [foo](): three;
}
      `,
      output: `
interface Foo {
  [foo]: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    {
      code: noFormat`
interface Foo {
  [foo](bar: string): one;
  [foo](bar: number, baz: string): two;
  [foo](): three;
  bar(arg: string): void;
  bar(baz: number): Foo;
}
      `,
      output: `
interface Foo {
  [foo]: ((bar: string) => one) & ((bar: number, baz: string) => two) & (() => three);
  bar: ((arg: string) => void) & ((baz: number) => Foo);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
        {
          messageId: 'errorMethod',
          line: 6,
        },
        {
          messageId: 'errorMethod',
          line: 7,
        },
      ],
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
          messageId: 'errorMethod',
          line: 6,
        },
        {
          messageId: 'errorMethod',
          line: 7,
        },
      ],
    },
    {
      code: noFormat`
type Foo = {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      output: `
type Foo = {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    {
      code: noFormat`
declare const Foo: {
  foo(): one;
  foo(): two;
  foo(): three;
}
      `,
      output: `
declare const Foo: {
  foo: (() => one) & (() => two) & (() => three);
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
        {
          messageId: 'errorMethod',
          line: 4,
        },
        {
          messageId: 'errorMethod',
          line: 5,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2834
    {
      code: `
interface MyInterface {
  methodReturningImplicitAny();
}
      `,
      output: `
interface MyInterface {
  methodReturningImplicitAny: () => any;
}
      `,
      errors: [
        {
          messageId: 'errorMethod',
          line: 3,
        },
      ],
    },
  ],
});
