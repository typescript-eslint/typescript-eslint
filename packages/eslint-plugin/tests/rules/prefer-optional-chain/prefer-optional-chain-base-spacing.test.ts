import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

describe('base cases', () => {
  describe('should ignore spacing sanity checks', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      // One base case does not match the mutator, so we have to dedupe it
      invalid: [
        {
          code: noFormat`
declare const foo: { bar: number } | null | undefined;
foo && foo.      bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 21,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: number } | null | undefined };
foo.      bar && foo.      bar.      baz;
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
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
          `,
        },
        {
          code: `
declare const foo: (() => number) | null | undefined;
foo && foo();
          `,
          errors: [
            {
              column: 1,
              endColumn: 13,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: (() => number) | null | undefined;
foo?.();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: (() => number) | null | undefined };
foo.      bar && foo.      bar();
          `,
          errors: [
            {
              column: 1,
              endColumn: 33,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
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
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.      bar && foo.      bar.      baz && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 79,
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
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.      bar && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 6,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.      bar && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 52,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
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
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
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
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].      baz && foo[bar].      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 71,
              endLine: 12,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].      baz && foo[bar].      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 12,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.      baz] && foo[bar.      baz].      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 7,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.      baz]?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 14,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
          `,
        },
        {
          code: noFormat`
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
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
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
foo?.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
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
foo.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.      bar && foo.      bar.      baz.      buzz();
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
foo?.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.      bar && foo.      bar.      baz.      buzz();
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
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 14,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.      bar &&
  foo.      bar() &&
  foo.      bar().      baz &&
  foo.      bar().      baz.      buzz &&
  foo.      bar().      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 41,
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
foo.bar?.()?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
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
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 34,
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
foo?.bar?.baz?.[buzz]();
          `,
        },
        {
          code: noFormat`
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
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz[buzz] &&
  foo.      bar.      baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 34,
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
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
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
foo &&
  foo?.      bar &&
  foo?.      bar.      baz &&
  foo?.      bar.      baz[buzz] &&
  foo?.      bar.      baz[buzz]();
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
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.      bar.      baz && foo?.      bar.      baz[buzz];
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
foo?.bar.baz?.[buzz];
          `,
        },
        {
          code: noFormat`
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.      () && foo?.      ().      bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 48,
              endLine: 6,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.      bar && foo.      bar?.      () && foo.      bar?.      ().      baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 78,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: number } | null | undefined;
foo && foo.
bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 4,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: number } | null | undefined };
foo.
bar && foo.
bar.
baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 6,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: (() => number) | null | undefined };
foo.
bar && foo.
bar();
          `,
          errors: [
            {
              column: 1,
              endColumn: 6,
              endLine: 5,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 12,
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
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 11,
              line: 5,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 10,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.
bar && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 7,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 14,
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
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.
bar && foo.
bar.
baz && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 14,
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
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].
baz && foo[bar].
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 15,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].
baz && foo[bar].
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 15,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.
baz] && foo[bar.
baz].
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 10,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.
baz]?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 17,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
          `,
        },
        {
          code: noFormat`
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
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 22,
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
foo?.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 17,
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
foo.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 10,
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
foo?.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.
bar && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 7,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 18,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.
bar &&
  foo.
bar() &&
  foo.
bar().
baz &&
  foo.
bar().
baz.
buzz &&
  foo.
bar().
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 22,
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
foo.bar?.()?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
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
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 17,
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
foo?.bar?.baz?.[buzz]();
          `,
        },
        {
          code: noFormat`
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
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz[buzz] && foo.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 24,
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
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
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
foo && foo?.
bar && foo?.
bar.
baz && foo?.
bar.
baz[buzz] && foo?.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 24,
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
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.
bar.
baz && foo?.
bar.
baz[buzz];
          `,
          errors: [
            {
              column: 1,
              endColumn: 10,
              endLine: 11,
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
foo?.bar.baz?.[buzz];
          `,
        },
        {
          code: noFormat`
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.
() && foo?.
().
bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 9,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.
bar && foo.
bar?.
() && foo.
bar?.
().
baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 9,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
          `,
        },
      ],
    });
  });
});
