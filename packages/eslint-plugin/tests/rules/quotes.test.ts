/* eslint-disable eslint-comments/no-use */
// this rule tests quotes, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

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

const useDoubleQuote = {
  messageId: 'wrongQuotes' as const,
  data: {
    description: 'doublequote',
  },
};

const useSingleQuote = {
  messageId: 'wrongQuotes' as const,
  data: {
    description: 'singlequote',
  },
};

const useBacktick = {
  messageId: 'wrongQuotes' as const,
  data: {
    description: 'backtick',
  },
};

ruleTester.run('quotes', rule, {
  valid: [
    {
      code: "declare module '*.html' {}",
      options: ['backtick'],
    },
    {
      code: `
        class A {
          public prop: IProps['prop'];
        }
      `,
      options: ['backtick'],
    },

    /** ESLint */
    'var foo = "bar";',
    {
      code: "var foo = 'bar';",
      options: ['single'],
    },
    {
      code: 'var foo = "bar";',
      options: ['double'],
    },
    {
      code: 'var foo = 1;',
      options: ['single'],
    },
    {
      code: 'var foo = 1;',
      options: ['double'],
    },
    {
      code: 'var foo = "\'";',
      options: [
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
    {
      code: "var foo = '\"';",
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
    },
    {
      code: 'var foo = <>Hello world</>;',
      options: ['single'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <>Hello world</>;',
      options: ['double'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <>Hello world</>;',
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <>Hello world</>;',
      options: ['backtick'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <div>Hello world</div>;',
      options: ['single'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <div id="foo"></div>;',
      options: ['single'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <div>Hello world</div>;',
      options: ['double'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <div>Hello world</div>;',
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = `bar`;',
      options: ['backtick'],
    },
    {
      code: "var foo = `bar 'baz'`;",
      options: ['backtick'],
    },
    {
      code: 'var foo = `bar "baz"`;',
      options: ['backtick'],
    },
    {
      code: 'var foo = 1;',
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
      code: 'var foo = <div id="foo"></div>;',
      options: ['backtick'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'var foo = <div>Hello world</div>;',
      options: ['backtick'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    // Backticks are only okay if they have substitutions, contain a line break, or are tagged
    {
      code: 'var foo = `back\ntick`;',
      options: ['single'],
    },
    {
      code: 'var foo = `back\rtick`;',
      options: ['single'],
    },
    {
      code: 'var foo = `back\u2028tick`;',
      options: ['single'],
    },
    {
      code: 'var foo = `back\u2029tick`;',
      options: ['single'],
    },
    {
      code: 'var foo = `back\\\\\ntick`;', // 2 backslashes followed by a newline
      options: ['single'],
    },
    {
      code: 'var foo = `back\\\\\\\\\ntick`;',
      options: ['single'],
    },
    {
      code: 'var foo = `\n`;',
      options: ['single'],
    },
    {
      code: 'var foo = `back${x}tick`;',
      options: ['double'],
    },
    {
      code: 'var foo = tag`backtick`;',
      options: ['double'],
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
    },
    {
      code: 'var foo = `bar \'foo\' baz` + "bar";',
      options: [
        'double',
        {
          allowTemplateLiterals: true,
        },
      ],
    },
    {
      code: "var foo = `bar 'foo' baz` + `bar`;",
      options: [
        'backtick',
        {
          allowTemplateLiterals: true,
        },
      ],
    },

    // `backtick` should not warn the directive prologues.
    {
      code: '"use strict"; var foo = `backtick`;',
      options: ['backtick'],
    },
    {
      code: '"use strict"; \'use strong\'; "use asm"; var foo = `backtick`;',
      options: ['backtick'],
    },
    {
      code:
        'function foo() { "use strict"; "use strong"; "use asm"; var foo = `backtick`; }',
      options: ['backtick'],
    },
    {
      code:
        "(function() { 'use strict'; 'use strong'; 'use asm'; var foo = `backtick`; })();",
      options: ['backtick'],
    },
    {
      code:
        '(() => { "use strict"; "use strong"; "use asm"; var foo = `backtick`; })();',
      options: ['backtick'],
    },

    // `backtick` should not warn import/export sources.
    {
      code: 'import "a"; import \'b\';',
      options: ['backtick'],
    },
    {
      code: 'import a from "a"; import b from \'b\';',
      options: ['backtick'],
    },
    {
      code: 'export * from "a"; export * from \'b\';',
      options: ['backtick'],
    },
    // `backtick` should not warn import with require.
    {
      code: "import moment = require('moment');",
      options: ['backtick'],
    },
    // `backtick` should not warn property/method names (not computed).
    {
      code: 'var obj = {"key0": 0, \'key1\': 1};',
      options: ['backtick'],
    },
    {
      code: "class Foo { 'bar'(){} }",
      options: ['backtick'],
    },
    {
      code: "class Foo { static ''(){} }",
      options: ['backtick'],
    },

    {
      code: `
interface Foo {
  a: number;
  b: string;
  "a-b": boolean;
  "a-b-c": boolean;
}
      `,
    },
    {
      code: `
interface Foo {
  a: number;
  b: string;
  'a-b': boolean;
  'a-b-c': boolean;
}
      `,
      options: ['single'],
    },
    {
      code: `
interface Foo {
  a: number;
  b: string;
  'a-b': boolean;
  'a-b-c': boolean;
}
      `,
      options: ['backtick'],
    },

    // TSEnumMember
    {
      code: `
enum Foo {
  A = 1,
  "A-B" = 2
}
      `,
    },
    {
      code: `
enum Foo {
  A = 1,
  'A-B' = 2
}
      `,
      options: ['single'],
    },
    {
      code: `
enum Foo {
  A = \`A\`,
  'A-B' = \`A-B\`
}
      `,
      options: ['backtick'],
    },

    // TSMethodSignature
    {
      code: `
interface Foo {
  a(): void;
  "a-b"(): void;
}
      `,
    },
    {
      code: `
interface Foo {
  a(): void;
  'a-b'(): void;
}
      `,
      options: ['single'],
    },
    {
      code: `
interface Foo {
  a(): void;
  'a-b'(): void;
}
      `,
      options: ['backtick'],
    },

    // ClassProperty
    {
      code: `
class Foo {
  public a = "";
  public "a-b" = "";
}
      `,
    },
    {
      code: `
class Foo {
  public a = '';
  public 'a-b' = '';
}
      `,
      options: ['single'],
    },
    {
      code: `
class Foo {
  public a = \`\`;
  public 'a-b' = \`\`;
}
      `,
      options: ['backtick'],
    },

    // TSAbstractClassProperty
    {
      code: `
abstract class Foo {
  public abstract a = "";
  public abstract "a-b" = "";
}
      `,
    },
    {
      code: `
abstract class Foo {
  public abstract a = '';
  public abstract 'a-b' = '';
}
      `,
      options: ['single'],
    },
    {
      code: `
abstract class Foo {
  public abstract a = \`\`;
  public abstract 'a-b' = \`\`;
}
      `,
      options: ['backtick'],
    },

    // TSAbstractMethodDefinition
    {
      code: `
abstract class Foo {
  public abstract a(): void;
  public abstract "a-b"(): void;
}
      `,
    },
    {
      code: `
abstract class Foo {
  public abstract a(): void;
  public abstract 'a-b'(): void;
}
      `,
      options: ['single'],
    },
    {
      code: `
abstract class Foo {
  public abstract a(): void;
  public abstract 'a-b'(): void;
}
      `,
      options: ['backtick'],
    },
  ],

  invalid: [
    {
      code: "var foo = 'bar';",
      output: 'var foo = "bar";',
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = "bar";',
      output: "var foo = 'bar';",
      options: ['single'],
      errors: [useSingleQuote],
    },
    {
      code: 'var foo = `bar`;',
      output: "var foo = 'bar';",
      options: ['single'],
      errors: [useSingleQuote],
    },
    {
      code: "var foo = 'don\\'t';",
      output: 'var foo = "don\'t";',
      errors: [useDoubleQuote],
    },
    {
      code: 'var msg = "Plugin \'" + name + "\' not found"',
      output: "var msg = 'Plugin \\'' + name + '\\' not found'",
      options: ['single'],
      errors: [
        { ...useSingleQuote, column: 11 },
        { ...useSingleQuote, column: 31 },
      ],
    },
    {
      code: "var foo = 'bar';",
      output: 'var foo = "bar";',
      options: ['double'],
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `bar`;',
      output: 'var foo = "bar";',
      options: ['double'],
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = "bar";',
      output: "var foo = 'bar';",
      options: [
        'single',
        {
          avoidEscape: true,
        },
      ],
      errors: [useSingleQuote],
    },
    {
      code: "var foo = 'bar';",
      output: 'var foo = "bar";',
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: "var foo = '\\\\';",
      output: 'var foo = "\\\\";',
      options: [
        'double',
        {
          avoidEscape: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = "bar";',
      output: "var foo = 'bar';",
      options: [
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      errors: [useSingleQuote],
    },
    {
      code: "var foo = 'bar';",
      output: 'var foo = "bar";',
      options: [
        'double',
        {
          allowTemplateLiterals: true,
        },
      ],
      errors: [useDoubleQuote],
    },
    {
      code: "var foo = 'bar';",
      output: 'var foo = `bar`;',
      options: ['backtick'],
      errors: [useBacktick],
    },
    {
      code: "var foo = 'b${x}a$r';",
      output: 'var foo = `b\\${x}a$r`;',
      options: ['backtick'],
      errors: [useBacktick],
    },
    {
      code: 'var foo = "bar";',
      output: 'var foo = `bar`;',
      options: ['backtick'],
      errors: [useBacktick],
    },
    {
      code: 'var foo = "bar";',
      output: 'var foo = `bar`;',
      options: [
        'backtick',
        {
          avoidEscape: true,
        },
      ],
      errors: [useBacktick],
    },
    {
      code: "var foo = 'bar';",
      output: 'var foo = `bar`;',
      options: [
        'backtick',
        {
          avoidEscape: true,
        },
      ],
      errors: [useBacktick],
    },

    // "use strict" is *not* a directive prologue in these statements so is subject to the rule
    {
      code: 'var foo = `backtick`; "use strict";',
      output: 'var foo = `backtick`; `use strict`;',
      options: ['backtick'],
      errors: [useBacktick],
    },
    {
      code: '{ "use strict"; var foo = `backtick`; }',
      output: '{ `use strict`; var foo = `backtick`; }',
      options: ['backtick'],
      errors: [useBacktick],
    },
    {
      code: 'if (1) { "use strict"; var foo = `backtick`; }',
      output: 'if (1) { `use strict`; var foo = `backtick`; }',
      options: ['backtick'],
      errors: [useBacktick],
    },

    // `backtick` should warn computed property names.
    {
      code: 'var obj = {["key0"]: 0, [\'key1\']: 1};',
      output: 'var obj = {[`key0`]: 0, [`key1`]: 1};',
      options: ['backtick'],
      parserOptions: { ecmaVersion: 6 },
      errors: [useBacktick, useBacktick],
    },
    {
      code: "class Foo { ['a'](){} static ['b'](){} }",
      output: 'class Foo { [`a`](){} static [`b`](){} }',
      options: ['backtick'],
      errors: [useBacktick, useBacktick],
    },

    // https://github.com/eslint/eslint/issues/7084
    {
      code: '<div blah={"blah"} />',
      output: "<div blah={'blah'} />",
      options: [`single`],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [useSingleQuote],
    },
    {
      code: "<div blah={'blah'} />",
      output: '<div blah={"blah"} />',
      options: ['double'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [useDoubleQuote],
    },
    {
      code: "<div blah={'blah'} />",
      output: '<div blah={`blah`} />',
      options: ['backtick'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [useBacktick],
    },

    // https://github.com/eslint/eslint/issues/7610
    {
      code: '`use strict`;',
      output: null,
      errors: [useDoubleQuote],
    },
    {
      code: 'function foo() { `use strict`; foo(); }',
      output: null,
      errors: [useDoubleQuote],
    },
    {
      code: 'foo = function() { `use strict`; foo(); }',
      output: null,
      errors: [useDoubleQuote],
    },
    {
      code: '() => { `use strict`; foo(); }',
      output: null,
      errors: [useDoubleQuote],
    },
    {
      code: '() => { foo(); `use strict`; }',
      output: '() => { foo(); "use strict"; }',
      errors: [useDoubleQuote],
    },
    {
      code: 'foo(); `use strict`;',
      output: 'foo(); "use strict";',
      errors: [useDoubleQuote],
    },

    // https://github.com/eslint/eslint/issues/7646
    {
      code: 'var foo = `foo\\nbar`;',
      output: 'var foo = "foo\\nbar";',
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `foo\\\nbar`;', // 1 backslash followed by a newline
      output: 'var foo = "foo\\\nbar";',
      errors: [useDoubleQuote],
    },
    {
      code: 'var foo = `foo\\\\\\\nbar`;', // 3 backslashes followed by a newline
      output: 'var foo = "foo\\\\\\\nbar";',
      errors: [useDoubleQuote],
    },
    {
      code: '````',
      output: '""``',
      errors: [{ ...useDoubleQuote, line: 1, column: 1 }],
    },

    {
      code: `
interface Foo {
  a: number;
  b: string;
  'a-b': boolean;
  'a-b-c': boolean;
}
      `,
      output: `
interface Foo {
  a: number;
  b: string;
  "a-b": boolean;
  "a-b-c": boolean;
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 5,
          column: 3,
        },
        {
          ...useDoubleQuote,
          line: 6,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  a: number;
  b: string;
  "a-b": boolean;
  "a-b-c": boolean;
}
      `,
      output: `
interface Foo {
  a: number;
  b: string;
  'a-b': boolean;
  'a-b-c': boolean;
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 5,
          column: 3,
        },
        {
          ...useSingleQuote,
          line: 6,
          column: 3,
        },
      ],
      options: ['single'],
    },

    // Enums
    {
      code: `
enum Foo {
  A = 1,
  'A-B' = 2
}
      `,
      output: `
enum Foo {
  A = 1,
  "A-B" = 2
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: `
enum Foo {
  A = 1,
  "A-B" = 2
}
      `,
      output: `
enum Foo {
  A = 1,
  'A-B' = 2
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 4,
          column: 3,
        },
      ],
      options: ['single'],
    },
    {
      code: `
enum Foo {
  A = 'A',
  'A-B' = 'A-B'
}
      `,
      output: `
enum Foo {
  A = \`A\`,
  'A-B' = \`A-B\`
}
      `,
      errors: [
        {
          ...useBacktick,
          line: 3,
          column: 7,
        },
        {
          ...useBacktick,
          line: 4,
          column: 11,
        },
      ],
      options: ['backtick'],
    },

    // TSMethodSignature
    {
      code: `
interface Foo {
  a(): void;
  'a-b'(): void;
}
      `,
      output: `
interface Foo {
  a(): void;
  "a-b"(): void;
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: `
interface Foo {
  a(): void;
  "a-b"(): void;
}
      `,
      output: `
interface Foo {
  a(): void;
  'a-b'(): void;
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 4,
          column: 3,
        },
      ],
      options: ['single'],
    },

    // ClassProperty
    {
      code: `
class Foo {
  public a = '';
  public 'a-b' = '';
}
      `,
      output: `
class Foo {
  public a = "";
  public "a-b" = "";
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 3,
          column: 14,
        },
        {
          ...useDoubleQuote,
          line: 4,
          column: 10,
        },
        {
          ...useDoubleQuote,
          line: 4,
          column: 18,
        },
      ],
    },
    {
      code: `
class Foo {
  public a = "";
  public "a-b" = "";
}
      `,
      output: `
class Foo {
  public a = '';
  public 'a-b' = '';
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 3,
          column: 14,
        },
        {
          ...useSingleQuote,
          line: 4,
          column: 10,
        },
        {
          ...useSingleQuote,
          line: 4,
          column: 18,
        },
      ],
      options: ['single'],
    },
    {
      code: `
class Foo {
  public a = "";
  public "a-b" = "";
}
      `,
      output: `
class Foo {
  public a = \`\`;
  public "a-b" = \`\`;
}
      `,
      errors: [
        {
          ...useBacktick,
          line: 3,
          column: 14,
        },
        {
          ...useBacktick,
          line: 4,
          column: 18,
        },
      ],
      options: ['backtick'],
    },

    // TSAbstractClassProperty
    {
      code: `
abstract class Foo {
  public abstract a = '';
  public abstract 'a-b' = '';
}
      `,
      output: `
abstract class Foo {
  public abstract a = "";
  public abstract "a-b" = "";
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 3,
          column: 23,
        },
        {
          ...useDoubleQuote,
          line: 4,
          column: 19,
        },
        {
          ...useDoubleQuote,
          line: 4,
          column: 27,
        },
      ],
    },
    {
      code: `
abstract class Foo {
  public abstract a = "";
  public abstract "a-b" = "";
}
      `,
      output: `
abstract class Foo {
  public abstract a = '';
  public abstract 'a-b' = '';
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 3,
          column: 23,
        },
        {
          ...useSingleQuote,
          line: 4,
          column: 19,
        },
        {
          ...useSingleQuote,
          line: 4,
          column: 27,
        },
      ],
      options: ['single'],
    },
    {
      code: `
abstract class Foo {
  public abstract a = "";
  public abstract "a-b" = "";
}
      `,
      output: `
abstract class Foo {
  public abstract a = \`\`;
  public abstract "a-b" = \`\`;
}
      `,
      errors: [
        {
          ...useBacktick,
          line: 3,
          column: 23,
        },
        {
          ...useBacktick,
          line: 4,
          column: 27,
        },
      ],
      options: ['backtick'],
    },

    // TSAbstractMethodDefinition
    {
      code: `
abstract class Foo {
  public abstract a(): void;
  public abstract 'a-b'(): void;
}
      `,
      output: `
abstract class Foo {
  public abstract a(): void;
  public abstract "a-b"(): void;
}
      `,
      errors: [
        {
          ...useDoubleQuote,
          line: 4,
          column: 19,
        },
      ],
    },
    {
      code: `
abstract class Foo {
  public abstract a(): void;
  public abstract "a-b"(): void;
}
      `,
      output: `
abstract class Foo {
  public abstract a(): void;
  public abstract 'a-b'(): void;
}
      `,
      errors: [
        {
          ...useSingleQuote,
          line: 4,
          column: 19,
        },
      ],
      options: ['single'],
    },
  ],
});
