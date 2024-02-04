import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/dot-notation';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

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

    `
      declare const a: { b: number };
      a.b;
    `,
    `
      declare const a: { b: { c: number } };
      a.b.c;
    `,
    `
      declare const a: { 12: number };
      a['12'];
    `,
    `
      declare const b: 'foo';
      declare const a: { [K in typeof b]: number };
      a[b];
    `,
    `
      declare const a: [number];
      a[0];
    `,
    {
      code: `
        declare const a: { b: { c: number } };
        a.b.c;
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { arguments: number };
        a.arguments;
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { let: number };
        a.let;
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { yield: number };
        a.yield;
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { eval: number };
        a.eval;
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { 0: number };
        a[0];
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { while: number };
        a['while'];
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { true: number };
        a['true'];
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { null: number };
        a['null'];
      `,
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: any;
        a[true];
      `,
      ignoreTsErrors: [2538],
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { null: number };
        a[null];
      `,
      ignoreTsErrors: [2538],
      options: [{ allowKeywords: false }],
    },
    {
      code: `
        declare const a: { true: number };
        a.true;
      `,
      options: [{ allowKeywords: true }],
    },
    {
      code: `
        declare const a: { null: number };
        a.null;
      `,
      options: [{ allowKeywords: true }],
    },
    {
      code: `
        declare const a: { snake_case: number };
        a['snake_case'];
      `,
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
    },
    {
      code: `
        declare const a: { lots_of_snake_case: number };
        a['lots_of_snake_case'];
      `,
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
    },
    {
      code: `
        declare const range: 'foo';
        declare const a: { timefoo: number };
        a[\`time\${range}\`];
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
        declare const a: { while: number };
        a[\`while\`];
      `,
      options: [{ allowKeywords: false }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
        declare const a: { 'time range': number };
        a[\`time range\`];
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    `
      declare const a: { true: number };
      a.true;
    `,
    `
      declare const a: { null: number };
      a.null;
    `,
    {
      code: `
        declare const a: { undefined: number };
        a[undefined];
      `,
      ignoreTsErrors: [2538],
    },
    {
      code: `
        declare const a: any;
        a[void 0];
      `,
      ignoreTsErrors: [2538],
    },
    `
      declare const b: () => 'foo';
      declare const a: { foo: number };
      a[b()];
    `,
    {
      code: `
        declare const a: any;
        a[/(?<zero>0)/];
      `,
      ignoreTsErrors: [2538],
      parserOptions: { ecmaVersion: 2018 },
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
  prop: number = 1;
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
  nested: Nested = { property: 'foo' };
}

let dingus: Dingus | undefined;

dingus?.nested.property;
dingus?.nested['hello'];
      `,
      options: [{ allowIndexSignaturePropertyAccess: true }],
      parserOptions: { ecmaVersion: 2020 },
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
      options: [{ allowPrivateClassPropertyAccess: false }],
      output: `
class X {
  private priv_prop = 123;
}

const x = new X();
x.priv_prop = 123;
      `,
      errors: [{ messageId: 'useDot' }],
    },
    {
      code: `
class X {
  public pub_prop = 123;
}

const x = new X();
x['pub_prop'] = 123;
      `,
      output: `
class X {
  public pub_prop = 123;
}

const x = new X();
x.pub_prop = 123;
      `,
      errors: [{ messageId: 'useDot' }],
    },
    //  baseRule

    // {
    //     code: 'a.true;',
    //     output: "a['true'];",
    //     options: [{ allowKeywords: false }],
    //     errors: [{ messageId: "useBrackets", data: { key: "true" } }],
    // },
    {
      code: `
declare const a: { true: number };
a['true'];
      `,
      output: `
declare const a: { true: number };
a.true;
      `,
      errors: [{ messageId: 'useDot', data: { key: q('true') } }],
    },
    {
      code: `
declare const a: { time: number };
a['time'];
      `,
      output: `
declare const a: { time: number };
a.time;
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'useDot', data: { key: '"time"' } }],
    },
    {
      code: `
declare const a: { null: number };
a[null];
      `,
      output: `
declare const a: { null: number };
a.null;
      `,
      ignoreTsErrors: [2538],
      errors: [{ messageId: 'useDot', data: { key: 'null' } }],
    },
    {
      code: `
declare const a: { true: number };
a[true];
      `,
      output: `
declare const a: { true: number };
a.true;
      `,
      ignoreTsErrors: [2538],
      errors: [{ messageId: 'useDot', data: { key: 'true' } }],
    },
    {
      code: `
declare const a: { false: number };
a[false];
      `,
      output: `
declare const a: { false: number };
a.false;
      `,
      ignoreTsErrors: [2538],
      errors: [{ messageId: 'useDot', data: { key: 'false' } }],
    },
    {
      code: `
declare const a: { b: number };
a['b'];
      `,
      output: `
declare const a: { b: number };
a.b;
      `,
      errors: [{ messageId: 'useDot', data: { key: q('b') } }],
    },
    {
      code: `
declare const a: { b: { c: number } };
a.b['c'];
      `,
      output: `
declare const a: { b: { c: number } };
a.b.c;
      `,
      errors: [{ messageId: 'useDot', data: { key: q('c') } }],
    },
    {
      code: `
declare const a: { _dangle: number };
a['_dangle'];
      `,
      output: `
declare const a: { _dangle: number };
a._dangle;
      `,
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      errors: [{ messageId: 'useDot', data: { key: q('_dangle') } }],
    },
    {
      code: `
declare const a: { SHOUT_CASE: number };
a['SHOUT_CASE'];
      `,
      output: `
declare const a: { SHOUT_CASE: number };
a.SHOUT_CASE;
      `,
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      errors: [{ messageId: 'useDot', data: { key: q('SHOUT_CASE') } }],
    },
    {
      code: noFormat`
declare const a: { SHOUT_CASE: number };
a
  ['SHOUT_CASE'];
      `,
      output: `
declare const a: { SHOUT_CASE: number };
a
  .SHOUT_CASE;
      `,
      errors: [
        {
          messageId: 'useDot',
          data: { key: q('SHOUT_CASE') },
          line: 4,
          column: 4,
        },
      ],
    },
    {
      code: `
declare const getResource: () => Promise<number>;
getResource()
  .then(function () {})
  ['catch'](function () {})
  .then(function () {})
  ['catch'](function () {});
      `,
      output: `
declare const getResource: () => Promise<number>;
getResource()
  .then(function () {})
  .catch(function () {})
  .then(function () {})
  .catch(function () {});
      `,
      errors: [
        {
          messageId: 'useDot',
          data: { key: q('catch') },
          line: 5,
          column: 4,
        },
        {
          messageId: 'useDot',
          data: { key: q('catch') },
          line: 7,
          column: 4,
        },
      ],
    },
    {
      code: noFormat`
        declare const foo: { while: number };
        foo
          .while;
      `,
      output: `
        declare const foo: { while: number };
        foo
          ["while"];
      `,
      options: [{ allowKeywords: false }],
      errors: [{ messageId: 'useBrackets', data: { key: 'while' } }],
    },
    {
      code: `
        declare const foo: { bar: number };
        foo[/* comment */ 'bar'];
      `,
      output: null, // Not fixed due to comment
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: `
        declare const foo: { bar: number };
        foo['bar' /* comment */];
      `,
      output: null, // Not fixed due to comment
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: `
        declare const foo: { bar: number };
        foo['bar'];
      `,
      output: `
        declare const foo: { bar: number };
        foo.bar;
      `,
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: `
        declare const foo: { while: number };
        foo./* comment */ while;
      `,
      output: null, // Not fixed due to comment
      options: [{ allowKeywords: false }],
      errors: [{ messageId: 'useBrackets', data: { key: 'while' } }],
    },
    {
      code: `
        declare const foo: { null: number };
        foo[null];
      `,
      output: `
        declare const foo: { null: number };
        foo.null;
      `,
      ignoreTsErrors: [2538],
      errors: [{ messageId: 'useDot', data: { key: 'null' } }],
    },
    {
      code: `
        declare class baz {}
        declare const foo: { bar: baz };
        foo['bar'] instanceof baz;
      `,
      output: `
        declare class baz {}
        declare const foo: { bar: baz };
        foo.bar instanceof baz;
      `,
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: 'let.if();',
      ignoreTsErrors: [1212, 2304],
      output: null, // `let["if"]()` is a syntax error because `let[` indicates a destructuring variable declaration
      options: [{ allowKeywords: false }],
      errors: [{ messageId: 'useBrackets', data: { key: 'if' } }],
    },
    {
      code: `
class X {
  protected protected_prop = 123;
}

const x = new X();
x['protected_prop'] = 123;
      `,
      ignoreTsErrors: true,
      options: [{ allowProtectedClassPropertyAccess: false }],
      output: `
class X {
  protected protected_prop = 123;
}

const x = new X();
x.protected_prop = 123;
      `,
      errors: [{ messageId: 'useDot' }],
    },
    {
      code: `
class X {
  prop: string = 'foo';
  [key: string]: string;
}

const x = new X();
x['prop'] = 'hello';
      `,
      options: [{ allowIndexSignaturePropertyAccess: true }],
      errors: [{ messageId: 'useDot' }],
      output: `
class X {
  prop: string = 'foo';
  [key: string]: string;
}

const x = new X();
x.prop = 'hello';
      `,
    },
  ],
});
