import rule from 'eslint/lib/rules/no-shadow';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-shadow', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/459
    `
type foo = any;
function bar(foo: any) {}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/20
    `
export abstract class Foo {}
export class FooBar extends Foo {}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/207
    `
function test(this: Foo) {
  function test2(this: Bar) {}
}
    `,
  ],
  invalid: [],
});
