import rule from '../../src/rules/no-throw-literal';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    tsconfigRootDir: getFixturesRootDir(),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-throw-literal', rule, {
  valid: [
    'throw new Error();',
    "throw new Error('error');",
    "throw Error('error');",
    `
const e = new Error();
throw e;
    `,
    `
try {
  throw new Error();
} catch (e) {
  throw e;
}
    `,
    `
function foo() {
  return new Error();
}
throw foo();
    `,
    `
const foo = {
  bar: new Error(),
};
throw foo.bar;
    `,
    `
const foo = {
  bar: new Error(),
};

throw foo['bar'];
    `,
    `
const foo = {
  bar: new Error(),
};

const bar = 'bar';
throw foo[bar];
    `,
    `
class CustomError extends Error {}
throw new CustomError();
    `,
    `
class CustomError1 extends Error {}
class CustomError2 extends CustomError1 {}
throw new CustomError2();
    `,
    'throw (foo = new Error());',
    'throw (1, 2, new Error());',
    "throw 'literal' && new Error();",
    "throw new Error() || 'literal';",
    'throw foo ? new Error() : new Error();',
    `
function* foo() {
  let index = 0;
  throw yield index++;
}
    `,
    `
async function foo() {
  throw await bar;
}
    `,
    `
import { Error } from './missing';
throw Error;
    `,
    `
class CustomError<T, C> extends Error {}
throw new CustomError<string, string>();
    `,
    `
class CustomError<T = {}> extends Error {}
throw new CustomError();
    `,
    `
class CustomError<T extends object> extends Error {}
throw new CustomError();
    `,
    `
function foo() {
  throw Object.assign(new Error('message'), { foo: 'bar' });
}
    `,
    `
const foo: Error | SyntaxError = bar();
function bar() {
  throw foo;
}
    `,
    `
declare const foo: Error | string;
throw foo as Error;
    `,
    'throw new Error() as Error;',
    `
declare const nullishError: Error | undefined;
throw nullishError ?? new Error();
    `,
    `
declare const nullishError: Error | undefined;
throw nullishError || new Error();
    `,
    `
declare const nullishError: Error | undefined;
throw nullishError ? nullishError : new Error();
    `,
  ],
  invalid: [
    {
      code: 'throw undefined;',
      errors: [
        {
          messageId: 'undef',
        },
      ],
    },
    {
      code: "throw new String('');",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'error';",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw 0;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw false;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw null;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw {};',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'a' + 'b';",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const a = '';
throw a + 'b';
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw (foo = 'error');",
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw (new Error(), 1, 2, 3);',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: "throw 'literal' && 'not an Error';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw 'literal' || new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw new Error() && 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw 'literal' ?? new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? 'not an Error' : 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? new Error() : 'literal';",
      errors: [{ messageId: 'object' }],
    },
    {
      code: "throw foo ? 'literal' : new Error();",
      errors: [{ messageId: 'object' }],
    },
    {
      code: 'throw `${err}`;',
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const err = 'error';
throw err;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
function foo(msg) {}
throw foo('error');
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo = {
  msg: 'error',
};
throw foo.msg;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo = {
  msg: undefined,
};
throw foo.msg;
      `,
      errors: [
        {
          messageId: 'undef',
        },
      ],
    },
    {
      code: `
class CustomError {}
throw new CustomError();
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
class Foo {}
class CustomError extends Foo {}
throw new CustomError();
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const Error = null;
throw Error;
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
import { Error } from './class';
throw new Error();
      `,
      errors: [
        {
          messageId: 'object',
          line: 3,
          column: 7,
        },
      ],
    },
    {
      code: `
class CustomError<T extends object> extends Foo {}
throw new CustomError();
      `,
      errors: [
        {
          messageId: 'object',
          line: 3,
          column: 7,
        },
      ],
    },
    {
      code: `
function foo<T>() {
  const res: T;
  throw res;
}
      `,
      errors: [
        {
          messageId: 'object',
          line: 4,
          column: 9,
        },
      ],
    },
    {
      code: `
function foo<T>(fn: () => Promise<T>) {
  const promise = fn();
  const res = promise.then(() => {}).catch(() => {});
  throw res;
}
      `,
      errors: [
        {
          messageId: 'object',
          line: 5,
          column: 9,
        },
      ],
    },
    {
      code: `
function foo() {
  throw Object.assign({ foo: 'foo' }, { bar: 'bar' });
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
const foo: Error | { bar: string } = bar();
function bar() {
  throw foo;
}
      `,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `
declare const foo: Error | string;
throw foo as string;
      `,
      errors: [{ messageId: 'object' }],
    },
  ],
});
