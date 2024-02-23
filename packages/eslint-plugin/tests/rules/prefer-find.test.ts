import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-find';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-find', rule, {
  valid: [
    `
      interface JerkCode<T> {
        filter(predicate: (item: T) => boolean): JerkCode<T>;
      }

      declare const jerkCode: JerkCode<string>;

      jerkCode.filter(item => item === 'aha')[0];
    `,
    `
      declare const arr: readonly string[];
      arr.filter(item => item === 'aha')[1];
    `,
    `
      declare const arr: string[];
      arr.filter(item => item === 'aha').at(1);
    `,
    `
      declare const notNecessarilyAnArray: unknown[] | undefined | null | string;
      notNecessarilyAnArray?.filter(item => true)[0];
    `,
    // Be sure that we don't try to mess with this case, since the member access
    // should not need to be optional for the cases the rule is concerned with.
    '[].filter(() => true)?.[0];',
    // Be sure that we don't try to mess with this case, since the member access
    // should not need to be optional for the cases the rule is concerned with.
    '[].filter(() => true)?.at?.(0);',
    // Be sure that we don't try to mess with this case, since the function call
    // should not need to be optional for the cases the rule is concerned with.
    '[].filter?.(() => true)[0];',
    '[1, 2, 3].filter(x => x > 0).at(-Infinity);',
    `
      declare const arr: string[];
      declare const cond: Parameters<Array<string>['filter']>[0];
      const a = { arr };
      a?.arr.filter(cond).at(1);
    `,
    "['Just', 'a', 'filter'].filter(x => x.length > 4);",
    "['Just', 'a', 'find'].find(x => x.length > 4);",
    'undefined.filter(x => x)[0];',
    'null?.filter(x => x)[0];',
    // Should not throw. See https://github.com/typescript-eslint/typescript-eslint/issues/8386
    `
      declare function foo(param: any): any;
      foo(Symbol.for('foo'));
    `,
    // Specifically need to test Symbol.for(), not just Symbol(), since only
    // Symbol.for() creates a static value that the rule inspects.
    `
      declare const arr: string[];
      const s = Symbol.for("Don't throw!");
      arr.filter(item => item === 'aha').at(s);
    `,
    "[1, 2, 3].filter(x => x)[Symbol('0')];",
    "[1, 2, 3].filter(x => x)[Symbol.for('0')];",
    '(Math.random() < 0.5 ? [1, 2, 3].filter(x => true) : [1, 2, 3])[0];',
    `
      (Math.random() < 0.5
        ? [1, 2, 3].find(x => true)
        : [1, 2, 3].filter(x => true))[0];
    `,
  ],

  invalid: [
    {
      code: `
declare const arr: string[];
arr.filter(item => item === 'aha')[0];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: string[];
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: Array<string>;
const zero = 0;
arr.filter(item => item === 'aha')[zero];
      `,
      errors: [
        {
          line: 4,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: Array<string>;
const zero = 0;
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: Array<string>;
const zero = 0n;
arr.filter(item => item === 'aha')[zero];
      `,
      errors: [
        {
          line: 4,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: Array<string>;
const zero = 0n;
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: Array<string>;
const zero = -0n;
arr.filter(item => item === 'aha')[zero];
      `,
      errors: [
        {
          line: 4,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: Array<string>;
const zero = -0n;
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: readonly string[];
arr.filter(item => item === 'aha').at(0);
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: readonly string[];
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: ReadonlyArray<string>;
(undefined, arr.filter(item => item === 'aha')).at(0);
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: ReadonlyArray<string>;
(undefined, arr.find(item => item === 'aha'));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: string[];
const zero = 0;
arr.filter(item => item === 'aha').at(zero);
      `,
      errors: [
        {
          line: 4,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: string[];
const zero = 0;
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: string[];
arr.filter(item => item === 'aha')['0'];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: string[];
arr.find(item => item === 'aha');
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'const two = [1, 2, 3].filter(item => item === 2)[0];',
      errors: [
        {
          line: 1,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `const two = [1, 2, 3].find(item => item === 2);`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`const fltr = "filter"; (([] as unknown[]))[fltr] ((item) => { return item === 2 }  ) [ 0  ] ;`,
      errors: [
        {
          line: 1,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output:
                'const fltr = "filter"; (([] as unknown[]))["find"] ((item) => { return item === 2 }  )  ;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(([] as unknown[]))?.["filter"] ((item) => { return item === 2 }  ) [ 0  ] ;`,
      errors: [
        {
          line: 1,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output:
                '(([] as unknown[]))?.["find"] ((item) => { return item === 2 }  )  ;',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const nullableArray: unknown[] | undefined | null;
nullableArray?.filter(item => true)[0];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const nullableArray: unknown[] | undefined | null;
nullableArray?.find(item => true);
      `,
            },
          ],
        },
      ],
    },
    {
      code: '([]?.filter(f))[0];',
      errors: [
        {
          line: 1,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: '([]?.find(f));',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const objectWithArrayProperty: { arr: unknown[] };
declare function cond(x: unknown): boolean;
console.log((1, 2, objectWithArrayProperty?.arr['filter'](cond)).at(0));
      `,
      errors: [
        {
          line: 4,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const objectWithArrayProperty: { arr: unknown[] };
declare function cond(x: unknown): boolean;
console.log((1, 2, objectWithArrayProperty?.arr["find"](cond)));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[1, 2, 3].filter(x => x > 0).at(NaN);
      `,
      errors: [
        {
          line: 2,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
[1, 2, 3].find(x => x > 0);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const idxToLookUp = -0.12635678;
[1, 2, 3].filter(x => x > 0).at(idxToLookUp);
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
const idxToLookUp = -0.12635678;
[1, 2, 3].find(x => x > 0);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
[1, 2, 3].filter(x => x > 0)[\`at\`](0);
      `,
      errors: [
        {
          line: 2,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
[1, 2, 3].find(x => x > 0);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: string[];
declare const cond: Parameters<Array<string>['filter']>[0];
const a = { arr };
a?.arr
  .filter(cond) /* what a bad spot for a comment. Let's make sure
  there's some yucky symbols too. [ . ?. <>   ' ' \\'] */
  .at('0');
      `,
      errors: [
        {
          line: 5,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: string[];
declare const cond: Parameters<Array<string>['filter']>[0];
const a = { arr };
a?.arr
  .find(cond) /* what a bad spot for a comment. Let's make sure
  there's some yucky symbols too. [ . ?. <>   ' ' \\'] */
  ;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const imNotActuallyAnArray = [
  [1, 2, 3],
  [2, 3, 4],
] as const;
const butIAm = [4, 5, 6];
butIAm.push(
  // line comment!
  ...imNotActuallyAnArray[/* comment */ 'filter' /* another comment */](
    x => x[1] > 0,
  ) /**/[\`0\`]!,
);
      `,
      errors: [
        {
          line: 9,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
const imNotActuallyAnArray = [
  [1, 2, 3],
  [2, 3, 4],
] as const;
const butIAm = [4, 5, 6];
butIAm.push(
  // line comment!
  ...imNotActuallyAnArray[/* comment */ "find" /* another comment */](
    x => x[1] > 0,
  ) /**/!,
);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function actingOnArray<T extends string[]>(values: T) {
  return values.filter(filter => filter === 'filter')[
    /* filter */ -0.0 /* filter */
  ];
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
function actingOnArray<T extends string[]>(values: T) {
  return values.find(filter => filter === 'filter');
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const nestedSequenceAbomination =
  (1,
  2,
  (1,
  2,
  3,
  (1, 2, 3, 4),
  (1, 2, 3, 4, 5, [1, 2, 3, 4, 5, 6].filter(x => x % 2 == 0)))['0']);
      `,
      errors: [
        {
          line: 5,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
const nestedSequenceAbomination =
  (1,
  2,
  (1,
  2,
  3,
  (1, 2, 3, 4),
  (1, 2, 3, 4, 5, [1, 2, 3, 4, 5, 6].find(x => x % 2 == 0))));
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: { a: 1 }[] & { b: 2 }[];
arr.filter(f, thisArg)[0];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: { a: 1 }[] & { b: 2 }[];
arr.find(f, thisArg);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const arr: { a: 1 }[] & ({ b: 2 }[] | { c: 3 }[]);
arr.filter(f, thisArg)[0];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const arr: { a: 1 }[] & ({ b: 2 }[] | { c: 3 }[]);
arr.find(f, thisArg);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const f: any, g: any;
const nestedTernaries = (
  Math.random() < 0.5
    ? Math.random() < 0.5
      ? [1, 2, 3].filter(f)
      : []?.filter(x => 'shrug')
    : [2, 3, 4]['filter'](g)
).at(0.2);
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const f: any, g: any;
const nestedTernaries = (
  Math.random() < 0.5
    ? Math.random() < 0.5
      ? [1, 2, 3].find(f)
      : []?.find(x => 'shrug')
    : [2, 3, 4]["find"](g)
);
      `,
            },
          ],
        },
      ],
    },

    {
      code: `
declare const f: any, g: any;
const nestedTernariesWithSequenceExpression = (
  Math.random() < 0.5
    ? ('sequence',
      'expression',
      Math.random() < 0.5 ? [1, 2, 3].filter(f) : []?.filter(x => 'shrug'))
    : [2, 3, 4]['filter'](g)
).at(0.2);
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindSuggestion',
              output: `
declare const f: any, g: any;
const nestedTernariesWithSequenceExpression = (
  Math.random() < 0.5
    ? ('sequence',
      'expression',
      Math.random() < 0.5 ? [1, 2, 3].find(f) : []?.find(x => 'shrug'))
    : [2, 3, 4]["find"](g)
);
      `,
            },
          ],
        },
      ],
    },
  ],
});
