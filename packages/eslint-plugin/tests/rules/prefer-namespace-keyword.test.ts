import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-namespace-keyword';

const ruleTester = new RuleTester();

ruleTester.run('prefer-namespace-keyword', rule, {
  invalid: [
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'useNamespace',
        },
      ],
      output: 'namespace foo {}',
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'useNamespace',
        },
      ],
      output: 'declare namespace foo {}',
    },
    {
      code: `
declare module foo {
  declare module bar {}
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'useNamespace',
        },
        {
          column: 3,
          line: 3,
          messageId: 'useNamespace',
        },
      ],
      output: `
declare namespace foo {
  declare namespace bar {}
}
      `,
    },
  ],
  valid: [
    "declare module 'foo';",
    "declare module 'foo' {}",
    'namespace foo {}',
    'declare namespace foo {}',
    'declare global {}',
  ],
});
