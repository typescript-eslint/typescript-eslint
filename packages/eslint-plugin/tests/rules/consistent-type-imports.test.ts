import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-imports';

const PARSER_OPTION_COMBOS = [
  {
    experimentalDecorators: false,
    emitDecoratorMetadata: false,
  },
  {
    experimentalDecorators: false,
    emitDecoratorMetadata: true,
  },
  {
    experimentalDecorators: true,
    emitDecoratorMetadata: false,
  },
];
for (const parserOptions of PARSER_OPTION_COMBOS) {
  describe(`experimentalDecorators: ${parserOptions.experimentalDecorators} + emitDecoratorMetadata: ${parserOptions.emitDecoratorMetadata}`, () => {
    const ruleTester = new RuleTester({
      parser: '@typescript-eslint/parser',
      // type-only imports were first added in TS3.8
      dependencyConstraints: {
        typescript: '3.8',
      },
      parserOptions,
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
        {
          code: `
import * as Type from 'foo' assert { type: 'json' };
const a: typeof Type = Type;
          `,
          options: [{ prefer: 'no-type-imports' }],
          dependencyConstraints: {
            typescript: '4.5',
          },
        },
        `
          import { type A } from 'foo';
          type T = A;
        `,
        `
          import { type A, B } from 'foo';
          type T = A;
          const b = B;
        `,
        `
          import { type A, type B } from 'foo';
          type T = A;
          type Z = B;
        `,
        `
          import { B } from 'foo';
          import { type A } from 'foo';
          type T = A;
          const b = B;
        `,
        {
          code: `
import { B, type A } from 'foo';
type T = A;
const b = B;
          `,
          options: [{ fixStyle: 'inline-type-imports' }],
        },
        {
          code: `
import { B } from 'foo';
import type A from 'baz';
type T = A;
const b = B;
          `,
          options: [{ fixStyle: 'inline-type-imports' }],
        },
        {
          code: `
import { type B } from 'foo';
import type { A } from 'foo';
type T = A;
const b = B;
          `,
          options: [{ fixStyle: 'inline-type-imports' }],
        },
        {
          code: `
import { B, type C } from 'foo';
import type A from 'baz';
type T = A;
type Z = C;
const b = B;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
        },
        {
          code: `
import { B } from 'foo';
import type { A } from 'foo';
type T = A;
const b = B;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
        },
        {
          code: `
import { B } from 'foo';
import { A } from 'foo';
type T = A;
const b = B;
          `,
          options: [
            { prefer: 'no-type-imports', fixStyle: 'inline-type-imports' },
          ],
          dependencyConstraints: {
            typescript: '4.5',
          },
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
        // https://github.com/typescript-eslint/typescript-eslint/issues/2455
        {
          code: `
import React from 'react';

export const ComponentFoo: React.FC = () => {
  return <div>Foo Foo</div>;
};
          `,
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        {
          code: `
import { h } from 'some-other-jsx-lib';

export const ComponentFoo: h.FC = () => {
  return <div>Foo Foo</div>;
};
          `,
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
            jsxPragma: 'h',
          },
        },
        {
          code: `
import { Fragment } from 'react';

export const ComponentFoo: Fragment = () => {
  return <>Foo Foo</>;
};
          `,
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
            jsxFragmentName: 'Fragment',
          },
        },
        `
          import Default, * as Rest from 'module';
          const a: typeof Default = Default;
          const b: typeof Rest = Rest;
        `,

        // https://github.com/typescript-eslint/typescript-eslint/issues/2989
        `
          import type * as constants from './constants';

          export type Y = {
            [constants.X]: ReadonlyArray<string>;
          };
        `,
        `
          import A from 'foo';
          export = A;
        `,
        `
          import type A from 'foo';
          export = A;
        `,
        `
          import type A from 'foo';
          export = {} as A;
        `,
        `
          import { type A } from 'foo';
          export = {} as A;
        `,
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
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
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
            },
          ],
        },
        {
          code: `
import foo from 'foo';
type Baz = (typeof foo.bar)['Baz']; // TSQualifiedName & TSTypeQuery
          `,
          output: `
import type foo from 'foo';
type Baz = (typeof foo.bar)['Baz']; // TSQualifiedName & TSTypeQuery
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import * as A from 'foo';
let foo: A.Foo;
          `,
          output: `
import type * as A from 'foo';
let foo: A.Foo;
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
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
          output: `
import type { B } from 'foo';
import type A from 'foo';
let foo: A;
let bar: B;
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: noFormat`
import A, {} from 'foo';
let foo: A;
          `,
          output: `
import type A from 'foo';
let foo: A;
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B } from 'foo';
const foo: A = B();
          `,
          output: `
import type { A} from 'foo';
import { B } from 'foo';
const foo: A = B();
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"A"' },
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B, C } from 'foo';
const foo: A = B();
let bar: C;
          `,
          output: `
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
            },
          ],
        },
        {
          code: `
import { A, B, C, D } from 'foo';
const foo: A = B();
type T = { bar: C; baz: D };
          `,
          output: `
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
            },
          ],
        },
        {
          code: `
import A, { B, C, D } from 'foo';
B();
type T = { foo: A; bar: C; baz: D };
          `,
          output: `
import type { C, D } from 'foo';
import type A from 'foo';
import { B } from 'foo';
B();
type T = { foo: A; bar: C; baz: D };
          `,
          errors: [
            {
              messageId: 'someImportsAreOnlyTypes',
              data: { typeImports: '"A", "C" and "D"' },
              line: 2,
            },
          ],
        },
        {
          code: `
import A, { B } from 'foo';
B();
type T = A;
          `,
          output: `
import type A from 'foo';
import { B } from 'foo';
B();
type T = A;
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"A"' },
              line: 2,
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
          output: `
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
            },
            {
              messageId: 'someImportsAreOnlyTypes',
              data: { typeImports: '"C" and "D"' },
              line: 5,
            },
          ],
        },
        {
          code: `
import A, { /* comment */ B } from 'foo';
type T = B;
          `,
          output: `
import type { /* comment */ B } from 'foo';
import A from 'foo';
type T = B;
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"B"' },
              line: 2,
            },
          ],
        },
        {
          code: noFormat`
import { A, B, C } from 'foo';
import { D, E, F, } from 'bar';
type T = A | D;
          `,
          output: `
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
            },
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"D"' },
              line: 3,
            },
          ],
        },
        {
          code: noFormat`
import { A, B, C } from 'foo';
import { D, E, F, } from 'bar';
type T = B | E;
          `,
          output: `
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
            },
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"E"' },
              line: 3,
            },
          ],
        },
        {
          code: noFormat`
import { A, B, C } from 'foo';
import { D, E, F, } from 'bar';
type T = C | F;
          `,
          output: `
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
            },
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"F"' },
              line: 3,
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
          output: `
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
            },
            {
              messageId: 'typeOverValue',
              line: 3,
            },
            {
              messageId: 'typeOverValue',
              line: 4,
            },
            {
              messageId: 'typeOverValue',
              line: 5,
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
          output: `
import type { Type1 } from 'named_import';
import { Value1 } from 'named_import';
import type Type2 from 'default_import';
import { Value2 } from 'default_import';
import type { Type3 } from 'default_import2';
import Value3 from 'default_import2';
import type { Type5} from 'default_and_named_import';
import type Type4 from 'default_and_named_import';
import { Value4 } from 'default_and_named_import';
type T = Type1 | Type2 | Type3 | Type4 | Type5;
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"Type1"' },
              line: 2,
            },
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"Type2"' },
              line: 3,
            },
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"Type3"' },
              line: 4,
            },
            {
              messageId: 'someImportsAreOnlyTypes',
              data: { typeImports: '"Type4" and "Type5"' },
              line: 5,
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
            },
            {
              messageId: 'noImportTypeAnnotations',
              line: 3,
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
            },
          ],
        },
        {
          code: `
import type { Foo } from 'foo';
let foo: Foo;
          `,
          options: [{ prefer: 'no-type-imports' }],
          output: `
import { Foo } from 'foo';
let foo: Foo;
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import Type from 'foo';

type T = typeof Type;
type T = typeof Type.foo;
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import { Type } from 'foo';

type T = typeof Type;
type T = typeof Type.foo;
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import * as Type from 'foo';

type T = typeof Type;
type T = typeof Type.foo;
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import Type from 'foo';

export { Type }; // is a type-only export
export default Type; // is a type-only export
export type { Type }; // is a type-only export
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import { Type } from 'foo';

export { Type }; // is a type-only export
export default Type; // is a type-only export
export type { Type }; // is a type-only export
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
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
          output: `
import * as Type from 'foo';

export { Type }; // is a type-only export
export default Type; // is a type-only export
export type { Type }; // is a type-only export
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
            },
          ],
        },
        {
          // type with comments
          code: noFormat`
import type /*comment*/ * as AllType from 'foo';
import type // comment
DefType from 'foo';
import type /*comment*/ { Type } from 'foo';

type T = { a: AllType; b: DefType; c: Type };
          `,
          options: [{ prefer: 'no-type-imports' }],
          output: `
import /*comment*/ * as AllType from 'foo';
import // comment
DefType from 'foo';
import /*comment*/ { Type } from 'foo';

type T = { a: AllType; b: DefType; c: Type };
          `,
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
            },
            {
              messageId: 'valueOverType',
              line: 3,
            },
            {
              messageId: 'valueOverType',
              line: 5,
            },
          ],
        },
        {
          // https://github.com/typescript-eslint/typescript-eslint/issues/2775
          code: `
import Default, * as Rest from 'module';
const a: Rest.A = '';
          `,
          options: [{ prefer: 'type-imports' }],
          output: `
import type * as Rest from 'module';
import Default from 'module';
const a: Rest.A = '';
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import Default, * as Rest from 'module';
const a: Default = '';
          `,
          options: [{ prefer: 'type-imports' }],
          output: `
import type Default from 'module';
import * as Rest from 'module';
const a: Default = '';
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import Default, * as Rest from 'module';
const a: Default = '';
const b: Rest.A = '';
          `,
          options: [{ prefer: 'type-imports' }],
          output: `
import type * as Rest from 'module';
import type Default from 'module';
const a: Default = '';
const b: Rest.A = '';
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          // type with comments
          code: `
import Default, /*comment*/ * as Rest from 'module';
const a: Default = '';
          `,
          options: [{ prefer: 'type-imports' }],
          output: `
import type Default from 'module';
import /*comment*/ * as Rest from 'module';
const a: Default = '';
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          // type with comments
          code: noFormat`
import Default /*comment1*/, /*comment2*/ { Data } from 'module';
const a: Default = '';
          `,
          options: [{ prefer: 'type-imports' }],
          output: `
import type Default /*comment1*/ from 'module';
import /*comment2*/ { Data } from 'module';
const a: Default = '';
          `,
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import Foo from 'foo';
@deco
class A {
  constructor(foo: Foo) {}
}
          `,
          output: `
import type Foo from 'foo';
@deco
class A {
  constructor(foo: Foo) {}
}
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import { type A, B } from 'foo';
type T = A;
const b = B;
          `,
          output: `
import { A, B } from 'foo';
type T = A;
const b = B;
          `,
          dependencyConstraints: {
            typescript: '4.5',
          },
          options: [{ prefer: 'no-type-imports' }],
          errors: [
            {
              messageId: 'valueOverType',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B, type C } from 'foo';
type T = A | C;
const b = B;
          `,
          output: `
import type { A} from 'foo';
import { B, type C } from 'foo';
type T = A | C;
const b = B;
          `,
          dependencyConstraints: {
            typescript: '4.5',
          },
          options: [{ prefer: 'type-imports' }],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              data: { typeImports: '"A"' },
              line: 2,
            },
          ],
        },

        // inline-type-imports
        {
          code: `
import { A, B } from 'foo';
let foo: A;
let bar: B;
          `,
          output: `
import { type A, type B } from 'foo';
let foo: A;
let bar: B;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B } from 'foo';

let foo: A;
B();
          `,
          output: `
import { type A, B } from 'foo';

let foo: A;
B();
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B } from 'foo';
type T = A;
B();
          `,
          output: `
import { type A, B } from 'foo';
type T = A;
B();
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A } from 'foo';
import { B } from 'foo';
type T = A;
type U = B;
          `,
          output: `
import { type A } from 'foo';
import { type B } from 'foo';
type T = A;
type U = B;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
            {
              messageId: 'typeOverValue',
              line: 3,
            },
          ],
        },
        {
          code: `
import { A } from 'foo';
import B from 'foo';
type T = A;
type U = B;
          `,
          output: `
import { type A } from 'foo';
import type B from 'foo';
type T = A;
type U = B;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
            {
              messageId: 'typeOverValue',
              line: 3,
            },
          ],
        },
        {
          code: `
import A, { B, C } from 'foo';
type T = B;
type U = C;
A();
          `,
          output: `
import A, { type B, type C } from 'foo';
type T = B;
type U = C;
A();
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'someImportsAreOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import A, { B, C } from 'foo';
type T = B;
type U = C;
type V = A;
          `,
          output: `
import {type B, type C} from 'foo';
import type A from 'foo';
type T = B;
type U = C;
type V = A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import A, { B, C as D } from 'foo';
type T = B;
type U = D;
type V = A;
          `,
          output: `
import {type B, type C as D} from 'foo';
import type A from 'foo';
type T = B;
type U = D;
type V = A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import { /* comment */ A, B } from 'foo';
type T = A;
          `,
          output: `
import { /* comment */ type A, B } from 'foo';
type T = A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import { B, /* comment */ A } from 'foo';
type T = A;
          `,
          output: `
import { B, /* comment */ type A } from 'foo';
type T = A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B, C } from 'foo';
import type { D } from 'deez';

const foo: A = B();
let bar: C;
let baz: D;
          `,
          output: `
import { type A, B, type C } from 'foo';
import type { D } from 'deez';

const foo: A = B();
let bar: C;
let baz: D;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'someImportsAreOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A, B, type C } from 'foo';
import type { D } from 'deez';
const foo: A = B();
let bar: C;
let baz: D;
          `,
          output: `
import { type A, B, type C } from 'foo';
import type { D } from 'deez';
const foo: A = B();
let bar: C;
let baz: D;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'aImportIsOnlyTypes',
              line: 2,
            },
          ],
        },
        {
          code: `
import A from 'foo';
export = {} as A;
          `,
          output: `
import type A from 'foo';
export = {} as A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
import { A } from 'foo';
export = {} as A;
          `,
          output: `
import { type A } from 'foo';
export = {} as A;
          `,
          options: [
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
          ],
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            @deco
            class A {
              constructor(foo: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            @deco
            class A {
              constructor(foo: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              foo: Foo;
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              foo: Foo;
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              foo(foo: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              foo(foo: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              foo(): Foo {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              foo(): Foo {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              foo(@deco foo: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              foo(@deco foo: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              set foo(value: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              set foo(value: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              get foo() {}

              set foo(value: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              get foo() {}

              set foo(value: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import Foo from 'foo';
            class A {
              @deco
              get foo() {}

              set ['foo'](value: Foo) {}
            }
          `,
          output: `
            import type Foo from 'foo';
            class A {
              @deco
              get foo() {}

              set ['foo'](value: Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
        {
          code: `
            import * as foo from 'foo';
            @deco
            class A {
              constructor(foo: foo.Foo) {}
            }
          `,
          output: `
            import type * as foo from 'foo';
            @deco
            class A {
              constructor(foo: foo.Foo) {}
            }
          `,
          errors: [
            {
              messageId: 'typeOverValue',
              line: 2,
            },
          ],
        },
      ],
    });
  });
}

// the special ignored config case
describe('experimentalDecorators: true + emitDecoratorMetadata: true', () => {
  const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser',
    // type-only imports were first added in TS3.8
    dependencyConstraints: {
      typescript: '3.8',
    },
    parserOptions: {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  });

  ruleTester.run('consistent-type-imports', rule, {
    valid: [
      `
        import Foo from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          foo: Foo;
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          foo(foo: Foo) {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          foo(): Foo {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          foo(@deco foo: Foo) {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          set foo(value: Foo) {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          get foo() {}

          set foo(value: Foo) {}
        }
      `,

      `
        import Foo from 'foo';
        class A {
          @deco
          get foo() {}

          set ['foo'](value: Foo) {}
        }
      `,

      `
        import type { Foo } from 'foo';
        const key = 'k';
        class A {
          @deco
          get [key]() {}

          set [key](value: Foo) {}
        }
      `,

      `
        import * as foo from 'foo';
        @deco
        class A {
          constructor(foo: foo.Foo) {}
        }
      `,

      // https://github.com/typescript-eslint/typescript-eslint/issues/7327
      `
        import type { ClassA } from './classA';

        export class ClassB {
          public constructor(node: ClassA) {}
        }
      `,

      `
        import type Foo from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
        }
      `,
      `
        import type { Foo } from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
        }
      `,
      `
        import type { Type } from 'foo';
        import { Foo, Bar } from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
        }
        type T = Bar;
      `,
      `
        import { V } from 'foo';
        import type { Foo, Bar, T } from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
          foo(@deco bar: Bar) {}
        }
      `,
      `
        import type { Foo, T } from 'foo';
        import { V } from 'foo';
        @deco
        class A {
          constructor(foo: Foo) {}
        }
      `,
      `
        import type * as Type from 'foo';
        @deco
        class A {
          constructor(foo: Type.Foo) {}
        }
      `,
    ],
    invalid: [
      {
        code: `
          import Foo from 'foo';
          export type T = Foo;
        `,
        output: `
          import type Foo from 'foo';
          export type T = Foo;
        `,
        errors: [
          {
            messageId: 'typeOverValue',
            line: 2,
          },
        ],
      },
    ],
  });
});
