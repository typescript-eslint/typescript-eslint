import rule from '../../src/rules/prefer-namespace-keyword';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-namespace-keyword', rule, {
  valid: [
    "declare module 'foo';",
    "declare module 'foo' {}",
    'namespace foo {}',
    'declare namespace foo {}',
    'declare global {}',
  ],
  invalid: [
    {
      code: 'module foo {}',
      output: 'namespace foo {}',
      errors: [
        {
          messageId: 'useNamespace',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'declare module foo {}',
      output: 'declare namespace foo {}',
      errors: [
        {
          messageId: 'useNamespace',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
declare module foo {
  declare module bar {}
}
      `,
      output: `
declare namespace foo {
  declare namespace bar {}
}
      `,
      errors: [
        {
          messageId: 'useNamespace',
          line: 2,
          column: 1,
        },
        {
          messageId: 'useNamespace',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
