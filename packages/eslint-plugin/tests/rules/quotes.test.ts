import rule from '../../src/rules/quotes';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
});

/**
 * the base rule `quotes` doesn't use a message id
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDoubleQuote: any = {
  message: 'Strings must use doublequote.',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSingleQuote: any = {
  message: 'Strings must use singlequote.',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useBacktick: any = {
  message: 'Strings must use backtick.',
};

ruleTester.run('quotes', rule, {
  valid: [
    {
      code: `declare module '*.html' {}`,
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
        class A {
          public prop: IProps['prop'];
        }
      `,
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },

    /** ESLint */
    `var foo = "bar";`,
    {
      code: `var foo = 'bar';`,
      options: ['single'],
    },
    {
      code: `var foo = "bar";`,
      options: ['double'],
    },
    {
      code: `var foo = 1;`,
      options: ['single'],
    },
    {
      code: `var foo = 1;`,
      options: ['double'],
    },
    {
      code: `var foo = "'";`,
      options: [
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
    {
      code: `var foo = '"';`,
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
    },
    {
      code: `var foo = <>Hello world</>;`,
      options: ['single'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <>Hello world</>;`,
      options: ['double'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <>Hello world</>;`,
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <>Hello world</>;`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <div>Hello world</div>;`,
      options: ['single'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <div id="foo"></div>;`,
      options: ['single'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <div>Hello world</div>;`,
      options: ['double'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <div>Hello world</div>;`,
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = `bar`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: "var foo = `bar 'baz'`;",
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `bar "baz"`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `var foo = 1;`,
      options: ['backtick'],
    },
    {
      code: 'var foo = "a string containing `backtick` quotes";',
      options: [
        'backtick',
        {
          avoidEscape: true,
        },
      ],
    },
    {
      code: `var foo = <div id="foo"></div>;`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `var foo = <div>Hello world</div>;`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    // Backticks are only okay if they have substitutions, contain a line break, or are tagged
    {
      code: 'var foo = `back\ntick`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back\rtick`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back\u2028tick`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back\u2029tick`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back\\\\\ntick`;', // 2 backslashes followed by a newline
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back\\\\\\\\\ntick`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `\n`;',
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `back${x}tick`;',
      options: ['double'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = tag`backtick`;',
      options: ['double'],
      parserOptions: { ecmaVersion: 6 },
    },

    // Backticks are also okay if allowTemplateLiterals
    {
      code: "var foo = `bar 'foo' baz` + 'bar';",
      options: [
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = `bar \'foo\' baz` + "bar";',
      options: [
        'double',
        {
          allowTemplateLiterals: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: "var foo = `bar 'foo' baz` + `bar`;",
      options: [
        'backtick',
        {
          allowTemplateLiterals: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },

    // `backtick` should not warn the directive prologues.
    {
      code: '"use strict"; var foo = `backtick`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: '"use strict"; \'use strong\'; "use asm"; var foo = `backtick`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'function foo() { "use strict"; "use strong"; "use asm"; var foo = `backtick`; }',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        "(function() { 'use strict'; 'use strong'; 'use asm'; var foo = `backtick`; })();",
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        '(() => { "use strict"; "use strong"; "use asm"; var foo = `backtick`; })();',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },

    // `backtick` should not warn import/export sources.
    {
      code: `import "a"; import 'b';`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },
    {
      code: `import a from "a"; import b from 'b';`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },
    {
      code: `export * from "a"; export * from 'b';`,
      options: ['backtick'],
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },

    // `backtick` should not warn property/method names (not computed).
    {
      code: `var obj = {"key0": 0, 'key1': 1};`,
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `class Foo { 'bar'(){} }`,
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `class Foo { static ''(){} }`,
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
    },
  ],

  invalid: [
    {
      code: `var foo = 'bar';`,
      output: `var foo = "bar";`,
      errors: [useDoubleQuote],
    },
    {
      code: `var foo = "bar";`,
      output: `var foo = 'bar';`,
      options: ['single'],
      errors: [useSingleQuote],
    },
    {
      code: 'var foo = `bar`;',
      output: `var foo = 'bar';`,
      options: ['single'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useSingleQuote],
    },
    {
      code: `var foo = 'don\\'t';`,
      output: `var foo = "don't";`,
      errors: [useDoubleQuote],
    },
    {
      code: `var msg = "Plugin '" + name + "' not found"`,
      output: `var msg = 'Plugin \\'' + name + '\\' not found'`,
      options: ['single'],
      errors: [
        { ...useSingleQuote, column: 11 },
        { ...useSingleQuote, column: 31 },
      ],
    },
    {
      code: `var foo = 'bar';`,
      output: `var foo = "bar";`,
      options: ['double'],
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `bar`;',
      output: `var foo = "bar";`,
      options: ['double'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: `var foo = "bar";`,
      output: `var foo = 'bar';`,
      options: [
        'single',
        {
          avoidEscape: true,
        },
      ],
      errors: [useSingleQuote],
    },
    {
      code: `var foo = 'bar';`,
      output: `var foo = "bar";`,
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: `var foo = '\\\\';`,
      output: `var foo = "\\\\\";`, // eslint-disable-line no-useless-escape
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: `var foo = "bar";`,
      output: `var foo = 'bar';`,
      options: [
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      errors: [useSingleQuote],
    },
    {
      code: `var foo = 'bar';`,
      output: `var foo = "bar";`,
      options: [
        'double',
        {
          allowTemplateLiterals: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: `var foo = 'bar';`,
      output: 'var foo = `bar`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 2015 },
      errors: [useBacktick],
    },
    {
      code: "var foo = 'b${x}a$r';",
      output: 'var foo = `b\\${x}a$r`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 2015 },
      errors: [useBacktick],
    },
    {
      code: 'var foo = "bar";',
      output: 'var foo = `bar`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 2015 },
      errors: [useBacktick],
    },
    {
      code: `var foo = "bar";`,
      output: 'var foo = `bar`;',
      options: [
        'backtick',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: { ecmaVersion: 2015 },
      errors: [useBacktick],
    },
    {
      code: `var foo = 'bar';`,
      output: 'var foo = `bar`;',
      options: [
        'backtick',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: { ecmaVersion: 2015 },
      errors: [useBacktick],
    },

    // "use strict" is *not* a directive prologue in these statements so is subject to the rule
    {
      code: 'var foo = `backtick`; "use strict";',
      output: 'var foo = `backtick`; `use strict`;',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick],
    },
    {
      code: '{ "use strict"; var foo = `backtick`; }',
      output: '{ `use strict`; var foo = `backtick`; }',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick],
    },
    {
      code: 'if (1) { "use strict"; var foo = `backtick`; }',
      output: 'if (1) { `use strict`; var foo = `backtick`; }',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick],
    },

    // `backtick` should warn computed property names.
    {
      code: `var obj = {["key0"]: 0, ['key1']: 1};`,
      output: 'var obj = {[`key0`]: 0, [`key1`]: 1};',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick, useBacktick],
    },
    {
      code: `class Foo { ['a'](){} static ['b'](){} }`,
      output: 'class Foo { [`a`](){} static [`b`](){} }',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick, useBacktick],
    },

    // https://github.com/eslint/eslint/issues/7084
    {
      code: `<div blah={"blah"} />`,
      output: `<div blah={'blah'} />`,
      options: [`single`],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [useSingleQuote],
    },
    {
      code: `<div blah={'blah'} />`,
      output: `<div blah={"blah"} />`,
      options: ['double'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [useDoubleQuote],
    },
    {
      code: `<div blah={'blah'} />`,
      output: '<div blah={`blah`} />',
      options: ['backtick'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2015,
      },
      errors: [useBacktick],
    },

    // https://github.com/eslint/eslint/issues/7610
    {
      code: '`use strict`;',
      output: null,
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: 'function foo() { `use strict`; foo(); }',
      output: null,
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: 'foo = function() { `use strict`; foo(); }',
      output: null,
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: '() => { `use strict`; foo(); }',
      output: null,
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: '() => { foo(); `use strict`; }',
      output: `() => { foo(); "use strict"; }`,
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: 'foo(); `use strict`;',
      output: 'foo(); "use strict";',
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },

    // https://github.com/eslint/eslint/issues/7646
    {
      code: 'var foo = `foo\\nbar`;',
      output: 'var foo = "foo\\nbar";',
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `foo\\\nbar`;', // 1 backslash followed by a newline
      output: 'var foo = "foo\\\nbar";',
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `foo\\\\\\\nbar`;', // 3 backslashes followed by a newline
      output: 'var foo = "foo\\\\\\\nbar";',
      parserOptions: { ecmaVersion: 6 },
      errors: [useDoubleQuote],
    },
    {
      code: '````',
      output: '""``',
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...useDoubleQuote, line: 1, column: 1 }],
    },
  ],
});
