import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-and-boolean', rule, {
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
