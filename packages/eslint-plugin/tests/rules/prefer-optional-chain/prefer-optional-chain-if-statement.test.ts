import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-if-statement', rule, {
  valid: [
    // if statements are ignored by default
    `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo.bar();
}
    `,
    {
      code: `
declare const foo: { bar: () => void } | undefined;
declare function baz(): void;
if (foo) {
  foo.bar();
} else {
  baz();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo.bar();
  foo.bar();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: number } | undefined;
if (foo) {
  foo.bar = 1;
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
declare const unrelated: boolean;
if (unrelated && foo) {
  foo.bar();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
declare const baz: boolean;
if (foo || baz) {
  foo.bar();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
declare const baz: { bar: () => void };
if (foo) {
  baz.bar();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: number } | undefined;
if (foo) {
  foo;
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (!foo) {
  foo.bar();
}
      `,
      options: [{ ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: string | undefined;
if (foo) {
  foo.length;
}
      `,
      options: [{ checkString: false, ignoreIfStatements: false }],
    },
    {
      code: `
declare const foo: { bar: () => void };
if (foo) {
  foo.bar();
}
      `,
      options: [{ ignoreIfStatements: false, requireNullish: true }],
    },
  ],
  invalid: [
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo.bar();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
foo?.bar();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) foo.bar();
      `,
      errors: [
        {
          column: 1,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
foo?.bar();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
if (foo && foo.bar) {
  foo.bar.baz();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
foo?.bar?.baz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: () => void } } | undefined;
if (foo) {
  foo.bar.baz();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: { baz: () => void } } | undefined;
foo?.bar.baz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
if (foo?.bar) {
  foo.bar.baz();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
foo?.bar?.baz();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
if (foo) {
  foo.bar?.baz();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: { baz: () => void } | undefined } | undefined;
foo?.bar?.baz();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => void) | undefined } | undefined;
if (foo) {
  foo.bar?.();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: (() => void) | undefined } | undefined;
foo?.bar?.();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo!.bar();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
foo?.bar();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => void) | undefined };
if (foo.bar) {
  foo.bar!();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: (() => void) | undefined };
foo.bar?.();
      `,
    },
    {
      code: `
declare const foo: { bar: (() => void) | undefined };
if (foo.bar) {
  foo.bar();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: (() => void) | undefined };
foo.bar?.();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo['bar']();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
foo?.['bar']();
      `,
    },
    {
      code: `
declare const foo: (<T>() => void) | undefined;
if (foo) {
  foo<string>();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: (<T>() => void) | undefined;
foo?.<string>();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | null;
if (foo != null) {
  foo.bar();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
declare const foo: { bar: () => void } | null;
foo?.bar();
      `,
            },
          ],
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: null,
    },
    {
      code: noFormat`
declare const foo: { bar: () => void } | undefined;
if (foo) {
  foo.bar()
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
foo?.bar();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
declare const a: boolean;
if (a) {
} else if (foo) {
  foo.bar();
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 2,
          endLine: 7,
          line: 5,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
declare const a: boolean;
if (a) {
} else foo?.bar();
      `,
    },
    {
      code: `
declare const foo: { bar: () => void } | undefined;
if (foo) {
  // comment
  foo.bar();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 6,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: { bar: () => void } | undefined;
// comment
  foo?.bar();
      `,
    },
    {
      code: noFormat`
declare const foo: undefined | { bar: () => void };
/* a */ /* b */ if /* c */ /* d */ ( /* e */ /* f */ foo /* g */ /* h */) /* i */ /* j */ {
  /* k */ /* l */ foo /* m */ /* n */ . /* o */ /* p */ bar /* q */ /* r */ () /* s */ /* t */;
}
      `,
      errors: [
        {
          column: 17,
          endColumn: 2,
          endLine: 5,
          line: 3,
          messageId: 'preferOptionalChain',
        },
      ],
      options: [{ ignoreIfStatements: false }],
      output: `
declare const foo: undefined | { bar: () => void };
/* a */ /* b */ /* c */ /* d */ /* e */ /* f */ /* g */ /* h *//* i */ /* j */ /* k */ /* l */ foo /* m */ /* n */ ?. /* o */ /* p */ bar /* q */ /* r */ () /* s */ /* t */;
      `,
    },
  ],
});
