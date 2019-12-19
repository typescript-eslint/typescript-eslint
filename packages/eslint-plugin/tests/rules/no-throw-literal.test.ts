import rule from '../../src/rules/no-throw-literal';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: getFixturesRootDir(),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-throw-literal', rule, {
  valid: [
    {
      code: `throw new Error();`,
    },
    {
      code: `throw new Error('error');`,
    },
    {
      code: `throw Error('error');`,
    },
    {
      code: `
const e = new Error();
throw e;
      `,
    },
    {
      code: `
try {
  throw new Error();
} catch (e) {
  throw e;
}
      `,
    },
    {
      code: `
function foo() {
  return new Error();
}

throw foo();
      `,
    },
    {
      code: `
const foo = {
  bar: new Error()
}

throw foo.bar;
      `,
    },
    {
      code: `
const foo = {
  bar: new Error()
}

throw foo['bar'];
      `,
    },
    {
      code: `
const foo = {
  bar: new Error()
}

const bar = 'bar';
throw foo[bar];
      `,
    },
    {
      code: `
class CustomError extends Error {};
throw new CustomError();
      `,
    },
    {
      code: `
class CustomError1 extends Error {}
class CustomError2 extends CustomError1 {}
throw new CustomError();
      `,
    },
    {
      code: `throw foo = new Error();`,
    },
    {
      code: `throw 1, 2, new Error();`,
    },
    {
      code: `throw 'literal' && new Error();`,
    },
    {
      code: `throw new Error() || 'literal'`,
    },
    {
      code: `throw foo ? new Error() : 'literal';`,
    },
    {
      code: `throw foo ? 'literal' : new Error();`,
    },
    {
      code: `
function* foo() {
  let index = 0;
  throw yield index++;
}
      `,
    },
    {
      code: `
async function foo() {
  throw await bar;
}
      `,
    },
  ],
  invalid: [
    {
      code: `throw undefined;`,
      errors: [
        {
          messageId: 'undef',
        },
      ],
    },
    {
      code: `throw new String('');`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw 'error';`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw 0;`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw false;`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw null;`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw {};`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw 'a' + 'b';`,
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
      code: `throw foo = 'error';`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw new Error(), 1, 2, 3;`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw 'literal' && 'not an Error';`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: `throw foo ? 'not an Error' : 'literal';`,
      errors: [
        {
          messageId: 'object',
        },
      ],
    },
    {
      code: 'throw `${err}`',
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
function foo(msg) {
}
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
  msg: 'error'
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
  msg: undefined
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
  ],
});
