import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { tsconfigRootDir: getFixturesRootDir() } },
});

ruleTester.run('prefer-optional-chain-or-eqeq-undefined', rule, {
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo == undefined || foo.bar == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 41,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar == undefined || foo.bar.baz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz == undefined;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo == undefined || foo() == undefined;
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
declare const foo: (() => number) | null | undefined;
foo?.() == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar == undefined || foo.bar() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() == undefined;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
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
foo?.bar?.baz?.buzz == undefined;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 7,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz == undefined;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo == undefined || foo.bar == undefined || foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 74,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar == undefined || foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz == undefined;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
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
foo?.bar?.baz?.buzz == undefined;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
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
foo.bar?.baz?.buzz == undefined;
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
foo == undefined ||
  foo[bar] == undefined ||
  foo[bar].baz == undefined ||
  foo[bar].baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
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
foo?.[bar]?.baz?.buzz == undefined;
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
foo == undefined || foo[bar].baz == undefined || foo[bar].baz.buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 80,
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
foo?.[bar].baz?.buzz == undefined;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo == undefined || foo[bar.baz] == undefined || foo[bar.baz].buzz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 80,
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
foo?.[bar.baz]?.buzz == undefined;
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
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
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
foo?.bar?.baz?.buzz() == undefined;
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
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
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
foo?.bar?.baz?.buzz?.() == undefined;
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
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
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
foo.bar?.baz?.buzz?.() == undefined;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo == undefined || foo.bar == undefined || foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 76,
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
foo?.bar?.baz.buzz() == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar == undefined || foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 56,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() == undefined;
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
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
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
foo?.bar?.baz.buzz?.() == undefined;
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
foo.bar == undefined ||
  foo.bar() == undefined ||
  foo.bar().baz == undefined ||
  foo.bar().baz.buzz == undefined ||
  foo.bar().baz.buzz() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
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
foo.bar?.()?.baz?.buzz?.() == undefined;
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
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz[buzz]() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
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
foo?.bar?.baz?.[buzz]() == undefined;
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
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz[buzz] == undefined ||
  foo.bar.baz[buzz]() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
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
foo?.bar?.baz?.[buzz]?.() == undefined;
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
foo == undefined ||
  foo?.bar == undefined ||
  foo?.bar.baz == undefined ||
  foo?.bar.baz[buzz] == undefined ||
  foo?.bar.baz[buzz]() == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
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
foo?.bar?.baz?.[buzz]?.() == undefined;
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo == undefined ||
  foo?.bar.baz == undefined ||
  foo?.bar.baz[buzz] == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 9,
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
foo?.bar.baz?.[buzz] == undefined;
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo == undefined || foo?.() == undefined || foo?.().bar == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 69,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar == undefined;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar == undefined ||
  foo.bar?.() == undefined ||
  foo.bar?.().baz == undefined;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz == undefined;
      `,
    },
  ],
  valid: [],
});
