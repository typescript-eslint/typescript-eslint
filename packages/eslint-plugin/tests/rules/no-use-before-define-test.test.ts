import rule from '../../src/rules/no-use-before-define';
import { RuleTester } from '../RuleTester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const parserOptions = { ecmaVersion: 6 as const };

ruleTester.run('no-use-before-define', rule, {
  valid: [
    // "allowNamedExports" option
    {
      code: `
export { a };
const a = 1;
      `,
      options: [{ allowNamedExports: true }],
      parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    },
    //     {
    //       code: `
    // export { a as b };
    // const a = 1;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //     },
    //     {
    //       code: `
    // export { a, b };
    // let a, b;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //     },
    //     {
    //       code: `
    // export { a };
    // var a;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //     },
    //     {
    //       code: `
    // export { f };
    // function f() {}
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //     },
    //     {
    //       code: `
    // export { C };
    // class C {}
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //     },
  ],
  invalid: [
    // "allowNamedExports" option
    //     {
    //       code: `
    // export { a };
    // const a = 1;
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a };
    // const a = 1;
    //       `,
    //       options: [{}],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a };
    // const a = 1;
    //       `,
    //       options: [{ allowNamedExports: false }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a };
    // const a = 1;
    //       `,
    //       options: ['nofunc'],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a as b };
    // const a = 1;
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a, b };
    // let a, b;
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'b' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { a };
    // var a;
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { f };
    // function f() {}
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'f' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export { C };
    // class C {}
    //       `,
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'C' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export const foo = a;
    // const a = 1;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    {
      code: `
export default a;
const a = 1;
      `,
      options: [{ allowNamedExports: true, ignoreTypeReferences: false }],
      parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
      errors: [
        {
          messageId: 'noUseBeforeDefine',
          data: { name: 'a' },
        },
      ],
    },
    //     {
    //       code: `
    // export function foo() {
    //   return a;
    // }
    // const a = 1;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // export class C {
    //   foo() {
    //     return a;
    //   }
    // }
    // const a = 1;
    //       `,
    //       options: [{ allowNamedExports: true }],
    //       parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    //       errors: [
    //         {
    //           messageId: 'noUseBeforeDefine',
    //           data: { name: 'a' },
    //         },
    //       ],
    //     },
  ],
});
