import rule from '../../src/rules/no-unused-expressions';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

// the base rule doesn't have messageIds
function error(
  messages: { line: number; column: number }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return messages.map(message => ({
    ...message,
    message:
      'Expected an assignment or function call and instead saw an expression.',
  }));
}

ruleTester.run('no-unused-expressions', rule, {
  valid: [
    `
      test.age?.toLocaleString();
    `,
    `
      let a = (a?.b).c;
    `,
    `
      let b = a?.['b'];
    `,
    `
      let c = one[2]?.[3][4];
    `,
    `
      one[2]?.[3][4]?.();
    `,
    `
      a?.['b']?.c();
    `,
  ],
  invalid: [
    {
      code: `
if(0) 0
        `,
      errors: error([
        {
          line: 2,
          column: 7,
        },
      ]),
    },
    {
      code: `
f(0), {}
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a, b()
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a() && function namedFunctionInExpressionContext () {f();}
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.b
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.b).c
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.['b']
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.['b']).c
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.b()?.c
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.b()).c
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
one[2]?.[3][4];
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
one.two?.three.four;
        `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
  ],
});
