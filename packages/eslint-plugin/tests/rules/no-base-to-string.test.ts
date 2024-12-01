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
([{}, 'bar'] as string[]).join('');
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
class Foo {}
declare const array: (string & Foo)[];
array.join('');
    `,
    `
class Foo {}
class Bar {}
declare const array: (string & Foo)[] | (string & Bar)[];
array.join('');
    `,
    `
class Foo {}
class Bar {}
declare const array: (string & Foo)[] & (string & Bar)[];
array.join('');
    `,
    `
class Foo {}
class Bar {}
declare const tuple: [string & Foo, string & Bar];
tuple.join('');
    `,
    `
class Foo {}
declare const tuple: [string] & [Foo];
tuple.join('');
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
function foo<T>(x: T) {
  String(x);
}
    `,
    `
declare const u: unknown;
String(u);
    `,
  ],
  invalid: [
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
class Foo {}
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
class Foo {}
class Bar {}
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
class Foo {}
class Bar {}
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
        class A {}
        [new A(), 'str'].join('');
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: "[new A(), 'str']",
          },
          messageId: 'baseArrayJoin',
        },
      ],
    },
    {
      code: `
        class Foo {}
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
        class Foo {}
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
        class Foo {}
        class Bar {}
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
        class Foo {}
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
        class Foo {}
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
        class Foo {}
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
        class Foo {}
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
        class Foo {}
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
        class Foo {}
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
  ],
});
