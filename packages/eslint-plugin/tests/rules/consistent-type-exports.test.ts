import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/consistent-type-exports';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
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
  ],
  invalid: [
    {
      code: "export { Type1 } from './consistent-type-exports';",
      output: "export type { Type1 } from './consistent-type-exports';",
      errors: [
        {
          messageId: 'typeOverValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "export { Type1, value1 } from './consistent-type-exports';",
      output:
        `export type { Type1 } from './consistent-type-exports';\n` +
        `export { value1 } from './consistent-type-exports';`,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
export { Type1, value1, value2 } from './consistent-type-exports';
      `,
      output: `
export type { Type1 } from './consistent-type-exports';
export { value1, value2 } from './consistent-type-exports';
      `,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
export { Type1, value1, Type2, value2 } from './consistent-type-exports';
      `,
      output: `
export type { Type1, Type2 } from './consistent-type-exports';
export { value1, value2 } from './consistent-type-exports';
      `,
      errors: [
        {
          messageId: 'multipleExportsAreTypes',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: "export { Type2 as Foo } from './consistent-type-exports';",
      output: "export type { Type2 as Foo } from './consistent-type-exports';",
      errors: [
        {
          messageId: 'typeOverValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
export { Type2 as Foo, value1 } from './consistent-type-exports';
      `,
      output: `
export type { Type2 as Foo } from './consistent-type-exports';
export { value1 } from './consistent-type-exports';
      `,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
export {
  Type2 as Foo,
  value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
      output: `
export type { Type2 as Foo } from './consistent-type-exports';
export { value1 as BScope, value2 as CScope } from './consistent-type-exports';
      `,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
import { Type2 } from './consistent-type-exports';
export { Type2 };
      `,
      output: `
import { Type2 } from './consistent-type-exports';
export type { Type2 };
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
import { value2, Type2 } from './consistent-type-exports';
export { value2, Type2 };
      `,
      output: `
import { value2, Type2 } from './consistent-type-exports';
export type { Type2 };
export { value2 };
      `,
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 3,
          column: 1,
        },
      ],
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
      errors: [
        {
          messageId: 'multipleExportsAreTypes',
          line: 9,
          column: 1,
        },
      ],
    },
    {
      code: `
namespace TypeNS {
  export interface Foo {}
}

export { TypeNS };
      `,
      output: `
namespace TypeNS {
  export interface Foo {}
}

export type { TypeNS };
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
type T = 1;
export { type T, T };
      `,
      output: `
type T = 1;
export type { T, T };
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      errors: [
        {
          messageId: 'typeOverValue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: noFormat`
type T = 1;
export { type/* */T, type     /* */T, T };
      `,
      output: `
type T = 1;
export type { /* */T, /* */T, T };
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      errors: [
        {
          messageId: 'typeOverValue',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
type T = 1;
const x = 1;
export { type T, T, x };
      `,
      output: `
type T = 1;
const x = 1;
export type { T, T };
export { x };
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: `
type T = 1;
const x = 1;
export { T, x };
      `,
      output: `
type T = 1;
const x = 1;
export { type T, x };
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      errors: [
        {
          messageId: 'singleExportIsType',
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: `
type T = 1;
export { type T, T };
      `,
      output: `
type T = 1;
export type { T, T };
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      errors: [
        {
          messageId: 'typeOverValue',
          line: 3,
          column: 1,
        },
      ],
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
      output: `
export type { Type1, Type2 as Foo, value1 as BScope } from './consistent-type-exports';
export { value2 as CScope } from './consistent-type-exports';
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      options: [{ fixMixedExportsWithInlineTypeSpecifier: false }],
      errors: [
        {
          messageId: 'multipleExportsAreTypes',
          line: 2,
          column: 1,
        },
      ],
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
      output: `
export {
  type Type1,
  type Type2 as Foo,
  type value1 as BScope,
  value2 as CScope,
} from './consistent-type-exports';
      `,
      dependencyConstraints: {
        typescript: '4.5',
      },
      options: [{ fixMixedExportsWithInlineTypeSpecifier: true }],
      errors: [
        {
          messageId: 'multipleExportsAreTypes',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
