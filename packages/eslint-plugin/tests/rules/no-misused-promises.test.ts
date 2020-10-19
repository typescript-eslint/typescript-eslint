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
    `
if (true) {
}
    `,
    {
      code: `
if (Promise.resolve()) {
}
      `,
      options: [{ checksConditionals: false }],
    },
    `
if (true) {
} else if (false) {
} else {
}
    `,
    {
      code: `
if (Promise.resolve()) {
} else if (Promise.resolve()) {
} else {
}
      `,
      options: [{ checksConditionals: false }],
    },
    'for (;;) {}',
    'for (let i; i < 10; i++) {}',
    {
      code: 'for (let i; Promise.resolve(); i++) {}',
      options: [{ checksConditionals: false }],
    },
    'do {} while (true);',
    {
      code: 'do {} while (Promise.resolve());',
      options: [{ checksConditionals: false }],
    },
    'while (true) {}',
    {
      code: 'while (Promise.resolve()) {}',
      options: [{ checksConditionals: false }],
    },
    'true ? 123 : 456;',
    {
      code: 'Promise.resolve() ? 123 : 456;',
      options: [{ checksConditionals: false }],
    },
    `
if (!true) {
}
    `,
    {
      code: `
if (!Promise.resolve()) {
}
      `,
      options: [{ checksConditionals: false }],
    },
    '(await Promise.resolve()) || false;',
    {
      code: 'Promise.resolve() || false;',
      options: [{ checksConditionals: false }],
    },
    '(true && (await Promise.resolve())) || false;',
    {
      code: '(true && Promise.resolve()) || false;',
      options: [{ checksConditionals: false }],
    },
    'false || (true && Promise.resolve());',
    '(true && Promise.resolve()) || false;',
    `
async function test() {
  if (await Promise.resolve()) {
  }
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
    `
if (~Promise.resolve()) {
}
    `,
    `
interface NotQuiteThenable {
  then(param: string): void;
  then(): void;
}
const value: NotQuiteThenable = { then() {} };
if (value) {
}
    `,
    '[1, 2, 3].forEach(val => {});',
    {
      code: '[1, 2, 3].forEach(async val => {});',
      options: [{ checksVoidReturn: false }],
    },
    'new Promise((resolve, reject) => resolve());',
    {
      code: 'new Promise(async (resolve, reject) => resolve());',
      options: [{ checksVoidReturn: false }],
    },
    `
Promise.all(
  ['abc', 'def'].map(async val => {
    await val;
  }),
);
    `,
    `
const fn: (arg: () => Promise<void> | void) => void = () => {};
fn(() => Promise.resolve());
    `,
    `
declare const returnsPromise: (() => Promise<void>) | null;
if (returnsPromise?.()) {
}
    `,
    `
declare const returnsPromise: { call: () => Promise<void> } | null;
if (returnsPromise?.call()) {
}
    `,
    'Promise.resolve() ?? false;',
    `
function test(a: Promise<void> | undefinded) {
  const foo = a ?? Promise.reject();
}
    `,
    `
function test(p: Promise<boolean> | undefined, bool: boolean) {
  if (p ?? bool) {
  }
}
    `,
    `
async function test(p: Promise<boolean | undefined>, bool: boolean) {
  if ((await p) ?? bool) {
  }
}
    `,
    `
async function test(p: Promise<boolean> | undefined) {
  if (await (p ?? Promise.reject())) {
  }
}
    `,
  ],

  invalid: [
    {
      code: `
if (Promise.resolve()) {
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
if (Promise.resolve()) {
} else if (Promise.resolve()) {
} else {
}
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
      code: 'for (let i; Promise.resolve(); i++) {}',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'do {} while (Promise.resolve());',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'while (Promise.resolve()) {}',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'Promise.resolve() ? 123 : 456;',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
if (!Promise.resolve()) {
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'Promise.resolve() || false;',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
[Promise.resolve(), Promise.reject()].forEach(async val => {
  await val;
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
    {
      code: `
const fnWithCallback:
  | ((arg: string, cb: (err: any, res: string) => void) => void)
  | null = (arg, cb) => {
  cb(null, arg);
};

fnWithCallback?.('val', (err, res) => Promise.resolve(res));
      `,
      errors: [
        {
          line: 8,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
const fnWithCallback:
  | ((arg: string, cb: (err: any, res: string) => void) => void)
  | null = (arg, cb) => {
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
          line: 8,
          messageId: 'voidReturn',
        },
      ],
    },
    {
      code: `
function test(bool: boolean, p: Promise<void>) {
  if (bool || p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(bool: boolean, p: Promise<void>) {
  if (bool && p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(a: any, p: Promise<void>) {
  if (a ?? p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(p: Promise<void> | undefined) {
  if (p ?? Promise.reject()) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
  ],
});
