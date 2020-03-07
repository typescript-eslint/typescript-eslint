import rule from '../../src/rules/no-unsafe-assignment';
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

ruleTester.run('no-unsafe-assignment', rule, {
  valid: [
    'const x = 1',
    'const x: number = 1',
    'const x = 1, y = 1',
    'let x',
    'let x = 1, y',
    'function foo(a = 1) {}',
    'class Foo { constructor(private a = 1) {} }',
    'class Foo { private a = 1 }',
    'const x: Set<string> = new Set();',
    'const x: Set<string> = new Set<string>();',
    'const [x] = [1]',
    // this is not checked, because there's no annotation to compare it with
    'const x = new Set<any>();',
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: `
const x = (1 as any);
const x = (1 as any), y = 1;
function foo(a = (1 as any)) {}
class Foo { constructor(private a = (1 as any)) {} }
class Foo { private a = (1 as any) }
      `,
      errors: [
        {
          messageId: 'anyAssignment',
          line: 2,
          column: 7,
          endColumn: 21,
        },
        {
          messageId: 'anyAssignment',
          line: 3,
          column: 7,
          endColumn: 21,
        },
        {
          messageId: 'anyAssignment',
          line: 4,
          column: 14,
          endColumn: 28,
        },
        {
          messageId: 'anyAssignment',
          line: 5,
          column: 33,
          endColumn: 47,
        },
        {
          messageId: 'anyAssignment',
          line: 6,
          column: 13,
          endColumn: 35,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `
const [x] = (1 as any);
const [x] = [] as any[];
      `,
      errors: [
        {
          messageId: 'anyAssignment',
          line: 2,
          column: 7,
          endColumn: 23,
        },
        {
          messageId: 'unsafeArrayPattern',
          line: 3,
          column: 7,
          endColumn: 24,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `
const x: Set<string> = new Set<any>();
const x: Map<string, string> = new Map<string, any>();
const x: Set<string[]> = new Set<any[]>();
const x: Set<Set<Set<string>>> = new Set<Set<Set<any>>>();
      `,
      errors: [
        {
          messageId: 'unsafeAssignment',
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
          line: 2,
        },
        {
          messageId: 'unsafeAssignment',
          data: {
            sender: 'Map<string, any>',
            receiver: 'Map<string, string>',
          },
          line: 3,
        },
        {
          messageId: 'unsafeAssignment',
          data: {
            sender: 'Set<any[]>',
            receiver: 'Set<string[]>',
          },
          line: 4,
        },
        {
          messageId: 'unsafeAssignment',
          data: {
            sender: 'Set<Set<Set<any>>>',
            receiver: 'Set<Set<Set<string>>>',
          },
          line: 5,
        },
      ],
    }),
  ],
});
