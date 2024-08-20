import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-empty-interface';

const ruleTester = new RuleTester();

ruleTester.run('no-empty-interface', rule, {
  invalid: [
    {
      code: 'interface Foo {}',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmpty',
        },
      ],
      output: null,
    },
    {
      code: noFormat`interface Foo extends {}`,
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmpty',
        },
      ],
      output: null,
    },
    {
      code: `
interface Foo {
  props: string;
}

interface Bar extends Foo {}

class Baz {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyWithSuper',
        },
      ],
      options: [{ allowSingleExtends: false }],
      output: `
interface Foo {
  props: string;
}

type Bar = Foo

class Baz {}
      `,
    },
    {
      code: `
interface Foo {
  props: string;
}

interface Bar extends Foo {}

class Bar {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyWithSuper',
        },
      ],
      options: [{ allowSingleExtends: false }],
      output: null,
    },
    {
      code: `
interface Foo {
  props: string;
}

interface Bar extends Foo {}

const bar = class Bar {};
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyWithSuper',
        },
      ],
      options: [{ allowSingleExtends: false }],
      output: `
interface Foo {
  props: string;
}

type Bar = Foo

const bar = class Bar {};
      `,
    },
    {
      code: `
interface Foo {
  name: string;
}

interface Bar extends Foo {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyWithSuper',
        },
      ],
      options: [{ allowSingleExtends: false }],
      output: `
interface Foo {
  name: string;
}

type Bar = Foo
      `,
    },
    {
      code: 'interface Foo extends Array<number> {}',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmptyWithSuper',
        },
      ],
      output: `type Foo = Array<number>`,
    },
    {
      code: 'interface Foo extends Array<number | {}> {}',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmptyWithSuper',
        },
      ],
      output: `type Foo = Array<number | {}>`,
    },
    {
      code: `
interface Bar {
  bar: string;
}
interface Foo extends Array<Bar> {}
      `,
      errors: [
        {
          column: 11,
          line: 5,
          messageId: 'noEmptyWithSuper',
        },
      ],
      output: `
interface Bar {
  bar: string;
}
type Foo = Array<Bar>
      `,
    },
    {
      code: `
type R = Record<string, unknown>;
interface Foo extends R {}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'noEmptyWithSuper',
        },
      ],
      output: `
type R = Record<string, unknown>;
type Foo = R
      `,
    },
    {
      code: `
interface Foo<T> extends Bar<T> {}
      `,
      errors: [
        {
          column: 11,
          line: 2,
          messageId: 'noEmptyWithSuper',
        },
      ],
      output: `
type Foo<T> = Bar<T>
      `,
    },
    {
      code: `
declare module FooBar {
  type Baz = typeof baz;
  export interface Bar extends Baz {}
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'noEmptyWithSuper',
          suggestions: [
            {
              messageId: 'noEmptyWithSuper',
              output: `
declare module FooBar {
  type Baz = typeof baz;
  export type Bar = Baz
}
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
      // output matches input because a suggestion was made
      output: null,
    },
  ],
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
    {
      code: `
interface Foo {
  props: string;
}

interface Bar extends Foo {}

class Bar {}
      `,
      options: [{ allowSingleExtends: true }],
    },
  ],
});
