import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-assignment';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes({
  project: './tsconfig.noImplicitThis.json',
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
    `
class Foo {
  accessor a = 1;
}
    `,
    'const x: Set<string> = new Set();',
    'const x: Set<string> = new Set<string>();',
    'const [x] = [1];',
    'const [x, y] = [1, 2] as number[];',
    'const [x, ...y] = [1, 2, 3, 4, 5];',
    'const [x, ...y] = [1];',
    'const [{ ...x }] = [{ x: 1 }] as [{ x: any }];',
    'function foo(x = 1) {}',
    'function foo([x] = [1]) {}',
    'function foo([x, ...y] = [1, 2, 3, 4, 5]) {}',
    'function foo([x, ...y] = [1]) {}',
    // this is not checked, because there's no annotation to compare it with
    'const x = new Set<any>();',
    'const x = { y: 1 };',
    'const x = { y = 1 };',
    noFormat`const x = { y(){} };`,
    'const x: { y: number } = { y: 1 };',
    'const x = [...[1, 2, 3]];',
    'const [{ [`x${1}`]: x }] = [{ [`x`]: 1 }] as [{ [`x`]: any }];',
    `
type T = [string, T[]];
const test: T = ['string', []] as T;
    `,
    {
      code: `
type Props = { a: string };
declare function Foo(props: Props): never;
<Foo a={'foo'} />;
      `,
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },

    {
      code: `
declare function Foo(props: { a: string }): never;
<Foo a="foo" />;
      `,
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },
    {
      code: `
declare function Foo(props: { a: string }): never;
<Foo a={} />;
      `,
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },
    'const x: unknown = y as any;',
    'const x: unknown[] = y as any[];',
    'const x: Set<unknown> = y as Set<any>;',
    // https://github.com/typescript-eslint/typescript-eslint/issues/2109
    'const x: Map<string, string> = new Map();',
    `
type Foo = { bar: unknown };
const bar: any = 1;
const foo: Foo = { bar };
    `,
  ],
  invalid: [
    {
      code: 'const x = 1 as any;',
      errors: [
        {
          column: 7,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
const x = 1 as any,
  y = 1;
      `,
      errors: [
        {
          column: 7,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: 'function foo(a = 1 as any) {}',
      errors: [
        {
          column: 14,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(private a = 1 as any) {}
}
      `,
      errors: [
        {
          column: 23,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
class Foo {
  private a = 1 as any;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
class Foo {
  accessor a = 1 as any;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
const [x] = spooky;
      `,
      errors: [
        {
          column: 7,
          data: { receiver: 'error typed', sender: 'error typed' },
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
const [[[x]]] = [spooky];
      `,
      errors: [
        {
          column: 8,
          data: { receiver: 'error typed', sender: 'error typed' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: `
const {
  x: { y: z },
} = { x: spooky };
      `,
      errors: [
        {
          column: 6,
          data: { receiver: 'error typed', sender: 'error typed' },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'unsafeObjectPattern',
        },
        {
          column: 7,
          data: { receiver: 'error typed', sender: 'error typed' },
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
let value: number;

value = spooky;
      `,
      errors: [
        {
          column: 1,
          data: { sender: 'error typed' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
const [x] = 1 as any;
      `,
      errors: [
        {
          column: 7,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
const [x] = [] as any[];
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'unsafeArrayPattern',
        },
      ],
    },

    {
      code: 'const x: Set<string> = new Set<any>();',
      errors: [
        {
          column: 7,
          data: { receiver: '`Set<string>`', sender: '`Set<any>`' },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },
    {
      code: 'const x: Map<string, string> = new Map<string, any>();',
      errors: [
        {
          column: 7,
          data: {
            receiver: '`Map<string, string>`',
            sender: '`Map<string, any>`',
          },
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },
    {
      code: 'const x: Set<string[]> = new Set<any[]>();',
      errors: [
        {
          column: 7,
          data: { receiver: '`Set<string[]>`', sender: '`Set<any[]>`' },
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },
    {
      code: 'const x: Set<Set<Set<string>>> = new Set<Set<Set<any>>>();',
      errors: [
        {
          column: 7,
          data: {
            receiver: '`Set<Set<Set<string>>>`',
            sender: '`Set<Set<Set<any>>>`',
          },
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },

    {
      code: 'const [x] = [1] as [any];',
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'function foo([x] = [1] as [any]) {}',
      errors: [
        {
          column: 15,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: '[x] = [1] as [any];',
      errors: [
        {
          column: 2,
          endColumn: 3,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'const [[[[x]]]] = [[[[1 as any]]]];',
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'function foo([[[[x]]]] = [[[[1 as any]]]]) {}',
      errors: [
        {
          column: 18,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: '[[[[x]]]] = [[[[1 as any]]]];',
      errors: [
        {
          column: 5,
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'const [[[[x]]]] = [1 as any];',
      errors: [
        {
          column: 8,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'function foo([[[[x]]]] = [1 as any]) {}',
      errors: [
        {
          column: 15,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'const [{ x }] = [{ x: 1 }] as [{ x: any }];',
      errors: [
        {
          column: 10,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'function foo([{ x }] = [{ x: 1 }] as [{ x: any }]) {}',
      errors: [
        {
          column: 17,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: '[{ x }] = [{ x: 1 }] as [{ x: any }];',
      errors: [
        {
          column: 4,
          endColumn: 5,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: "const [{ ['x']: x }] = [{ ['x']: 1 }] as [{ ['x']: any }];",
      errors: [
        {
          column: 17,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: "function foo([{ ['x']: x }] = [{ ['x']: 1 }] as [{ ['x']: any }]) {}",
      errors: [
        {
          column: 24,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: "[{ ['x']: x }] = [{ ['x']: 1 }] as [{ ['x']: any }];",
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'const [{ [`x`]: x }] = [{ [`x`]: 1 }] as [{ [`x`]: any }];',
      errors: [
        {
          column: 17,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'function foo([{ [`x`]: x }] = [{ [`x`]: 1 }] as [{ [`x`]: any }]) {}',
      errors: [
        {
          column: 24,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: '[{ [`x`]: x }] = [{ [`x`]: 1 }] as [{ [`x`]: any }];',
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      // TS treats the assignment pattern weirdly in this case
      code: '[[[[x]]]] = [1 as any];',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },

    {
      code: `
const x = [...(1 as any)];
      `,
      errors: [
        {
          column: 12,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'unsafeArraySpread',
        },
      ],
    },
    {
      code: `
const x = [...([] as any[])];
      `,
      errors: [
        {
          column: 12,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'unsafeArraySpread',
        },
      ],
    },

    {
      code: 'const { x } = { x: 1 } as { x: any };',
      errors: [
        {
          column: 9,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'function foo({ x } = { x: 1 } as { x: any }) {}',
      errors: [
        {
          column: 16,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: '({ x } = { x: 1 } as { x: any });',
      errors: [
        {
          column: 4,
          endColumn: 5,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'const { x: y } = { x: 1 } as { x: any };',
      errors: [
        {
          column: 12,
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'function foo({ x: y } = { x: 1 } as { x: any }) {}',
      errors: [
        {
          column: 19,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: '({ x: y } = { x: 1 } as { x: any });',
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: `
const {
  x: { y },
} = { x: { y: 1 } } as { x: { y: any } };
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: 'function foo({ x: { y } } = { x: { y: 1 } } as { x: { y: any } }) {}',
      errors: [
        {
          column: 21,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: `
({
  x: { y },
} = { x: { y: 1 } } as { x: { y: any } });
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'unsafeObjectPattern',
        },
      ],
    },
    {
      code: `
const {
  x: [y],
} = { x: { y: 1 } } as { x: [any] };
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: 'function foo({ x: [y] } = { x: { y: 1 } } as { x: [any] }) {}',
      errors: [
        {
          column: 20,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },
    {
      code: `
({
  x: [y],
} = { x: { y: 1 } } as { x: [any] });
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'unsafeArrayPatternFromTuple',
        },
      ],
    },

    {
      code: 'const x = { y: 1 as any };',
      errors: [
        {
          column: 13,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: 'const x = { y: { z: 1 as any } };',
      errors: [
        {
          column: 18,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: 'const x: { y: Set<Set<Set<string>>> } = { y: new Set<Set<Set<any>>>() };',
      errors: [
        {
          column: 43,
          data: {
            receiver: '`Set<Set<Set<string>>>`',
            sender: '`Set<Set<Set<any>>>`',
          },
          endColumn: 70,
          endLine: 1,
          line: 1,
          messageId: 'unsafeAssignment',
        },
      ],
    },
    {
      code: 'const x = { ...(1 as any) };',
      errors: [
        {
          // spreading an any widens the object type to any
          column: 7,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'anyAssignment',
        },
      ],
    },

    {
      code: `
type Props = { a: string };
declare function Foo(props: Props): never;
<Foo a={1 as any} />;
      `,
      errors: [
        {
          column: 9,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'anyAssignment',
        },
      ],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },
    {
      code: `
function foo() {
  const bar = this;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'anyAssignmentThis',
        },
      ],
    },
    {
      code: `
type T = [string, T[]];
const test: T = ['string', []] as any;
      `,
      errors: [
        {
          column: 7,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'anyAssignment',
        },
      ],
    },
    {
      code: `
type Foo = { bar: number };
const bar: any = 1;
const foo: Foo = { bar };
      `,
      errors: [
        {
          column: 20,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'anyAssignment',
        },
      ],
    },
  ],
});
