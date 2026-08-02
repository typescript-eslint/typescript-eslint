import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { tsconfigRootDir: getFixturesRootDir() } },
});

ruleTester.run('prefer-optional-chain-and-neq-null', rule, {
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo != null && foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar != null && foo.bar.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo != null && foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: (() => number) | null | undefined;
foo?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar != null && foo.bar();
      `,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 74,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 59,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo != null && foo.bar != null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 51,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar != null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 10,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 9,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null && foo[bar] != null && foo[bar].baz != null && foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 77,
          endLine: 10,
          line: 10,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null && foo[bar].baz != null && foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 57,
          endLine: 10,
          line: 10,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        { baz: { buzz: number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo != null && foo[bar.baz] != null && foo[bar.baz].buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 57,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo?.[bar.baz]?.buzz;
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 76,
          endLine: 9,
          line: 9,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | {
      bar:
        { baz: { buzz: () => number } | null | undefined } | null | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 17,
          line: 13,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
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
foo?.bar?.baz?.buzz?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 11,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 53,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar != null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null &&
  foo.bar != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 12,
          line: 9,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | {
      bar:
        { baz: { buzz: (() => number) | null | undefined } } | null | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != null &&
  foo.bar() != null &&
  foo.bar().baz != null &&
  foo.bar().baz.buzz != null &&
  foo.bar().baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 12,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 77,
          endLine: 12,
          line: 12,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
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
foo?.bar?.baz?.[buzz]();
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz[buzz] != null &&
  foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 21,
          line: 17,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
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
foo?.bar?.baz?.[buzz]?.();
      `,
            },
          ],
        },
      ],
      output: null,
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
foo != null &&
  foo?.bar != null &&
  foo?.bar.baz != null &&
  foo?.bar.baz[buzz] != null &&
  foo?.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 21,
          line: 17,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
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
foo?.bar?.baz?.[buzz]?.();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo != null && foo?.bar.baz != null && foo?.bar.baz[buzz];
      `,
      errors: [
        {
          column: 1,
          endColumn: 58,
          endLine: 7,
          line: 7,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo != null && foo?.() != null && foo?.().bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar;
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar != null && foo.bar?.() != null && foo.bar?.().baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 58,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
  valid: [],
});
