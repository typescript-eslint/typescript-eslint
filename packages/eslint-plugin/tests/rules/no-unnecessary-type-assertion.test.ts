import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import path from 'path';

import rule from '../../src/rules/no-unnecessary-type-assertion';

const rootDir = path.resolve(__dirname, '../fixtures/');
const ruleTester = new RuleTester({
  parserOptions: {
    EXPERIMENTAL_useProjectService: false,
    sourceType: 'module',
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

const optionsWithOnUncheckedIndexedAccess = {
  tsconfigRootDir: rootDir,
  project: './tsconfig.noUncheckedIndexedAccess.json',
};

const optionsWithExactOptionalPropertyTypes = {
  tsconfigRootDir: rootDir,
  project: './tsconfig.exactOptionalPropertyTypes.json',
};

ruleTester.run('no-unnecessary-type-assertion', rule, {
  valid: [
    `
import { TSESTree } from '@typescript-eslint/utils';
declare const member: TSESTree.TSEnumMember;
if (
  member.id.type === AST_NODE_TYPES.Literal &&
  typeof member.id.value === 'string'
) {
  const name = member.id as TSESTree.StringLiteral;
}
    `,
    `
      const c = 1;
      let z = c as number;
    `,
    `
      const c = 1;
      let z = c as const;
    `,
    `
      const c = 1;
      let z = c as 1;
    `,
    `
      type Bar = 'bar';
      const data = {
        x: 'foo' as 'foo',
        y: 'bar' as Bar,
      };
    `,
    "[1, 2, 3, 4, 5].map(x => [x, 'A' + x] as [number, string]);",
    `
      let x: Array<[number, string]> = [1, 2, 3, 4, 5].map(
        x => [x, 'A' + x] as [number, string],
      );
    `,
    'let y = 1 as 1;',
    'const foo = 3 as number;',
    'const foo = <number>3;',
    `
type Tuple = [3, 'hi', 'bye'];
const foo = [3, 'hi', 'bye'] as Tuple;
    `,
    `
type PossibleTuple = {};
const foo = {} as PossibleTuple;
    `,
    `
type PossibleTuple = { hello: 'hello' };
const foo = { hello: 'hello' } as PossibleTuple;
    `,
    `
type PossibleTuple = { 0: 'hello'; 5: 'hello' };
const foo = { 0: 'hello', 5: 'hello' } as PossibleTuple;
    `,
    `
let bar: number | undefined = x;
let foo: number = bar!;
    `,
    `
declare const a: { data?: unknown };

const x = a.data!;
    `,
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;
      `,
      options: [{ typesToIgnore: ['Foo'] }],
    },
    {
      code: 'const foo = (3 + 5) as any;',
      options: [{ typesToIgnore: ['any'] }],
    },
    {
      code: "(Syntax as any).ArrayExpression = 'foo';",
      options: [{ typesToIgnore: ['any'] }],
    },
    {
      code: 'const foo = (3 + 5) as string;',
      options: [{ typesToIgnore: ['string'] }],
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);
      `,
      options: [{ typesToIgnore: ['Foo'] }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/453
    // the ol' use-before-assign-is-okay-trust-me assertion
    `
let bar: number;
bar! + 1;
    `,
    `
let bar: undefined | number;
bar! + 1;
    `,
    `
let bar: number, baz: number;
bar! + 1;
    `,
    `
function foo<T extends string | undefined>(bar: T) {
  return bar!;
}
    `,
    `
declare function nonNull(s: string);
let s: string | null = null;
nonNull(s!);
    `,
    `
const x: number | null = null;
const y: number = x!;
    `,
    `
const x: number | null = null;
class Foo {
  prop: number = x!;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/529
    `
declare function foo(str?: string): void;
declare const str: string | null;

foo(str!);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/532
    `
declare function a(a: string): any;
declare const b: string | null;
class Mx {
  @a(b!)
  private prop = 1;
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1199
    `
function testFunction(_param: string | undefined): void {
  /* noop */
}
const value = 'test' as string | null | undefined;
testFunction(value!);
    `,
    `
function testFunction(_param: string | null): void {
  /* noop */
}
const value = 'test' as string | null | undefined;
testFunction(value!);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/982
    {
      code: `
declare namespace JSX {
  interface IntrinsicElements {
    div: { key?: string | number };
  }
}

function Test(props: { id?: null | string | number }) {
  return <div key={props.id!} />;
}
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
const a = [1, 2];
const b = [3, 4];
const c = [...a, ...b] as const;
      `,
    },
    {
      code: 'const a = [1, 2] as const;',
    },
    {
      code: "const a = { foo: 'foo' } as const;",
    },
    {
      code: `
const a = [1, 2];
const b = [3, 4];
const c = <const>[...a, ...b];
      `,
    },
    {
      code: 'const a = <const>[1, 2];',
    },
    {
      code: "const a = <const>{ foo: 'foo' };",
    },
    {
      code: `
let a: number | undefined;
let b: number | undefined;
let c: number;
a = b;
c = b!;
a! -= 1;
      `,
    },
    {
      code: `
let a: { b?: string } | undefined;
a!.b = '';
      `,
    },
    `
let value: number | undefined;
let values: number[] = [];

value = values.pop()!;
    `,
    `
declare function foo(): number | undefined;
const a = foo()!;
    `,
    `
declare function foo(): number | undefined;
const a = foo() as number;
    `,
    `
declare function foo(): number | undefined;
const a = <number>foo();
    `,
    `
declare const arr: (object | undefined)[];
const item = arr[0]!;
    `,
    `
declare const arr: (object | undefined)[];
const item = arr[0] as object;
    `,
    `
declare const arr: (object | undefined)[];
const item = <object>arr[0];
    `,
    {
      code: `
function foo(item: string) {}
function bar(items: string[]) {
  for (let i = 0; i < items.length; i++) {
    foo(items[i]!);
  }
}
      `,
      parserOptions: optionsWithOnUncheckedIndexedAccess,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    `
const myString = 'foo';
const templateLiteral = \`\${myString}-somethingElse\` as const;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    `
const myString = 'foo';
const templateLiteral = <const>\`\${myString}-somethingElse\`;
    `,
    {
      code: `
declare const foo: {
  a?: string;
};
const bar = foo.a as string;
      `,
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
    {
      code: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a as string;
      `,
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
    {
      code: `
declare const foo: {
  a: string;
};
const bar = foo.a as string | undefined;
      `,
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
    {
      code: `
declare const foo: {
  a?: string | null | number;
};
const bar = foo.a as string | undefined;
      `,
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
  ],

  invalid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    {
      code: 'const a = `a` as const;',
      output: 'const a = `a`;',
      errors: [{ messageId: 'unnecessaryAssertion', line: 1 }],
    },
    {
      code: "const a = 'a' as const;",
      output: "const a = 'a';",
      errors: [{ messageId: 'unnecessaryAssertion', line: 1 }],
    },
    {
      code: "const a = <const>'a';",
      output: "const a = 'a';",
      errors: [{ messageId: 'unnecessaryAssertion', line: 1 }],
    },
    {
      code: 'const foo = <3>3;',
      output: 'const foo = 3;',
      errors: [{ messageId: 'unnecessaryAssertion', line: 1, column: 13 }],
    },
    {
      code: 'const foo = 3 as 3;',
      output: 'const foo = 3;',
      errors: [{ messageId: 'unnecessaryAssertion', line: 1, column: 13 }],
    },
    {
      code: `
        type Foo = 3;
        const foo = <Foo>3;
      `,
      output: `
        type Foo = 3;
        const foo = 3;
      `,
      errors: [{ messageId: 'unnecessaryAssertion', line: 3, column: 21 }],
    },
    {
      code: `
        type Foo = 3;
        const foo = 3 as Foo;
      `,
      output: `
        type Foo = 3;
        const foo = 3;
      `,
      errors: [{ messageId: 'unnecessaryAssertion', line: 3, column: 21 }],
    },
    {
      code: `
const foo = 3;
const bar = foo!;
      `,
      output: `
const foo = 3;
const bar = foo;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
const foo = (3 + 5) as number;
      `,
      output: `
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
const foo = <number>(3 + 5);
      `,
      output: `
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;
      `,
      output: `
type Foo = number;
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);
      `,
      output: `
type Foo = number;
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 13,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/453
    {
      code: `
let bar: number = 1;
bar! + 1;
      `,
      output: `
let bar: number = 1;
bar + 1;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      // definite declaration operator
      code: `
let bar!: number;
bar! + 1;
      `,
      output: `
let bar!: number;
bar + 1;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
let bar: number | undefined;
bar = 1;
bar! + 1;
      `,
      output: `
let bar: number | undefined;
bar = 1;
bar + 1;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 4,
        },
      ],
    },
    {
      code: `
function foo<T extends string>(bar: T) {
  return bar!;
}
      `,
      output: `
function foo<T extends string>(bar: T) {
  return bar;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
declare const foo: Foo;
const bar = <Foo>foo;
      `,
      output: `
declare const foo: Foo;
const bar = foo;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s!);
      `,
      output: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s);
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 4,
        },
      ],
    },
    {
      code: `
const x: number | null = null;
const y: number | null = x!;
      `,
      output: `
const x: number | null = null;
const y: number | null = x;
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 3,
        },
      ],
    },
    {
      code: `
const x: number | null = null;
class Foo {
  prop: number | null = x!;
}
      `,
      output: `
const x: number | null = null;
class Foo {
  prop: number | null = x;
}
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 4,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/532
    {
      code: `
declare function a(a: string): any;
const b = 'asdf';
class Mx {
  @a(b!)
  private prop = 1;
}
      `,
      output: `
declare function a(a: string): any;
const b = 'asdf';
class Mx {
  @a(b)
  private prop = 1;
}
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 5,
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/982
    {
      code: `
declare namespace JSX {
  interface IntrinsicElements {
    div: { key?: string | number };
  }
}

function Test(props: { id?: string | number }) {
  return <div key={props.id!} />;
}
      `,
      output: `
declare namespace JSX {
  interface IntrinsicElements {
    div: { key?: string | number };
  }
}

function Test(props: { id?: string | number }) {
  return <div key={props.id} />;
}
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 9,
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
let x: number | undefined;
let y: number | undefined;
y = x!;
y! = 0;
      `,
      output: `
let x: number | undefined;
let y: number | undefined;
y = x!;
y = 0;
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
          line: 5,
        },
      ],
    },
    {
      code: `
declare function foo(): number;
const a = foo()!;
      `,
      output: `
declare function foo(): number;
const a = foo();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 11,
          endColumn: 17,
        },
      ],
    },
    {
      code: `
const b = new Date()!;
      `,
      output: `
const b = new Date();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
        },
      ],
    },
    {
      code: `
const b = (1 + 1)!;
      `,
      output: `
const b = (1 + 1);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 11,
          endColumn: 19,
        },
      ],
    },
    {
      code: `
declare function foo(): number;
const a = foo() as number;
      `,
      output: `
declare function foo(): number;
const a = foo();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
          column: 11,
        },
      ],
    },
    {
      code: `
declare function foo(): number;
const a = <number>foo();
      `,
      output: `
declare function foo(): number;
const a = foo();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: `
type RT = { log: () => void };
declare function foo(): RT;
(foo() as RT).log;
      `,
      output: `
type RT = { log: () => void };
declare function foo(): RT;
(foo()).log;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
    },
    {
      code: `
declare const arr: object[];
const item = arr[0]!;
      `,
      output: `
declare const arr: object[];
const item = arr[0];
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
    },
    {
      code: noFormat`
const foo = (  3 + 5  ) as number;
      `,
      output: `
const foo = (  3 + 5  );
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = (  3 + 5  ) /*as*/ as number;
      `,
      output: `
const foo = (  3 + 5  ) /*as*/;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = (  3 + 5
  ) /*as*/ as //as
  (
    number
  );
      `,
      output: `
const foo = (  3 + 5
  ) /*as*/;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = (3 + (5 as number) ) as number;
      `,
      output: `
const foo = (3 + (5 as number) );
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = 3 + 5/*as*/ as number;
      `,
      output: `
const foo = 3 + 5/*as*/;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = 3 + 5/*a*/ /*b*/ as number;
      `,
      output: `
const foo = 3 + 5/*a*/ /*b*/;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = <(number)>(3 + 5);
      `,
      output: `
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = < ( number ) >( 3 + 5 );
      `,
      output: `
const foo = ( 3 + 5 );
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = <number> /* a */ (3 + 5);
      `,
      output: `
const foo =  /* a */ (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    {
      code: noFormat`
const foo = <number /* a */>(3 + 5);
      `,
      output: `
const foo = (3 + 5);
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 2,
          column: 13,
        },
      ],
    },
    // onUncheckedIndexedAccess = false
    {
      code: `
function foo(item: string) {}
function bar(items: string[]) {
  for (let i = 0; i < items.length; i++) {
    foo(items[i]!);
  }
}
      `,
      output: `
function foo(item: string) {}
function bar(items: string[]) {
  for (let i = 0; i < items.length; i++) {
    foo(items[i]);
  }
}
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 5,
          column: 9,
        },
      ],
    },
    // exactOptionalPropertyTypes = true
    {
      code: `
declare const foo: {
  a?: string;
};
const bar = foo.a as string | undefined;
      `,
      output: `
declare const foo: {
  a?: string;
};
const bar = foo.a;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 5,
          column: 13,
        },
      ],
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
    {
      code: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a as string | undefined;
      `,
      output: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 5,
          column: 13,
        },
      ],
      parserOptions: optionsWithExactOptionalPropertyTypes,
    },
  ],
});
