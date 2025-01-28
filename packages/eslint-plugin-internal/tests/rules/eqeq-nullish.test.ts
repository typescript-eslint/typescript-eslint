import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/eqeq-nullish';

const ruleTester = new RuleTester();

ruleTester.run('eqeq-nullish', rule, {
  invalid: [
    {
      code: 'something === undefined;',
      errors: [
        {
          column: 11,
          data: {
            nullishKind: 'undefined',
            strictOperator: '===',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedComparison',
          suggestions: [
            {
              data: {
                looseOperator: '==',
              },
              messageId: 'useLooseComparisonSuggestion',
              output: `something == null;`,
            },
          ],
        },
      ],
    },
    {
      code: 'undefined !== something;',
      errors: [
        {
          column: 1,
          data: {
            nullishKind: 'undefined',
            strictOperator: '!==',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedComparison',
          suggestions: [
            {
              data: {
                looseOperator: '!=',
              },
              messageId: 'useLooseComparisonSuggestion',
              output: `null != something;`,
            },
          ],
        },
      ],
    },
    {
      code: 'null !== something;',
      errors: [
        {
          column: 1,
          data: {
            nullishKind: 'null',
            strictOperator: '!==',
          },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'unexpectedComparison',
          suggestions: [
            {
              data: {
                looseOperator: '!=',
              },
              messageId: 'useLooseComparisonSuggestion',
              output: `null != something;`,
            },
          ],
        },
      ],
    },
  ],
  valid: [
    'null == a;',
    'foo != null;',
    'foo === bar;',
    'foo !== bar;',
    // We're not trying to duplicate eqeqeq's reports.
    'a == b;',
    'something == undefined;',
    'undefined != something;',
  ],
});
