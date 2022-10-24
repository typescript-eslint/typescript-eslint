import rule from '../../src/rules/consistent-type-exports';
import { getFixturesRootDir, noFormat, RuleTester } from '../RuleTester';

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
    "export { Foo } from 'foo';",
    "export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';",
    "export { BlockScope } from '@typescript-eslint/utils';",
    "export type { BlockScope } from '@typescript-eslint/utils';",
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
      code: "export { AnalyzeOptions } from '@typescript-eslint/scope-manager';",
      output:
        "export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';",
      errors: [
        {
          messageId: 'typeOverValue',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "export { AnalyzeOptions, BlockScope } from '@typescript-eslint/scope-manager';",
      output:
        `export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';\n` +
        `export { BlockScope } from '@typescript-eslint/scope-manager';`,
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
export {
  AnalyzeOptions,
  BlockScope,
  CatchScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';
export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';
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
  AnalyzeOptions,
  BlockScope,
  Definition,
  CatchScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';
export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';
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
      code: "export { Definition as Foo } from '@typescript-eslint/scope-manager';",
      output:
        "export type { Definition as Foo } from '@typescript-eslint/scope-manager';",
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
export {
  Definition as Foo,
  BlockScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export type { Definition as Foo } from '@typescript-eslint/scope-manager';
export { BlockScope } from '@typescript-eslint/scope-manager';
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
  Definition as Foo,
  BlockScope as BScope,
  CatchScope as CScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export type { Definition as Foo } from '@typescript-eslint/scope-manager';
export { BlockScope as BScope, CatchScope as CScope } from '@typescript-eslint/scope-manager';
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
import { Definition } from '@typescript-eslint/scope-manager';
export { Definition };
      `,
      output: `
import { Definition } from '@typescript-eslint/scope-manager';
export type { Definition };
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
import { CatchScope, Definition } from '@typescript-eslint/scope-manager';
export { CatchScope, Definition };
      `,
      output: `
import { CatchScope, Definition } from '@typescript-eslint/scope-manager';
export type { Definition };
export { CatchScope };
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
  AnalyzeOptions,
  Definition as Foo,
  type BlockScope as BScope,
  CatchScope as CScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export type { AnalyzeOptions, Definition as Foo, BlockScope as BScope } from '@typescript-eslint/scope-manager';
export { CatchScope as CScope } from '@typescript-eslint/scope-manager';
      `,
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
  AnalyzeOptions,
  Definition as Foo,
  type BlockScope as BScope,
  CatchScope as CScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export {
  type AnalyzeOptions,
  type Definition as Foo,
  type BlockScope as BScope,
  CatchScope as CScope,
} from '@typescript-eslint/scope-manager';
      `,
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
