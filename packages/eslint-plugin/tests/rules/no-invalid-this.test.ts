import rule from '../../src/rules/no-invalid-this';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-invalid-this', rule, {
  valid: [
    `class A {
      private barA = 0;
      fooA = () => {
        this.barA = 1;
      }
    }`,
    `class B {
      private barB() {}
      fooB = () => {
        this.barB();
      }
    }`,
    `const C = class {
      private barC = 0;
      fooC = () => {
        this.barC = 1;
      }
    }`,
    `const D = class {
      private barD() {}
      fooD = () => {
        this.barD();
      }
    }`,
  ],
  invalid: [
    {
      code: `function invalidFoo() {
          this.x = 1;
        }`,
      errors: [
        {
          messageId: 'noInvalidThis',
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `function invalidBar() {
          this.invalidMethod();
        }`,
      errors: [
        {
          messageId: 'noInvalidThis',
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `const invalidBazz = () => {
          this.x = 1;
        }`,
      errors: [
        {
          messageId: 'noInvalidThis',
          line: 2,
          column: 11,
        },
      ],
    },
    {
      code: `const invalidBuzz = () => {
          this.invalidMethod();
        }`,
      errors: [
        {
          messageId: 'noInvalidThis',
          line: 2,
          column: 11,
        },
      ],
    },
  ],
});

/*


*/
