import rule from '../../src/rules/dot-notation';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
    { code: 'a[`time${range}`];', parserOptions: { ecmaVersion: 6 } },
    {
      code: 'a[`while`];',
      options: [{ allowKeywords: false }],
      parserOptions: { ecmaVersion: 6 },
    },
    { code: 'a[`time range`];', parserOptions: { ecmaVersion: 6 } },
    'a.true;',
    'a.null;',
    'a[undefined];',
    'a[void 0];',
    'a[b()];',
    { code: 'a[/(?<zero>0)/];', parserOptions: { ecmaVersion: 2018 } },

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
      code: "a['true'];",
      output: 'a.true;',
      errors: [{ messageId: 'useDot', data: { key: q('true') } }],
    },
    {
      code: "a['time'];",
      output: 'a.time;',
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'useDot', data: { key: '"time"' } }],
    },
    {
      code: 'a[null];',
      output: 'a.null;',
      errors: [{ messageId: 'useDot', data: { key: 'null' } }],
    },
    {
      code: 'a[true];',
      output: 'a.true;',
      errors: [{ messageId: 'useDot', data: { key: 'true' } }],
    },
    {
      code: 'a[false];',
      output: 'a.false;',
      errors: [{ messageId: 'useDot', data: { key: 'false' } }],
    },
    {
      code: "a['b'];",
      output: 'a.b;',
      errors: [{ messageId: 'useDot', data: { key: q('b') } }],
    },
    {
      code: "a.b['c'];",
      output: 'a.b.c;',
      errors: [{ messageId: 'useDot', data: { key: q('c') } }],
    },
    {
      code: "a['_dangle'];",
      output: 'a._dangle;',
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      errors: [{ messageId: 'useDot', data: { key: q('_dangle') } }],
    },
    {
      code: "a['SHOUT_CASE'];",
      output: 'a.SHOUT_CASE;',
      options: [{ allowPattern: '^[a-z]+(_[a-z]+)+$' }],
      errors: [{ messageId: 'useDot', data: { key: q('SHOUT_CASE') } }],
    },
    {
      code: 'a\n' + "  ['SHOUT_CASE'];",
      output: 'a\n' + '  .SHOUT_CASE;',
      errors: [
        {
          messageId: 'useDot',
          data: { key: q('SHOUT_CASE') },
          line: 2,
          column: 4,
        },
      ],
    },
    {
      code:
        'getResource()\n' +
        '    .then(function(){})\n' +
        '    ["catch"](function(){})\n' +
        '    .then(function(){})\n' +
        '    ["catch"](function(){});',
      output:
        'getResource()\n' +
        '    .then(function(){})\n' +
        '    .catch(function(){})\n' +
        '    .then(function(){})\n' +
        '    .catch(function(){});',
      errors: [
        {
          messageId: 'useDot',
          data: { key: q('catch') },
          line: 3,
          column: 6,
        },
        {
          messageId: 'useDot',
          data: { key: q('catch') },
          line: 5,
          column: 6,
        },
      ],
    },
    {
      code: 'foo\n' + '  .while;',
      output: 'foo\n' + '  ["while"];',
      options: [{ allowKeywords: false }],
      errors: [{ messageId: 'useBrackets', data: { key: 'while' } }],
    },
    {
      code: "foo[/* comment */ 'bar'];",
      output: null, // Not fixed due to comment
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: "foo['bar' /* comment */];",
      output: null, // Not fixed due to comment
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: "foo['bar'];",
      output: 'foo.bar;',
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: 'foo./* comment */ while;',
      output: null, // Not fixed due to comment
      options: [{ allowKeywords: false }],
      errors: [{ messageId: 'useBrackets', data: { key: 'while' } }],
    },
    {
      code: 'foo[null];',
      output: 'foo.null;',
      errors: [{ messageId: 'useDot', data: { key: 'null' } }],
    },
    {
      code: "foo['bar'] instanceof baz;",
      output: 'foo.bar instanceof baz;',
      errors: [{ messageId: 'useDot', data: { key: q('bar') } }],
    },
    {
      code: 'let.if();',
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
  ],
});
