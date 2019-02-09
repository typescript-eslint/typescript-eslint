/**
 * @fileoverview Disallows awaiting a value that is not a Promise
 * @author Josh Goldberg
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/await-promise'),
  RuleTester = require('eslint').RuleTester,
  path = require('path');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const rootDir = path.join(process.cwd(), 'tests/fixtures/');
const parserOptions = {
  ecmaVersion: 2018,
  tsconfigRootDir: rootDir,
  project: './tsconfig.json'
};
const ruleTester = new RuleTester({
  parserOptions,
  parser: '@typescript-eslint/parser'
});

ruleTester.run('await-promise', rule, {
  valid: [
    `
async function test() {
  await Promise.resolve("value");
  await Promise.reject(new Error("message"));

  await (async () => true)();

  function returnsPromise() {
    return Promise.resolve("value");
  }
  await returnsPromise();

  async function returnsPromiseAsync() {}
  await returnsPromiseAsync();

  let anyValue: any;
  await anyValue;

  let unknownValue: unknown;
  await unknownValue;

  const numberPromise: Promise<number>;
  await numberPromise;

  class Foo extends Promise<number> {}
  const foo: Foo = Foo.resolve(2);
  await foo;

  class Bar extends Foo {}
  const bar: Bar = Bar.resolve(2);
  await bar;

  await (Math.random() > 0.5 ? numberPromise : 0);
  await (Math.random() > 0.5 ? foo : 0);
  await (Math.random() > 0.5 ? bar : 0);

  const intersectionPromise: Promise<number> & number;
  await intersectionPromise;
}
`,
    {
      code: `
class AllowedCustomClass { }

async function test() {
  await new AllowedCustomClass();
}
`,
      options: [
        {
          allowedPromiseNames: ['AllowedCustomClass']
        }
      ]
    }
  ],

  invalid: [
    {
      code: `
async function test() {
  await 0;
  await "value";

  await (Math.random() > 0.5 ? "" : 0);

  class NonPromise extends Array {}
  await new NonPromise();
}
`,
      errors: [
        {
          line: 3,
          messageId: 'await',
          type: 'AwaitExpression'
        },
        {
          line: 4,
          messageId: 'await',
          type: 'AwaitExpression'
        },
        {
          line: 6,
          messageId: 'await',
          type: 'AwaitExpression'
        },
        {
          line: 9,
          messageId: 'await',
          type: 'AwaitExpression'
        }
      ]
    },
    {
      code: `
class NotAllowedCustomClass { }

function test() {
  await new NotAllowedCustomClass();
}
`,
      errors: [
        {
          line: 5,
          messageId: 'await',
          type: 'AwaitExpression'
        }
      ],
      options: [
        {
          allowedPromiseNames: ['AllowedCustomClass']
        }
      ]
    }
  ]
});
