import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { tsconfigRootDir: getFixturesRootDir() } },
});

ruleTester.run('prefer-optional-chain-or-boolean', rule, {
  invalid: [
    {
      code: `
declare const foo: { bar: number } | null | undefined;
!foo || !foo.bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: number } | null | undefined;
!foo?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: number } | null | undefined };
!foo.bar || !foo.bar.baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: number } | null | undefined };
!foo.bar?.baz;
      `,
    },
    {
      code: `
declare const foo: (() => number) | null | undefined;
!foo || !foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: (() => number) | null | undefined;
!foo?.();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => number) | null | undefined };
!foo.bar || !foo.bar();
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: (() => number) | null | undefined };
!foo.bar?.();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 54,
          endLine: 6,
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
!foo?.bar?.baz?.buzz;
      `,
    },
    {
      code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
!foo.bar || !foo.bar.baz || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 46,
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
!foo.bar?.baz?.buzz;
      `,
    },
    {
      code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
!foo || !foo.bar || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
!foo?.bar?.baz.buzz;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
!foo.bar || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
!foo.bar?.baz.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 70,
          endLine: 6,
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
!foo?.bar?.baz?.buzz;
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo.bar || !foo.bar.baz || !foo.bar.baz || !foo.bar.baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 62,
          endLine: 6,
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
!foo.bar?.baz?.buzz;
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
!foo || !foo[bar] || !foo[bar].baz || !foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 57,
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
!foo?.[bar]?.baz?.buzz;
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
!foo || !foo[bar].baz || !foo[bar].baz.buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
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
!foo?.[bar].baz?.buzz;
      `,
    },
    {
      code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
!foo || !foo[bar.baz] || !foo[bar.baz].buzz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 44,
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
!foo?.[bar.baz]?.buzz;
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
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 56,
          endLine: 9,
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
!foo?.bar?.baz?.buzz();
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
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 77,
          endLine: 13,
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
!foo?.bar?.baz?.buzz?.();
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
!foo.bar || !foo.bar.baz || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 69,
          endLine: 8,
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
!foo.bar?.baz?.buzz?.();
      `,
    },
    {
      code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
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
!foo?.bar?.baz.buzz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
!foo.bar || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
!foo.bar?.baz.buzz();
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
!foo || !foo.bar || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 61,
          endLine: 9,
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
!foo?.bar?.baz.buzz?.();
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
!foo.bar ||
  !foo.bar() ||
  !foo.bar().baz ||
  !foo.bar().baz.buzz ||
  !foo.bar().baz.buzz();
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
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
!foo.bar?.()?.baz?.buzz?.();
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
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 57,
          endLine: 12,
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
!foo?.bar?.baz?.[buzz]();
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
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz[buzz] || !foo.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 79,
          endLine: 17,
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
!foo?.bar?.baz?.[buzz]?.();
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
!foo ||
  !foo?.bar ||
  !foo?.bar.baz ||
  !foo?.bar.baz[buzz] ||
  !foo?.bar.baz[buzz]();
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
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
!foo?.bar?.baz?.[buzz]?.();
      `,
    },
    {
      code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
!foo || !foo?.bar.baz || !foo?.bar.baz[buzz];
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
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
!foo?.bar.baz?.[buzz];
      `,
    },
    {
      code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
!foo || !foo?.() || !foo?.().bar;
      `,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
!foo?.()?.bar;
      `,
    },
    {
      code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
!foo.bar || !foo.bar?.() || !foo.bar?.().baz;
      `,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
      output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
!foo.bar?.()?.baz;
      `,
    },
  ],
  valid: [],
});
