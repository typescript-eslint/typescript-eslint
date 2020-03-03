import rule from '../../src/rules/no-unsafe-member-access';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
} from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
  },
});

ruleTester.run('no-unsafe-member-access', rule, {
  valid: [
    'function foo(x: { a: number }) { x.a }',
    'function foo(x?: { a: number }) { x?.a }',
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: `
function foo(x: any) { x.a }
function foo(x: any) { x.a.b.c.d.e.f.g }
function foo(x: { a: any }) { x.a.b.c.d.e.f.g }
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
          line: 2,
          column: 24,
          endColumn: 27,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.a',
          },
          line: 3,
          column: 24,
          endColumn: 27,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: '.b',
          },
          line: 4,
          column: 31,
          endColumn: 36,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `
function foo(x: any) { x['a'] }
function foo(x: any) { x['a']['b']['c'] }
      `,
      errors: [
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
          line: 2,
          column: 24,
          endColumn: 30,
        },
        {
          messageId: 'unsafeMemberExpression',
          data: {
            property: "['a']",
          },
          line: 3,
          column: 24,
          endColumn: 30,
        },
      ],
    }),
  ],
});
