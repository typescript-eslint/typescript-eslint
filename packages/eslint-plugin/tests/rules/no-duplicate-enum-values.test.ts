import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-duplicate-enum-values';

const ruleTester = new RuleTester();

ruleTester.run('no-duplicate-enum-values', rule, {
  valid: [
    `
enum E {
  A,
  B,
}
    `,
    `
enum E {
  A = 1,
  B,
}
    `,
    `
enum E {
  A = 1,
  B = 2,
}
    `,
    `
enum E {
  A = 'A',
  B = 'B',
}
    `,
    `
enum E {
  A = 'A',
  B = 'B',
  C,
}
    `,
    `
enum E {
  A = 'A',
  B = 'B',
  C = 2,
  D = 1 + 1,
}
    `,
    `
enum E {
  A = 3,
  B = 2,
  C,
}
    `,
    `
enum E {
  A = 'A',
  B = 'B',
  C = 2,
  D = foo(),
}
    `,
    `
enum E {
  A = '',
  B = 0,
}
    `,
    `
enum E {
  A = 0,
  B = -0,
  C = NaN,
}
    `,
    `
const A = 'A';
enum E {
  A = 'A',
  B = \`\${A}\`,
}
    `,
  ],
  invalid: [
    {
      code: `
enum E {
  A = 1,
  B = 1,
}
      `,
      errors: [
        {
          column: 3,
          data: { value: 1 },
          line: 4,
          messageId: 'duplicateValue',
        },
      ],
    },
    {
      code: `
enum E {
  A = 'A',
  B = 'A',
}
      `,
      errors: [
        {
          column: 3,
          data: { value: 'A' },
          line: 4,
          messageId: 'duplicateValue',
        },
      ],
    },
    {
      code: `
enum E {
  A = 'A',
  B = 'A',
  C = 1,
  D = 1,
}
      `,
      errors: [
        {
          column: 3,
          data: { value: 'A' },
          line: 4,
          messageId: 'duplicateValue',
        },
        {
          column: 3,
          data: { value: 1 },
          line: 6,
          messageId: 'duplicateValue',
        },
      ],
    },
    {
      code: `
enum E {
  A = 'A',
  B = \`A\`,
}
      `,
      errors: [
        {
          column: 3,
          data: { value: 'A' },
          line: 4,
          messageId: 'duplicateValue',
        },
      ],
    },
    {
      code: `
enum E {
  A = \`A\`,
  B = \`A\`,
}
      `,
      errors: [
        {
          column: 3,
          data: { value: 'A' },
          line: 4,
          messageId: 'duplicateValue',
        },
      ],
    },
  ],
});
