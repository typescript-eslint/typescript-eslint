import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-for-in-array';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
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
          column: 1,
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'forInViolation',
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
          column: 1,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'forInViolation',
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
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'forInViolation',
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
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'forInViolation',
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
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'forInViolation',
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
          column: 1,
          endColumn: 4,
          endLine: 11,
          line: 2,
          messageId: 'forInViolation',
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
          column: 1,
          endColumn: 4,
          endLine: 11,
          line: 2,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const arr: string[] | null;

for (const x in arr) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const arr: number[] | undefined;

for (const x in arr) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const arr: boolean[] | undefined | null;

for (const x in arr) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
  ],
});
