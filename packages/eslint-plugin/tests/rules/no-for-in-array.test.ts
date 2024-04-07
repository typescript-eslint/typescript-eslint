import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-for-in-array';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-for-in-array', rule, {
  valid: [
    `
for (const x of [3, 4, 5]) {
  console.log(x);
}
    `,
    `
for (const x in { a: 1, b: 2, c: 3 }) {
  console.log(x);
}
    `,
  ],

  invalid: [
    {
      code: `
for (const x in [3, 4, 5]) {
  console.log(x);
}
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 2,
          column: 1,
          endLine: 2,
          endColumn: 27,
        },
      ],
    },
    {
      code: `
const z = [3, 4, 5];
for (const x in z) {
  console.log(x);
}
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 3,
          column: 1,
          endLine: 3,
          endColumn: 19,
        },
      ],
    },
    {
      code: `
const fn = (arr: number[]) => {
  for (const x in arr) {
    console.log(x);
  }
};
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
const fn = (arr: number[] | string[]) => {
  for (const x in arr) {
    console.log(x);
  }
};
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
const fn = <T extends any[]>(arr: T) => {
  for (const x in arr) {
    console.log(x);
  }
};
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 23,
        },
      ],
    },
    {
      code: noFormat`
for (const x
  in
    (
      (
        (
          [3, 4, 5]
        )
      )
    )
  )
  // weird
  /* spot for a */
  // comment
  /* ) */
  /* ( */
  {
  console.log(x);
}
      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 2,
          column: 1,
          endLine: 11,
          endColumn: 4,
        },
      ],
    },
    {
      code: noFormat`
for (const x
  in
    (
      (
        (
          [3, 4, 5]
        )
      )
    )
  )
  // weird
  /* spot for a */
  // comment
  /* ) */
  /* ( */

  ((((console.log('body without braces ')))));

      `,
      errors: [
        {
          messageId: 'forInViolation',
          line: 2,
          column: 1,
          endLine: 11,
          endColumn: 4,
        },
      ],
    },
  ],
});
