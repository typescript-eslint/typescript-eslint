import path from 'path';
import rule from '../../src/rules/no-unnecessary-type-arguments';
import { RuleTester } from '../RuleTester';

const rootDir = path.join(process.cwd(), 'tests/fixtures');
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unnecessary-type-arguments', rule, {
  valid: [
    `f<>();`,
    `f<string>();`,
    `class Foo extends Bar<> {}`,
    `class Foo extends Bar<string> {}`,
    `class Foo implements Bar<> {}`,
    `class Foo implements Bar<string> {}`,
    `function f<T = number>() { }
      f();`,
    `function f<T = number>() { }
      f<string>();`,
    `declare const f: (<T = number>() => void) | null;
      f?.();`,
    `declare const f: (<T = number>() => void) | null;
      f?.<string>();`,
    `declare const f: any;
      f();`,
    `declare const f: any;
      f<string>();`,
    `declare const f: unknown;
      f();`,
    `declare const f: unknown;
      f<string>();`,
    `function g<T = number, U = string>() { }
      g<number, number>();`,
    `declare const g: any;
      g<string, string>();`,
    `declare const g: unknown;
      g<string, string>();`,
    `class C<T = number> { }
      new C<string>();`,
    `declare const C: any;
      new C<string>();`,
    `declare const C: unknown;
      new C<string>();`,
    `class C<T = number> { }
      class D extends C<string> { }`,
    `declare const C: any;
      class D extends C<string> { }`,
    `declare const C: unknown;
      class D extends C<string> { }`,
    `interface I<T = number> { }
      class Impl implements I<string> { }`,
    `class C<TC = number> { }
      class D<TD = number> extends C { }`,
    `declare const C: any;
      class D<TD = number> extends C { }`,
    `declare const C: unknown;
      class D<TD = number> extends C { }`,
    `let a: A<number>`,
    `class Foo<T> {}
      const foo = new Foo<number>();`,
    `type Foo<T> = import('foo').Foo<T>;`,
    `class Bar<T = number> {}
      class Foo<T = number> extends Bar<T> {}`,
    `interface Bar<T = number> {}
      class Foo<T = number> implements Bar<T> {}`,
    `class Bar<T = number> {}
      class Foo<T = number> extends Bar<string> {}`,
    `interface Bar<T = number> {}
      class Foo<T = number> implements Bar<string> {}`,
  ],
  invalid: [
    {
      code: `function f<T = number>() { }
        f<number>();`,
      errors: [
        {
          column: 11,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `function f<T = number>() { }
        f();`,
    },
    {
      code: `function g<T = number, U = string>() { }
        g<string, string>();`,
      errors: [
        {
          column: 19,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `function g<T = number, U = string>() { }
        g<string>();`,
    },
    {
      code: `class C<T = number> { }
        function h(c: C<number>) { }`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `class C<T = number> { }
        function h(c: C) { }`,
    },
    {
      code: `class C<T = number> { }
        new C<number>();`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `class C<T = number> { }
        new C();`,
    },
    {
      code: `class C<T = number> { }
        class D extends C<number> { }`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `class C<T = number> { }
        class D extends C { }`,
    },
    {
      code: `interface I<T = number> { }
        class Impl implements I<number> { }`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `interface I<T = number> { }
        class Impl implements I { }`,
    },
    {
      code: `class Foo<T = number> {}
        const foo = new Foo<number>();`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `class Foo<T = number> {}
        const foo = new Foo();`,
    },
    {
      code: `interface Bar<T = string> {}
        class Foo<T = number> implements Bar<string> {}`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `interface Bar<T = string> {}
        class Foo<T = number> implements Bar {}`,
    },
    {
      code: `class Bar<T = string> {}
        class Foo<T = number> extends Bar<string> {}`,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `class Bar<T = string> {}
        class Foo<T = number> extends Bar {}`,
    },
  ],
});
