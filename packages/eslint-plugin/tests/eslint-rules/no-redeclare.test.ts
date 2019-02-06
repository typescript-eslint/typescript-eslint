import rule from 'eslint/lib/rules/no-redeclare';
import RuleTester from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-redeclare', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/443
    `
const Foo = 1;
type Foo = 1;
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
function foo({ bar }: { bar: string }) {
    console.log(bar);
}
    `
  ],
  invalid: []
});
