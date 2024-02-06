import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/use-unknown-in-catch-callback-variable';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('use-unknown-in-catch-callback-variable', rule, {
  valid: [
    `
      Promise.resolve().catch((err: unknown) => {
        throw err;
      });
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
Promise.resolve().catch((e, ...rest: []) => {
  throw err;
});
      `,
      errors: [
        {
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
type InvalidHandler = (arg: any) => void;
Promise.resolve().catch(<InvalidHandler>(
  function (err /* awkward spot for comment */) {
    throw err;
  }
));
      `,
      errors: [
        {
          line: 3,
          messageId: 'useUnknown',
          // We should _not_ make a suggestion due to the type assertion.
          suggestions: null,
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
Promise.resolve().catch((err?) => {
  throw err;
});
      `,
      errors: [
        {
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
          line: 2,
          messageId: 'useUnknownDestructuringPattern',
          suggestions: null,
        },
      ],
    },

    {
      code: `
declare const yoloHandler: (x: any) => void;
Promise.reject(new Error('I will reject!')).catch(yoloHandler);
      `,
      errors: [
        {
          line: 3,
          messageId: 'useUnknown',
        },
      ],
    },

    {
      code: `
declare let iPromiseImAPromise: Promise<any>;
declare const catchArgs: [(x: any) => void];
iPromiseImAPromise.catch(...catchArgs);
      `,
      errors: [
        {
          line: 4,
          messageId: 'useUnknown',
        },
      ],
    },

    {
      code: `
declare const catchArgs: [
  string | (() => never) | ((shouldFlag: string) => void),
  number,
];
Promise.reject(new Error()).catch(...catchArgs);
      `,
      errors: [
        {
          line: 6,
          messageId: 'useUnknown',
        },
      ],
    },

    {
      code: `
declare const you: [];
declare const cannot: [];
declare const fool: [];
declare const me: [(shouldFlag: Error) => void] | undefined;
Promise.resolve(undefined).catch(...you, ...cannot, ...fool, ...me!);
      `,
      errors: [
        {
          line: 6,
          messageId: 'useUnknownSpreadArgs',
        },
      ],
    },

    {
      code: `
declare const really: undefined[];
declare const dumb: [];
declare const code: (shouldFlag: Error) => void;
Promise.resolve(undefined).catch(...really, ...dumb, code);
      `,
      errors: [
        {
          line: 5,
          messageId: 'useUnknownSpreadArgs',
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
          line: 2,
          messageId: 'useUnknownDestructuringPattern',
        },
      ],
    },

    {
      code: `
Promise.resolve()['catch']((x: any) => 'return');
      `,
      errors: [
        {
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
declare const x: any;
Promise.resolve().catch(...x);
      `,
      errors: [
        {
          line: 3,
          messageId: 'useUnknown',
          suggestions: null,
        },
      ],
    },

    {
      code: `
declare const x: ((x: any) => string)[];
Promise.resolve('string promise').catch(...x);
      `,
      errors: [
        {
          line: 3,
          messageId: 'useUnknown',
          suggestions: null,
        },
      ],
    },

    {
      code: `
Promise.reject().catch((...x: any) => {});
      `,
      errors: [
        {
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
  ],
});
