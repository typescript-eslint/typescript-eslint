import rule from '../../src/rules/consistent-type-exports';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
    "export { BlockScope } from '@typescript-eslint/experimental-utils';",
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
      code: "export type { BlockScope } from '@typescript-eslint/scope-manager';",
      output: "export { BlockScope } from '@typescript-eslint/scope-manager';",
      errors: [
        {
          messageId: 'valueOverType',
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
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
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
      code: `
export type {
  AnalyzeOptions,
  BlockScope,
} from '@typescript-eslint/scope-manager';
      `,
      output: `
export { BlockScope } from '@typescript-eslint/scope-manager';
export type { AnalyzeOptions } from '@typescript-eslint/scope-manager';
      `,
      errors: [
        {
          messageId: 'singleExportIsValue',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
export type {
  AnalyzeOptions,
  BlockScope,
  Definition,
} from '@typescript-eslint/scope-manager';
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: `
export { BlockScope } from '@typescript-eslint/scope-manager';
export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';
      `,
      errors: [
        {
          messageId: 'singleExportIsValue',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
export type {
  AnalyzeOptions,
  BlockScope,
  Definition,
  CatchScope,
} from '@typescript-eslint/scope-manager';
      `,
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      output: `
export { BlockScope, CatchScope } from '@typescript-eslint/scope-manager';
export type { AnalyzeOptions, Definition } from '@typescript-eslint/scope-manager';
      `,
      errors: [
        {
          messageId: 'multipleExportsAreValues',
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
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
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
const variable = 1;
class Class {}
enum Enum {}
function Func() {}
namespace ValueNS {
  export const x = 1;
}

export type {
  // type-export the values
  variable,
  Class,
  Enum,
  Func,
  ValueNS,
};
      `,
      output: `
const variable = 1;
class Class {}
enum Enum {}
function Func() {}
namespace ValueNS {
  export const x = 1;
}

export {
  // type-export the values
  variable,
  Class,
  Enum,
  Func,
  ValueNS,
};
      `,
      errors: [
        {
          messageId: 'valueOverType',
          line: 10,
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
}

export { Alias, IFace, TypeNS };
      `,
      output: `
type Alias = 1;
interface IFace {}
namespace TypeNS {
  export type x = 1;
}

export type { Alias, IFace, TypeNS };
      `,
      errors: [
        {
          messageId: 'typeOverValue',
          line: 8,
          column: 1,
        },
      ],
    },
  ],
});
