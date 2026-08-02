import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { tsconfigRootDir: getFixturesRootDir() } },
});

ruleTester.run('prefer-optional-chain-and-neqeq-undefined', rule, {
  // with the `| null | undefined` type - `!== undefined` doesn't cover the
  // `null` case - so optional chaining is not a valid conversion
  valid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo !== undefined && foo.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar !== undefined && foo.bar.baz;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo !== undefined && foo();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar !== undefined && foo.bar();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar !== undefined && foo.bar.baz !== undefined && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar !== undefined && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
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
foo !== undefined &&
  foo[bar] !== undefined &&
  foo[bar].baz !== undefined &&
  foo[bar].baz.buzz;
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
foo !== undefined && foo[bar].baz !== undefined && foo[bar].baz.buzz;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo !== undefined && foo[bar.baz] !== undefined && foo[bar.baz].buzz;
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
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz();
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
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
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
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar !== undefined && foo.bar.baz.buzz();
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
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
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
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz]();
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
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz] !== undefined &&
  foo.bar.baz[buzz]();
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
foo !== undefined &&
  foo?.bar !== undefined &&
  foo?.bar.baz !== undefined &&
  foo?.bar.baz[buzz] !== undefined &&
  foo?.bar.baz[buzz]();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo !== undefined && foo?.bar.baz !== undefined && foo?.bar.baz[buzz];
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo !== undefined && foo?.() !== undefined && foo?.().bar;
      `,
    },
  ],
  // but if the type is just `| undefined` - then it covers the cases and is
  // a valid conversion
  invalid: [
    {
      code: `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo.bar;
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
declare const foo: { bar: number } | undefined;
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
declare const foo: { bar: { baz: number } | undefined };
foo.bar !== undefined && foo.bar.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: number } | undefined };
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
declare const foo: (() => number) | undefined;
foo !== undefined && foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: (() => number) | undefined;
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
declare const foo: { bar: (() => number) | undefined };
foo.bar !== undefined && foo.bar();
      `,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: (() => number) | undefined };
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
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 7,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
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
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar !== undefined && foo.bar.baz !== undefined && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 71,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
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
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 63,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
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
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar !== undefined && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
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
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 8,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
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
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 7,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
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
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo[bar] !== undefined &&
  foo[bar].baz !== undefined &&
  foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 11,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
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
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined && foo[bar].baz !== undefined && foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 69,
          endLine: 8,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
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
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo !== undefined && foo[bar.baz] !== undefined && foo[bar.baz].buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 69,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
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
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 10,
          line: 7,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
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
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 15,
          line: 11,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
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
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 8,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
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
  { bar: { baz: { buzz: () => number } } | undefined } | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 65,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  { bar: { baz: { buzz: () => number } } | undefined } | undefined;
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
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar !== undefined && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
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
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 10,
          line: 7,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
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
    { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar !== undefined &&
  foo.bar() !== undefined &&
  foo.bar().baz !== undefined &&
  foo.bar().baz.buzz !== undefined &&
  foo.bar().baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 10,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: () =>
    { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
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
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 11,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
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
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz] !== undefined &&
  foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 16,
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
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
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
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo?.bar !== undefined &&
  foo?.bar.baz !== undefined &&
  foo?.bar.baz[buzz] !== undefined &&
  foo?.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 16,
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
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
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
  { bar: { baz: { [k: string]: number } | undefined } } | undefined;
foo !== undefined && foo?.bar.baz !== undefined && foo?.bar.baz[buzz];
      `,
      errors: [
        {
          column: 1,
          endColumn: 70,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo:
  { bar: { baz: { [k: string]: number } | undefined } } | undefined;
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
declare const foo: (() => { bar: number } | undefined) | undefined;
foo !== undefined && foo?.() !== undefined && foo?.().bar;
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
declare const foo: (() => { bar: number } | undefined) | undefined;
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
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 70,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar?.()?.baz;
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
foo.bar !== undefined &&
  foo.bar() !== undefined &&
  foo.bar().baz !== undefined &&
  foo.bar().baz.buzz !== undefined &&
  foo.bar().baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 9,
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
foo.bar?.() !== undefined &&
  foo.bar().baz !== undefined &&
  foo.bar().baz.buzz !== undefined &&
  foo.bar().baz.buzz();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 51,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.() !== undefined && foo.bar?.().baz;
      `,
            },
          ],
        },
      ],
    },
  ],
});
