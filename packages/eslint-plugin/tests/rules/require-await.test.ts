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

// The rule has no messageId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noAwaitFunctionDeclaration: any = {
  message: "Async function 'numberOne' has no 'await' expression.",
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noAwaitFunctionExpression: any = {
  message: "Async function has no 'await' expression.",
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noAwaitAsyncFunctionExpression: any = {
  message: "Async arrow function has no 'await' expression.",
};

ruleTester.run('require-await', rule, {
  valid: [
    // Non-async function declaration
    `function numberOne(): number {
      return 1;
    }`,
    // Non-async function expression
    `const numberOne = function(): number {
      return 1;
    }`,
    // Non-async arrow function expression (concise-body)
    `const numberOne = (): number => 1;`,
    // Non-async arrow function expression (block-body)
    `const numberOne = (): number => {
      return 1;
    };`,
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
}
    `,
    `const delay = () => Promise.resolve();`,
    // Async function declaration with await
    `async function numberOne(): Promise<number> {
      return await 1;
    }`,
    // Async function expression with await
    `const numberOne = async function(): Promise<number> {
      return await 1;
    }`,
    // Async arrow function expression with await (concise-body)
    `const numberOne = async (): Promise<number> => await 1;`,
    // Async arrow function expression with await (block-body)
    `const numberOne = async (): Promise<number> => {
      return await 1;
    };`,
    // Async function declaration with promise return
    `async function numberOne(): Promise<number> {
      return Promise.resolve(1);
    }`,
    // Async function expression with promise return
    `const numberOne = async function(): Promise<number> {
      return Promise.resolve(1);
    }`,
    // Async arrow function with promise return (concise-body)
    `const numberOne = async (): Promise<number> => Promise.resolve(1);`,
    // Async arrow function with promise return (block-body)
    `const numberOne = async (): Promise<number> => {
      return Promise.resolve(1);
    };`,
    // Async function declaration with async function return
    `async function numberOne(): Promise<number> {
      return getAsyncNumber(1);
    }
    async function getAsyncNumber(x: number): Promise<number> {
      return Promise.resolve(x);
    }`,
    // Async function expression with async function return
    `const numberOne = async function(): Promise<number> {
      return getAsyncNumber(1);
    }
    const getAsyncNumber = async function(x: number): Promise<number> {
      return Promise.resolve(x);
    }`,
    // Async arrow function with async function return (concise-body)
    `const numberOne = async (): Promise<number> => getAsyncNumber(1);
    const getAsyncNumber = async function(x: number): Promise<number> {
      return Promise.resolve(x);
    }`,
    // Async arrow function with async function return (block-body)
    `const numberOne = async (): Promise<number> => {
      return getAsyncNumber(1);
    };
    const getAsyncNumber = async function(x: number): Promise<number> {
      return Promise.resolve(x);
    }`,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1188
    `
async function testFunction(): Promise<void> {
  await Promise.all([1, 2, 3].map(
    // this should not trigger an error on the parent function
    async value => Promise.resolve(value)
  ))
}
    `,
  ],

  invalid: [
    {
      // Async function declaration with no await
      code: `async function numberOne(): Promise<number> {
        return 1;
      }`,
      errors: [noAwaitFunctionDeclaration],
    },
    {
      // Async function expression with no await
      code: `const numberOne = async function(): Promise<number> {
        return 1;
      }`,
      errors: [noAwaitFunctionExpression],
    },
    {
      // Async arrow function expression with no await
      code: `const numberOne = async (): Promise<number> => 1;`,
      errors: [noAwaitAsyncFunctionExpression],
    },
  ],
});
