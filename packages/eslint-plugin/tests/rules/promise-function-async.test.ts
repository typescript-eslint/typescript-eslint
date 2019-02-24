import rule from '../../src/rules/promise-function-async';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const parserOptions = {
  ecmaVersion: 2018,
  tsconfigRootDir: rootDir,
  project: './tsconfig.json',
};

const messageId = 'missingAsync';

const ruleTester = new RuleTester({
  parserOptions,
  parser: '@typescript-eslint/parser',
});

ruleTester.run('promise-function-async', rule, {
  valid: [
    `
const nonAsyncNonPromiseArrowFunction = (n: number) => n;
    `,
    `
function nonAsyncNonPromiseFunctionDeclaration(n: number) { return n; }
    `,
    `
const asyncPromiseFunctionExpressionA = async function(p: Promise<void>) { return p; };
    `,
    `
const asyncPromiseFunctionExpressionB = async function() { return new Promise<void>(); };
    `,
    `
class Test {
  public nonAsyncNonPromiseArrowFunction = (n: number) => n;

  public nonAsyncNonPromiseMethod() {
    return 0;
  }

  public async asyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public async asyncPromiseMethodB() {
    return new Promise<void>();
  }
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/227
    `export function valid(n: number) { return n; }`,
    `export default function invalid(n: number) { return n; }`,
    `class Foo { constructor() { } }`,
  ],
  invalid: [
    {
      code: `
const nonAsyncPromiseFunctionExpressionA = function(p: Promise<void>) { return p; };
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpressionB = function() { return new Promise<void>(); };
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationA(p: Promise<void>) { return p; }
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationB() { return new Promise<void>(); }
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseArrowFunctionA = (p: Promise<void>) => p;
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseArrowFunctionB = () => new Promise<void>();
            `,
      errors: [
        {
          messageId,
        },
      ],
    },
    {
      code: `
class Test {
  public nonAsyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public nonAsyncPromiseMethodB() {
    return new Promise<void>();
  }
}
          `,
      errors: [
        {
          line: 3,
          messageId,
        },
        {
          line: 7,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkArrowFunctions: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 4,
          messageId,
        },
        {
          line: 9,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkFunctionDeclarations: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 9,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkFunctionExpressions: false,
        },
      ],
      errors: [
        {
          line: 4,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
        {
          line: 9,
          messageId,
        },
      ],
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkMethodDeclarations: false,
        },
      ],
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 4,
          messageId,
        },
        {
          line: 6,
          messageId,
        },
      ],
    },
    {
      code: `
class PromiseType { }

const returnAllowedType = () => new PromiseType();
`,
      options: [
        {
          allowedPromiseNames: ['PromiseType'],
        },
      ],
      errors: [
        {
          line: 4,
          messageId,
        },
      ],
    },
  ],
});
