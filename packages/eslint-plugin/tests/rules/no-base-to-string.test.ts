import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-base-to-string';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

const literalListBasic: string[] = [
  "''",
  "'text'",
  'true',
  'false',
  '1',
  '1n',
  '[]',
  '/regex/',
];

const literalListNeedParen: string[] = [
  "__dirname === 'foobar'",
  '{}.constructor()',
  '() => {}',
  'function() {}',
];

const literalList = [...literalListBasic, ...literalListNeedParen];

const literalListWrapped = [
  ...literalListBasic,
  ...literalListNeedParen.map(i => `(${i})`),
];

ruleTester.run('no-base-to-string', rule, {
  valid: [
    // template
    ...literalList.map(i => `\`\${${i}}\`;`),

    // operator + +=
    ...literalListWrapped.flatMap(l =>
      literalListWrapped.map(r => `${l} + ${r};`),
    ),

    // toString()
    ...literalListWrapped.map(i => `${i === '1' ? `(${i})` : i}.toString();`),

    // variable toString() and template
    ...literalList.map(
      i => `
        let value = ${i};
        value.toString();
        let text = \`\${value}\`;
      `,
    ),

    // String()
    ...literalList.map(i => `String(${i});`),
    `
function someFunction() {}
someFunction.toString();
let text = \`\${someFunction}\`;
    `,
    `
function someFunction() {}
someFunction.toLocaleString();
let text = \`\${someFunction}\`;
    `,
    'unknownObject.toString();',
    'unknownObject.toLocaleString();',
    'unknownObject.someOtherMethod();',
    `
class CustomToString {
  toString() {
    return 'Hello, world!';
  }
}
'' + new CustomToString();
    `,
    `
const literalWithToString = {
  toString: () => 'Hello, world!',
};
'' + literalWithToString;
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toString();
};
printer('');
printer(1);
printer(true);
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toLocaleString();
};
printer('');
printer(1);
printer(true);
    `,
    'let _ = {} * {};',
    'let _ = {} / {};',
    'let _ = ({} *= {});',
    'let _ = ({} /= {});',
    'let _ = ({} = {});',
    'let _ = {} == {};',
    'let _ = {} === {};',
    'let _ = {} in {};',
    'let _ = {} & {};',
    'let _ = {} ^ {};',
    'let _ = {} << {};',
    'let _ = {} >> {};',
    `
function tag() {}
tag\`\${{}}\`;
    `,
    `
      function tag() {}
      tag\`\${{}}\`;
    `,
    `
      interface Brand {}
      function test(v: string & Brand): string {
        return \`\${v}\`;
      }
    `,
    "'' += new Error();",
    "'' += new URL();",
    "'' += new URLSearchParams();",
    `
Number(1);
    `,
    {
      code: 'String(/regex/);',
      options: [{ ignoredTypeNames: ['RegExp'] }],
    },
    {
      code: `
type Foo = { a: string } | { b: string };
declare const foo: Foo;
String(foo);
      `,
      options: [{ ignoredTypeNames: ['Foo'] }],
    },
    `
function String(value) {
  return value;
}
declare const myValue: object;
String(myValue);
    `,
    `
import { String } from 'foo';
String({});
    `,
    `
['foo', 'bar'].join('');
    `,

    `
([{ foo: 'foo' }, 'bar'] as string[]).join('');
    `,
    `
function foo<T extends string>(array: T[]) {
  return array.join();
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
[new Foo()].join();
    `,
    `
class Foo {
  join() {}
}
const foo = new Foo();
foo.join();
    `,
    `
declare const array: string[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
array.join('');
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
tuple.join('');
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
tuple.join('');
    `,

    `
String(['foo', 'bar']);
    `,

    `
String([{ foo: 'foo' }, 'bar'] as string[]);
    `,
    `
function foo<T extends string>(array: T[]) {
  return String(array);
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
String([new Foo()]);
    `,
    `
declare const array: string[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
String(array);
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
String(tuple);
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
String(tuple);
    `,

    `
['foo', 'bar'].toString();
    `,

    `
([{ foo: 'foo' }, 'bar'] as string[]).toString();
    `,
    `
function foo<T extends string>(array: T[]) {
  return array.toString();
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
[new Foo()].toString();
    `,
    `
declare const array: string[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
array.toString();
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
tuple.toString();
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
tuple.toString();
    `,

    `
\`\${['foo', 'bar']}\`;
    `,

    `
\`\${[{ foo: 'foo' }, 'bar'] as string[]}\`;
    `,
    `
function foo<T extends string>(array: T[]) {
  return \`\${array}\`;
}
    `,
    `
class Foo {
  toString() {
    return '';
  }
}
\`\${[new Foo()]}\`;
    `,
    `
declare const array: string[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
declare const array: (string & Foo)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] | (string & Bar)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const array: (string & Foo)[] & (string & Bar)[];
\`\${array}\`;
    `,
    `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const tuple: [string & Foo, string & Bar];
\`\${tuple}\`;
    `,
    `
class Foo {
  foo: string;
}
declare const tuple: [string] & [Foo];
\`\${tuple}\`;
    `,

    // don't bother trying to interpret spread args.
    `
let objects = [{}, {}];
String(...objects);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8585
    `
type Constructable<Entity> = abstract new (...args: any[]) => Entity;

interface GuildChannel {
  toString(): \`<#\${string}>\`;
}

declare const foo: Constructable<GuildChannel & { bar: 1 }>;
class ExtendedGuildChannel extends foo {}
declare const bb: ExtendedGuildChannel;
bb.toString();
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8585 with intersection order reversed.
    `
type Constructable<Entity> = abstract new (...args: any[]) => Entity;

interface GuildChannel {
  toString(): \`<#\${string}>\`;
}

declare const foo: Constructable<{ bar: 1 } & GuildChannel>;
class ExtendedGuildChannel extends foo {}
declare const bb: ExtendedGuildChannel;
bb.toString();
    `,
    `
type Value = string | Value[];
declare const v: Value;

String(v);
    `,
    `
type Value = (string | Value)[];
declare const v: Value;

String(v);
    `,
    `
type Value = Value[];
declare const v: Value;

String(v);
    `,
    `
type Value = [Value];
declare const v: Value;

String(v);
    `,
    `
declare const v: ('foo' | 'bar')[][];
String(v);
    `,
    `
declare const x: unknown;
\`\${x})\`;
    `,
    `
declare const x: unknown;
x.toString();
    `,
    `
declare const x: unknown;
x.toLocaleString();
    `,
    `
declare const x: unknown;
'' + x;
    `,
    `
declare const x: unknown;
String(x);
    `,
    `
declare const x: unknown;
'' += x;
    `,
    `
function foo<T>(x: T) {
  String(x);
}
    `,
    `
declare const x: any;
\`\${x})\`;
    `,
    `
declare const x: any;
x.toString();
    `,
    `
declare const x: any;
x.toLocaleString();
    `,
    `
declare const x: any;
'' + x;
    `,
    `
declare const x: any;
String(x);
    `,
    `
declare const x: any;
'' += x;
    `,
  ],
  invalid: [
    {
      code: `
declare const x: unknown;
\`\${x})\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
declare const x: unknown;
x.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
declare const x: unknown;
x.toLocaleString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
declare const x: unknown;
'' + x;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
declare const x: unknown;
String(x);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
declare const x: unknown;
'' += x;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: `
function foo<T>(x: T) {
  String(x);
}
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'x',
          },
          messageId: 'baseToString',
        },
      ],
      options: [
        {
          checkUnknown: true,
        },
      ],
    },
    {
      code: '`${{}})`;',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toString();',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toLocaleString();',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' + {};",
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: 'String({});',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' += {};",
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString.toLocaleString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString + '';
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject.toLocaleString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject + '';
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        interface A {}
        interface B {}
        function test(intersection: A & B): string {
          return \`\${intersection}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'intersection',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
declare const foo: string | Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'foo',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const foo: Bar | Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'foo',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
class Foo {
  foo: string;
}
class Bar {
  bar: string;
}
declare const foo: Bar & Foo;
\`\${foo}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'foo',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        [{}, {}].join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: '[{}, {}]',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        const array = [{}, {}];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class A {
          a: string;
        }
        [new A(), 'str'].join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: "[new A(), 'str']",
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string | Foo)[];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string & Foo) | (string | Foo)[];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        class Bar {
          bar: string;
        }
        declare const array: Foo[] & Bar[];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: string[] | Foo[];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, Foo];
        tuple.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, Foo];
        tuple.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo | string, string];
        tuple.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, string] | [Foo, Foo];
        tuple.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, string] & [Foo, Foo];
        tuple.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        const array = ['string', { foo: 'bar' }];
        array.join('');
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return array.join();
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },

    {
      code: `
        String([{}, {}]);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: '[{}, {}]',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = [{}, {}];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class A {
          a: string;
        }
        String([new A(), 'str']);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: "[new A(), 'str']",
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string | Foo)[];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string & Foo) | (string | Foo)[];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        class Bar {
          bar: string;
        }
        declare const array: Foo[] & Bar[];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: string[] | Foo[];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, Foo];
        String(tuple);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, Foo];
        String(tuple);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo | string, string];
        String(tuple);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, string] | [Foo, Foo];
        String(tuple);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, string] & [Foo, Foo];
        String(tuple);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = ['string', { foo: 'bar' }];
        String(array);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return String(array);
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },

    {
      code: `
        [{}, {}].toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: '[{}, {}]',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = [{}, {}];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class A {
          a: string;
        }
        [new A(), 'str'].toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: "[new A(), 'str']",
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string | Foo)[];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string & Foo) | (string | Foo)[];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        class Bar {
          bar: string;
        }
        declare const array: Foo[] & Bar[];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: string[] | Foo[];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, Foo];
        tuple.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, Foo];
        tuple.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo | string, string];
        tuple.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, string] | [Foo, Foo];
        tuple.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, string] & [Foo, Foo];
        tuple.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = ['string', { foo: 'bar' }];
        array.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return array.toString();
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },

    {
      code: `
        \`\${[{}, {}]}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: '[{}, {}]',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = [{}, {}];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class A {
          a: string;
        }
        \`\${[new A(), 'str']}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: "[new A(), 'str']",
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string | Foo)[];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: (string & Foo) | (string | Foo)[];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        class Bar {
          bar: string;
        }
        declare const array: Foo[] & Bar[];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const array: string[] | Foo[];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, Foo];
        \`\${tuple}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, Foo];
        \`\${tuple}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo | string, string];
        \`\${tuple}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, string] | [Foo, Foo];
        \`\${tuple}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, string] & [Foo, Foo];
        \`\${tuple}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'tuple',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        const array = ['string', { foo: 'bar' }];
        \`\${array}\`;
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return \`\${array}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array',
          },
          messageId: 'baseToString',
        },
      ],
    },

    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          array[0].toString();
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'array[0]',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(value: T) {
          value.toString();
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'value',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Bar = Record<string, string>;
declare const foo: Bar | string;
foo.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'foo',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return array;
        }
        foo([{ foo: 'foo' }]).join();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: "foo([{ foo: 'foo' }])",
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        type Bar = Record<string, string>;
        function foo<T extends string | Bar>(array: T[]) {
          return array;
        }
        foo([{ foo: 'foo' }, 'bar']).join();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: "foo([{ foo: 'foo' }, 'bar'])",
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
type Value = { foo: string } | Value[];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'v',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Value = ({ foo: string } | Value)[];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'v',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
type Value = [{ foo: string }, Value];
declare const v: Value;

String(v);
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'v',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
declare const v: { foo: string }[][];
v.join();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'v',
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
  ],
});
