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
    {
      // Non-async function declaration
      code: `function numberOne(): number {
        return 1;
      }`,
    },
    {
      // Non-async function expression
      code: `const numberOne = function(): number {
        return 1;
      }`,
    },
    {
      // Non-async arrow function expression (concise-body)
      code: `const numberOne = (): number => 1;`,
    },
    {
      // Non-async arrow function expression (block-body)
      code: `const numberOne = (): number => {
        return 1;
      };`,
    },
    {
      // Async function declaration with await
      code: `async function numberOne(): Promise<number> {
        return await 1;
      }`,
    },
    {
      // Async function expression with await
      code: `const numberOne = async function(): Promise<number> {
        return await 1;
      }`,
    },
    {
      // Async arrow function expression with await (concise-body)
      code: `const numberOne = async (): Promise<number> => await 1;`,
    },
    {
      // Async arrow function expression with await (block-body)
      code: `const numberOne = async (): Promise<number> => {
        return await 1;
      };`,
    },
    {
      // Async function declaration with promise return
      code: `async function numberOne(): Promise<number> {
        return Promise.resolve(1);
      }`,
    },
    {
      // Async function expression with promise return
      code: `const numberOne = async function(): Promise<number> {
        return Promise.resolve(1);
      }`,
    },
    {
      // Async arrow function with promise return (concise-body)
      code: `const numberOne = async (): Promise<number> => Promise.resolve(1);`,
    },
    {
      // Async arrow function with promise return (block-body)
      code: `const numberOne = async (): Promise<number> => {
        return Promise.resolve(1);
      };`,
    },
    {
      // Async function declaration with async function return
      code: `async function numberOne(): Promise<number> {
        return getAsyncNumber(1);
      }
      async function getAsyncNumber(x: number): Promise<number> {
        return Promise.resolve(x);
      }`,
    },
    {
      // Async function expression with async function return
      code: `const numberOne = async function(): Promise<number> {
        return getAsyncNumber(1);
      }
      const getAsyncNumber = async function(x: number): Promise<number> {
        return Promise.resolve(x);
      }`,
    },
    {
      // Async arrow function with async function return (concise-body)
      code: `const numberOne = async (): Promise<number> => getAsyncNumber(1);
      const getAsyncNumber = async function(x: number): Promise<number> {
        return Promise.resolve(x);
      }`,
    },
    {
      // Async arrow function with async function return (block-body)
      code: `const numberOne = async (): Promise<number> => {
        return getAsyncNumber(1);
      };
      const getAsyncNumber = async function(x: number): Promise<number> {
        return Promise.resolve(x);
      }`,
    },
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
