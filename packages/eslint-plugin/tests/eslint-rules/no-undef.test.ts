import rule from 'eslint/lib/rules/no-undef';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
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
  field = {};
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/466
    `
/*globals document, selector, NodeListOf, HTMLElement */
const links = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    `,
    {
      code: `
/*globals document, selector */
const links = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      `,
      parserOptions: {
        lib: ['dom'],
      },
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/437
    `
interface Runnable {
  run(): void;
  toString(): string;
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/416
    `
export type SomeThing = {
  id: string;
};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/20
    `
export abstract class Foo {}
export class FooBar extends Foo {}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/18
    `
interface IteratorCallback<Subject, Key, Value> {
  (this: Subject, value: Value, key: Key, subject: Subject): void | false;
}
function eachr<Value>(
  subject: Array<Value>,
  callback: IteratorCallback<typeof subject, number, Value>,
): typeof subject;
function eachr<Key, Value>(
  subject: Map<Key, Value>,
  callback: IteratorCallback<typeof subject, Key, Value>,
): typeof subject;
function eachr<Object extends object, Key extends keyof Object>(
  subject: Object,
  callback: IteratorCallback<Object, Key, Object[Key]>,
): Object;
function eachr<Object extends object, Key, Value>(
  subject: Object | Array<Value> | Map<Key, Value>,
  callback: IteratorCallback<typeof subject, Key, Value>,
): typeof subject {
  return subject;
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
      var d = a?.['b']?.c;
    `,
    `
      var a = { b: 3 };
      var c = {};
      var d = (a || c)?.b;
    `,
    `
      var a = { b: () => {} };
      a?.b();
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
  ],
});
