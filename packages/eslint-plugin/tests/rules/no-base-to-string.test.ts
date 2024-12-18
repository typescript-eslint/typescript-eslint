import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type { MessageIds, Options } from '../../src/rules/no-base-to-string';

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

const validArrayOrTupleCases = (
  wrap: (arr: string) => string,
): (string | ValidTestCase<Options>)[] => [
  `${wrap("['foo', 'bar']")};`,
  `${wrap("([{ a: 'a' }, 'bar'] as string[])")};`,
  `
  function foo<T extends string>(array: T[]) {
    return ${wrap('array')};
  }
  `,
  `
  declare const array: string[];
  ${wrap('array')};
  `,
  `
  class Foo {
    foo: string;
  }
  declare const array: (string & Foo)[];
  ${wrap('array')};
  `,
  `
  class Foo {
    foo: string;
  }
  class Bar {
    bar: string;
  }
  declare const array: (string & Foo)[] | (string & Bar)[];
  ${wrap('array')};
  `,
  `
  class Foo {
    foo: string;
  }
  class Bar {
    bar: string;
  }
  declare const array: (string & Foo)[] & (string & Bar)[];
  ${wrap('array')};
  `,
  `
  class Foo {
    foo: string;
  }
  class Bar {
    bar: string;
  }
  declare const tuple: [string & Foo, string & Bar];
  ${wrap('tuple')};
  `,
  `
  class Foo {
    foo: string;
  }
  declare const tuple: [string] & [Foo];
  ${wrap('tuple')};
  `,
];

const invalidArrayOrTupleCases = (
  messageId: MessageIds,
  wrap: (arr: string) => string,
): InvalidTestCase<MessageIds, Options>[] => [
  {
    code: wrap('[{}, {}]'),
    errors: [
      {
        data: {
          certainty: 'will',
          name: '[{}, {}]',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        const array = [{}, {}];
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'will',
          name: 'array',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class A {
          a: string;
        }
        ${wrap("[new A(), 'str']")};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: "[new A(), 'str']",
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const array: (string | Foo)[];
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'array',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const array: (string & Foo) | (string | Foo)[];
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'array',
        },
        messageId,
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
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'will',
          name: 'array',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const array: string[] | Foo[];
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'array',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, Foo];
        ${wrap('tuple')};
      `,
    errors: [
      {
        data: {
          certainty: 'will',
          name: 'tuple',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, Foo];
        ${wrap('tuple')};
      `,
    errors: [
      {
        data: {
          certainty: 'will',
          name: 'tuple',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo | string, string];
        ${wrap('tuple')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'tuple',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [string, string] | [Foo, Foo];
        ${wrap('tuple')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'tuple',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        class Foo {
          foo: string;
        }
        declare const tuple: [Foo, string] & [Foo, Foo];
        ${wrap('tuple')};
      `,
    errors: [
      {
        data: {
          certainty: 'will',
          name: 'tuple',
        },
        messageId,
      },
    ],
  },
  {
    code: `
        const array = ['string', { foo: 'bar' }];
        ${wrap('array')};
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'array',
        },
        messageId,
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
          return ${wrap('array')};
        }
      `,
    errors: [
      {
        data: {
          certainty: 'may',
          name: 'array',
        },
        messageId,
      },
    ],
  },
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
    {
      code: `
type Foo = { a: string }[];
declare const foo: Foo;
String(foo);
      `,
      options: [{ ignoredTypeNames: ['Foo'] }],
    },
    {
      code: `
type Foo = { a: string }[];
declare const foo: Foo;
\`\${foo}\`;
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
    ...validArrayOrTupleCases(arr => `${arr}.join('')`),
    ...validArrayOrTupleCases(arr => `String(${arr})`),
    ...validArrayOrTupleCases(arr => `${arr}.toString()`),
    ...validArrayOrTupleCases(arr => `\`\${${arr}}\``),
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
class Foo {
  toString() {
    return '';
  }
}
new Foo().toString();
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
    ...invalidArrayOrTupleCases('baseArrayJoin', arr => `${arr}.join('')`),
    ...invalidArrayOrTupleCases('baseToString', arr => `String(${arr})`),
    ...invalidArrayOrTupleCases('baseToString', arr => `${arr}.toString()`),
    ...invalidArrayOrTupleCases('baseToString', arr => `\`\${${arr}}\``),

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
