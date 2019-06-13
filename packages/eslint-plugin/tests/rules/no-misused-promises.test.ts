import rule from '../../src/rules/no-misused-promises';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-misused-promises', rule, {
  valid: [
    `if (true) {}`,
    {
      code: `if (Promise.resolve()) {}`,
      options: [{ checks: ['void-return'] }],
    },
    `
if (true) {}
else if (false) {}
else {}
`,
    {
      code: `
if (Promise.resolve()) {}
else if (Promise.resolve()) {}
else {}
`,
      options: [{ checks: ['void-return'] }],
    },
    `for (;;) {}`,
    `for (let i; i < 10; i++) {}`,
    {
      code: `for (let i; Promise.resolve(); i++) {}`,
      options: [{ checks: ['void-return'] }],
    },
    `do {} while (true);`,
    {
      code: `do {} while (Promise.resolve())`,
      options: [{ checks: ['void-return'] }],
    },
    `while (true) {}`,
    {
      code: `while (Promise.resolve()) {}`,
      options: [{ checks: ['void-return'] }],
    },
    `true ? 123 : 456`,
    {
      code: `Promise.resolve() ? 123 : 456`,
      options: [{ checks: ['void-return'] }],
    },
    `if (!true) {}`,
    {
      code: `if (!Promise.resolve()) {}`,
      options: [{ checks: ['void-return'] }],
    },
    `(await Promise.resolve()) || false`,
    {
      code: `Promise.resolve() || false`,
      options: [{ checks: ['void-return'] }],
    },
    `(true && await Promise.resolve()) || false`,
    {
      code: `(true && Promise.resolve()) || false`,
      options: [{ checks: ['void-return'] }],
    },
    `false || (true && Promise.resolve())`,
    `
async function test() {
  if (await Promise.resolve()) {}
}
`,
    `
async function test() {
  const mixed: Promise | undefined = Promise.resolve();
  if (mixed) {
    await mixed;
  }
}
`,
    `if (~Promise.resolve()) {}`,
    `
interface NotQuiteThenable {
  then(param: string): void;
  then(): void;
}
const value: NotQuiteThenable = { then() {} };
if (value) {}
`,
    `[1, 2, 3].forEach(val => {});`,
    {
      code: `[1, 2, 3].forEach(async val => {});`,
      options: [{ checks: ['conditional'] }],
    },
    `new Promise((resolve, reject) => resolve());`,
    {
      code: `new Promise(async (resolve, reject) => resolve());`,
      options: [{ checks: ['conditional'] }],
    },
    `Promise.all(['abc', 'def'].map(async val => { await val; }))`,
    `
const fn: (arg: () => Promise<void> | void) => void = () => {};
fn(() => Promise.resolve());
`,
  ],

  invalid: [
    {
      code: `if (Promise.resolve()) {}`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
if (Promise.resolve()) {}
else if (Promise.resolve()) {}
else {}
`,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `for (let i; Promise.resolve(); i++) {}`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `do {} while (Promise.resolve())`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `while (Promise.resolve()) {}`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `Promise.resolve() ? 123 : 456`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `if (!Promise.resolve()) {}`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `Promise.resolve() || false`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `(true && Promise.resolve()) || false`,
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
[Promise.resolve(), Promise.reject()].forEach(
  async val => { await val; }
);
`,
      errors: [
        {
          line: 3,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
new Promise(async (resolve, reject) => {
  await Promise.resolve();
  resolve();
});
`,
      errors: [
        {
          line: 2,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', async (err, res) => {
  await res;
});
`,
      errors: [
        {
          line: 6,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', (err, res) => Promise.resolve(res));
`,
      errors: [
        {
          line: 6,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', (err, res) => {
  if (err) {
    return 'abc';
  } else {
    return Promise.resolve(res);
  }
});
`,
      errors: [
        {
          line: 6,
          messageId: 'voidReturn',
        },
      ],
    },
  ],
});
