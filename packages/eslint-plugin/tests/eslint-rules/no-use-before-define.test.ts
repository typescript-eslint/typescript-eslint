'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from 'eslint/lib/rules/no-use-before-define';
import RuleTester from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-undef', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/550
    `
function test(file: Blob) {
  const slice: typeof file.slice =
    file.slice || (file as any).webkitSlice || (file as any).mozSlice
  return slice
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/435
    `
interface Foo {
    bar: string
}
const bar = 'blah'
    `
  ],
  invalid: []
});
