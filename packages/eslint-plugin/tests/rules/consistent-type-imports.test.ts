import rule from '../../src/rules/consistent-type-imports';
import { RuleTester, noFormat } from '../RuleTester';

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
      const bar = new A();
    `,
    `
      import Foo from 'foo';
    `,
    `
      import Foo from 'foo';
      type T<Foo> = Foo; // shadowing
    `,
    `
      import Foo from 'foo';
      function fn() {
        type Foo = {}; // shadowing
        let foo: Foo;
      }
    `,
    `
      import { A, B } from 'foo';
      const b = B;
    `,
    `
      import { A, B, C as c } from 'foo';
      const d = c;
    `,
    `
      import {} from 'foo'; // empty
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
    // type queries
    `
      import type Type from 'foo';

      type T = typeof Type;
      type T = typeof Type.foo;
    `,
    `
      import type { Type } from 'foo';

      type T = typeof Type;
      type T = typeof Type.foo;
    `,
    `
      import type * as Type from 'foo';

      type T = typeof Type;
      type T = typeof Type.foo;
    `,
    {
      code: `
        import Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
    {
      code: `
        import { Type } from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
    {
      code: `
        import * as Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
    // exports
    `
      import Type from 'foo';

      export { Type }; // is a value export
      export default Type; // is a value export
    `,
    `
      import type Type from 'foo';

      export { Type }; // is a type-only export
      export default Type; // is a type-only export
      export type { Type }; // is a type-only export
    `,
    `
      import { Type } from 'foo';

      export { Type }; // is a value export
      export default Type; // is a value export
    `,
    `
      import type { Type } from 'foo';

      export { Type }; // is a type-only export
      export default Type; // is a type-only export
      export type { Type }; // is a type-only export
    `,
    `
      import * as Type from 'foo';

      export { Type }; // is a value export
      export default Type; // is a value export
    `,
    `
      import type * as Type from 'foo';

      export { Type }; // is a type-only export
      export default Type; // is a type-only export
      export type { Type }; // is a type-only export
    `,

    {
      code: `
        import Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
    {
      code: `
        import { Type } from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
      `,
      options: [{ prefer: 'no-type-imports' }],
    },
    {
      code: `
        import * as Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
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
      options: [{ prefer: 'type-imports' }],
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
        import Foo from 'foo';
        type Bar = typeof Foo; // TSTypeQuery
      `,
      output: `
        import type Foo from 'foo';
        type Bar = typeof Foo; // TSTypeQuery
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
        import foo from 'foo';
        type Bar = foo.Bar; // TSQualifiedName
      `,
      output: `
        import type foo from 'foo';
        type Bar = foo.Bar; // TSQualifiedName
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
        import foo from 'foo';
        type Baz = typeof foo.bar['Baz']; // TSQualifiedName & TSTypeQuery
      `,
      output: `
        import type foo from 'foo';
        type Baz = typeof foo.bar['Baz']; // TSQualifiedName & TSTypeQuery
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
      code: noFormat`
        import * as A from 'foo';
        let foo: A.Foo;
      `,
      output: noFormat`
        import type * as A from 'foo';
        let foo: A.Foo;
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
      // default and named
      code: `
        import A, { B } from 'foo';
        let foo: A;
        let bar: B;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { B } from 'foo';
import type A from 'foo';
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
      code: noFormat`
        import A, {} from 'foo';
        let foo: A;
      `,
      output: noFormat`
        import type A from 'foo';
        let foo: A;
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
        import { A, B } from 'foo';
        const foo: A = B();
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { A} from 'foo';
import { B } from 'foo';
        const foo: A = B();
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"A"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import { A, B, C } from 'foo';
        const foo: A = B();
        let bar: C;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { A, C } from 'foo';
import { B } from 'foo';
        const foo: A = B();
        let bar: C;
      `,
      errors: [
        {
          messageId: 'someImportsAreOnlyTypes',
          data: { typeImports: '"A" and "C"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import { A, B, C, D } from 'foo';
        const foo: A = B();
        type T = { bar: C; baz: D };
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { A, C, D } from 'foo';
import { B } from 'foo';
        const foo: A = B();
        type T = { bar: C; baz: D };
      `,
      errors: [
        {
          messageId: 'someImportsAreOnlyTypes',
          data: { typeImports: '"A", "C" and "D"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import A, { B, C, D } from 'foo';
        B();
        type T = { foo: A; bar: C; baz: D };
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { C, D } from 'foo';
import type A from 'foo';
import  { B } from 'foo';
        B();
        type T = { foo: A; bar: C; baz: D };
      `,
      errors: [
        {
          messageId: 'someImportsAreOnlyTypes',
          data: { typeImports: '"A", "C" and "D"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import A, { B } from 'foo';
        B();
        type T = A;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type A from 'foo';
import  { B } from 'foo';
        B();
        type T = A;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"A"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: `
        import type Already1Def from 'foo';
        import type { Already1 } from 'foo';
        import A, { B } from 'foo';
        import { C, D, E } from 'bar';
        import type { Already2 } from 'bar';
        type T = { b: B; c: C; d: D };
      `,
      output: noFormat`
        import type Already1Def from 'foo';
        import type { Already1 , B } from 'foo';
        import A from 'foo';
        import { E } from 'bar';
        import type { Already2 , C, D} from 'bar';
        type T = { b: B; c: C; d: D };
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"B"' },
          line: 4,
          column: 9,
        },
        {
          messageId: 'someImportsAreOnlyTypes',
          data: { typeImports: '"C" and "D"' },
          line: 5,
          column: 9,
        },
      ],
    },
    {
      code: `
        import A, { /* comment */ B } from 'foo';
        type T = B;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { /* comment */ B } from 'foo';
import A from 'foo';
        type T = B;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"B"' },
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: noFormat`
        import { A, B, C } from 'foo';
        import { D, E, F, } from 'bar';
        type T = A | D;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { A} from 'foo';
import { B, C } from 'foo';
        import type { D} from 'bar';
import { E, F, } from 'bar';
        type T = A | D;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"A"' },
          line: 2,
          column: 9,
        },
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"D"' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: noFormat`
        import { A, B, C } from 'foo';
        import { D, E, F, } from 'bar';
        type T = B | E;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { B} from 'foo';
import { A, C } from 'foo';
        import type { E} from 'bar';
import { D, F, } from 'bar';
        type T = B | E;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"B"' },
          line: 2,
          column: 9,
        },
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"E"' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: noFormat`
        import { A, B, C } from 'foo';
        import { D, E, F, } from 'bar';
        type T = C | F;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { C } from 'foo';
import { A, B } from 'foo';
        import type { F} from 'bar';
import { D, E } from 'bar';
        type T = C | F;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"C"' },
          line: 2,
          column: 9,
        },
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"F"' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      // all type fix cases
      code: `
        import { Type1, Type2 } from 'named_types';
        import Type from 'default_type';
        import * as Types from 'namespace_type';
        import Default, { Named } from 'default_and_named_type';
        type T = Type1 | Type2 | Type | Types.A | Default | Named;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { Type1, Type2 } from 'named_types';
        import type Type from 'default_type';
        import type * as Types from 'namespace_type';
        import type { Named } from 'default_and_named_type';
import type Default from 'default_and_named_type';
        type T = Type1 | Type2 | Type | Types.A | Default | Named;
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 2,
          column: 9,
        },
        {
          messageId: 'typeOverValue',
          line: 3,
          column: 9,
        },
        {
          messageId: 'typeOverValue',
          line: 4,
          column: 9,
        },
        {
          messageId: 'typeOverValue',
          line: 5,
          column: 9,
        },
      ],
    },
    {
      // some type fix cases
      code: `
        import { Value1, Type1 } from 'named_import';
        import Type2, { Value2 } from 'default_import';
        import Value3, { Type3 } from 'default_import2';
        import Type4, { Type5, Value4 } from 'default_and_named_import';
        type T = Type1 | Type2 | Type3 | Type4 | Type5;
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: noFormat`
        import type { Type1 } from 'named_import';
import { Value1 } from 'named_import';
        import type Type2 from 'default_import';
import  { Value2 } from 'default_import';
        import type { Type3 } from 'default_import2';
import Value3 from 'default_import2';
        import type { Type5} from 'default_and_named_import';
import type Type4 from 'default_and_named_import';
import  { Value4 } from 'default_and_named_import';
        type T = Type1 | Type2 | Type3 | Type4 | Type5;
      `,
      errors: [
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"Type1"' },
          line: 2,
          column: 9,
        },
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"Type2"' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'aImportIsOnlyTypes',
          data: { typeImports: '"Type3"' },
          line: 4,
          column: 9,
        },
        {
          messageId: 'someImportsAreOnlyTypes',
          data: { typeImports: '"Type4" and "Type5"' },
          line: 5,
          column: 9,
        },
      ],
    },
    // type annotations
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
      options: [{ prefer: 'type-imports' }],
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
      output: noFormat`
        import  Foo from 'foo';
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
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  { Foo } from 'foo';
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
    // type queries
    {
      code: `
        import Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      output: `
        import type Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
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
        import { Type } from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      output: `
        import type { Type } from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
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
        import * as Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      output: `
        import type * as Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
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
        import type Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
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
        import type { Type } from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  { Type } from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
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
        import type * as Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  * as Type from 'foo';

        type T = typeof Type;
        type T = typeof Type.foo;
      `,
      errors: [
        {
          messageId: 'valueOverType',
          line: 2,
          column: 9,
        },
      ],
    },
    // exports
    {
      code: `
        import Type from 'foo';

        export type { Type }; // is a type-only export
      `,
      output: `
        import type Type from 'foo';

        export type { Type }; // is a type-only export
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
        import { Type } from 'foo';

        export type { Type }; // is a type-only export
      `,
      output: `
        import type { Type } from 'foo';

        export type { Type }; // is a type-only export
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
        import * as Type from 'foo';

        export type { Type }; // is a type-only export
      `,
      output: `
        import type * as Type from 'foo';

        export type { Type }; // is a type-only export
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
        import type Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
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
        import type { Type } from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  { Type } from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
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
        import type * as Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
      `,
      options: [{ prefer: 'no-type-imports' }],
      output: noFormat`
        import  * as Type from 'foo';

        export { Type }; // is a type-only export
        export default Type; // is a type-only export
        export type { Type }; // is a type-only export
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
