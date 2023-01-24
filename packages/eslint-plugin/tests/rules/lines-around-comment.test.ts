import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/lines-around-comment';
import { noFormat, RuleTester } from '../RuleTester';
import { unIndent } from './indent/utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('lines-around-comment', rule, {
  valid: [
    // Interface
    {
      code: unIndent`
interface A {
  // line
  a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowInterfaceStart: true,
        },
      ],
    },
    {
      code: unIndent`
interface A {
  /* block
     comment */
  a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceStart: true,
        },
      ],
    },
    {
      code: unIndent`
interface A {
  a: string;
  // line
}
`,
      options: [
        {
          afterLineComment: true,
          allowInterfaceEnd: true,
        },
      ],
    },
    {
      code: unIndent`
interface A {
  a: string;
  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowInterfaceEnd: true,
        },
      ],
    },
    // Type
    {
      code: unIndent`
type A = {
  // line
  a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowTypeStart: true,
        },
      ],
    },
    {
      code: unIndent`
type A = {
  /* block
     comment */
  a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowTypeStart: true,
        },
      ],
    },
    {
      code: unIndent`
type A = {
  a: string;
  // line
}
`,
      options: [
        {
          afterLineComment: true,
          allowTypeEnd: true,
        },
      ],
    },
    {
      code: unIndent`
type A = {
  a: string;
  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowTypeEnd: true,
        },
      ],
    },

    // Enum
    {
      code: unIndent`
enum A {
  // line
  a,
}
`,
      options: [
        {
          beforeLineComment: true,
          allowEnumStart: true,
        },
      ],
    },
    {
      code: unIndent`
enum A {
  /* block
     comment */
  a,
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowEnumStart: true,
        },
      ],
    },
    {
      code: unIndent`
enum A {
  a,
  // line
}
`,
      options: [
        {
          afterLineComment: true,
          allowEnumEnd: true,
        },
      ],
    },
    {
      code: unIndent`
enum A {
  a,
  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowEnumEnd: true,
        },
      ],
    },

    // TS module
    {
      code: unIndent`
declare module A {
  // line
  const a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowModuleStart: true,
        },
      ],
    },
    {
      code: unIndent`
declare module A {
  /* block
     comment */
  const a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowModuleStart: true,
        },
      ],
    },
    {
      code: unIndent`
declare module A {
  const a: string;
  // line
}
`,
      options: [
        {
          afterLineComment: true,
          allowModuleEnd: true,
        },
      ],
    },
    {
      code: unIndent`
declare module A {
  const a: string;
  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowModuleEnd: true,
        },
      ],
    },
    // ignorePattern
    {
      code:
        'interface A {' +
        'foo: string;\n\n' +
        '/* eslint-disable no-underscore-dangle */\n\n' +
        '_values: 2;\n' +
        '_values2: true;\n' +
        '/* eslint-enable no-underscore-dangle */\n' +
        'bar: boolean' +
        '}',
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
        },
      ],
    },
    `
interface A {
  foo;
  /* eslint */
}
    `,
    `
interface A {
  foo;
  /* jshint */
}
    `,
    `
interface A {
  foo;
  /* jslint */
}
    `,
    `
interface A {
  foo;
  /* istanbul */
}
    `,
    `
interface A {
  foo;
  /* global */
}
    `,
    `
interface A {
  foo;
  /* globals */
}
    `,
    `
interface A {
  foo;
  /* exported */
}
    `,
    `
interface A {
  foo;
  /* jscs */
}
    `,
    {
      code: `
interface A {
  foo: boolean;
  /* this is pragmatic */
}
      `,
      options: [{ ignorePattern: 'pragma' }],
    },
    {
      code: `
interface A {
  foo;
  /* this is pragmatic */
}
      `,
      options: [{ applyDefaultIgnorePatterns: false, ignorePattern: 'pragma' }],
    },
    {
      code: `
interface A {
  foo: string; // this is inline line comment
}
      `,
      options: [{ beforeLineComment: true }],
    },
    {
      code: `
interface A {
  foo: string /* this is inline block comment */;
}
      `,
    },
    {
      code: `
interface A {
  /* this is inline block comment */ foo: string;
}
      `,
    },
    {
      code: `
interface A {
  /* this is inline block comment */ foo: string /* this is inline block comment */;
}
      `,
    },
    {
      code: `
interface A {
  /* this is inline block comment */ foo: string; // this is inline line comment ;
}
      `,
    },
  ],
  invalid: [
    // interface
    {
      code: unIndent`
interface A {
  a: string;
  // line
}
`,
      output: unIndent`
interface A {
  a: string;

  // line
}
`,
      options: [
        {
          beforeLineComment: true,
          allowInterfaceStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
interface A {
  a: string;
  /* block
     comment */
}
`,
      output: unIndent`
interface A {
  a: string;

  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
interface A {
  // line
  a: string;
}
`,
      output: unIndent`
interface A {

  // line
  a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
interface A {
  /* block
     comment */
  a: string;
}
`,
      output: unIndent`
interface A {

  /* block
     comment */
  a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
interface A {
  a: string;
  // line
}
`,
      output: unIndent`
interface A {
  a: string;
  // line

}
`,
      options: [
        {
          afterLineComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
interface A {
  a: string;
  /* block
     comment */
}
`,
      output: unIndent`
interface A {
  a: string;
  /* block
     comment */

}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },

    // type
    {
      code: unIndent`
type A = {
  a: string;
  // line
}
`,
      output: unIndent`
type A = {
  a: string;

  // line
}
`,
      options: [
        {
          beforeLineComment: true,
          allowInterfaceStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
type A = {
  a: string;
  /* block
     comment */
}
`,
      output: unIndent`
type A = {
  a: string;

  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
type A = {
  // line
  a: string;
}
`,
      output: unIndent`
type A = {

  // line
  a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
type A = {
  /* block
     comment */
  a: string;
}
`,
      output: unIndent`
type A = {

  /* block
     comment */
  a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
type A = {
  a: string;
  // line
}
`,
      output: unIndent`
type A = {
  a: string;
  // line

}
`,
      options: [
        {
          afterLineComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
type A = {
  a: string;
  /* block
     comment */
}
`,
      output: unIndent`
type A = {
  a: string;
  /* block
     comment */

}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },

    // Enum
    {
      code: unIndent`
enum A {
  a,
  // line
}
`,
      output: unIndent`
enum A {
  a,

  // line
}
`,
      options: [
        {
          beforeLineComment: true,
          allowEnumStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
enum A {
  a,
  /* block
     comment */
}
`,
      output: unIndent`
enum A {
  a,

  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowEnumStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
enum A {
  // line
  a,
}
`,
      output: unIndent`
enum A {

  // line
  a,
}
`,
      options: [
        {
          beforeLineComment: true,
          allowEnumStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
enum A {
  /* block
     comment */
  a,
}
`,
      output: unIndent`
enum A {

  /* block
     comment */
  a,
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowEnumStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
enum A {
  a,
  // line
}
`,
      output: unIndent`
enum A {
  a,
  // line

}
`,
      options: [
        {
          afterLineComment: true,
          allowEnumEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
enum A {
  a,
  /* block
     comment */
}
`,
      output: unIndent`
enum A {
  a,
  /* block
     comment */

}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowEnumEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },

    // TS module
    {
      code: unIndent`
module A {
  const a: string;
  // line
}
`,
      output: unIndent`
module A {
  const a: string;

  // line
}
`,
      options: [
        {
          beforeLineComment: true,
          allowModuleStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
module A {
  const a: string;
  /* block
     comment */
}
`,
      output: unIndent`
module A {
  const a: string;

  /* block
     comment */
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowModuleStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
module A {
  // line
  const a: string;
}
`,
      output: unIndent`
module A {

  // line
  const a: string;
}
`,
      options: [
        {
          beforeLineComment: true,
          allowModuleStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
module A {
  /* block
     comment */
  const a: string;
}
`,
      output: unIndent`
module A {

  /* block
     comment */
  const a: string;
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowModuleStart: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
module A {
  const a: string;
  // line
}
`,
      output: unIndent`
module A {
  const a: string;
  // line

}
`,
      options: [
        {
          afterLineComment: true,
          allowModuleEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
module A {
  const a: string;
  /* block
     comment */
}
`,
      output: unIndent`
module A {
  const a: string;
  /* block
     comment */

}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowModuleEnd: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },

    // multiple comments in one line
    {
      code: unIndent`
interface A {
  a: string;
  /* block */ /* block */
}
`,
      output: unIndent`
interface A {
  a: string;

  /* block */ /* block */
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
interface A {
  a: string;
  /* block */ // line
}
`,
      output: unIndent`
interface A {
  a: string;

  /* block */ // line
}
`,
      options: [
        {
          beforeBlockComment: true,
          allowInterfaceEnd: false,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
interface A {
  /* block */ /* block */
  a: string;
}
`,
      output: unIndent`
interface A {
  /* block */ /* block */

  a: string;
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
interface A {
  /* block */ // line
  a: string;
}
`,
      output: unIndent`
interface A {
  /* block */ // line

  a: string;
}
`,
      options: [
        {
          beforeBlockComment: false,
          afterLineComment: true,
          allowInterfaceStart: false,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
  ],
});
