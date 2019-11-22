import rule from '../../src/rules/no-empty-interface';
import { RuleTester } from '../RuleTester';

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
      code: 'interface Foo extends {}',
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
      output: 'type Foo = Array<number>',
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'interface Foo extends Array<number | {}> { }',
      output: 'type Foo = Array<number | {}>',
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
      output: `
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
interface Foo extends R {   };`,
      output: `
type R = Record<string, unknown>;
type Foo = R;`,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 3,
          column: 11,
        },
      ],
    },
  ],
});
