import rule from 'eslint/lib/rules/no-undef';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
  },
  env: { es6: true },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-undef', rule, {
  valid: [
    `
import Beemo from './Beemo';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';

export { Context, Driver, DriverContext, Script, ScriptContext };

export * from './constants';

export * from './types';

export default Beemo;
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/471
    `
class X {
  field = {}
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/466
    {
      code: `
/*globals document, selector */
const links = document.querySelectorAll( selector ) as NodeListOf<HTMLElement>
      `,
      env: { browser: true }
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/437
    `
type Result = string
interface Runnable {
  run (): Result
  toString (): string
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/416
    `
export type SomeThing = {
    id: string;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/20
    `
export abstract class Foo {}
export class FooBar extends Foo {}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/18
    `
function eachr<Key, Value>(subject: Map<Key, Value>): typeof subject;
function eachr<Value = string>(subject: Object | Array<Value>): typeof subject {
  return subject
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/18
    `
function eachr<Key, Value>(subject: Map<Key, Value>): typeof subject;
    `,
    `
      var a = { b: 3 };
      var c = a?.b;
    `,
    `
      var a = { b: { c: 3 } };
      var d = a?.["b"]?.c;
    `,
    `
      var a = { b: 3 };
      var c = { };
      var d = (a || c)?.b;
    `,
    `
      var a = { b: () => {} };
      a?.b();
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/262
    `
export default class Foo {
  [key: string]: any;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/262
    `
export default interface Foo {
  [key: string]: any;
}
    `,
  ],
  invalid: [
    {
      code: 'a = 5;',
      errors: [
        {
          messageId: 'undef',
          data: {
            name: 'a',
          },
        },
      ],
    },
    {
      code: 'a?.b = 5;',
      errors: [
        {
          messageId: 'undef',
          data: {
            name: 'a',
          },
        },
      ],
    },
    {
      code: 'a()?.b = 5;',
      errors: [
        {
          messageId: 'undef',
          data: {
            name: 'a',
          },
        },
      ],
    },
    {
      code: 'function foo(subject: Object<Key> | Array<Value>)',
      errors: [
        {
          messageId: 'undef',
          data: {
            name: 'Key',
          },
          line: 1,
          column: 30,
        },
        {
          messageId: 'undef',
          data: {
            name: 'Value',
          },
          line: 1,
          column: 43,
        },
      ],
    },
  ],
});
