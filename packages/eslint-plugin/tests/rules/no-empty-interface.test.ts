import rule from '../../src/rules/no-empty-interface';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-empty-interface', rule, {
  valid: [
    `
interface Foo {
  name: string;
}
    `,
    `
interface Foo {
  name: string;
}

interface Bar {
  age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Baz extends Foo, Bar {}
    `,
    {
      code: `
interface Foo {
  name: string;
}

interface Bar extends Foo {}
      `,
      options: [{ allowSingleExtends: true }],
    },
  ],
  invalid: [
    {
      code: 'interface Foo {}',
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: noFormat`interface Foo extends {}`,
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
}

interface Bar extends Foo {}
      `,
      output: noFormat`
interface Foo {
  name: string;
}

type Bar = Foo
      `,
      options: [{ allowSingleExtends: false }],
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 6,
          column: 11,
        },
      ],
    },
    {
      code: 'interface Foo extends Array<number> {}',
      output: noFormat`type Foo = Array<number>`,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'interface Foo extends Array<number | {}> {}',
      output: noFormat`type Foo = Array<number | {}>`,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `
interface Bar {
  bar: string;
}
interface Foo extends Array<Bar> {}
      `,
      output: noFormat`
interface Bar {
  bar: string;
}
type Foo = Array<Bar>
      `,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 5,
          column: 11,
        },
      ],
    },
    {
      code: `
type R = Record<string, unknown>;
interface Foo extends R {}
      `,
      output: noFormat`
type R = Record<string, unknown>;
type Foo = R
      `,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: `
interface Foo<T> extends Bar<T> {}
      `,
      output: noFormat`
type Foo<T> = Bar<T>
      `,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 2,
          column: 11,
        },
      ],
    },
    {
      filename: 'test.d.ts',
      code: `
declare module FooBar {
  type Baz = typeof baz;
  export interface Bar extends Baz {}
}
      `.trimRight(),
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 4,
          column: 20,
          endLine: 4,
          endColumn: 23,
          suggestions: [
            {
              messageId: 'noEmptyWithSuper',
              output: noFormat`
declare module FooBar {
  type Baz = typeof baz;
  export type Bar = Baz
}
              `.trimRight(),
            },
          ],
        },
      ],
      // output matches input because a suggestion was made
      output: `
declare module FooBar {
  type Baz = typeof baz;
  export interface Bar extends Baz {}
}
      `.trimRight(),
    },
  ],
});
