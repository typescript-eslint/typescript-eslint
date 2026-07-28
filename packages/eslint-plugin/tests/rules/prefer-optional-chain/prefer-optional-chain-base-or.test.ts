import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

describe('base cases', () => {
  describe('or', () => {
    describe('boolean', () => {
      ruleTester.run('prefer-optional-chain', rule, {
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
    });

    describe('strict nullish equality checks', () => {
      describe('=== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== null` doesn't cover the
          // `undefined` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo === null || foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar === null || foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo === null || foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar === null || foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
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
foo === null || foo[bar] === null || foo[bar].baz === null || foo[bar].baz.buzz;
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
foo === null || foo[bar].baz === null || foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz;
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
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz();
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
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
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz();
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
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
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
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
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz[buzz]();
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
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
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
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
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo === null || foo?.() === null || foo?.().bar;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz;
              `,
            },
          ],
          // but if the type is just `| null` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null;
foo === null || foo.bar === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | null;
foo?.bar === null;
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
foo.bar === null || foo.bar.baz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 41,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | null };
foo.bar?.baz === null;
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
foo === null || foo() === null;
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
declare const foo: (() => number) | null;
foo?.() === null;
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
foo.bar === null || foo.bar() === null;
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
declare const foo: { bar: (() => number) | null };
foo.bar?.() === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 6,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz === null;
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
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz === null;
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
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar?.baz?.buzz === null;
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
foo === null || foo.bar === null || foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 62,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo?.bar?.baz.buzz === null;
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
foo.bar === null || foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 46,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar?.baz.buzz === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 7,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz === null;
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
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 6,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar?.baz?.buzz === null;
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
foo === null ||
  foo[bar] === null ||
  foo[bar].baz === null ||
  foo[bar].baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 9,
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
foo?.[bar]?.baz?.buzz === null;
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
foo === null || foo[bar].baz === null || foo[bar].baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
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
foo?.[bar].baz?.buzz === null;
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
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo?.[bar.baz]?.buzz === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo?.bar?.baz?.buzz() === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
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
foo?.bar?.baz?.buzz?.() === null;
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
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
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
foo.bar?.baz?.buzz?.() === null;
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
foo === null || foo.bar === null || foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 64,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo?.bar?.baz.buzz() === null;
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
foo.bar === null || foo.bar.baz.buzz() === null;
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
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar?.baz.buzz() === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
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
foo?.bar?.baz.buzz?.() === null;
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
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
  foo.bar().baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
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
foo.bar?.()?.baz?.buzz?.() === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 9,
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
foo?.bar?.baz?.[buzz]() === null;
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
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
  foo.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
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
foo?.bar?.baz?.[buzz]?.() === null;
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
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
  foo?.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
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
foo?.bar?.baz?.[buzz]?.() === null;
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
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz] === null;
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
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo?.bar.baz?.[buzz] === null;
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
foo === null || foo?.() === null || foo?.().bar === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 57,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => { bar: number } | null) | null;
foo?.()?.bar === null;
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
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar?.()?.baz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
          ],
        });
      });

      describe('== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
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
      });

      describe('=== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== undefined` doesn't cover the
          // `null` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo === undefined || foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar === undefined || foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo === undefined || foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar === undefined || foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar === undefined || foo.bar.baz === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
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
foo === undefined ||
  foo[bar] === undefined ||
  foo[bar].baz === undefined ||
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
foo === undefined || foo[bar].baz === undefined || foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo === undefined || foo[bar.baz] === undefined || foo[bar.baz].buzz;
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
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
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar === undefined || foo.bar.baz.buzz();
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz.buzz === undefined ||
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz] === undefined ||
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
foo === undefined ||
  foo?.bar === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined ||
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
foo === undefined || foo?.bar.baz === undefined || foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo === undefined || foo?.() === undefined || foo?.().bar;
              `,
            },
          ],
          // but if the type is just `| undefined` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | undefined;
foo === undefined || foo.bar === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 43,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: number } | undefined;
foo?.bar === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar === undefined || foo.bar.baz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 51,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar?.baz === undefined;
              `,
            },
            {
              code: `
declare const foo: (() => number) | undefined;
foo === undefined || foo() === undefined;
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
declare const foo: (() => number) | undefined;
foo?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | undefined };
foo.bar === undefined || foo.bar() === undefined;
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
declare const foo: { bar: (() => number) | undefined };
foo.bar?.() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 7,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo?.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 7,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 77,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo?.bar?.baz.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar === undefined || foo.bar.baz.buzz === undefined;
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
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar?.baz.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 8,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo?.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 7,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  { bar: { baz: { buzz: number } | undefined } | undefined } | undefined;
foo.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo[bar] === undefined ||
  foo[bar].baz === undefined ||
  foo[bar].baz.buzz === undefined;
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
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar]?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo[bar].baz === undefined ||
  foo[bar].baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 10,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar].baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo === undefined ||
  foo[bar.baz] === undefined ||
  foo[bar.baz].buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 6,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo?.[bar.baz]?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.buzz() === undefined;
              `,
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 15,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
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
foo?.bar?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  { bar: { baz: { buzz: () => number } } | undefined } | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 79,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  { bar: { baz: { buzz: () => number } } | undefined } | undefined;
foo?.bar?.baz.buzz() === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar === undefined || foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 58,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar?.baz.buzz() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo?.bar?.baz.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar === undefined ||
  foo.bar() === undefined ||
  foo.bar().baz === undefined ||
  foo.bar().baz.buzz === undefined ||
  foo.bar().baz.buzz() === undefined;
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
declare const foo: {
  bar: () =>
    { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar?.()?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]() === undefined;
              `,
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
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz] === undefined ||
  foo.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 16,
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
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.() === undefined;
              `,
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
foo === undefined ||
  foo?.bar === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined ||
  foo?.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 16,
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
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  { bar: { baz: { [k: string]: number } | undefined } } | undefined;
foo === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 7,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  { bar: { baz: { [k: string]: number } | undefined } } | undefined;
foo?.bar.baz?.[buzz] === undefined;
              `,
            },
            {
              code: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo === undefined || foo?.() === undefined || foo?.().bar === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 72,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo?.()?.bar === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar === undefined ||
  foo.bar?.() === undefined ||
  foo.bar?.().baz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 5,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar?.()?.baz === undefined;
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
                foo.bar === undefined ||
                  foo.bar() === undefined ||
                  foo.bar().baz === undefined ||
                  foo.bar().baz.buzz === undefined ||
                  foo.bar().baz.buzz();
              `,
              errors: [
                {
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
                foo.bar?.() === undefined ||
                  foo.bar().baz === undefined ||
                  foo.bar().baz.buzz === undefined ||
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
                foo.bar === undefined || foo.bar?.() === undefined || foo.bar?.().baz;
              `,
              errors: [
                {
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar?.() === undefined || foo.bar?.().baz;
              `,
                    },
                  ],
                },
              ],
            },
          ],
        });
      });

      describe('== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
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
      });
    });
  });
});
