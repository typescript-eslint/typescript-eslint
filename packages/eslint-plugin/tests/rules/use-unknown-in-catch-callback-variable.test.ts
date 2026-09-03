import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/use-unknown-in-catch-callback-variable';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('use-unknown-in-catch-callback-variable', rule, {
  valid: [
    `
Promise.resolve().catch((err: unknown) => {
  throw err;
});
    `,
    `
let x = Math.random() ? 'ca' + 'tch' : 'catch';
Promise.resolve()[x]((err: Error) => {});
    `,
    `
Promise.resolve().then(
  () => {},
  (err: unknown) => {
    throw err;
  },
);
    `,
    `
Promise.resolve().catch(() => {
  throw new Error();
});
    `,
    `
Promise.reject(new Error()).catch("not this rule's problem");
    `,
    `
declare const crappyHandler: (() => void) | 2;
Promise.reject(new Error()).catch(crappyHandler);
    `,

    `
Promise.resolve().catch((...args: [unknown]) => {
  throw args[0];
});
    `,
    `
Promise.resolve().catch((...args: [a: unknown]) => {
  const err = args[0];
});
    `,

    `
Promise.resolve().catch((...args: readonly unknown[]) => {
  throw args[0];
});
    `,

    `
declare const notAPromise: { catch: (f: Function) => void };
notAPromise.catch((...args: [a: string, string]) => {
  throw args[0];
});
    `,
    `
declare const catchArgs: [(x: unknown) => void];
Promise.reject(new Error()).catch(...catchArgs);
    `,

    `
declare const catchArgs: [
  string | (() => never),
  (shouldntFlag: string) => void,
  number,
];
Promise.reject(new Error()).catch(...catchArgs);
    `,
    `
declare const catchArgs: ['not callable'];
Promise.reject(new Error()).catch(...catchArgs);
    `,
    `
declare const emptySpread: [];
Promise.reject(new Error()).catch(...emptySpread);
    `,
    `
Promise.resolve().catch(
  (
    ...err: [unknown, string | ((number | unknown) & { b: () => void }), string]
  ) => {
    throw err;
  },
);
    `,
    `
declare const notAMemberExpression: (...args: any[]) => {};
notAMemberExpression(
  'This helps get 100% code cov',
  "but doesn't test anything useful related to the rule.",
);
    `,
    `
Promise.resolve().catch((...[args]: [unknown]) => {
  console.log(args);
});
    `,
    `
Promise.resolve().catch((...{ find }: [unknown]) => {
  console.log(find);
});
    `,
    'Promise.resolve.then();',
    'Promise.resolve().then(() => {});',
    `
declare const singleTupleArg: [() => void];
Promise.resolve().then(...singleTupleArg, (error: unknown) => {});
    `,
    `
declare const arrayArg: (() => void)[];
Promise.resolve().then(...arrayArg, error => {});
    `,
    `
declare let iPromiseImAPromise: Promise<any>;
declare const catchArgs: [(x: any) => void];
iPromiseImAPromise.catch(...catchArgs);
    `,
    `
declare const catchArgs: [
  string | (() => never) | ((x: string) => void),
  number,
];
Promise.reject(new Error()).catch(...catchArgs);
    `,
    `
declare const you: [];
declare const cannot: [];
declare const fool: [];
declare const me: [(x: Error) => void] | undefined;
Promise.resolve(undefined).catch(...you, ...cannot, ...fool, ...me!);
    `,
    `
declare const really: undefined[];
declare const dumb: [];
declare const code: (x: Error) => void;
Promise.resolve(undefined).catch(...really, ...dumb, code);
    `,
    `
declare const x: ((x: any) => string)[];
Promise.resolve('string promise').catch(...x);
    `,
    `
declare const x: any;
Promise.resolve().catch(...x);
    `,
    `
declare const thenArgs: [() => {}, (err: any) => {}];
Promise.resolve().then(...thenArgs);
    `,
    // this is valid, because the `any` is a passed-in handler, not a function literal.
    // https://github.com/typescript-eslint/typescript-eslint/issues/9057
    `
declare const yoloHandler: (x: any) => void;
Promise.reject(new Error('I will reject!')).catch(yoloHandler);
    `,
    // type assertion is not a function literal.
    `
type InvalidHandler = (arg: any) => void;
Promise.resolve().catch(<InvalidHandler>(
  function (err /* awkward spot for comment */) {
    throw err;
  }
));
    `,
  ],
  invalid: [
    {
      code: `
Promise.resolve().catch((err: Error) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err: unknown) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
let method = 'catch';
Promise.resolve()[method]((error: Error) => {});
      `,
      errors: [
        {
          column: 28,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
let method = 'catch';
Promise.resolve()[method]((error: unknown) => {});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((e, ...rest: []) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((e: unknown, ...rest: []) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(
  (err: string | ((number | unknown) & { b: () => void })) => {
    throw err;
  },
);
      `,
      errors: [
        {
          column: 4,
          endColumn: 58,
          endLine: 3,
          line: 3,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch(
  (err: unknown) => {
    throw err;
  },
);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(
  (
    ...err: [
      unknown[],
      string | ((number | unknown) & { b: () => void }),
      string,
    ]
  ) => {
    throw err;
  },
);
      `,
      errors: [
        {
          column: 5,
          endColumn: 6,
          endLine: 8,
          line: 4,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongRestTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch(
  (
    ...err: [unknown]
  ) => {
    throw err;
  },
);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(function (err: string) {
  throw err;
});
      `,
      errors: [
        {
          column: 35,
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch(function (err: unknown) {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(function (err /* awkward spot for comment */) {
  throw err;
});
      `,
      errors: [
        {
          column: 35,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch(function (err: unknown /* awkward spot for comment */) {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(function namedCallback(err: string) {
  throw err;
});
      `,
      errors: [
        {
          column: 48,
          endColumn: 59,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch(function namedCallback(err: unknown) {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch(err => {
  throw err;
});
      `,
      errors: [
        {
          column: 25,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err: unknown) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().then(
  () => {},
  error => {},
);
      `,
      errors: [
        {
          column: 3,
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().then(
  () => {},
  (error: unknown) => {},
);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((err?) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err?: unknown) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((err?: string) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err?: unknown) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: noFormat`
Promise.resolve().catch(err/* with comment */=> {
  throw err;
});
      `,
      errors: [
        {
          column: 25,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err: unknown)/* with comment */=> {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((err = 2) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err: unknown = 2) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((err: any /* comment 1 */ = /* comment 2 */ 2) => {
  throw err;
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 70,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((err: unknown /* comment 1 */ = /* comment 2 */ 2) => {
  throw err;
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((...args) => {
  throw args[0];
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownRestTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((...args: [unknown]) => {
  throw args[0];
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.reject(new Error('I will reject!')).catch(([err]: [unknown]) => {
  console.log(err);
});
      `,
      errors: [
        {
          column: 52,
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'useUnknownArrayDestructuringPattern',
          suggestions: null,
        },
      ],
    },

    {
      code: `
Promise.resolve(' a string ').catch(
  (a: any, b: () => any, c: (x: string & number) => void) => {},
);
      `,
      errors: [
        {
          column: 4,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve(' a string ').catch(
  (a: unknown, b: () => any, c: (x: string & number) => void) => {},
);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve('object destructuring').catch(({}) => {});
      `,
      errors: [
        {
          column: 48,
          endColumn: 50,
          endLine: 2,
          line: 2,
          messageId: 'useUnknownObjectDestructuringPattern',
        },
      ],
    },

    {
      code: `
Promise.resolve('object destructuring').catch(function ({ gotcha }) {
  return null;
});
      `,
      errors: [
        {
          column: 57,
          endColumn: 67,
          endLine: 2,
          line: 2,
          messageId: 'useUnknownObjectDestructuringPattern',
        },
      ],
    },

    {
      code: `
Promise.resolve()['catch']((x: any) => 'return');
      `,
      errors: [
        {
          column: 29,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              output: `
Promise.resolve()['catch']((x: unknown) => 'return');
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.reject().catch((...x: any) => {});
      `,
      errors: [
        {
          column: 25,
          endColumn: 34,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongRestTypeAnnotationSuggestion',
              output: `
Promise.reject().catch((...x: [unknown]) => {});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((...[args]: [string]) => {
  console.log(args);
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongRestTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((...[args]: [unknown]) => {
  console.log(args);
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
Promise.resolve().catch((...{ find }: [string]) => {
  console.log(find);
});
      `,
      errors: [
        {
          column: 26,
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'wrongRestTypeAnnotationSuggestion',
              output: `
Promise.resolve().catch((...{ find }: [unknown]) => {
  console.log(find);
});
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
declare const condition: boolean;
Promise.resolve('foo').then(() => {}, condition ? err => {} : err => {});
      `,
      errors: [
        {
          column: 51,
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
declare const condition: boolean;
Promise.resolve('foo').then(() => {}, condition ? (err: unknown) => {} : err => {});
      `,
            },
          ],
        },
        {
          column: 63,
          endColumn: 66,
          endLine: 3,
          line: 3,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
declare const condition: boolean;
Promise.resolve('foo').then(() => {}, condition ? err => {} : (err: unknown) => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const condition: boolean;
declare const maybeNullishHandler: null | ((err: any) => void);
Promise.resolve('foo').catch(
  condition
    ? ((err => {}, err => {}, maybeNullishHandler) ?? (err => {}))
    : (condition && (err => {})) || (err => {}),
);
      `,
      errors: [
        {
          column: 56,
          endColumn: 59,
          endLine: 6,
          line: 6,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
declare const condition: boolean;
declare const maybeNullishHandler: null | ((err: any) => void);
Promise.resolve('foo').catch(
  condition
    ? ((err => {}, err => {}, maybeNullishHandler) ?? ((err: unknown) => {}))
    : (condition && (err => {})) || (err => {}),
);
      `,
            },
          ],
        },
        {
          column: 22,
          endColumn: 25,
          endLine: 7,
          line: 7,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
declare const condition: boolean;
declare const maybeNullishHandler: null | ((err: any) => void);
Promise.resolve('foo').catch(
  condition
    ? ((err => {}, err => {}, maybeNullishHandler) ?? (err => {}))
    : (condition && ((err: unknown) => {})) || (err => {}),
);
      `,
            },
          ],
        },
        {
          column: 38,
          endColumn: 41,
          endLine: 7,
          line: 7,
          messageId: 'useUnknown',
          suggestions: [
            {
              messageId: 'addUnknownTypeAnnotationSuggestion',
              output: `
declare const condition: boolean;
declare const maybeNullishHandler: null | ((err: any) => void);
Promise.resolve('foo').catch(
  condition
    ? ((err => {}, err => {}, maybeNullishHandler) ?? (err => {}))
    : (condition && (err => {})) || ((err: unknown) => {}),
);
      `,
            },
          ],
        },
      ],
    },
  ],
});
