import rule from '../../src/rules/find-loop-style';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('for-loop-style', rule, {
  valid: [],
  invalid: [
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  if (condition(item)) {
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferFind',
        },
      ],
      output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  return condition(item);
});
      `,
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log("Hooray!");
  if (condition(item)) {
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferFind',
        },
      ],
      output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  console.log("Hooray!");
  return condition(item);
});
      `,
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log("Hooray 1!");
  console.log("Hooray 2!");
  console.log("Hooray 3!");
  if (condition(item)) {
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferFind',
        },
      ],
      output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  console.log("Hooray 1!");
  console.log("Hooray 2!");
  console.log("Hooray 3!");
  return condition(item);
});
      `,
    },
  ],
});
