import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

describe('base cases', () => {
  describe('and', () => {
    describe('boolean', () => {
      ruleTester.run('prefer-optional-chain', rule, {
        invalid: [
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar;
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
declare const foo: { bar: number } | null | undefined;
foo?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz;
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
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar();
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
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
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
foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
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
            code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo && foo.bar && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
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
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
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
foo.bar?.baz?.buzz;
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
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.[bar]?.baz?.buzz;
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
foo && foo[bar].baz && foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar].baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar.baz]?.buzz;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
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
foo?.bar?.baz?.buzz();
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
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 72,
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
foo?.bar?.baz?.buzz?.();
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
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo.bar?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
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
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz();
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
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
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
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
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
foo?.bar?.baz.buzz?.();
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
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
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
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.bar?.baz?.[buzz]();
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
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz] && foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 74,
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
foo?.bar?.baz?.[buzz]?.();
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
foo && foo?.bar && foo?.bar.baz && foo?.bar.baz[buzz] && foo?.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 78,
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
foo?.bar?.baz?.[buzz]?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz];
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
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
            code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo && foo?.() && foo?.().bar;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
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
          // it should ignore parts of the expression that aren't part of the expression chain
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar && bing;
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
declare const foo: { bar: number } | null | undefined;
foo?.bar && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz && bing;
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
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz && bing;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
foo && foo() && bing;
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
foo?.() && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar() && bing;
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
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
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
foo?.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
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
foo.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo && foo.bar && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo?.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
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
foo.bar?.baz?.buzz && bing;
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
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.[bar]?.baz?.buzz && bing;
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
foo && foo[bar].baz && foo[bar].baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar].baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar.baz]?.buzz && bing;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
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
foo?.bar?.baz?.buzz() && bing;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 72,
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
foo?.bar?.baz?.buzz?.() && bing;
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
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo.bar?.baz?.buzz?.() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
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
foo?.bar?.baz.buzz() && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz() && bing;
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
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() && bing;
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
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
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
foo?.bar?.baz.buzz?.() && bing;
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
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
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
foo.bar?.()?.baz?.buzz?.() &&
  bing;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.bar?.baz?.[buzz]() && bing;
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
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz[buzz] &&
  foo.bar.baz[buzz]() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 22,
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
foo?.bar?.baz?.[buzz]?.() &&
  bing;
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
foo &&
  foo?.bar &&
  foo?.bar.baz &&
  foo?.bar.baz[buzz] &&
  foo?.bar.baz[buzz]() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
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
foo?.bar?.baz?.[buzz]?.() &&
  bing;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz] && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
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
foo?.bar.baz?.[buzz] && bing;
            `,
          },
          {
            code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo && foo?.() && foo?.().bar && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar && bing.bong;
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
declare const foo: { bar: number } | null | undefined;
foo?.bar && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz && bing.bong;
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
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
foo && foo() && bing.bong;
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
foo?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar() && bing.bong;
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
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
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
foo?.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
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
foo.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo && foo.bar && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  { bar: { baz: { buzz: number } } | null | undefined } | null | undefined;
foo?.bar?.baz.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo?.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
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
foo.bar?.baz?.buzz && bing.bong;
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
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.[bar]?.baz?.buzz && bing.bong;
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
foo && foo[bar].baz && foo[bar].baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar].baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  { [k: string]: { buzz: number } | null | undefined } | null | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
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
foo?.[bar.baz]?.buzz && bing.bong;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
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
foo?.bar?.baz?.buzz() && bing.bong;
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
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz.buzz &&
  foo.bar.baz.buzz() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 21,
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
foo?.bar?.baz?.buzz?.() &&
  bing.bong;
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
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
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
foo.bar?.baz?.buzz?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
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
foo?.bar?.baz.buzz() && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz() && bing.bong;
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
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() && bing.bong;
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
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
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
foo?.bar?.baz.buzz?.() && bing.bong;
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
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
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
foo.bar?.()?.baz?.buzz?.() &&
  bing.bong;
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
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
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
foo?.bar?.baz?.[buzz]() && bing.bong;
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
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz[buzz] &&
  foo.bar.baz[buzz]() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 22,
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
foo?.bar?.baz?.[buzz]?.() &&
  bing.bong;
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
foo &&
  foo?.bar &&
  foo?.bar.baz &&
  foo?.bar.baz[buzz] &&
  foo?.bar.baz[buzz]() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
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
foo?.bar?.baz?.[buzz]?.() &&
  bing.bong;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz] && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
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
foo?.bar.baz?.[buzz] && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo && foo?.() && foo?.().bar && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 4,
                line: 4,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  (() => { bar: number } | null | undefined) | null | undefined;
foo?.()?.bar && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz && bing.bong;
            `,
          },
        ],
        valid: [],
      });
    });

    describe('strict nullish equality checks', () => {
      describe('!== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
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
      });

      describe('!= null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
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
      });

      describe('!== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
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
      });

      describe('!= undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo != undefined && foo.bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
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
foo.bar != undefined && foo.bar.baz;
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
foo != undefined && foo();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 26,
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
foo.bar != undefined && foo.bar();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
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
foo.bar != undefined && foo.bar.baz != undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
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
foo != undefined && foo.bar != undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 61,
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
foo.bar != undefined && foo.bar.baz.buzz;
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz != undefined &&
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
foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz != undefined &&
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
foo != undefined &&
  foo[bar] != undefined &&
  foo[bar].baz != undefined &&
  foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 20,
                  endLine: 13,
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
foo != undefined && foo[bar].baz != undefined && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 67,
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
foo != undefined && foo[bar.baz] != undefined && foo[bar.baz].buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 67,
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz != undefined &&
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
foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz != undefined &&
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
foo != undefined && foo.bar != undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 63,
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
foo.bar != undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 43,
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz.buzz != undefined &&
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
foo.bar != undefined &&
  foo.bar() != undefined &&
  foo.bar().baz != undefined &&
  foo.bar().baz.buzz != undefined &&
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 15,
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
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz[buzz] != undefined &&
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
foo != undefined &&
  foo?.bar != undefined &&
  foo?.bar.baz != undefined &&
  foo?.bar.baz[buzz] != undefined &&
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
foo != undefined && foo?.bar.baz != undefined && foo?.bar.baz[buzz];
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
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
foo != undefined && foo?.() != undefined && foo?.().bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 56,
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
foo.bar != undefined && foo.bar?.() != undefined && foo.bar?.().baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
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
      });
    });
  });
});
