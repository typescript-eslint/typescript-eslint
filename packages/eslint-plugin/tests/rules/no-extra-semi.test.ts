/* eslint-disable eslint-comments/no-use */
// this rule tests semis, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/no-extra-semi';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extra-semi', rule, {
  valid: [
    {
      code: 'var x = 5;',
    },
    {
      code: 'function foo() {}',
    },
    {
      code: 'for(;;);',
    },
    {
      code: 'while(0);',
    },
    {
      code: 'do;while(0);',
    },
    {
      code: 'for(a in b);',
    },
    {
      code: 'for(a of b);',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'if(true);',
    },
    {
      code: 'if(true); else;',
    },
    {
      code: 'foo: ;',
    },
    {
      code: 'with(foo);',
    },

    // Class body.
    {
      code: 'class A { }',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var A = class { };',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'class A { a() { this; } }',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var A = class { a() { this; } };',
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'class A { } a;',
      parserOptions: { ecmaVersion: 6 },
    },

    // modules
    {
      code: 'export const x = 42;',
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },
    {
      code: 'export default 42;',
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },

    // Class Property
    {
      code: `
export class Foo {
  public foo: number = 0;
}
      `,
    },
    {
      code: `
export class Foo {
  public foo: number = 0; public bar: number = 1;
}
      `,
    },
  ],
  invalid: [
    {
      code: 'var x = 5;;',
      output: 'var x = 5;',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'function foo(){};',
      output: 'function foo(){}',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'for(;;);;',
      output: 'for(;;);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'while(0);;',
      output: 'while(0);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'do;while(0);;',
      output: 'do;while(0);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'for(a in b);;',
      output: 'for(a in b);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'for(a of b);;',
      output: 'for(a of b);',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'if(true);;',
      output: 'if(true);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'if(true){} else;;',
      output: 'if(true){} else;',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'if(true){;} else {;}',
      output: 'if(true){} else {}',
      errors: [
        {
          messageId: 'unexpected',
        },
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'foo:;;',
      output: 'foo:;',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'with(foo);;',
      output: 'with(foo);',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: 'with(foo){;}',
      output: 'with(foo){}',
      errors: [
        {
          messageId: 'unexpected',
        },
      ],
    },

    // Class body.
    {
      code: 'class A { ; }',
      output: 'class A {  }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
        },
      ],
    },
    {
      code: 'class A { /*a*/; }',
      output: 'class A { /*a*/ }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
        },
      ],
    },
    {
      code: 'class A { ; a() {} }',
      output: 'class A {  a() {} }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
        },
      ],
    },
    {
      code: 'class A { a() {}; }',
      output: 'class A { a() {} }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 17,
        },
      ],
    },
    {
      code: 'class A { a() {}; b() {} }',
      output: 'class A { a() {} b() {} }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 17,
        },
      ],
    },
    {
      code: 'class A {; a() {}; b() {}; }',
      output: 'class A { a() {} b() {} }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 10,
        },
        {
          messageId: 'unexpected',
          column: 18,
        },
        {
          messageId: 'unexpected',
          column: 26,
        },
      ],
    },
    {
      code: 'class A { a() {}; get b() {} }',
      output: 'class A { a() {} get b() {} }',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 17,
        },
      ],
    },
    {
      code: `
class Foo {
  public foo: number = 0;;
}
      `,
      output: `
class Foo {
  public foo: number = 0;
}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          column: 26,
        },
      ],
    },
    {
      code: `
class Foo {
  public foo: number = 0;; public bar: number = 1;;
  public baz: number = 1;;
}
      `,
      output: `
class Foo {
  public foo: number = 0; public bar: number = 1;
  public baz: number = 1;
}
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpected',
          line: 3,
          column: 26,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 51,
        },
        {
          messageId: 'unexpected',
          line: 4,
          column: 26,
        },
      ],
    },
  ],
});
