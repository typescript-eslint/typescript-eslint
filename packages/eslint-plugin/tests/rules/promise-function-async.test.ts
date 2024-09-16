import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/promise-function-async';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const messageId = 'missingAsync';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('promise-function-async', rule, {
  valid: [
    `
const nonAsyncNonPromiseArrowFunction = (n: number) => n;
    `,
    `
function nonAsyncNonPromiseFunctionDeclaration(n: number) {
  return n;
}
    `,
    `
const asyncPromiseFunctionExpressionA = async function (p: Promise<void>) {
  return p;
};
    `,
    `
const asyncPromiseFunctionExpressionB = async function () {
  return new Promise<void>();
};
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
    `
class InvalidAsyncModifiers {
  public constructor() {
    return new Promise<void>();
  }
  public get asyncGetter() {
    return new Promise<void>();
  }
  public set asyncGetter(p: Promise<void>) {
    return p;
  }
  public get asyncGetterFunc() {
    return async () => new Promise<void>();
  }
  public set asyncGetterFunc(p: () => Promise<void>) {
    return p;
  }
}
    `,
    `
const invalidAsyncModifiers = {
  get asyncGetter() {
    return new Promise<void>();
  },
  set asyncGetter(p: Promise<void>) {
    return p;
  },
  get asyncGetterFunc() {
    return async () => new Promise<void>();
  },
  set asyncGetterFunc(p: () => Promise<void>) {
    return p;
  },
};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/227
    `
      export function valid(n: number) {
        return n;
      }
    `,
    `
      export default function invalid(n: number) {
        return n;
      }
    `,
    `
      class Foo {
        constructor() {}
      }
    `,
    `
class Foo {
  async catch<T>(arg: Promise<T>) {
    return arg;
  }
}
    `,
    {
      code: `
function returnsAny(): any {
  return 0;
}
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
function returnsUnknown(): unknown {
  return 0;
}
      `,
      options: [
        {
          allowAny: true,
        },
      ],
    },
    {
      code: `
interface ReadableStream {}
interface Options {
  stream: ReadableStream;
}

type Return = ReadableStream | Promise<void>;
const foo = (options: Options): Return => {
  return options.stream ? asStream(options) : asPromise(options);
};
      `,
    },
    {
      code: `
function foo(): Promise<string> | boolean {
  return Math.random() > 0.5 ? Promise.resolve('value') : false;
}
      `,
    },
    {
      code: `
abstract class Test {
  abstract test1(): Promise<number>;

  // abstract method with body is always an error but it still parses into valid AST
  abstract test2(): Promise<number> {
    return Promise.resolve(1);
  }
}
      `,
    },
    `
function promiseInUnionWithExplicitReturnType(
  p: boolean,
): Promise<number> | number {
  return p ? Promise.resolve(5) : 5;
}
    `,
    `
function explicitReturnWithPromiseInUnion(): Promise<number> | number {
  return 5;
}
    `,
    `
async function asyncFunctionReturningUnion(p: boolean) {
  return p ? Promise.resolve(5) : 5;
}
    `,
  ],
  invalid: [
    {
      code: `
function returnsAny(): any {
  return 0;
}
      `,
      errors: [
        {
          messageId,
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
      output: null,
    },
    {
      code: `
function returnsUnknown(): unknown {
  return 0;
}
      `,
      errors: [
        {
          messageId,
        },
      ],
      options: [
        {
          allowAny: false,
        },
      ],
      output: null,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpressionA = function (p: Promise<void>) {
  return p;
};
      `,
      errors: [
        {
          messageId,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpressionA = async function (p: Promise<void>) {
  return p;
};
      `,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpressionB = function () {
  return new Promise<void>();
};
      `,
      errors: [
        {
          messageId,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpressionB = async function () {
  return new Promise<void>();
};
      `,
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationA(p: Promise<void>) {
  return p;
}
      `,
      errors: [
        {
          messageId,
        },
      ],
      output: `
async function nonAsyncPromiseFunctionDeclarationA(p: Promise<void>) {
  return p;
}
      `,
    },
    {
      code: `
function nonAsyncPromiseFunctionDeclarationB() {
  return new Promise<void>();
}
      `,
      errors: [
        {
          messageId,
        },
      ],
      output: `
async function nonAsyncPromiseFunctionDeclarationB() {
  return new Promise<void>();
}
      `,
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
      output: `
const nonAsyncPromiseArrowFunctionA = async (p: Promise<void>) => p;
      `,
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
      output: `
const nonAsyncPromiseArrowFunctionB = async () => new Promise<void>();
      `,
    },
    {
      code: `
const functions = {
  nonAsyncPromiseMethod() {
    return Promise.resolve(1);
  },
};
      `,
      errors: [
        {
          line: 3,
          messageId,
        },
      ],
      output: `
const functions = {
  async nonAsyncPromiseMethod() {
    return Promise.resolve(1);
  },
};
      `,
    },
    {
      code: `
class Test {
  public nonAsyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public static nonAsyncPromiseMethodB() {
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
      output: `
class Test {
  public async nonAsyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public static async nonAsyncPromiseMethodB() {
    return new Promise<void>();
  }
}
      `,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
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
          line: 13,
          messageId,
        },
      ],
      options: [
        {
          checkArrowFunctions: false,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpression = async function (p: Promise<void>) {
  return p;
};

async function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public async nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      errors: [
        {
          line: 2,
          messageId,
        },
        {
          line: 10,
          messageId,
        },
        {
          line: 13,
          messageId,
        },
      ],
      options: [
        {
          checkFunctionDeclarations: false,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpression = async function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = async (p: Promise<void>) => p;

class Test {
  public async nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
      errors: [
        {
          line: 6,
          messageId,
        },
        {
          line: 10,
          messageId,
        },
        {
          line: 13,
          messageId,
        },
      ],
      options: [
        {
          checkFunctionExpressions: false,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

async function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = async (p: Promise<void>) => p;

class Test {
  public async nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function (p: Promise<void>) {
  return p;
};

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
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
          line: 10,
          messageId,
        },
      ],
      options: [
        {
          checkMethodDeclarations: false,
        },
      ],
      output: `
const nonAsyncPromiseFunctionExpression = async function (p: Promise<void>) {
  return p;
};

async function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) {
  return p;
}

const nonAsyncPromiseArrowFunction = async (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
      `,
    },
    {
      code: `
class PromiseType {}

const returnAllowedType = () => new PromiseType();
      `,
      errors: [
        {
          line: 4,
          messageId,
        },
      ],
      options: [
        {
          allowedPromiseNames: ['PromiseType'],
        },
      ],
      output: `
class PromiseType {}

const returnAllowedType = async () => new PromiseType();
      `,
    },
    {
      code: `
interface SPromise<T> extends Promise<T> {}
function foo(): Promise<string> | SPromise<boolean> {
  return Math.random() > 0.5
    ? Promise.resolve('value')
    : Promise.resolve(false);
}
      `,
      errors: [
        {
          line: 3,
          messageId,
        },
      ],
      options: [
        {
          allowedPromiseNames: ['SPromise'],
        },
      ],
      output: `
interface SPromise<T> extends Promise<T> {}
async function foo(): Promise<string> | SPromise<boolean> {
  return Math.random() > 0.5
    ? Promise.resolve('value')
    : Promise.resolve(false);
}
      `,
    },
    {
      code: `
class Test {
  @decorator
  public test() {
    return Promise.resolve(123);
  }
}
      `,
      errors: [{ column: 3, line: 4, messageId }],
      output: `
class Test {
  @decorator
  public async test() {
    return Promise.resolve(123);
  }
}
      `,
    },
    {
      code: noFormat`
class Test {
  @decorator(async () => {})
  static protected[(1)]() {
    return Promise.resolve(1);
  }
  public'bar'() {
    return Promise.resolve(2);
  }
  private['baz']() {
    return Promise.resolve(3);
  }
}
      `,
      errors: [
        { column: 3, line: 4, messageId },
        { column: 3, line: 7, messageId },
        { column: 3, line: 10, messageId },
      ],
      output: `
class Test {
  @decorator(async () => {})
  static protected async [(1)]() {
    return Promise.resolve(1);
  }
  public async 'bar'() {
    return Promise.resolve(2);
  }
  private async ['baz']() {
    return Promise.resolve(3);
  }
}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/5729
    {
      code: `
class Foo {
  catch() {
    return Promise.resolve(1);
  }

  public default() {
    return Promise.resolve(2);
  }

  @decorator
  private case<T>() {
    return Promise.resolve(3);
  }
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId,
        },
        {
          column: 3,
          line: 7,
          messageId,
        },
        {
          column: 3,
          line: 12,
          messageId,
        },
      ],
      output: `
class Foo {
  async catch() {
    return Promise.resolve(1);
  }

  public async default() {
    return Promise.resolve(2);
  }

  @decorator
  private async case<T>() {
    return Promise.resolve(3);
  }
}
      `,
    },
    {
      code: `
const foo = {
  catch() {
    return Promise.resolve(1);
  },
};
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId,
        },
      ],
      output: `
const foo = {
  async catch() {
    return Promise.resolve(1);
  },
};
      `,
    },
    {
      code: `
function promiseInUnionWithoutExplicitReturnType(p: boolean) {
  return p ? Promise.resolve(5) : 5;
}
      `,
      errors: [
        {
          messageId,
        },
      ],
      output: `
async function promiseInUnionWithoutExplicitReturnType(p: boolean) {
  return p ? Promise.resolve(5) : 5;
}
      `,
    },
  ],
});
