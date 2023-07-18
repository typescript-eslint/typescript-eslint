/* eslint-disable eslint-comments/no-use */
// this rule tests semis, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-extra-semi';

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
    },
    {
      code: 'var A = class { };',
    },
    {
      code: 'class A { a() { this; } }',
    },
    {
      code: 'var A = class { a() { this; } };',
    },
    {
      code: 'class A { } a;',
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

    // abstract prop/method
    {
      code: `
class Foo {
  abstract foo: number;; abstract bar: number;;
  abstract baz: number;;
}
      `,
      output: `
class Foo {
  abstract foo: number; abstract bar: number;
  abstract baz: number;
}
      `,
      errors: [
        {
          messageId: 'unexpected',
          line: 3,
          column: 24,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 47,
        },
        {
          messageId: 'unexpected',
          line: 4,
          column: 24,
        },
      ],
    },
    {
      code: `
class Foo {
  abstract foo();; abstract bar();;
  abstract baz();;
  abstract foo(): void;; abstract bar(): void;;
  abstract baz(): void;;
}
      `,
      output: `
class Foo {
  abstract foo(); abstract bar();
  abstract baz();
  abstract foo(): void; abstract bar(): void;
  abstract baz(): void;
}
      `,
      errors: [
        {
          messageId: 'unexpected',
          line: 3,
          column: 18,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 35,
        },
        {
          messageId: 'unexpected',
          line: 4,
          column: 18,
        },
        {
          messageId: 'unexpected',
          line: 5,
          column: 24,
        },
        {
          messageId: 'unexpected',
          line: 5,
          column: 47,
        },
        {
          messageId: 'unexpected',
          line: 6,
          column: 24,
        },
      ],
    },
  ],
});
