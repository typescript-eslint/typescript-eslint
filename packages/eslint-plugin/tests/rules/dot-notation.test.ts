import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/dot-notation';
import { getTypedRuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = getTypedRuleTester();

/**
 * Quote a string in "double quotes" because it’s painful
 * with a double-quoted string literal
 */
function q(str: string): string {
  return `"${str}"`;
}

ruleTester.run('dot-notation', rule, {
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
      errors: [{ messageId: 'useDot' }],
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
      errors: [{ messageId: 'useDot' }],
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
      errors: [{ data: { key: q('true') }, messageId: 'useDot' }],
      output: 'a.true;',
    },
    {
      code: "a['time'];",
      errors: [{ data: { key: '"time"' }, messageId: 'useDot' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      output: 'a.time;',
    },
    {
      code: 'a[null];',
      errors: [{ data: { key: 'null' }, messageId: 'useDot' }],
      output: 'a.null;',
    },
    {
      code: 'a[true];',
      errors: [{ data: { key: 'true' }, messageId: 'useDot' }],
      output: 'a.true;',
    },
    {
      code: 'a[false];',
      errors: [{ data: { key: 'false' }, messageId: 'useDot' }],
      output: 'a.false;',
    },
    {
      code: "a['b'];",
      errors: [{ data: { key: q('b') }, messageId: 'useDot' }],
      output: 'a.b;',
    },
    {
      code: "a.b['c'];",
      errors: [{ data: { key: q('c') }, messageId: 'useDot' }],
      output: 'a.b.c;',
    },
    {
      code: "a['_dangle'];",
      errors: [{ data: { key: q('_dangle') }, messageId: 'useDot' }],
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      output: 'a._dangle;',
    },
    {
      code: "a['SHOUT_CASE'];",
      errors: [{ data: { key: q('SHOUT_CASE') }, messageId: 'useDot' }],
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
      code:
        'getResource()\n' +
        '    .then(function(){})\n' +
        '    ["catch"](function(){})\n' +
        '    .then(function(){})\n' +
        '    ["catch"](function(){});',
      errors: [
        {
          column: 6,
          data: { key: q('catch') },
          line: 3,
          messageId: 'useDot',
        },
        {
          column: 6,
          data: { key: q('catch') },
          line: 5,
          messageId: 'useDot',
        },
      ],
      output:
        'getResource()\n' +
        '    .then(function(){})\n' +
        '    .catch(function(){})\n' +
        '    .then(function(){})\n' +
        '    .catch(function(){});',
    },
    {
      code: noFormat`
foo
  .while;
      `,
      errors: [{ data: { key: 'while' }, messageId: 'useBrackets' }],
      options: [{ allowKeywords: false }],
      output: `
foo
  ["while"];
      `,
    },
    {
      code: "foo[/* comment */ 'bar'];",
      errors: [{ data: { key: q('bar') }, messageId: 'useDot' }],
      output: null, // Not fixed due to comment
    },
    {
      code: "foo['bar' /* comment */];",
      errors: [{ data: { key: q('bar') }, messageId: 'useDot' }],
      output: null, // Not fixed due to comment
    },
    {
      code: "foo['bar'];",
      errors: [{ data: { key: q('bar') }, messageId: 'useDot' }],
      output: 'foo.bar;',
    },
    {
      code: 'foo./* comment */ while;',
      errors: [{ data: { key: 'while' }, messageId: 'useBrackets' }],
      options: [{ allowKeywords: false }],
      output: null, // Not fixed due to comment
    },
    {
      code: 'foo[null];',
      errors: [{ data: { key: 'null' }, messageId: 'useDot' }],
      output: 'foo.null;',
    },
    {
      code: "foo['bar'] instanceof baz;",
      errors: [{ data: { key: q('bar') }, messageId: 'useDot' }],
      output: 'foo.bar instanceof baz;',
    },
    {
      code: 'let.if();',
      errors: [{ data: { key: 'if' }, messageId: 'useBrackets' }],
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
      errors: [{ messageId: 'useDot' }],
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
      errors: [{ messageId: 'useDot' }],
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
      errors: [{ messageId: 'useDot' }],
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
      errors: [{ messageId: 'useDot' }],
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
