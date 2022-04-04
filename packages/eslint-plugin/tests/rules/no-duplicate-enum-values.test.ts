import rule from '../../src/rules/no-duplicate-enum-values';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
          line: 4,
          column: 3,
          messageId: 'duplicateMember',
          data: { value: 1 },
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
          line: 4,
          column: 3,
          messageId: 'duplicateMember',
          data: { value: 'A' },
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
          line: 4,
          column: 3,
          messageId: 'duplicateMember',
          data: { value: 'A' },
        },
        {
          line: 6,
          column: 3,
          messageId: 'duplicateMember',
          data: { value: 1 },
        },
      ],
    },
  ],
});
