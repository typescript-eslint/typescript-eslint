import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-unsafe-assignment';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
} from '../RuleTester';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type Options = InferOptionsTypeFromRule<typeof rule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type InvalidTest = TSESLint.InvalidTestCase<MessageIds, Options>;

function assignmentTest(
  tests: [string, number, number, boolean?][],
): InvalidTest[] {
  return tests.reduce<InvalidTest[]>(
    (acc, [assignment, column, endColumn, skipAssignmentExpression]) => {
      // VariableDeclaration
      acc.push({
        code: `const ${assignment}`,
        errors: [
          {
            messageId: 'unsafeArrayPatternFromTuple',
            line: 1,
            column: column + 6,
            endColumn: endColumn + 6,
          },
        ],
      });
      // AssignmentPattern
      acc.push({
        code: `function foo(${assignment}) {}`,
        errors: [
          {
            messageId: 'unsafeArrayPatternFromTuple',
            line: 1,
            column: column + 13,
            endColumn: endColumn + 13,
          },
        ],
      });
      // AssignmentExpression
      if (skipAssignmentExpression !== true) {
        acc.push({
          code: `(${assignment})`,
          errors: [
            {
              messageId: 'unsafeArrayPatternFromTuple',
              line: 1,
              column: column + 1,
              endColumn: endColumn + 1,
            },
          ],
        });
      }

      return acc;
    },
    [],
  );
}

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
    'function foo(x = 1) {}',
    'function foo([x] = [1]) {}',
    'function foo([x, ...y] = [1, 2, 3, 4, 5]) {}',
    'function foo([x, ...y] = [1]) {}',
    // this is not checked, because there's no annotation to compare it with
    'const x = new Set<any>();',
    'const x = { y: 1 };',
    'const x: { y: number } = { y: 1 };',
    'const x = [...[1, 2, 3]];',
    {
      code: `
type Props = { a: string };
declare function Foo(props: Props): never;
<Foo a={'foo'} />;
      `,
      filename: 'react.tsx',
    },
    `
      const x: unknown = y as any;
    `,
    `
      const x: unknown[] = y as any[];
    `,
    `
      const x: Set<unknown> = y as Set<any>;
    `,
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
      code: `
const [x] = 1 as any;
const [x] = [] as any[];
      `,
      errors: [
        {
          messageId: 'anyAssignment',
          line: 2,
          column: 7,
          endColumn: 21,
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
    ...assignmentTest([
      ['[x] = [1] as [any]', 2, 3],
      ['[[[[x]]]] = [[[[1 as any]]]]', 5, 6],
      ['[[[[x]]]] = [1 as any]', 2, 9, true],
      ['[{x}] = [{x: 1}] as [{x: any}]', 3, 4],
    ]),
    {
      // TS treats the assignment pattern weirdly in this case
      code: '[[[[x]]]] = [1 as any];',
      errors: [
        {
          messageId: 'unsafeAssignment',
          line: 1,
          column: 1,
          endColumn: 23,
        },
      ],
    },
    ...batchedSingleLineTests({
      code: `
const x = [...(1 as any)];
const x = [...([] as any[])];
      `,
      errors: [
        {
          messageId: 'unsafeArraySpread',
          line: 2,
          column: 12,
          endColumn: 25,
        },
        {
          messageId: 'unsafeArraySpread',
          line: 3,
          column: 12,
          endColumn: 28,
        },
      ],
    }),
    ...assignmentTest([
      ['{x} = {x: 1} as {x: any}', 2, 3],
      ['{x: y} = {x: 1} as {x: any}', 5, 6],
      ['{x: {y}} = {x: {y: 1}} as {x: {y: any}}', 6, 7],
      ['{x: [y]} = {x: {y: 1}} as {x: [any]}', 6, 7],
    ]),
    ...batchedSingleLineTests({
      code: `
const x = { y: 1 as any };
const x = { y: { z: 1 as any } };
const x: { y: Set<Set<Set<string>>> } = { y: new Set<Set<Set<any>>>() };
const x = { ...(1 as any) };
      `,
      errors: [
        {
          messageId: 'anyAssignment',
          line: 2,
          column: 13,
          endColumn: 24,
        },
        {
          messageId: 'anyAssignment',
          line: 3,
          column: 18,
          endColumn: 29,
        },
        {
          messageId: 'unsafeAssignment',
          line: 4,
          column: 43,
          endColumn: 70,
          data: {
            sender: 'Set<Set<Set<any>>>',
            receiver: 'Set<Set<Set<string>>>',
          },
        },
        {
          // spreading an any widens the object type to any
          messageId: 'anyAssignment',
          line: 5,
          column: 7,
          endColumn: 28,
        },
      ],
    }),
    {
      code: `
type Props = { a: string };
declare function Foo(props: Props): never;
<Foo a={1 as any} />;
      `,
      filename: 'react.tsx',
      errors: [
        {
          messageId: 'anyAssignment',
          line: 4,
          column: 9,
          endColumn: 17,
        },
      ],
    },
  ],
});
