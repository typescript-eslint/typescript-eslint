import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('prefer-optional-chain-or-eqeq-null', rule, {
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo == null || foo.bar == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar == null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar == null || foo.bar.baz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz == null;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo == null || foo() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: (() => number) | null | undefined;
foo?.() == null;
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar == null || foo.bar() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() == null;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 9,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar == null || foo.bar.baz == null || foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 67,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz == null;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo == null || foo.bar == null || foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 59,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz == null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar == null || foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz == null;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 10,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == null;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 9,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz == null;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo[bar] == null ||
  foo[bar].baz == null ||
  foo[bar].baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 13,
          line: 10,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz == null;
      `,
    },
    {
      code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo == null || foo[bar].baz == null || foo[bar].baz.buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 65,
          endLine: 10,
          line: 10,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz == null;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo == null || foo[bar.baz] == null || foo[bar.baz].buzz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 65,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo?.[bar.baz]?.buzz == null;
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        { baz: { buzz: () => number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 12,
          line: 9,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | {
      bar:
        { baz: { buzz: () => number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz() == null;
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 17,
          line: 13,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.() == null;
      `,
    },
    {
      code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 11,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.() == null;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo == null || foo.bar == null || foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 61,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz() == null;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar == null || foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() == null;
      `,
    },
    {
      code: `
declare const foo:
  | {
      bar:
        { baz: { buzz: (() => number) | null | undefined } } | null | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 12,
          line: 9,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  | {
      bar:
        { baz: { buzz: (() => number) | null | undefined } } | null | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.() == null;
      `,
    },
    {
      code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == null ||
  foo.bar() == null ||
  foo.bar().baz == null ||
  foo.bar().baz.buzz == null ||
  foo.bar().baz.buzz() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 12,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() == null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz[buzz]() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 15,
          line: 12,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]() == null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz[buzz] == null ||
  foo.bar.baz[buzz]() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 21,
          line: 17,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo?.bar == null ||
  foo?.bar.baz == null ||
  foo?.bar.baz[buzz] == null ||
  foo?.bar.baz[buzz]() == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 21,
          line: 17,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == null;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo == null || foo?.bar.baz == null || foo?.bar.baz[buzz] == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 66,
          endLine: 7,
          line: 7,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz] == null;
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo == null || foo?.() == null || foo?.().bar == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 54,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar == null;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar == null || foo.bar?.() == null || foo.bar?.().baz == null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 66,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz == null;
      `,
    },
  ],
  valid: [],
});
