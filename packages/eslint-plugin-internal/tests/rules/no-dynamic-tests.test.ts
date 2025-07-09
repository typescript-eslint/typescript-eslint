import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-dynamic-tests';

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
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
    },
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
          line: 3,
          messageId: 'noDynamicTests',
        },
      ],
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
  code: "import type { ValueOf } from './utils';",
  filename: path.resolve(
    PACKAGES_DIR,
    'ast-spec/src/expression/AssignmentExpression/spec.ts',
  ),
});
      `,
    },
  ],
});
