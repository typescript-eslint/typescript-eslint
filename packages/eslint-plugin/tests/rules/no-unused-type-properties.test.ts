import rule from '../../src/rules/no-unused-type-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unused-type-properties', rule, {
  valid: [
    `
      function Test() {}
    `,
  ],
  invalid: [
    {
      code: `
        function Test({}: { unused: boolean }) {}
      `,
      errors: [
        {
          column: 29,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
        function Test({}: {  }) {}
      `,
    },
  ],
});
