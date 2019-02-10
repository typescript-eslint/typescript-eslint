import rule from 'eslint/lib/rules/no-undef';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  parser: '@typescript-eslint/parser'
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
    `
/*globals document, selector */
const links = document.querySelectorAll( selector ) as NodeListOf<HTMLElement>
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/437
    `
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
    `
  ],
  invalid: []
});
