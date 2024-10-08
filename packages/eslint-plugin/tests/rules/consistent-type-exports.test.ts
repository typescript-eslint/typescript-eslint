import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-exports';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('consistent-type-exports', rule, {
  valid: [
    // unknown module should be ignored
    "export { Foo } from 'foo';",

    "export type { Type1 } from './consistent-type-exports';",
    "export { value1 } from './consistent-type-exports';",
    "export type { value1 } from './consistent-type-exports';",
    `
const variable = 1;
class Class {}
enum Enum {}
function Func() {}
namespace ValueNS {
  export const x = 1;
}

export { variable, Class, Enum, Func, ValueNS };
    `,
    `
type Alias = 1;
interface IFace {}
namespace TypeNS {
  export type x = 1;
}

export type { Alias, IFace, TypeNS };
    `,
    `
const foo = 1;
export type { foo };
    `,
    `
namespace NonTypeNS {
  export const x = 1;
}

export { NonTypeNS };
    `,
    "export * from './unknown-module';",
    "export * from './consistent-type-exports';",
    "export type * from './consistent-type-exports/type-only-exports';",
    "export type * from './consistent-type-exports/type-only-reexport';",
    "export * from './consistent-type-exports/value-reexport';",
    "export * as foo from './consistent-type-exports';",
    "export type * as foo from './consistent-type-exports/type-only-exports';",
    "export type * as foo from './consistent-type-exports/type-only-reexport';",
    "export * as foo from './consistent-type-exports/value-reexport';",
  ],
  invalid: [
    {
      code: "export { Type1 } from './consistent-type-exports';",
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'typeOverValue',
        },
      ],
      output: "export type { Type1 } from './consistent-type-exports';",
    },
    {
      code: "export { Type1, value1 } from './consistent-type-exports';",
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'singleExportIsType',
        },
      ],
      output:
        `export type { Type1 } from './consistent-type-exports';\n` +
        `export { value1 } from './consistent-type-exports';`,
    },
    {
      code: `
export { Type1, value1, value2 } from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'singleExportIsType',
        },
      ],
      output: `
export type { Type1 } from './consistent-type-exports';
export { value1, value2 } from './consistent-type-exports';
      `,
    },
    {
      code: `
export { Type1, value1, Type2, value2 } from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'multipleExportsAreTypes',
        },
      ],
      output: `
export type { Type1, Type2 } from './consistent-type-exports';
export { value1, value2 } from './consistent-type-exports';
      `,
    },
    {
      code: "export { Type2 as Foo } from './consistent-type-exports';",
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'typeOverValue',
        },
      ],
      output: "export type { Type2 as Foo } from './consistent-type-exports';",
    },
    {
      code: `
export { Type2 as Foo, value1 } from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'singleExportIsType',
        },
      ],
      output: `
export type { Type2 as Foo } from './consistent-type-exports';
export { value1 } from './consistent-type-exports';
      `,
    },
    {
      code: `
export {
  Type2 as Foo,
  value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'singleExportIsType',
        },
      ],
      output: `
export type { Type2 as Foo } from './consistent-type-exports';
export { value1 as BScope, value2 as CScope } from './consistent-type-exports';
      `,
    },
    {
      code: `
import { Type2 } from './consistent-type-exports';
export { Type2 };
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'typeOverValue',
        },
      ],
      output: `
import { Type2 } from './consistent-type-exports';
export type { Type2 };
      `,
    },
    {
      code: `
import { value2, Type2 } from './consistent-type-exports';
export { value2, Type2 };
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'singleExportIsType',
        },
      ],
      output: `
import { value2, Type2 } from './consistent-type-exports';
export type { Type2 };
export { value2 };
      `,
    },
    {
      code: `
type Alias = 1;
interface IFace {}
namespace TypeNS {
  export type x = 1;
  export const f = 1;
}

export { Alias, IFace, TypeNS };
      `,
      errors: [
        {
          column: 1,
          line: 9,
          messageId: 'multipleExportsAreTypes',
        },
      ],
      output: `
type Alias = 1;
interface IFace {}
namespace TypeNS {
  export type x = 1;
  export const f = 1;
}

export type { Alias, IFace };
export { TypeNS };
      `,
    },
    {
      code: `
namespace TypeNS {
  export interface Foo {}
}

export { TypeNS };
      `,
      errors: [
        {
          column: 1,
          line: 6,
          messageId: 'typeOverValue',
        },
      ],
      output: `
namespace TypeNS {
  export interface Foo {}
}

export type { TypeNS };
      `,
    },
    {
      code: `
type T = 1;
export { type T, T };
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'typeOverValue',
        },
      ],
      output: `
type T = 1;
export type { T, T };
      `,
    },
    {
      code: noFormat`
type T = 1;
export { type/* */T, type     /* */T, T };
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'typeOverValue',
        },
      ],
      output: `
type T = 1;
export type { /* */T, /* */T, T };
      `,
    },
    {
      code: `
type T = 1;
const x = 1;
export { type T, T, x };
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'singleExportIsType',
        },
      ],
      output: `
type T = 1;
const x = 1;
export type { T, T };
export { x };
      `,
    },
    {
      code: `
type T = 1;
const x = 1;
export { T, x };
      `,
      errors: [
        {
          column: 1,
          line: 4,
          messageId: 'singleExportIsType',
        },
      ],
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      output: `
type T = 1;
const x = 1;
export { type T, x };
      `,
    },
    {
      code: `
type T = 1;
export { type T, T };
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'typeOverValue',
        },
      ],
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      output: `
type T = 1;
export type { T, T };
      `,
    },
    {
      code: `
export {
  Type1,
  Type2 as Foo,
  type value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'multipleExportsAreTypes',
        },
      ],
      options: [{ fixMixedExportsWithInlineTypeSpecifier: false }],
      output: `
export type { Type1, Type2 as Foo, value1 as BScope } from './consistent-type-exports';
export { value2 as CScope } from './consistent-type-exports';
      `,
    },
    {
      code: `
export {
  Type1,
  Type2 as Foo,
  type value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'multipleExportsAreTypes',
        },
      ],
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      output: `
export {
  type Type1,
  type Type2 as Foo,
  type value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
    },
    {
      code: `
        export * from './consistent-type-exports/type-only-exports';
      `,
      errors: [
        {
          column: 9,
          endColumn: 69,
          endLine: 2,
          line: 2,
          messageId: 'typeOverValue',
        },
      ],
      output: `
        export type * from './consistent-type-exports/type-only-exports';
      `,
    },
    {
      code: noFormat`
        /* comment 1 */ export
          /* comment 2 */ *
            // comment 3
            from './consistent-type-exports/type-only-exports';
      `,
      errors: [
        {
          column: 25,
          endColumn: 64,
          endLine: 5,
          line: 2,
          messageId: 'typeOverValue',
        },
      ],
      output: `
        /* comment 1 */ export
          /* comment 2 */ type *
            // comment 3
            from './consistent-type-exports/type-only-exports';
      `,
    },
    {
      code: `
        export * from './consistent-type-exports/type-only-reexport';
      `,
      errors: [
        {
          column: 9,
          endColumn: 70,
          endLine: 2,
          line: 2,
          messageId: 'typeOverValue',
        },
      ],
      output: `
        export type * from './consistent-type-exports/type-only-reexport';
      `,
    },
    {
      code: `
        export * as foo from './consistent-type-exports/type-only-reexport';
      `,
      errors: [
        {
          column: 9,
          endColumn: 77,
          endLine: 2,
          line: 2,
          messageId: 'typeOverValue',
        },
      ],
      output: `
        export type * as foo from './consistent-type-exports/type-only-reexport';
      `,
    },
  ],
});
