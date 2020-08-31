import rule from '../../src/rules/require-await';
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

ruleTester.run('require-await', rule, {
  valid: [
    // Non-async function declaration
    `
function numberOne(): number {
  return 1;
}
    `,
    // Non-async function expression
    `
const numberOne = function (): number {
  return 1;
};
    `,
    // Non-async arrow function expression (concise-body)
    `
      const numberOne = (): number => 1;
    `,
    // Non-async arrow function expression (block-body)
    `
const numberOne = (): number => {
  return 1;
};
    `,
    // Non-async function that returns a promise
    // https://github.com/typescript-eslint/typescript-eslint/issues/1226
    `
function delay() {
  return Promise.resolve();
}
    `,
    `
const delay = () => {
  return Promise.resolve();
};
    `,
    'const delay = () => Promise.resolve();',
    // Async function declaration with await
    `
async function numberOne(): Promise<number> {
  return await 1;
}
    `,
    // Async function expression with await
    `
const numberOne = async function (): Promise<number> {
  return await 1;
};
    `,
    // Async arrow function expression with await (concise-body)
    'const numberOne = async (): Promise<number> => await 1;',
    // Async arrow function expression with await (block-body)
    `
const numberOne = async (): Promise<number> => {
  return await 1;
};
    `,
    // Async function declaration with promise return
    `
async function numberOne(): Promise<number> {
  return Promise.resolve(1);
}
    `,
    // Async function expression with promise return
    `
const numberOne = async function (): Promise<number> {
  return Promise.resolve(1);
};
    `,
    // Async arrow function with promise return (concise-body)
    'const numberOne = async (): Promise<number> => Promise.resolve(1);',
    // Async arrow function with promise return (block-body)
    `
const numberOne = async (): Promise<number> => {
  return Promise.resolve(1);
};
    `,
    // Async function declaration with async function return
    `
async function numberOne(): Promise<number> {
  return getAsyncNumber(1);
}
async function getAsyncNumber(x: number): Promise<number> {
  return Promise.resolve(x);
}
    `,
    // Async function expression with async function return
    `
const numberOne = async function (): Promise<number> {
  return getAsyncNumber(1);
};
const getAsyncNumber = async function (x: number): Promise<number> {
  return Promise.resolve(x);
};
    `,
    // Async arrow function with async function return (concise-body)
    `
const numberOne = async (): Promise<number> => getAsyncNumber(1);
const getAsyncNumber = async function (x: number): Promise<number> {
  return Promise.resolve(x);
};
    `,
    // Async arrow function with async function return (block-body)
    `
const numberOne = async (): Promise<number> => {
  return getAsyncNumber(1);
};
const getAsyncNumber = async function (x: number): Promise<number> {
  return Promise.resolve(x);
};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1188
    `
async function testFunction(): Promise<void> {
  await Promise.all(
    [1, 2, 3].map(
      // this should not trigger an error on the parent function
      async value => Promise.resolve(value),
    ),
  );
}
    `,
    'async function* run() {}',
    `
async function* run() {
  await new Promise(resolve => setTimeout(resolve, 100));
  yield 'Hello';
  console.log('World');
}
    `,
    `
function* test6() {
  yield* syncGenerator();
}
    `,
    `
function* syncGenerator() {
  yield 1;
}
    `,
    `
async function* asyncGenerator() {
  await Promise.resolve();
  yield 1;
}
async function* test1() {
  yield* asyncGenerator();
}
    `,
    'const foo: () => void = async function* () {};',
    `
async function* foo(): Promise<string> {
  return new Promise(res => res(\`hello\`));
}
    `,
  ],

  invalid: [
    {
      // Async function declaration with no await
      code: `
async function numberOne(): Promise<number> {
  return 1;
}
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async function 'numberOne'",
          },
        },
      ],
    },
    {
      // Async function expression with no await
      code: `
const numberOne = async function (): Promise<number> {
  return 1;
};
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: 'Async function',
          },
        },
      ],
    },
    {
      // Async arrow function expression with no await
      code: 'const numberOne = async (): Promise<number> => 1;',
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async arrow function 'numberOne'",
          },
        },
      ],
    },
    {
      // non-async function with await inside async function without await
      code: `
        async function foo() {
          function nested() {
            await doSomething();
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async function 'foo'",
          },
        },
      ],
    },
    {
      code: `
async function* foo(): void {
  doSomething();
}
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async generator function 'foo'",
          },
        },
      ],
    },
    {
      code: `
async function* foo() {
  yield 1;
}
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async generator function 'foo'",
          },
        },
      ],
    },
    {
      code: `
const foo = async function* () {
  console.log('bar');
};
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: 'Async generator function',
          },
        },
      ],
    },
    {
      code: `
async function* asyncGenerator() {
  yield 1;
}
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
        },
      ],
    },
    {
      code: `
function* syncGenerator() {
  yield 1;
}
async function* asyncGenerator() {
  yield* syncGenerator();
}
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
        },
      ],
    },
  ],
});
// base eslint tests
// https://github.com/eslint/eslint/blob/03a69dbe86d5b5768a310105416ae726822e3c1c/tests/lib/rules/require-await.js#L25-L132
ruleTester.run('require-await', rule, {
  valid: [
    `
async function foo() {
  await doSomething();
}
    `,
    `
(async function () {
  await doSomething();
});
    `,
    `
async () => {
  await doSomething();
};
    `,
    'async () => await doSomething();',
    `
({
  async foo() {
    await doSomething();
  },
});
    `,
    `
class A {
  async foo() {
    await doSomething();
  }
}
    `,
    `
(class {
  async foo() {
    await doSomething();
  }
});
    `,
    `
async function foo() {
  await (async () => {
    await doSomething();
  });
}
    `,
    // empty functions are ok.
    'async function foo() {}',
    'async () => {};',
    // normal functions are ok.
    `
function foo() {
  doSomething();
}
    `,
    // for-await-of
    `
async function foo() {
  for await (x of xs);
}
    `,
    // global await
    {
      code: 'await foo();',
    },
    {
      code: `
for await (let num of asyncIterable) {
  console.log(num);
}
      `,
    },
  ],
  invalid: [
    {
      code: `
        async function foo() {
          doSomething();
        }
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: "Async function 'foo'" },
        },
      ],
    },
    {
      code: `
        (async function () {
          doSomething();
        });
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: 'Async function' },
        },
      ],
    },
    {
      code: `
        async () => {
          doSomething();
        };
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: 'Async arrow function' },
        },
      ],
    },
    {
      code: 'async () => doSomething();',
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: 'Async arrow function' },
        },
      ],
    },
    {
      code: `
        ({
          async foo() {
            doSomething();
          },
        });
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: "Async method 'foo'" },
        },
      ],
    },
    {
      code: `
        class A {
          async foo() {
            doSomething();
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: "Async method 'foo'" },
        },
      ],
    },
    {
      code: `
        (class {
          async foo() {
            doSomething();
          }
        });
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: "Async method 'foo'" },
        },
      ],
    },
    {
      code: `
        (class {
          async ''() {
            doSomething();
          }
        });
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: 'Async method' },
        },
      ],
    },
    {
      code: `
        async function foo() {
          async () => {
            await doSomething();
          };
        }
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: "Async function 'foo'" },
        },
      ],
    },
    {
      code: `
        async function foo() {
          await (async () => {
            doSomething();
          });
        }
      `,
      errors: [
        {
          messageId: 'missingAwait',
          data: { name: 'Async arrow function' },
        },
      ],
    },
  ],
});
