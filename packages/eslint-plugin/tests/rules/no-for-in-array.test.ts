import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-for-in-array';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
          type: AST_NODE_TYPES.ForInStatement,
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
          type: AST_NODE_TYPES.ForInStatement,
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
          type: AST_NODE_TYPES.ForInStatement,
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
          type: AST_NODE_TYPES.ForInStatement,
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
          type: AST_NODE_TYPES.ForInStatement,
        },
      ],
    },
  ],
});
