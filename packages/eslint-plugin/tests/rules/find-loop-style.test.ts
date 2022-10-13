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
  valid: [
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  if (condition(item)) {
    console.log('Hooray!');
    return item;
  }
}
      `,
      options: [{ prefer: 'for-of' }],
    },
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
      options: [{ prefer: 'for-of' }],
    },
  ],
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
          suggestions: [
            {
              messageId: 'suggestFind',
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  return condition(item);
});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log('Hooray!');
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
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  console.log('Hooray!');
  return condition(item);
});
      `,
              messageId: 'suggestFind',
            },
          ],
        },
      ],
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log('Hooray 1!');
  console.log('Hooray 2!');
  console.log('Hooray 3!');
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
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  console.log('Hooray 1!');
  console.log('Hooray 2!');
  console.log('Hooray 3!');
  return condition(item);
});
      `,
              messageId: 'suggestFind',
            },
          ],
        },
      ],
    },
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
          messageId: 'preferForCounter',
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

for (let i = 0; i < array.length; i += 1) {
  const item = array[i];
  if (condition(item)) {
    return item;
  }
}
      `,
              messageId: 'suggestForCounter',
            },
          ],
        },
      ],
      options: [{ prefer: 'for-counter' }],
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log('Hooray!');
  if (condition(item)) {
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferForCounter',
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

for (let i = 0; i < array.length; i += 1) {
  const item = array[i];
  console.log('Hooray!');
  if (condition(item)) {
    return item;
  }
}
      `,
              messageId: 'suggestForCounter',
            },
          ],
        },
      ],
      options: [{ prefer: 'for-counter' }],
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  if (condition(item)) {
    console.log('Hooray!');
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferFind',
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

return array.find(item => {
  if (condition(item)) {
    console.log('Hooray!');
    return true;
  }

  return false;
});
      `,
              messageId: 'suggestFind',
            },
          ],
        },
      ],
      options: [{ prefer: 'find' }],
    },
    {
      code: `
declare const array: string[];
declare const condition: (item: string) => true;

for (const item of array) {
  console.log('Before condition!');
  if (condition(item)) {
    console.log('After condition!');
    return item;
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 5,
          messageId: 'preferForCounter',
          suggestions: [
            {
              output: `
declare const array: string[];
declare const condition: (item: string) => true;

for (let i = 0; i < array.length; i += 1) {
  const item = array[i];
  console.log('Before condition!');
  if (condition(item)) {
    console.log('After condition!');
    return item;
  }
}
      `,
              messageId: 'suggestForCounter',
            },
          ],
        },
      ],
      options: [{ prefer: 'for-counter' }],
    },
  ],
});
