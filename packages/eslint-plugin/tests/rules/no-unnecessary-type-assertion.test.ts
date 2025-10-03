import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-assertion';
import { getFixturesRootDir, createRuleTesterWithTypes } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = createRuleTesterWithTypes({
  project: './tsconfig.json',
});

const optionsWithOnUncheckedIndexedAccess = {
  project: './tsconfig.noUncheckedIndexedAccess.json',
  tsconfigRootDir: rootDir,
};

const optionsWithExactOptionalPropertyTypes = {
  project: './tsconfig.exactOptionalPropertyTypes.json',
  tsconfigRootDir: rootDir,
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
    `
declare function foo(arg?: number): number | void;
const bar: number = foo()!;
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
    `
class T {
  a = 'a' as const;
}
    `,
    `
class T {
  a = 3 as 3;
}
    `,
    `
const foo = 'foo';

class T {
  readonly test = \`\${foo}\` as const;
}
    `,
    `
class T {
  readonly a = { foo: 'foo' } as const;
}
    `,
    `
      declare const y: number | null;
      console.log(y!);
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
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
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
      languageOptions: { parserOptions: optionsWithOnUncheckedIndexedAccess },
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    `
declare const myString: 'foo';
const templateLiteral = \`\${myString}-somethingElse\` as const;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    `
declare const myString: 'foo';
const templateLiteral = <const>\`\${myString}-somethingElse\`;
    `,
    `
const myString = 'foo';
const templateLiteral = \`\${myString}-somethingElse\` as const;
    `,
    'let a = `a` as const;',
    {
      code: `
declare const foo: {
  a?: string;
};
const bar = foo.a as string;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a as string;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: {
  a: string;
};
const bar = foo.a as string | undefined;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: {
  a?: string | null | number;
};
const bar = foo.a as string | undefined;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: {
  a?: string | number;
};
const bar = foo.a as string | undefined | bigint;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
if (Math.random()) {
  {
    var x = 1;
  }
}
x!;
      `,
    },
    {
      code: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a as T.Value2;
      `,
    },
    {
      code: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a as T;
      `,
    },
    {
      code: `
enum T {
  Value1 = 0,
  Value2 = 1,
}

const b = 1 as T.Value2;
      `,
    },
    `
const foo: unknown = {};
const baz: {} = foo!;
    `,
    `
const foo: unknown = {};
const bar: object = foo!;
    `,
    `
declare function foo<T extends unknown>(bar: T): T;
const baz: unknown = {};
foo(baz!);
    `,
    {
      code: 'const a = `a` as const;',
    },
    {
      code: "const a = 'a' as const;",
    },
    {
      code: "const a = <const>'a';",
    },
    {
      code: `
class T {
  readonly a = 'a' as const;
}
      `,
    },
    {
      code: `
enum T {
  Value1,
  Value2,
}
declare const a: T.Value1;
const b = a as const;
      `,
    },
  ],

  invalid: [
    {
      code: 'const foo = <3>3;',
      errors: [{ column: 13, line: 1, messageId: 'unnecessaryAssertion' }],
      output: 'const foo = 3;',
    },
    {
      code: 'const foo = 3 as 3;',
      errors: [{ column: 13, line: 1, messageId: 'unnecessaryAssertion' }],
      output: 'const foo = 3;',
    },
    {
      code: `
        type Foo = 3;
        const foo = <Foo>3;
      `,
      errors: [{ column: 21, line: 3, messageId: 'unnecessaryAssertion' }],
      output: `
        type Foo = 3;
        const foo = 3;
      `,
    },
    {
      code: `
        type Foo = 3;
        const foo = 3 as Foo;
      `,
      errors: [{ column: 21, line: 3, messageId: 'unnecessaryAssertion' }],
      output: `
        type Foo = 3;
        const foo = 3;
      `,
    },
    {
      code: `
const foo = 3;
const bar = foo!;
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = 3;
const bar = foo;
      `,
    },
    {
      code: `
const foo = (3 + 5) as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (3 + 5);
      `,
    },
    {
      code: `
const foo = <number>(3 + 5);
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (3 + 5);
      `,
    },
    {
      code: `
type Foo = number;
const foo = (3 + 5) as Foo;
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
type Foo = number;
const foo = (3 + 5);
      `,
    },
    {
      code: `
type Foo = number;
const foo = <Foo>(3 + 5);
      `,
      errors: [
        {
          column: 13,
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
type Foo = number;
const foo = (3 + 5);
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/453
    {
      code: `
let bar: number = 1;
bar! + 1;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
let bar: number = 1;
bar + 1;
      `,
    },
    {
      // definite declaration operator
      code: `
let bar!: number;
bar! + 1;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
let bar!: number;
bar + 1;
      `,
    },
    {
      code: `
let bar: number | undefined;
bar = 1;
bar! + 1;
      `,
      errors: [
        {
          line: 4,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
let bar: number | undefined;
bar = 1;
bar + 1;
      `,
    },
    {
      code: `
        declare const y: number;
        console.log(y!);
      `,
      errors: [{ messageId: 'unnecessaryAssertion' }],
      output: `
        declare const y: number;
        console.log(y);
      `,
    },
    {
      code: 'Proxy!;',
      errors: [{ messageId: 'unnecessaryAssertion' }],
      output: 'Proxy;',
    },
    {
      code: `
function foo<T extends string>(bar: T) {
  return bar!;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
function foo<T extends string>(bar: T) {
  return bar;
}
      `,
    },
    {
      code: `
declare const foo: Foo;
const bar = <Foo>foo;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare const foo: Foo;
const bar = foo;
      `,
    },
    {
      code: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s!);
      `,
      errors: [
        {
          line: 4,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
declare function nonNull(s: string | null);
let s: string | null = null;
nonNull(s);
      `,
    },
    {
      code: `
const x: number | null = null;
const y: number | null = x!;
      `,
      errors: [
        {
          line: 3,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
const x: number | null = null;
const y: number | null = x;
      `,
    },
    {
      code: `
const x: number | null = null;
class Foo {
  prop: number | null = x!;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
const x: number | null = null;
class Foo {
  prop: number | null = x;
}
      `,
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
      errors: [
        {
          line: 5,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare function a(a: string): any;
const b = 'asdf';
class Mx {
  @a(b)
  private prop = 1;
}
      `,
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
      errors: [
        {
          line: 9,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
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
    },
    {
      code: `
let x: number | undefined;
let y: number | undefined;
y = x!;
y! = 0;
      `,
      errors: [
        {
          line: 5,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
let x: number | undefined;
let y: number | undefined;
y = x!;
y = 0;
      `,
    },
    {
      code: `
declare function foo(arg?: number): number | void;
const bar: number | void = foo()!;
      `,
      errors: [
        {
          column: 28,
          endColumn: 34,
          line: 3,
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
declare function foo(arg?: number): number | void;
const bar: number | void = foo();
      `,
    },
    {
      code: `
declare function foo(): number;
const a = foo()!;
      `,
      errors: [
        {
          column: 11,
          endColumn: 17,
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare function foo(): number;
const a = foo();
      `,
    },
    {
      code: `
const b = new Date()!;
      `,
      errors: [
        {
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const b = new Date();
      `,
    },
    {
      code: `
const b = (1 + 1)!;
      `,
      errors: [
        {
          column: 11,
          endColumn: 19,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const b = (1 + 1);
      `,
    },
    {
      code: `
declare function foo(): number;
const a = foo() as number;
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare function foo(): number;
const a = foo();
      `,
    },
    {
      code: `
declare function foo(): number;
const a = <number>foo();
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare function foo(): number;
const a = foo();
      `,
    },
    {
      code: `
type RT = { log: () => void };
declare function foo(): RT;
(foo() as RT).log;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
type RT = { log: () => void };
declare function foo(): RT;
(foo()).log;
      `,
    },
    {
      code: `
declare const arr: object[];
const item = arr[0]!;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
declare const arr: object[];
const item = arr[0];
      `,
    },
    {
      code: noFormat`
const foo = (  3 + 5  ) as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (  3 + 5  );
      `,
    },
    {
      code: noFormat`
const foo = (  3 + 5  ) /*as*/ as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (  3 + 5  ) /*as*/;
      `,
    },
    {
      code: noFormat`
const foo = (  3 + 5
  ) /*as*/ as //as
  (
    number
  );
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (  3 + 5
  ) /*as*/;
      `,
    },
    {
      code: noFormat`
const foo = (3 + (5 as number) ) as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (3 + (5 as number) );
      `,
    },
    {
      code: noFormat`
const foo = 3 + 5/*as*/ as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = 3 + 5/*as*/;
      `,
    },
    {
      code: noFormat`
const foo = 3 + 5/*a*/ /*b*/ as number;
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = 3 + 5/*a*/ /*b*/;
      `,
    },
    {
      code: noFormat`
const foo = <(number)>(3 + 5);
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (3 + 5);
      `,
    },
    {
      code: noFormat`
const foo = < ( number ) >( 3 + 5 );
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = ( 3 + 5 );
      `,
    },
    {
      code: noFormat`
const foo = <number> /* a */ (3 + 5);
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo =  /* a */ (3 + 5);
      `,
    },
    {
      code: `
const foo = <number /* a */>(3 + 5);
      `,
      errors: [
        {
          column: 13,
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
const foo = (3 + 5);
      `,
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
      errors: [
        {
          column: 9,
          line: 5,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
function foo(item: string) {}
function bar(items: string[]) {
  for (let i = 0; i < items.length; i++) {
    foo(items[i]);
  }
}
      `,
    },
    // exactOptionalPropertyTypes = true
    {
      code: `
declare const foo: {
  a?: string;
};
const bar = foo.a as string | undefined;
      `,
      errors: [
        {
          column: 13,
          line: 5,
          messageId: 'unnecessaryAssertion',
        },
      ],
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
      output: `
declare const foo: {
  a?: string;
};
const bar = foo.a;
      `,
    },
    {
      code: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a as string | undefined;
      `,
      errors: [
        {
          column: 13,
          line: 5,
          messageId: 'unnecessaryAssertion',
        },
      ],
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
      output: `
declare const foo: {
  a?: string | undefined;
};
const bar = foo.a;
      `,
    },
    {
      code: `
varDeclarationFromFixture!;
      `,
      errors: [
        {
          line: 2,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
varDeclarationFromFixture;
      `,
    },
    {
      code: `
var x = 1;
x!;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
var x = 1;
x;
      `,
    },
    {
      code: `
var x = 1;
{
  x!;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
var x = 1;
{
  x;
}
      `,
    },
    {
      code: `
class T {
  readonly a = 3 as 3;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
class T {
  readonly a = 3;
}
      `,
    },
    {
      code: `
type S = 10;

class T {
  readonly a = 10 as S;
}
      `,
      errors: [
        {
          line: 5,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
type S = 10;

class T {
  readonly a = 10;
}
      `,
    },
    {
      code: `
class T {
  readonly a = (3 + 5) as number;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
class T {
  readonly a = (3 + 5);
}
      `,
    },
    {
      code: `
const a = '';
const b: string | undefined = (a ? undefined : a)!;
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
const a = '';
const b: string | undefined = (a ? undefined : a);
      `,
    },
    {
      code: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a as T.Value1;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
      output: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a;
      `,
    },
    {
      code: `
const foo: unknown = {};
const bar: unknown = foo!;
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
const foo: unknown = {};
const bar: unknown = foo;
      `,
    },
    {
      code: `
function foo(bar: unknown) {}
const baz: unknown = {};
foo(baz!);
      `,
      errors: [
        {
          messageId: 'contextuallyUnnecessary',
        },
      ],
      output: `
function foo(bar: unknown) {}
const baz: unknown = {};
foo(baz);
      `,
    },
    {
      code: 'const a = true as const;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = true;',
    },
    {
      code: 'const a = <const>true;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = true;',
    },
    {
      code: 'const a = 1 as const;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = 1;',
    },
    {
      code: 'const a = <const>1;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = 1;',
    },
    {
      code: 'const a = 1n as const;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = 1n;',
    },
    {
      code: 'const a = <const>1n;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = 1n;',
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/8737
    {
      code: 'const a = `a` as const;',
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: 'const a = `a`;',
    },
    {
      code: "const a = 'a' as const;",
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: "const a = 'a';",
    },
    {
      code: "const a = <const>'a';",
      errors: [{ line: 1, messageId: 'unnecessaryAssertion' }],
      options: [{ checkLiteralConstAssertions: true }],
      output: "const a = 'a';",
    },
    {
      code: `
class T {
  readonly a = 'a' as const;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryAssertion',
        },
      ],
      options: [{ checkLiteralConstAssertions: true }],
      output: `
class T {
  readonly a = 'a';
}
      `,
    },
    {
      code: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a as const;
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
        },
      ],
      options: [{ checkLiteralConstAssertions: true }],
      output: `
enum T {
  Value1,
  Value2,
}

declare const a: T.Value1;
const b = a;
      `,
    },
  ],
});
