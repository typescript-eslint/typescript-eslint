import rule from '../../src/rules/consistent-type-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('consistent-type-imports', rule, {
  valid: [
    `
      import Foo from 'foo';
      const foo: Foo = new Foo();
    `,
    `
      import foo from 'foo';
      const foo: foo.Foo = foo.fn();
    `,
    `
      import { A, B } from 'foo';
      const foo: A = B();
    `,
    `
      import Foo from 'foo';
    `,
    `
      import Foo from 'foo';
      function fn() {
        type Foo = {};
        let foo: Foo;
      }
    `,
    `
      import A, { B } from 'foo';
      const b = B;
    `,
    `
      import A, { B, C as c } from 'foo';
      const d = c;
    `,
    {
      code: `
        let foo: import('foo');
        let bar: import('foo').Bar;
      `,
      options: [{ disallowTypeAnnotations: false }],
    },
    {
      code: `
        import Foo from 'foo';
        let foo: Foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
  ],
  invalid: [
    {
      code: `
        import Foo from 'foo';
        let foo: Foo;
        type Bar = Foo;
        interface Baz {
          foo: Foo;
        }
        function fn(a: Foo): Foo {}
      `,
      output: `
        import type Foo from 'foo';
        let foo: Foo;
        type Bar = Foo;
        interface Baz {
          foo: Foo;
        }
        function fn(a: Foo): Foo {}
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import Foo from 'foo';
        let foo: Foo;
      `,
      output: `
        import type Foo from 'foo';
        let foo: Foo;
      `,
      options: ['type-imports'],
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import { A, B } from 'foo';
        let foo: A;
        let bar: B;
      `,
      output: `
        import type { A, B } from 'foo';
        let foo: A;
        let bar: B;
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import { A as a, B as b } from 'foo';
        let foo: a;
        let bar: b;
      `,
      output: `
        import type { A as a, B as b } from 'foo';
        let foo: a;
        let bar: b;
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import A, { B } from 'foo';
        let foo: A;
        let bar: B;
      `,
      output: `
        import type A, { B } from 'foo';
        let foo: A;
        let bar: B;
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        let foo: import('foo');
        let bar: import('foo').Bar;
      `,
      output: null,
      errors: [
        {
          messageId: 'noImportTypeAnnotations',
          line: 2,
          column: 18,
        },
        {
          messageId: 'noImportTypeAnnotations',
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
        let foo: import('foo');
      `,
      output: null,
      options: ['type-imports'],
      errors: [
        {
          messageId: 'noImportTypeAnnotations',
          line: 2,
          column: 18,
        },
      ],
    },
    {
      code: `
        import type Foo from 'foo';
        let foo: Foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: `
        import Foo from 'foo';
        let foo: Foo;
      `,
      errors: [
        {
          messageId: 'valueOverType',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import type Foo from 'foo';
        let foo: Foo;
      `,
      options: ['no-type-imports'],
      output: `
        import Foo from 'foo';
        let foo: Foo;
      `,
      errors: [
        {
          messageId: 'valueOverType',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import type { Foo } from 'foo';
        let foo: Foo;
      `,
      options: ['no-type-imports'],
      output: `
        import { Foo } from 'foo';
        let foo: Foo;
      `,
      errors: [
        {
          messageId: 'valueOverType',
          line: 2,
          column: 9,
        },
      ],
    },
  ],
});
