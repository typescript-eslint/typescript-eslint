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

ruleTester.run('prefer-optional-chain-and-neqeq-null', rule, {
  // with the `| null | undefined` type - `!== null` doesn't cover the
  // `undefined` case - so optional chaining is not a valid conversion
  valid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
foo !== null && foo.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar !== null && foo.bar.baz;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
foo !== null && foo();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar !== null && foo.bar();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo !== null && foo.bar !== null && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar !== null && foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
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
foo !== null && foo[bar] !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
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
foo !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo !== null && foo[bar.baz] !== null && foo[bar.baz].buzz;
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
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz();
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
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
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
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar !== null && foo.bar.baz.buzz();
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
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
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
foo.bar !== null &&
  foo.bar() !== null &&
  foo.bar().baz !== null &&
  foo.bar().baz.buzz !== null &&
  foo.bar().baz.buzz();
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
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz[buzz]();
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
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz[buzz] !== null &&
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
foo !== null &&
  foo?.bar !== null &&
  foo?.bar.baz !== null &&
  foo?.bar.baz[buzz] !== null &&
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
foo !== null && foo?.bar.baz !== null && foo?.bar.baz[buzz];
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo !== null && foo?.() !== null && foo?.().bar;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;
      `,
    },
  ],
  // but if the type is just `| null` - then it covers the cases and is
  // a valid conversion
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null;
foo !== null && foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: number } | null;
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
declare const foo: { bar: { baz: number } | null };
foo.bar !== null && foo.bar.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: number } | null };
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
declare const foo: (() => number) | null;
foo !== null && foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: (() => number) | null;
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
declare const foo: { bar: (() => number) | null };
foo.bar !== null && foo.bar();
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: (() => number) | null };
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
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 77,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
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
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 61,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
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
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
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
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar !== null && foo.bar.baz.buzz;
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
declare const foo: { bar: { baz: { buzz: number } } | null };
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
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 7,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
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
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 6,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
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
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo !== null && foo[bar] !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
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
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 59,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
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
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo !== null && foo[bar.baz] !== null && foo[bar.baz].buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 59,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
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
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 79,
          endLine: 5,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
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
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 11,
          line: 7,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
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
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
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
  bar: { baz: { buzz: (() => number) | null } | null } | null;
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
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 55,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
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
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar !== null && foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
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
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz.buzz !== null &&
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
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
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
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar !== null &&
  foo.bar() !== null &&
  foo.bar().baz !== null &&
  foo.bar().baz.buzz !== null &&
  foo.bar().baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 9,
          line: 5,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
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
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 80,
          endLine: 6,
          line: 6,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
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
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz[buzz] !== null &&
  foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 12,
          line: 8,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
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
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo?.bar !== null &&
  foo?.bar.baz !== null &&
  foo?.bar.baz[buzz] !== null &&
  foo?.bar.baz[buzz]();
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
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
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
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo !== null && foo?.bar.baz !== null && foo?.bar.baz[buzz];
      `,
      errors: [
        {
          column: 1,
          endColumn: 60,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
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
declare const foo: (() => { bar: number } | null) | null;
foo !== null && foo?.() !== null && foo?.().bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: (() => { bar: number } | null) | null;
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
declare const foo: { bar: () => { baz: number } | null };
foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 60,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar?.()?.baz;
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
});
