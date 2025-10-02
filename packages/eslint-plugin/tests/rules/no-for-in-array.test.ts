import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-for-in-array';
import { getTypedRuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = getTypedRuleTester();

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
    // this is normally a type error, this test is here to make sure the rule
    // doesn't include an "extra" report for it
    `
declare const nullish: null | undefined;
// @ts-expect-error
for (const k in nullish) {
}
    `,
    `
declare const obj: {
  [key: number]: number;
};

for (const key in obj) {
  console.log(key);
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
declare const array: string[] | null;

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array: number[] | undefined;

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array: boolean[] | { a: 1; b: 2; c: 3 };

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array: [number, string];

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array: [number, string] | { a: 1; b: 2; c: 3 };

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array: string[] | Record<number, string>;

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
const arrayLike = /fe/.exec('foo');

for (const x in arrayLike) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const arrayLike: HTMLCollection;

for (const x in arrayLike) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.lib-dom.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
declare const arrayLike: NodeList;

for (const x in arrayLike) {
  console.log(x);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'forInViolation',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.lib-dom.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
function foo() {
  for (const a in arguments) {
    console.log(a);
  }
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array:
  | (({ a: string } & string[]) | Record<string, boolean>)
  | Record<number, string>;

for (const key in array) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 6,
          line: 6,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const array:
  | (({ a: string } & RegExpExecArray) | Record<string, boolean>)
  | Record<number, string>;

for (const key in array) {
  console.log(k);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 6,
          line: 6,
          messageId: 'forInViolation',
        },
      ],
    },
    {
      code: `
declare const obj: {
  [key: number]: number;
  length: 1;
};

for (const key in obj) {
  console.log(key);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 7,
          line: 7,
          messageId: 'forInViolation',
        },
      ],
    },
  ],
});
