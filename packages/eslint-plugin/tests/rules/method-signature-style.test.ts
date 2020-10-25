import rule from '../../src/rules/method-signature-style';
import { batchedSingleLineTests, noFormat, RuleTester } from '../RuleTester';

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
    'type Test = { readonly f: (a: string) => number };',
    "type Test = { ['f']?: (a: boolean) => void };",
    'type Test = { readonly f?: <T>(a?: T) => T };',
    "type Test = { readonly ['f']?: <T>(a: T, b: T) => T };",
    ...batchedSingleLineTests({
      options: ['method'],
      code: noFormat`
        interface Test { f(a: string): number }
        interface Test { ['f'](a: boolean): void }
        interface Test { f<T>(a: T): T }
        interface Test { ['f']<T extends {}>(a: T, b: T): T }
        interface Test { 'f!'</* a */>(/* b */ x: any /* c */): void }
        type Test = { readonly f(a: string): number }
        type Test = { ['f']?(a: boolean): void }
        type Test = { readonly f?<T>(a?: T): T }
        type Test = { readonly ['f']?<T>(a: T, b: T): T }
      `,
    }),
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: noFormat`
        interface Test { f(a: string): number }
        interface Test { ['f'](a: boolean): void }
        interface Test { f<T>(a: T): T }
        interface Test { ['f']<T extends {}>(a: T, b: T): T }
        interface Test { 'f!'</* a */>(/* b */ x: any /* c */): void }
        type Test = { readonly f(a: string): number }
        type Test = { ['f']?(a: boolean): void }
        type Test = { readonly f?<T>(a?: T): T }
        type Test = { readonly ['f']?<T>(a: T, b: T): T }
      `,
      errors: [
        { messageId: 'errorMethod', line: 2 },
        { messageId: 'errorMethod', line: 3 },
        { messageId: 'errorMethod', line: 4 },
        { messageId: 'errorMethod', line: 5 },
        { messageId: 'errorMethod', line: 6 },
        { messageId: 'errorMethod', line: 7 },
        { messageId: 'errorMethod', line: 8 },
        { messageId: 'errorMethod', line: 9 },
        { messageId: 'errorMethod', line: 10 },
      ],
      output: noFormat`
        interface Test { f: (a: string) => number }
        interface Test { ['f']: (a: boolean) => void }
        interface Test { f: <T>(a: T) => T }
        interface Test { ['f']: <T extends {}>(a: T, b: T) => T }
        interface Test { 'f!': </* a */>(/* b */ x: any /* c */) => void }
        type Test = { readonly f: (a: string) => number }
        type Test = { ['f']?: (a: boolean) => void }
        type Test = { readonly f?: <T>(a?: T) => T }
        type Test = { readonly ['f']?: <T>(a: T, b: T) => T }
      `,
    }),
    ...batchedSingleLineTests({
      options: ['method'],
      code: noFormat`
        interface Test { f: (a: string) => number }
        interface Test { ['f']: (a: boolean) => void }
        interface Test { f: <T>(a: T) => T }
        interface Test { ['f']: <T extends {}>(a: T, b: T) => T }
        interface Test { 'f!': </* a */>(/* b */ x: any /* c */) => void }
        type Test = { readonly f: (a: string) => number }
        type Test = { ['f']?: (a: boolean) => void }
        type Test = { readonly f?: <T>(a?: T) => T }
        type Test = { readonly ['f']?: <T>(a: T, b: T) => T }
      `,
      errors: [
        { messageId: 'errorProperty', line: 2 },
        { messageId: 'errorProperty', line: 3 },
        { messageId: 'errorProperty', line: 4 },
        { messageId: 'errorProperty', line: 5 },
        { messageId: 'errorProperty', line: 6 },
        { messageId: 'errorProperty', line: 7 },
        { messageId: 'errorProperty', line: 8 },
        { messageId: 'errorProperty', line: 9 },
        { messageId: 'errorProperty', line: 10 },
      ],
      output: noFormat`
        interface Test { f(a: string): number }
        interface Test { ['f'](a: boolean): void }
        interface Test { f<T>(a: T): T }
        interface Test { ['f']<T extends {}>(a: T, b: T): T }
        interface Test { 'f!'</* a */>(/* b */ x: any /* c */): void }
        type Test = { readonly f(a: string): number }
        type Test = { ['f']?(a: boolean): void }
        type Test = { readonly f?<T>(a?: T): T }
        type Test = { readonly ['f']?<T>(a: T, b: T): T }
      `,
    }),
    {
      code: noFormat`
interface Foo {
  semi(arg: string): void;
  comma(arg: string): void,
  none(arg: string): void
}
      `,
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
      output: noFormat`
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
  ],
});
