import rule from '../../src/rules/no-unsafe-assignment';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
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
    'const x = 1;',
    'const x: number = 1;',
    `
const x = 1,
  y = 1;
    `,
    'let x;',
    `
let x = 1,
  y;
    `,
    'function foo(a = 1) {}',
    `
class Foo {
  constructor(private a = 1) {}
}
    `,
    `
class Foo {
  private a = 1;
}
    `,
    'const x: Set<string> = new Set();',
    'const x: Set<string> = new Set<string>();',
    'const [x] = [1];',
    'const [x, ...y] = [1, 2, 3, 4, 5];',
    'const [x, ...y] = [1];',
    // this is not checked, because there's no annotation to compare it with
    'const x = new Set<any>();',
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: noFormat`
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
      code: noFormat`
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
          endColumn: 10,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
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
    ...batchedSingleLineTests({
      code: noFormat`
const [x] = [1 as any];
const [x, ...y] = [1, 2 as any];
const [x, y, ...z] = [1, 2 as any, 3 as any];
const [x, ...y] = [1, 2, 3, 4 as any];
const [[[[x]]]] = [[[[1 as any]]]];
      `,
      errors: [
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 2,
          column: 8,
          endColumn: 9,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 3,
          column: 11,
          endColumn: 15,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 4,
          column: 11,
          endColumn: 12,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 4,
          column: 14,
          endColumn: 18,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 5,
          column: 11,
          endColumn: 15,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 6,
          column: 11,
          endColumn: 12,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
[x] = [1] as [any];
[x, ...y] = [1, 2] as [1, any];
[x, y, ...z] = [1, 2, 3] as [1, any, any];
[x, ...y] = [1, 2, 3, 4] as [1, 2, 3, any];
[[[[x]]]] = [[[[1 as any]]]];
      `,
      errors: [
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 2,
          column: 2,
          endColumn: 3,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 3,
          column: 5,
          endColumn: 9,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 4,
          column: 5,
          endColumn: 6,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 4,
          column: 8,
          endColumn: 12,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 5,
          column: 5,
          endColumn: 9,
        },
        {
          messageId: 'unsafeArrayPatternFromTuple',
          line: 6,
          column: 5,
          endColumn: 6,
        },
      ],
    }),
  ],
});
