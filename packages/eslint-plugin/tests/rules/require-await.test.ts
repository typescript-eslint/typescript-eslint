import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-await';
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
    `
async function* asyncGenerator() {
  await Promise.resolve();
  yield 1;
}
async function* test1() {
  yield* asyncGenerator();
  yield* 2;
}
    `,
    `
async function* test(source: AsyncIterable<any>) {
  yield* source;
}
    `,
    `
async function* test(source: Iterable<any> & AsyncIterable<any>) {
  yield* source;
}
    `,
    `
async function* test(source: Iterable<any> | AsyncIterable<any>) {
  yield* source;
}
    `,
    `
type MyType = {
  [Symbol.iterator](): Iterator<any>;
  [Symbol.asyncIterator](): AsyncIterator<any>;
};
async function* test(source: MyType) {
  yield* source;
}
    `,
    `
type MyType = {
  [Symbol.asyncIterator]: () => AsyncIterator<any>;
};
async function* test(source: MyType) {
  yield* source;
}
    `,
    `
type MyFunctionType = () => AsyncIterator<any>;
type MyType = {
  [Symbol.asyncIterator]: MyFunctionType;
};
async function* test(source: MyType) {
  yield* source;
}
    `,
    `
async function* foo(): Promise<string> {
  return new Promise(res => res(\`hello\`));
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/5458
    `
      async function* f() {
        let x!: Omit<
          {
            [Symbol.asyncIterator](): AsyncIterator<any>;
          },
          'z'
        >;
        yield* x;
      }
    `,
    `
      const fn = async () => {
        await using foo = new Bar();
      };
    `,
    `
      async function* test1() {
        yield Promise.resolve(1);
      }
    `,
    `
      function asyncFunction() {
        return Promise.resolve(1);
      }
      async function* test1() {
        yield asyncFunction();
      }
    `,
    `
      declare const asyncFunction: () => Promise<void>;
      async function* test1() {
        yield asyncFunction();
      }
    `,
    `
      async function* test1() {
        yield new Promise(() => {});
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
          data: {
            name: "Async function 'numberOne'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function numberOne(): number {
  return 1;
}
      `,
            },
          ],
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
          data: {
            name: "Async function 'numberOne'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
const numberOne = function (): number {
  return 1;
};
      `,
            },
          ],
        },
      ],
    },
    {
      // Async arrow function expression with no await
      code: 'const numberOne = async (): Promise<number> => 1;',
      errors: [
        {
          data: {
            name: "Async arrow function 'numberOne'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: 'const numberOne = (): number => 1;',
            },
          ],
        },
      ],
    },
    {
      // Return type with nested type argument
      code: `
async function values(): Promise<Array<number>> {
  return [1];
}
      `,
      errors: [
        {
          data: {
            name: "Async function 'values'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function values(): Array<number> {
  return [1];
}
      `,
            },
          ],
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
          data: {
            name: "Async function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        function foo() {
          function nested() {
            await doSomething();
          }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      // Note: This code is considered a valid case in the ESLint tests,
      // but because we have type information we can say that it's invalid.
      code: `
async function* foo(): void {
  doSomething();
}
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* foo(): void {
  doSomething();
}
      `,
            },
          ],
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
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* foo() {
  yield 1;
}
      `,
            },
          ],
        },
      ],
    },
    {
      // Note: This code is considered a valid case in the ESLint tests,
      // but because we have type information we can say that it's invalid.
      code: `
const foo = async function* () {
  console.log('bar');
};
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
const foo = function* () {
  console.log('bar');
};
      `,
            },
          ],
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
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* asyncGenerator() {
  yield 1;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
async function* asyncGenerator(source: Iterable<any>) {
  yield* source;
}
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* asyncGenerator(source: Iterable<any>) {
  yield* source;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function isAsyncIterable(value: unknown): value is AsyncIterable<any> {
  return true;
}
async function* asyncGenerator(source: Iterable<any> | AsyncIterable<any>) {
  if (!isAsyncIterable(source)) {
    yield* source;
  }
}
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function isAsyncIterable(value: unknown): value is AsyncIterable<any> {
  return true;
}
function* asyncGenerator(source: Iterable<any> | AsyncIterable<any>) {
  if (!isAsyncIterable(source)) {
    yield* source;
  }
}
      `,
            },
          ],
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
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* syncGenerator() {
  yield 1;
}
function* asyncGenerator() {
  yield* syncGenerator();
}
      `,
            },
          ],
        },
      ],
    },
    {
      // Note: This code is considered a valid case in the ESLint tests,
      // but because we have type information we can say that it's invalid.
      code: `
async function* asyncGenerator() {
  yield* anotherAsyncGenerator(); // Unknown function.
}
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'asyncGenerator'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
function* asyncGenerator() {
  yield* anotherAsyncGenerator(); // Unknown function.
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        const fn = async () => {
          using foo = new Bar();
        };
      `,
      errors: [
        {
          data: {
            name: "Async arrow function 'fn'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        const fn = () => {
          using foo = new Bar();
        };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        // intentional TS error
        async function* foo(): Promise<number> {
          yield 1;
        }
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        // intentional TS error
        function* foo(): Promise<number> {
          yield 1;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        async function* foo(): AsyncGenerator {
          yield 1;
        }
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        function* foo(): Generator {
          yield 1;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        async function* foo(): AsyncGenerator<number> {
          yield 1;
        }
      `,
      errors: [
        {
          data: {
            name: "Async generator function 'foo'",
          },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        function* foo(): Generator<number> {
          yield 1;
        }
      `,
            },
          ],
        },
      ],
    },
  ],
});
// base eslint tests
// https://github.com/eslint/eslint/blob/3a4eaf921543b1cd5d1df4ea9dec02fab396af2a/tests/lib/rules/require-await.js#L25-L274
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
    // -- global await
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
    {
      code: `
        async function* run() {
          await new Promise(resolve => setTimeout(resolve, 100));
          yield 'Hello';
          console.log('World');
        }
      `,
    },
    {
      code: 'async function* run() {}',
    },
    {
      code: 'const foo = async function* () {};',
    },
    // Note: There are three test cases for async generators in the
    // ESLint repository that are considered valid. Because we have
    // type information, we can consider those cases to be invalid.
    // There are test cases in here to confirm that they are invalid.
    //
    // See https://github.com/typescript-eslint/typescript-eslint/pull/1782
    //
    // The cases are:
    //
    //  1.
    //  async function* run() {
    //    yield* anotherAsyncGenerator();
    //  }
    //
    //  2.
    //  const foo = async function* () {
    //   console.log('bar');
    //  };
    //
    //  3.
    //  async function* run() {
    //    console.log('bar');
    //  }
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
          data: { name: "Async function 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        function foo() {
          doSomething();
        }
      `,
            },
          ],
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
          data: { name: 'Async function' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        (function () {
          doSomething();
        });
      `,
            },
          ],
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
          data: { name: 'Async arrow function' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        () => {
          doSomething();
        };
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'async () => doSomething();',
      errors: [
        {
          data: { name: 'Async arrow function' },
          messageId: 'missingAwait',
          suggestions: [
            { messageId: 'removeAsync', output: '() => doSomething();' },
          ],
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
          data: { name: "Async method 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        ({
          foo() {
            doSomething();
          },
        });
      `,
            },
          ],
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
          data: { name: "Async method 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        class A {
          foo() {
            doSomething();
          }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        class A {
          public async foo() {
            doSomething();
          }
        }
      `,
      errors: [
        {
          data: { name: "Async method 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        class A {
          public foo() {
            doSomething();
          }
        }
      `,
            },
          ],
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
          data: { name: "Async method 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        (class {
          foo() {
            doSomething();
          }
        });
      `,
            },
          ],
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
          data: { name: 'Async method' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        (class {
          ''() {
            doSomething();
          }
        });
      `,
            },
          ],
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
          data: { name: "Async function 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        function foo() {
          async () => {
            await doSomething();
          };
        }
      `,
            },
          ],
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
          data: { name: 'Async arrow function' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        async function foo() {
          await (() => {
            doSomething();
          });
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        const obj = {
          async: async function foo() {
            bar();
          },
        };
      `,
      errors: [
        {
          data: { name: "Async method 'async'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        const obj = {
          async: function foo() {
            bar();
          },
        };
      `,
            },
          ],
        },
      ],
    },
    {
      // This test verifies that the async keyword and any following
      // whitespace is removed, but not the following comments.
      code: noFormat`
        async    /* test */ function foo() {
          doSomething();
        }
      `,
      errors: [
        {
          data: { name: "Async function 'foo'" },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        /* test */ function foo() {
          doSomething();
        }
      `,
            },
          ],
        },
      ],
    },
    {
      // This test must not have a semicolon after "a = 0".
      code: noFormat`
        class A {
          a = 0
          async [b]() {
            return 0;
          }
        }
      `,
      errors: [
        {
          data: { name: 'Async method' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        class A {
          a = 0
          ;[b]() {
            return 0;
          }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      // This test must not have a semicolon after "foo".
      code: noFormat`
        foo
        async () => {
          return 0;
        }
      `,
      errors: [
        {
          data: { name: 'Async arrow function' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        foo
        ;() => {
          return 0;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        class A {
          foo() {}
          async [bar]() {
            baz;
          }
        }
      `,
      errors: [
        {
          data: { name: 'Async method' },
          messageId: 'missingAwait',
          suggestions: [
            {
              messageId: 'removeAsync',
              output: `
        class A {
          foo() {}
          [bar]() {
            baz;
          }
        }
      `,
            },
          ],
        },
      ],
    },
  ],
});
