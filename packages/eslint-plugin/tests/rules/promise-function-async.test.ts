import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/promise-function-async';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

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
    `
function overloadingThatCanReturnPromise(): Promise<number>;
function overloadingThatCanReturnPromise(a: boolean): number;
function overloadingThatCanReturnPromise(
  a?: boolean,
): Promise<number> | number {
  return Promise.resolve(5);
}
    `,
    `
function overloadingThatCanReturnPromise(a: boolean): number;
function overloadingThatCanReturnPromise(): Promise<number>;
function overloadingThatCanReturnPromise(
  a?: boolean,
): Promise<number> | number {
  return Promise.resolve(5);
}
    `,
    `
function a(): Promise<void>;
function a(x: boolean): void;
function a(x?: boolean) {
  if (x == null) return Promise.reject(new Error());
  throw new Error();
}
    `,
    {
      code: `
function overloadingThatIncludeUnknown(): number;
function overloadingThatIncludeUnknown(a: boolean): unknown;
function overloadingThatIncludeUnknown(a?: boolean): unknown | number {
  return Promise.resolve(5);
}
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
function overloadingThatIncludeAny(): number;
function overloadingThatIncludeAny(a: boolean): any;
function overloadingThatIncludeAny(a?: boolean): any | number {
  return Promise.resolve(5);
}
      `,
      options: [{ allowAny: true }],
    },
    `
class Base {
  async foo() {
    return Promise.resolve(42);
  }
}

class Derived extends Base {
  override async foo() {
    return Promise.resolve(2000);
  }
}
    `,
    `
class Test {
  public override async method() {
    return Promise.resolve(1);
  }
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
        },
        {
          line: 7,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
        },
        {
          line: 6,
          messageId: 'missingAsync',
        },
        {
          line: 13,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
        },
        {
          line: 10,
          messageId: 'missingAsync',
        },
        {
          line: 13,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
        },
        {
          line: 10,
          messageId: 'missingAsync',
        },
        {
          line: 13,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
        },
        {
          line: 6,
          messageId: 'missingAsync',
        },
        {
          line: 10,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
      errors: [{ column: 3, line: 4, messageId: 'missingAsync' }],
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
        { column: 3, line: 4, messageId: 'missingAsync' },
        { column: 3, line: 7, messageId: 'missingAsync' },
        { column: 3, line: 10, messageId: 'missingAsync' },
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
          messageId: 'missingAsync',
        },
        {
          column: 3,
          line: 7,
          messageId: 'missingAsync',
        },
        {
          column: 3,
          line: 12,
          messageId: 'missingAsync',
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
          messageId: 'missingAsync',
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
          messageId: 'missingAsyncHybridReturn',
        },
      ],
      output: `
async function promiseInUnionWithoutExplicitReturnType(p: boolean) {
  return p ? Promise.resolve(5) : 5;
}
      `,
    },
    {
      code: `
function test1(): 'one' | Promise<'one'>;
function test1(a: number): Promise<number>;
function test1(a?: number) {
  if (a) {
    return Promise.resolve(a);
  }

  return Math.random() > 0.5 ? 'one' : Promise.resolve('one');
}
      `,
      errors: [
        {
          messageId: 'missingAsyncHybridReturn',
        },
      ],
      output: `
function test1(): 'one' | Promise<'one'>;
function test1(a: number): Promise<number>;
async function test1(a?: number) {
  if (a) {
    return Promise.resolve(a);
  }

  return Math.random() > 0.5 ? 'one' : Promise.resolve('one');
}
      `,
    },
    {
      code: `
class PromiseType {
  s?: string;
}

function promiseInUnionWithoutExplicitReturnType(p: boolean) {
  return p ? new PromiseType() : 5;
}
      `,
      errors: [
        {
          messageId: 'missingAsyncHybridReturn',
        },
      ],
      options: [
        {
          allowedPromiseNames: ['PromiseType'],
        },
      ],
      output: `
class PromiseType {
  s?: string;
}

async function promiseInUnionWithoutExplicitReturnType(p: boolean) {
  return p ? new PromiseType() : 5;
}
      `,
    },
    {
      code: `
function overloadingThatCanReturnPromise(): Promise<number>;
function overloadingThatCanReturnPromise(a: boolean): Promise<string>;
function overloadingThatCanReturnPromise(
  a?: boolean,
): Promise<number | string> {
  return Promise.resolve(5);
}
      `,
      errors: [
        {
          messageId: 'missingAsync',
        },
      ],
      output: `
function overloadingThatCanReturnPromise(): Promise<number>;
function overloadingThatCanReturnPromise(a: boolean): Promise<string>;
async function overloadingThatCanReturnPromise(
  a?: boolean,
): Promise<number | string> {
  return Promise.resolve(5);
}
      `,
    },
    {
      code: `
function overloadingThatIncludeAny(): number;
function overloadingThatIncludeAny(a: boolean): any;
function overloadingThatIncludeAny(a?: boolean): any | number {
  return Promise.resolve(5);
}
      `,
      errors: [
        {
          messageId: 'missingAsync',
        },
      ],
      options: [{ allowAny: false }],
    },
    {
      code: `
function overloadingThatIncludeUnknown(): number;
function overloadingThatIncludeUnknown(a: boolean): unknown;
function overloadingThatIncludeUnknown(a?: boolean): unknown | number {
  return Promise.resolve(5);
}
      `,
      errors: [
        {
          messageId: 'missingAsync',
        },
      ],
      options: [{ allowAny: false }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11729
    {
      code: `
class Base {
  async foo() {
    return Promise.resolve(42);
  }
}

class Derived extends Base {
  override foo() {
    return Promise.resolve(2000);
  }
}
      `,
      errors: [
        {
          line: 9,
          messageId: 'missingAsync',
        },
      ],
      output: `
class Base {
  async foo() {
    return Promise.resolve(42);
  }
}

class Derived extends Base {
  override async foo() {
    return Promise.resolve(2000);
  }
}
      `,
    },
    {
      code: `
class Test {
  public override method() {
    return Promise.resolve(1);
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'missingAsync',
        },
      ],
      output: `
class Test {
  public override async method() {
    return Promise.resolve(1);
  }
}
      `,
    },
  ],
});
