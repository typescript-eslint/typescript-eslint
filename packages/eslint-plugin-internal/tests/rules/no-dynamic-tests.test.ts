import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-dynamic-tests.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {},
      ecmaVersion: 6,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-dynamic-tests', rule, {
  invalid: [
    // Function calls in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [generateTestCases()],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [...getInvalidCases()],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 33,
          endLine: 4,
          line: 4,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Spread operator in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [...validTestCases],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [...validTestCases.map(t => t.code)],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Simple identifiers in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [testCase],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Template literals in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [\`\${getTest()}\`],
  invalid: [],
});
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Binary expressions in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: ['test' + getSuffix()],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Conditional expressions in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [shouldTest ? 'test1' : 'test2'],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 41,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Member expressions in test arrays
    {
      code: `
ruleTester.run('test', rule, {
  valid: [testConfig.cases],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Object spread
    {
      code: `
ruleTester.run('test', rule, {
  valid: [{ ...testConfig }],
  invalid: [],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Tag
    {
      code: `
ruleTester.run('test', rule, {
  valid: [foo\`const x = 1;\`],
  invalid: [],
});
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // Object Value
    {
      code: `
ruleTester.run('test', rule, {
  valid: [{ code: foo }],
  invalid: [],
});
      `,
      errors: [
        {
          column: 19,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [{ errors: [...getErrors()] }],
  invalid: [],
});
      `,
      errors: [
        {
          column: 22,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // assign directly
    {
      code: `
ruleTester.run('test', rule, {
  valid: foo,
  invalid: [],
});
      `,
      errors: [
        {
          column: 10,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
    // noFormat not allowed on non-code fields (e.g. output)
    {
      code: `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [
    {
      code: 'var x = 1;',
      errors: [{ messageId: 'error' }],
      output: noFormat\`var x = 1;\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 15,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'noFormatNotAllowedHere',
        },
      ],
      output: `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [
    {
      code: 'var x = 1;',
      errors: [{ messageId: 'error' }],
      output: \`var x = 1;\`,
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [
    {
      code: 'var x = 1;',
      errors: [
        {
          messageId: 'error',
          suggestions: [
            {
              messageId: 'suggestion',
              output: noFormat\`var x = 1;\`,
            },
          ],
        },
      ],
    },
  ],
});
      `,
      errors: [
        {
          column: 23,
          endColumn: 31,
          endLine: 13,
          line: 13,
          messageId: 'noFormatNotAllowedHere',
        },
      ],
      output: `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [
    {
      code: 'var x = 1;',
      errors: [
        {
          messageId: 'error',
          suggestions: [
            {
              messageId: 'suggestion',
              output: \`var x = 1;\`,
            },
          ],
        },
      ],
    },
  ],
});
      `,
    },
  ],
  valid: [
    {
      code: `
ruleTester.run('test', rule, {
  valid: ['const x = 1;'],
  invalid: [],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: ['const x = 1;', 'let y = 2;'],
  invalid: [
    {
      code: 'var z = 3;',
      errors: [{ messageId: 'error' }],
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [{ code: 'const x = 1;' }, { code: 'let y = 2;' }],
  invalid: [],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [noFormat\`const x = 1;\`],
  invalid: [],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  valid: [{ code: noFormat\`const x = 1;\` }],
  invalid: [],
});
      `,
    },
    {
      code: `
ruleTester.run('test', rule, {
  code: "import type { ValueOf } from './utils';",
  filename: path.resolve(
    PACKAGES_DIR,
    'ast-spec/src/expression/AssignmentExpression/spec.ts',
  ),
});
      `,
    },
    `
ruleTester.run('test', rule, {
  valid: [],
  invalid: [
    {
      code: 'x.y!;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
  ],
});
    `,
  ],
});
