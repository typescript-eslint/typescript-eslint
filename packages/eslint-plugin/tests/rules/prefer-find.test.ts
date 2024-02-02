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

      jerkCode.filter(item => item === 'aha');
    `,
    `
      declare const notNecessarilyAnArray: unknown[] | undefined | null | string;
      notNecessarilyAnArray?.filter(item => true)[0];
    `,
    // Be sure that we don't try to mess with this case, where the member access
    // is not directly occurring on the result of the filter call due to optional
    // chaining.
    '([]?.filter(f))[0];',
    // Be sure that we don't try to mess with this case, since the member access
    // should not need to be optional for the cases the rule is concerned with.
    '[].filter(() => true)?.[0];',
    // Be sure that we don't try to mess with this case, since the function call
    // should not need to be optional for the cases the rule is concerned with.
    '[].filter?.(() => true)[0];',
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
              messageId: 'preferFindFix',
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
declare const arr: string[];
arr.filter(item => item === 'aha')['0'];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindFix',
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
declare const arr: string[];
arr.filter(item => item === 'aha')[0n];
      `,
      errors: [
        {
          line: 3,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindFix',
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
              messageId: 'preferFindFix',
              output: `const two = [1, 2, 3].find(item => item === 2);`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(([] as unknown[]))["filter"] ((item) => { return item === 2 }  ) [ 0  ] ;`,
      errors: [
        {
          line: 1,
          messageId: 'preferFind',
          suggestions: [
            {
              messageId: 'preferFindFix',
              output:
                '(([] as unknown[]))["find"] ((item) => { return item === 2 }  ) ;',
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
              messageId: 'preferFindFix',
              output:
                '(([] as unknown[]))?.["find"] ((item) => { return item === 2 }  ) ;',
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
              messageId: 'preferFindFix',
              output: `
declare const nullableArray: unknown[] | undefined | null;
nullableArray?.find(item => true);
      `,
            },
          ],
        },
      ],
    },
  ],
});
