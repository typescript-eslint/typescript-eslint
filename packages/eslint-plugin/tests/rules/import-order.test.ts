import rule from '../../src/rules/import-order';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('import-order', rule, {
  valid: [
    "import { a, b } from 'foo'",
    "import { A, b } from 'foo'",
    "import { a, B } from 'foo'",
    "import { A, B } from 'foo'",
    "import { a, _b } from 'foo'",
    "import * as bar from 'foo'",
    `import b from 'a';
     import a from 'b';
    `,
    `import a from 'a';
     import { b, c } from 'bc';
     import d from 'd';
    `
  ],
  invalid: [
    {
      code: "import { b, a } from 'foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10
        }
      ]
    },
    {
      code: "import { _a, b } from 'foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10
        }
      ]
    },
    {
      code: `import a from 'b';
      import b from 'a';
      `,
      errors: [
        {
          messageId: 'sourceOrder',
          line: 1,
          column: 1
        }
      ]
    }
  ]
});
