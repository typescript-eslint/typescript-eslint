import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/dot-notation';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

/**
 * Quote a string in "double quotes" because it’s painful
 * with a double-quoted string literal
 */
function q(str: string): string {
  return `"${str}"`;
}

ruleTester.run('dot-notation', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    //  baseRule
    'a.b;',
    'a.b.c;',
    "a['12'];",
    'a[b];',
    'a[0];',
    { code: 'a.b.c;', options: [{ allowKeywords: false }] },
    { code: 'a.arguments;', options: [{ allowKeywords: false }] },
    { code: 'a.let;', options: [{ allowKeywords: false }] },
    { code: 'a.yield;', options: [{ allowKeywords: false }] },
    { code: 'a.eval;', options: [{ allowKeywords: false }] },
    { code: 'a[0];', options: [{ allowKeywords: false }] },
    { code: "a['while'];", options: [{ allowKeywords: false }] },
    { code: "a['true'];", options: [{ allowKeywords: false }] },
    { code: "a['null'];", options: [{ allowKeywords: false }] },
    { code: 'a[true];', options: [{ allowKeywords: false }] },
    { code: 'a[null];', options: [{ allowKeywords: false }] },
    { code: 'a.true;', options: [{ allowKeywords: true }] },
    { code: 'a.null;', options: [{ allowKeywords: true }] },
    {
      code: "a['snake_case'];",
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
    },
    {
      code: "a['lots_of_snake_case'];",
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
    },
    {
      code: 'a[`time${range}`];',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'a[`while`];',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ allowKeywords: false }],
    },
    {
      code: 'a[`time range`];',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    'a.true;',
    'a.null;',
    'a[undefined];',
    'a[void 0];',
    'a[b()];',
    {
      code: 'a[/(?<zero>0)/];',
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    {
      code: `
class X {
  private priv_prop = 123;
}

const x = new X();
x['priv_prop'] = 123;
      `,
      options: [{ allowPrivateClassPropertyAccess: true }],
    },

    {
      code: `
class X {
  protected protected_prop = 123;
}

const x = new X();
x['protected_prop'] = 123;
      `,
      options: [{ allowProtectedClassPropertyAccess: true }],
    },
    {
      code: `
class X {
  prop: string;
  [key: string]: number;
}

const x = new X();
x['hello'] = 3;
      `,
      options: [{ allowIndexSignaturePropertyAccess: true }],
    },
    {
      code: `
interface Nested {
  property: string;
  [key: string]: number | string;
}

class Dingus {
  nested: Nested;
}

let dingus: Dingus | undefined;

dingus?.nested.property;
dingus?.nested['hello'];
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ allowIndexSignaturePropertyAccess: true }],
    },
    {
      code: `
class X {
  private priv_prop = 123;
}

let x: X | undefined;
console.log(x?.['priv_prop']);
      `,
      options: [{ allowPrivateClassPropertyAccess: true }],
    },
    {
      code: `
class X {
  protected priv_prop = 123;
}

let x: X | undefined;
console.log(x?.['priv_prop']);
      `,
      options: [{ allowProtectedClassPropertyAccess: true }],
    },
    {
      code: `
type Foo = {
  bar: boolean;
  [key: \`key_\${string}\`]: number;
};
declare const foo: Foo;
foo['key_baz'];
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noPropertyAccessFromIndexSignature.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type Key = Lowercase<string>;
type Foo = {
  BAR: boolean;
  [key: Lowercase<string>]: number;
};
declare const foo: Foo;
foo['bar'];
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noPropertyAccessFromIndexSignature.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
type ExtraKey = \`extra\${string}\`;

type Foo = {
  foo: string;
  [extraKey: ExtraKey]: number;
};

function f<T extends Foo>(x: T) {
  x['extraKey'];
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noPropertyAccessFromIndexSignature.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
  ],
  invalid: [
    {
      code: `
class X {
  private priv_prop = 123;
}

const x = new X();
x['priv_prop'] = 123;
      `,
      errors: [
        {
          column: 3,
          data: { key: '"priv_prop"' },
          endColumn: 14,
          endLine: 7,
          line: 7,
          messageId: 'useDot',
        },
      ],
      options: [{ allowPrivateClassPropertyAccess: false }],
      output: `
class X {
  private priv_prop = 123;
}

const x = new X();
x.priv_prop = 123;
      `,
    },
    {
      code: `
class X {
  public pub_prop = 123;
}

const x = new X();
x['pub_prop'] = 123;
      `,
      errors: [
        {
          column: 3,
          data: { key: '"pub_prop"' },
          endColumn: 13,
          endLine: 7,
          line: 7,
          messageId: 'useDot',
        },
      ],
      output: `
class X {
  public pub_prop = 123;
}

const x = new X();
x.pub_prop = 123;
      `,
    },
    //  baseRule

    // {
    //     code: 'a.true;',
    //     output: "a['true'];",
    //     options: [{ allowKeywords: false }],
    //     errors: [{ messageId: "useBrackets", data: { key: "true" } }],
    // },
    {
      code: "a['true'];",
      errors: [
        {
          column: 3,
          data: { key: q('true') },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.true;',
    },
    {
      code: "a['time'];",
      errors: [
        {
          column: 3,
          data: { key: '"time"' },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      output: 'a.time;',
    },
    {
      code: 'a[null];',
      errors: [
        {
          column: 3,
          data: { key: 'null' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.null;',
    },
    {
      code: 'a[true];',
      errors: [
        {
          column: 3,
          data: { key: 'true' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.true;',
    },
    {
      code: 'a[false];',
      errors: [
        {
          column: 3,
          data: { key: 'false' },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.false;',
    },
    {
      code: "a['b'];",
      errors: [
        {
          column: 3,
          data: { key: q('b') },
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.b;',
    },
    {
      code: "a.b['c'];",
      errors: [
        {
          column: 5,
          data: { key: q('c') },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'a.b.c;',
    },
    {
      code: "a['_dangle'];",
      errors: [
        {
          column: 3,
          data: { key: q('_dangle') },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      output: 'a._dangle;',
    },
    {
      code: "a['SHOUT_CASE'];",
      errors: [
        {
          column: 3,
          data: { key: q('SHOUT_CASE') },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      output: 'a.SHOUT_CASE;',
    },
    {
      code: noFormat`
a
  ['SHOUT_CASE'];
      `,
      errors: [
        {
          column: 4,
          data: { key: q('SHOUT_CASE') },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'useDot',
        },
      ],
      output: `
a
  .SHOUT_CASE;
      `,
    },
    {
      code: `
getResource()
  .then(function () {})
  ['catch'](function () {})
  .then(function () {})
  ['catch'](function () {});
      `,
      errors: [
        {
          column: 4,
          data: { key: '"catch"' },
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'useDot',
        },
        {
          column: 4,
          data: { key: '"catch"' },
          endColumn: 11,
          endLine: 6,
          line: 6,
          messageId: 'useDot',
        },
      ],
      output: `
getResource()
  .then(function () {})
  .catch(function () {})
  .then(function () {})
  .catch(function () {});
      `,
    },
    {
      code: noFormat`
foo
  .while;
      `,
      errors: [
        {
          column: 4,
          data: { key: 'while' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'useBrackets',
        },
      ],
      options: [{ allowKeywords: false }],
      output: `
foo
  ["while"];
      `,
    },
    {
      code: "foo[/* comment */ 'bar'];",
      errors: [
        {
          column: 19,
          data: { key: q('bar') },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: null, // Not fixed due to comment
    },
    {
      code: "foo['bar' /* comment */];",
      errors: [
        {
          column: 5,
          data: { key: q('bar') },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: null, // Not fixed due to comment
    },
    {
      code: "foo['bar'];",
      errors: [
        {
          column: 5,
          data: { key: q('bar') },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'foo.bar;',
    },
    {
      code: 'foo./* comment */ while;',
      errors: [
        {
          column: 19,
          data: { key: 'while' },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'useBrackets',
        },
      ],
      options: [{ allowKeywords: false }],
      output: null, // Not fixed due to comment
    },
    {
      code: 'foo[null];',
      errors: [
        {
          column: 5,
          data: { key: 'null' },
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'foo.null;',
    },
    {
      code: "foo['bar'] instanceof baz;",
      errors: [
        {
          column: 5,
          data: { key: q('bar') },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'useDot',
        },
      ],
      output: 'foo.bar instanceof baz;',
    },
    {
      code: 'let.if();',
      errors: [
        {
          column: 5,
          data: { key: 'if' },
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'useBrackets',
        },
      ],
      options: [{ allowKeywords: false }],
      output: null, // `let["if"]()` is a syntax error because `let[` indicates a destructuring variable declaration
    },
    {
      code: `
class X {
  protected protected_prop = 123;
}

const x = new X();
x['protected_prop'] = 123;
      `,
      errors: [
        {
          column: 3,
          data: { key: '"protected_prop"' },
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'useDot',
        },
      ],
      options: [{ allowProtectedClassPropertyAccess: false }],
      output: `
class X {
  protected protected_prop = 123;
}

const x = new X();
x.protected_prop = 123;
      `,
    },
    {
      code: `
class X {
  prop: string;
  [key: string]: number;
}

const x = new X();
x['prop'] = 'hello';
      `,
      errors: [
        {
          column: 3,
          data: { key: '"prop"' },
          endColumn: 9,
          endLine: 8,
          line: 8,
          messageId: 'useDot',
        },
      ],
      options: [{ allowIndexSignaturePropertyAccess: true }],
      output: `
class X {
  prop: string;
  [key: string]: number;
}

const x = new X();
x.prop = 'hello';
      `,
    },
    {
      code: `
type Foo = {
  bar: boolean;
  [key: \`key_\${string}\`]: number;
};
foo['key_baz'];
      `,
      errors: [
        {
          column: 5,
          data: { key: '"key_baz"' },
          endColumn: 14,
          endLine: 6,
          line: 6,
          messageId: 'useDot',
        },
      ],
      output: `
type Foo = {
  bar: boolean;
  [key: \`key_\${string}\`]: number;
};
foo.key_baz;
      `,
    },
    {
      code: `
type ExtraKey = \`extra\${string}\`;

type Foo = {
  foo: string;
  [extraKey: ExtraKey]: number;
};

function f<T extends Foo>(x: T) {
  x['extraKey'];
}
      `,
      errors: [
        {
          column: 5,
          data: { key: '"extraKey"' },
          endColumn: 15,
          endLine: 10,
          line: 10,
          messageId: 'useDot',
        },
      ],
      output: `
type ExtraKey = \`extra\${string}\`;

type Foo = {
  foo: string;
  [extraKey: ExtraKey]: number;
};

function f<T extends Foo>(x: T) {
  x.extraKey;
}
      `,
    },
  ],
});
