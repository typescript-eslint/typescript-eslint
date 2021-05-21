/* eslint-disable eslint-comments/no-use */
// this rule tests new lines which prettier tries to fix, breaking the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import rule from '../../src/rules/padding-line-between-statements';
import { RuleTester } from '../RuleTester';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('padding-line-between-statements', rule, {
  valid: [
    // do nothing if no options.
    "'use strict'; foo(); if (a) { bar(); }",

    // do nothing for single statement.
    {
      code: 'foo()',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
    },
    {
      code: 'foo()',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
    },

    //----------------------------------------------------------------------
    // wildcard
    //----------------------------------------------------------------------

    {
      code: 'foo();bar();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\nbar();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n//comment\nbar();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n/*comment*/\nbar();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n\nbar();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n\n//comment\nbar();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n//comment\n\nbar();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
    },
    {
      code: 'foo();\n//comment\n\n//comment\nbar();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
    },
    {
      code: 'if(a){}\n\n;[].map(b)',
      options: [
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'never', prev: 'empty', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // block-like
    //----------------------------------------------------------------------

    {
      code: 'foo();\n\n{ foo() }\n\nfoo();',
      options: [
        { blankLine: 'always', prev: '*', next: '*' },
        { blankLine: 'never', prev: 'block-like', next: 'block-like' },
      ],
    },
    {
      code: '{ foo() } { foo() }',
      options: [
        { blankLine: 'always', prev: '*', next: '*' },
        { blankLine: 'never', prev: 'block-like', next: 'block-like' },
      ],
    },
    {
      code: '{ foo() }\n{ foo() }',
      options: [
        { blankLine: 'always', prev: '*', next: '*' },
        { blankLine: 'never', prev: 'block-like', next: 'block-like' },
      ],
    },
    {
      code: '{ foo() }\n\n{ foo() }',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: 'block-like' },
      ],
    },
    {
      code: '{ foo() }\n\n//comment\n{ foo() }',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: 'block-like' },
      ],
    },
    {
      code: 'if(a);\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: 'do;while(a);\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: 'do{}while(a);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: 'a={}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: 'let a={}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: 'foo(function(){})\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: '(function(){})()\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    {
      code: '!function(){}()\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // directive
    //----------------------------------------------------------------------

    {
      code: '"use strict"\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: 'function foo(){"use strict"\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: '(function foo(){"use strict"\n\nfoo()})',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: '(()=>{"use strict"\n\nfoo()})',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: "'use strict'\n\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: 'foo("use strict")\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: '`use strict`\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: '("use strict")\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: "'use '+'strict'\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: 'foo()\n"use strict"\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },
    {
      code: '{"use strict"\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // multiline-block-like
    //----------------------------------------------------------------------

    {
      code: '{}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'if(a){}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'while(a){}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: '{\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'if(a){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'while(a){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'do{\n}while(a)\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'for(;;){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'for(a in b){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'for(a of b){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'switch(a){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'function foo(a){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },
    {
      code: 'var a=function foo(a){\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // block
    //----------------------------------------------------------------------

    {
      code: '{}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
      ],
    },
    {
      code: '{\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
      ],
    },
    {
      code: '{\nfoo()\n}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
      ],
    },
    {
      code: 'if(a){}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
      ],
    },
    {
      code: 'a={}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'block', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // empty
    //----------------------------------------------------------------------

    {
      code: ';\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'empty', next: '*' },
      ],
    },
    {
      code: '1;\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'empty', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // expression
    //----------------------------------------------------------------------

    {
      code: 'foo()\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'expression', next: '*' },
      ],
    },
    {
      code: 'a=b+c\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'expression', next: '*' },
      ],
    },
    {
      code: 'var a=1\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'expression', next: '*' },
      ],
    },
    {
      code: "'use strict'\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'expression', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // multiline-expression
    //----------------------------------------------------------------------

    {
      code: 'foo()\n\nfoo(\n\tx,\n\ty\n)',
      options: [
        { blankLine: 'always', prev: '*', next: 'multiline-expression' },
      ],
    },
    {
      code: 'foo()\nfoo()',
      options: [
        { blankLine: 'always', prev: '*', next: 'multiline-expression' },
      ],
    },
    {
      code:
        '() => {\n\tsomeArray.forEach(x => doSomething(x));\n\treturn theThing;\n}',
      options: [
        { blankLine: 'always', prev: 'multiline-expression', next: 'return' },
      ],
    },
    {
      code:
        '() => {\n\tsomeArray.forEach(\n\t\tx => doSomething(x)\n\t);\n\n\treturn theThing;\n}',
      options: [
        { blankLine: 'always', prev: 'multiline-expression', next: 'return' },
      ],
    },

    //----------------------------------------------------------------------
    // break
    //----------------------------------------------------------------------

    {
      code: 'A:{break A\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'break', next: '*' },
      ],
    },
    {
      code: 'while(a){break\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'break', next: '*' },
      ],
    },
    {
      code: 'switch(a){case 0:break\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'break', next: '*' },
      ],
    },
    {
      code: 'switch(a){case 0:break\ncase 1:break}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'break', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // case
    //----------------------------------------------------------------------

    {
      code: 'switch(a){case 0:\nfoo()\n\ncase 1:\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'case', next: '*' },
      ],
    },
    {
      code: 'switch(a){case 0:\nfoo()\n\ndefault:\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'case', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // class
    //----------------------------------------------------------------------

    {
      code: 'class A{}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'class', next: '*' },
      ],
    },
    {
      code: 'var A = class{}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'class', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // const
    //----------------------------------------------------------------------

    {
      code: 'const a=1\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'const', next: '*' },
      ],
    },
    {
      code: 'let a=1\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'const', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // continue
    //----------------------------------------------------------------------

    {
      code: 'while(a){continue\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'continue', next: '*' },
      ],
    },
    {
      code: 'while(a){break\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'continue', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // debugger
    //----------------------------------------------------------------------

    {
      code: 'debugger\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'debugger', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // default
    //----------------------------------------------------------------------

    {
      code: 'switch(a){default:\nfoo()\n\ncase 0:\nfoo()\ncase 1:}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'default', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // do
    //----------------------------------------------------------------------

    {
      code: 'do;while(a)\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'do', next: '*' },
      ],
    },
    {
      code: 'while(a);\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'do', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // export
    //----------------------------------------------------------------------

    {
      code: 'export default 1\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'export', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'export let a=1\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'export', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var a = 0; export {a}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'export', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },

    //----------------------------------------------------------------------
    // for
    //----------------------------------------------------------------------

    {
      code: 'for(;;);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'for', next: '*' },
      ],
    },
    {
      code: 'for(a in b);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'for', next: '*' },
      ],
    },
    {
      code: 'for(a of b);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'for', next: '*' },
      ],
    },
    {
      code: 'while(a);\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'for', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // function
    //----------------------------------------------------------------------

    {
      code: 'function foo(){}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'function', next: '*' },
      ],
    },
    {
      code: 'var foo=function(){}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'function', next: '*' },
      ],
    },
    {
      code: 'async function foo(){}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'function', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // if
    //----------------------------------------------------------------------

    {
      code: 'if(a);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
    },
    {
      code: 'if(a);else;\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
    },
    {
      code: 'if(a);else if(b);else;\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
    },
    {
      code: 'for(;;);\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // iife
    //----------------------------------------------------------------------

    {
      code: '(function(){\n})()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
    },
    {
      code: '+(function(){\n})()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
    },
    {
      code: '(function(){\n})()\nvar a = 2;',
      options: [{ blankLine: 'never', prev: 'iife', next: '*' }],
    },
    {
      code: '+(function(){\n})()\nvar a = 2;',
      options: [{ blankLine: 'never', prev: 'iife', next: '*' }],
    },
    {
      code: '(1, 2, 3, function(){\n})()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
    },

    //----------------------------------------------------------------------
    // import
    //----------------------------------------------------------------------

    {
      code: "import 'a'\n\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'import', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import a from 'a'\n\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'import', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import * as a from 'a'\n\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'import', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {a} from 'a'\n\nfoo()",
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'import', next: '*' },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },

    //----------------------------------------------------------------------
    // let
    //----------------------------------------------------------------------

    {
      code: 'let a=1\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'let', next: '*' },
      ],
    },
    {
      code: 'var a=1\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'let', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // return
    //----------------------------------------------------------------------

    {
      code: 'function foo(){return\n\nfoo()}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'return', next: '*' },
      ],
    },
    {
      code: 'throw a\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'return', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // switch
    //----------------------------------------------------------------------

    {
      code: 'switch(a){}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'switch', next: '*' },
      ],
    },
    {
      code: 'if(a){}\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'switch', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // throw
    //----------------------------------------------------------------------

    {
      code: 'throw a\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'throw', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // try
    //----------------------------------------------------------------------

    {
      code: 'try{}catch(e){}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'try', next: '*' },
      ],
    },
    {
      code: 'try{}finally{}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'try', next: '*' },
      ],
    },
    {
      code: 'try{}catch(e){}finally{}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'try', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // var
    //----------------------------------------------------------------------

    {
      code: 'var a=1\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'var', next: '*' },
      ],
    },
    {
      code: 'const a=1\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'var', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // while
    //----------------------------------------------------------------------

    {
      code: 'while(a);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'while', next: '*' },
      ],
    },
    {
      code: 'do;while(a)\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'while', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // with
    //----------------------------------------------------------------------

    {
      code: 'with(a);\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'with', next: '*' },
      ],
    },

    //----------------------------------------------------------------------
    // multiline-const
    //----------------------------------------------------------------------

    {
      code: 'const a={\nb:1,\nc:2\n}\n\nconst d=3',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
      ],
    },
    {
      code: 'const a=1\n\nconst b={\nc:2,\nd:3\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-const' },
      ],
    },
    {
      code: 'const a=1\nconst b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
      ],
    },
    {
      code: 'const a=1\nconst b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-const' },
      ],
    },

    //----------------------------------------------------------------------
    // multiline-let
    //----------------------------------------------------------------------

    {
      code: 'let a={\nb:1,\nc:2\n}\n\nlet d=3',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-let', next: '*' },
      ],
    },
    {
      code: 'let a=1\n\nlet b={\nc:2,\nd:3\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-let' },
      ],
    },
    {
      code: 'let a=1\nlet b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-let', next: '*' },
      ],
    },
    {
      code: 'let a=1\nlet b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-let' },
      ],
    },

    //----------------------------------------------------------------------
    // multiline-var
    //----------------------------------------------------------------------

    {
      code: 'var a={\nb:1,\nc:2\n}\n\nvar d=3',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-var', next: '*' },
      ],
    },
    {
      code: 'var a=1\n\nvar b={\nc:2,\nd:3\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-var' },
      ],
    },
    {
      code: 'var a=1\nvar b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'multiline-var', next: '*' },
      ],
    },
    {
      code: 'var a=1\nvar b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-var' },
      ],
    },

    //----------------------------------------------------------------------
    // single line const
    //----------------------------------------------------------------------

    {
      code: 'const a=1\n\nconst b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-const', next: '*' },
      ],
    },
    {
      code: 'const a=1\n\nconst b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-const' },
      ],
    },
    {
      code: 'const a={\nb:1,\nc:2\n}\nconst d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-const', next: '*' },
      ],
    },
    {
      code: 'const a={\nb:1,\nc:2\n}\nconst d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-const' },
      ],
    },

    //----------------------------------------------------------------------
    // single line let
    //----------------------------------------------------------------------

    {
      code: 'let a=1\n\nlet b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-let', next: '*' },
      ],
    },
    {
      code: 'let a=1\n\nlet b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-let' },
      ],
    },
    {
      code: 'let a={\nb:1,\nc:2\n}\nlet d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-let', next: '*' },
      ],
    },
    {
      code: 'let a={\nb:1,\nc:2\n}\nlet d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-let' },
      ],
    },

    //----------------------------------------------------------------------
    // single line var
    //----------------------------------------------------------------------

    {
      code: 'var a=1\n\nvar b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-var', next: '*' },
      ],
    },
    {
      code: 'var a=1\n\nvar b=2',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-var' },
      ],
    },
    {
      code: 'var a={\nb:1,\nc:2\n}\nvar d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'singleline-var', next: '*' },
      ],
    },
    {
      code: 'var a={\nb:1,\nc:2\n}\nvar d={\ne:3,\nf:4\n}',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: '*', next: 'singleline-var' },
      ],
    },
  ],
  invalid: [
    //----------------------------------------------------------------------
    // wildcard
    //----------------------------------------------------------------------

    {
      code: 'foo();\n\nfoo();',
      output: 'foo();\nfoo();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'foo();\n\n//comment\nfoo();',
      output: 'foo();\n//comment\nfoo();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '    foo();\n    \n    //comment\n    foo();',
      output: '    foo();\n    //comment\n    foo();',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'if (a) {}\n\nfor (;;) {}',
      output: 'if (a) {}\nfor (;;) {}',
      options: [{ blankLine: 'never', prev: '*', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'foo();\nfoo();',
      output: 'foo();\n\nfoo();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: '    function a() {}\n    do {} while (a)',
      output: '    function a() {}\n\n    do {} while (a)',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'foo();//trailing-comment\n//comment\n//comment\nfoo();',
      output: 'foo();//trailing-comment\n\n//comment\n//comment\nfoo();',
      options: [{ blankLine: 'always', prev: '*', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // block-like
    //----------------------------------------------------------------------

    {
      code: '{}\n\nfoo()',
      output: '{}\nfoo()',
      options: [{ blankLine: 'never', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '{}\nfoo()',
      output: '{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){}\nfoo()',
      output: 'if(a){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){}else{}\nfoo()',
      output: 'if(a){}else{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){}else if(b){}\nfoo()',
      output: 'if(a){}else if(b){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){}else if(b){}else{}\nfoo()',
      output: 'if(a){}else if(b){}else{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'switch(a){}\nfoo()',
      output: 'switch(a){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'switch(a){case 0:}\nfoo()',
      output: 'switch(a){case 0:}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{}catch(e){}\nfoo()',
      output: 'try{}catch(e){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{}finally{}\nfoo()',
      output: 'try{}finally{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{}catch(e){}finally{}\nfoo()',
      output: 'try{}catch(e){}finally{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'while(a){}\nfoo()',
      output: 'while(a){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'do{}while(a)\nfoo()',
      output: 'do{}while(a)\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(;;){}\nfoo()',
      output: 'for(;;){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a in b){}\nfoo()',
      output: 'for(a in b){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a of b){}\nfoo()',
      output: 'for(a of b){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'a=function(){}\nfoo()',
      output: 'a=function(){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'a=()=>{}\nfoo()',
      output: 'a=()=>{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'function a(){}\nfoo()',
      output: 'function a(){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'let a=function(){}\nfoo()',
      output: 'let a=function(){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // directive
    //----------------------------------------------------------------------

    {
      code: '"use strict"\n\nfoo()',
      output: '"use strict"\nfoo()',
      options: [{ blankLine: 'never', prev: 'directive', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '"use strict"\nfoo()',
      output: '"use strict"\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'directive', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: "'use strict'\nfoo()",
      output: "'use strict'\n\nfoo()",
      options: [{ blankLine: 'always', prev: 'directive', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: "'use asm'\nfoo()",
      output: "'use asm'\n\nfoo()",
      options: [{ blankLine: 'always', prev: 'directive', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // multiline-block-like
    //----------------------------------------------------------------------

    {
      code: '{\n}\n\nfoo()',
      output: '{\n}\nfoo()',
      options: [{ blankLine: 'never', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '{\n}\nfoo()',
      output: '{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){\n}\nfoo()',
      output: 'if(a){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){\n}else{\n}\nfoo()',
      output: 'if(a){\n}else{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){\n}else if(b){\n}\nfoo()',
      output: 'if(a){\n}else if(b){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a){\n}else if(b){\n}else{\n}\nfoo()',
      output: 'if(a){\n}else if(b){\n}else{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'switch(a){\n}\nfoo()',
      output: 'switch(a){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{\n}catch(e){\n}\nfoo()',
      output: 'try{\n}catch(e){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{\n}finally{\n}\nfoo()',
      output: 'try{\n}finally{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{\n}catch(e){\n}finally{\n}\nfoo()',
      output: 'try{\n}catch(e){\n}finally{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'while(a){\n}\nfoo()',
      output: 'while(a){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'do{\n}while(a)\nfoo()',
      output: 'do{\n}while(a)\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(;;){\n}\nfoo()',
      output: 'for(;;){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a in b){\n}\nfoo()',
      output: 'for(a in b){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a of b){\n}\nfoo()',
      output: 'for(a of b){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'a=function(){\n}\nfoo()',
      output: 'a=function(){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'a=()=>{\n}\nfoo()',
      output: 'a=()=>{\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'function a(){\n}\nfoo()',
      output: 'function a(){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'let a=function(){\n}\nfoo()',
      output: 'let a=function(){\n}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block-like', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // block
    //----------------------------------------------------------------------

    {
      code: '{}\n\nfoo()',
      output: '{}\nfoo()',
      options: [{ blankLine: 'never', prev: 'block', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '{}\nfoo()',
      output: '{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'block', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // empty
    //----------------------------------------------------------------------

    {
      code: ';\n\nfoo()',
      output: ';\nfoo()',
      options: [{ blankLine: 'never', prev: 'empty', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: ';\nfoo()',
      output: ';\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'empty', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // expression
    //----------------------------------------------------------------------

    {
      code: 'foo()\n\nfoo()',
      output: 'foo()\nfoo()',
      options: [{ blankLine: 'never', prev: 'expression', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'foo()\nfoo()',
      output: 'foo()\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'expression', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // multiline-expression
    //----------------------------------------------------------------------

    {
      code: 'foo()\n\nfoo(\n\tx,\n\ty\n)',
      output: 'foo()\nfoo(\n\tx,\n\ty\n)',
      options: [
        { blankLine: 'never', prev: '*', next: 'multiline-expression' },
      ],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'foo()\nfoo(\n\tx,\n\ty\n)',
      output: 'foo()\n\nfoo(\n\tx,\n\ty\n)',
      options: [
        { blankLine: 'always', prev: '*', next: 'multiline-expression' },
      ],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code:
        '() => {\n\tsomeArray.forEach(\n\t\tx => doSomething(x)\n\t);\n\treturn theThing;\n}',
      output:
        '() => {\n\tsomeArray.forEach(\n\t\tx => doSomething(x)\n\t);\n\n\treturn theThing;\n}',
      options: [
        { blankLine: 'always', prev: 'multiline-expression', next: 'return' },
      ],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // break
    //----------------------------------------------------------------------

    {
      code: 'while(a){break\n\nfoo()}',
      output: 'while(a){break\nfoo()}',
      options: [{ blankLine: 'never', prev: 'break', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'switch(a){case 0:break\n\nfoo()}',
      output: 'switch(a){case 0:break\nfoo()}',
      options: [{ blankLine: 'never', prev: 'break', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'while(a){break\nfoo()}',
      output: 'while(a){break\n\nfoo()}',
      options: [{ blankLine: 'always', prev: 'break', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'switch(a){case 0:break\nfoo()}',
      output: 'switch(a){case 0:break\n\nfoo()}',
      options: [{ blankLine: 'always', prev: 'break', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // case
    //----------------------------------------------------------------------

    {
      code: 'switch(a){case 0:\nfoo()\n\ndefault:}',
      output: 'switch(a){case 0:\nfoo()\ndefault:}',
      options: [{ blankLine: 'never', prev: 'case', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'switch(a){case 0:\nfoo()\ndefault:}',
      output: 'switch(a){case 0:\nfoo()\n\ndefault:}',
      options: [{ blankLine: 'always', prev: 'case', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // class
    //----------------------------------------------------------------------

    {
      code: 'class A{}\n\nfoo()',
      output: 'class A{}\nfoo()',
      options: [{ blankLine: 'never', prev: 'class', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'class A{}\nfoo()',
      output: 'class A{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'class', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // const
    //----------------------------------------------------------------------

    {
      code: 'const a=1\n\nfoo()',
      output: 'const a=1\nfoo()',
      options: [{ blankLine: 'never', prev: 'const', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'const a=1\nfoo()',
      output: 'const a=1\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'const', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // continue
    //----------------------------------------------------------------------

    {
      code: 'while(a){continue\n\nfoo()}',
      output: 'while(a){continue\nfoo()}',
      options: [{ blankLine: 'never', prev: 'continue', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'while(a){continue\nfoo()}',
      output: 'while(a){continue\n\nfoo()}',
      options: [{ blankLine: 'always', prev: 'continue', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // debugger
    //----------------------------------------------------------------------

    {
      code: 'debugger\n\nfoo()',
      output: 'debugger\nfoo()',
      options: [{ blankLine: 'never', prev: 'debugger', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'debugger\nfoo()',
      output: 'debugger\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'debugger', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // default
    //----------------------------------------------------------------------

    {
      code: 'switch(a){default:\nfoo()\n\ncase 0:}',
      output: 'switch(a){default:\nfoo()\ncase 0:}',
      options: [{ blankLine: 'never', prev: 'default', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'switch(a){default:\nfoo()\ncase 0:}',
      output: 'switch(a){default:\nfoo()\n\ncase 0:}',
      options: [{ blankLine: 'always', prev: 'default', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // do
    //----------------------------------------------------------------------

    {
      code: 'do;while(a)\n\nfoo()',
      output: 'do;while(a)\nfoo()',
      options: [{ blankLine: 'never', prev: 'do', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'do;while(a)\nfoo()',
      output: 'do;while(a)\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'do', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // export
    //----------------------------------------------------------------------

    {
      code: 'export default 1\n\nfoo()',
      output: 'export default 1\nfoo()',
      options: [{ blankLine: 'never', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'export let a=1\n\nfoo()',
      output: 'export let a=1\nfoo()',
      options: [{ blankLine: 'never', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a = 0;export {a}\n\nfoo()',
      output: 'var a = 0;export {a}\nfoo()',
      options: [{ blankLine: 'never', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'export default 1\nfoo()',
      output: 'export default 1\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'export let a=1\nfoo()',
      output: 'export let a=1\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'var a = 0;export {a}\nfoo()',
      output: 'var a = 0;export {a}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'export', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // for
    //----------------------------------------------------------------------

    {
      code: 'for(;;);\n\nfoo()',
      output: 'for(;;);\nfoo()',
      options: [{ blankLine: 'never', prev: 'for', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'for(a in b);\n\nfoo()',
      output: 'for(a in b);\nfoo()',
      options: [{ blankLine: 'never', prev: 'for', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'for(a of b);\n\nfoo()',
      output: 'for(a of b);\nfoo()',
      options: [{ blankLine: 'never', prev: 'for', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'for(;;);\nfoo()',
      output: 'for(;;);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'for', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a in b);\nfoo()',
      output: 'for(a in b);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'for', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'for(a of b);\nfoo()',
      output: 'for(a of b);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'for', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // function
    //----------------------------------------------------------------------

    {
      code: 'function foo(){}\n\nfoo()',
      output: 'function foo(){}\nfoo()',
      options: [{ blankLine: 'never', prev: 'function', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'function foo(){}\nfoo()',
      output: 'function foo(){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'function', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'async function foo(){}\nfoo()',
      output: 'async function foo(){}\n\nfoo()',
      options: [
        { blankLine: 'never', prev: '*', next: '*' },
        { blankLine: 'always', prev: 'function', next: '*' },
      ],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // if
    //----------------------------------------------------------------------

    {
      code: 'if(a);\n\nfoo()',
      output: 'if(a);\nfoo()',
      options: [{ blankLine: 'never', prev: 'if', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'if(a);else;\n\nfoo()',
      output: 'if(a);else;\nfoo()',
      options: [{ blankLine: 'never', prev: 'if', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'if(a);\nfoo()',
      output: 'if(a);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'if', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'if(a);else;\nfoo()',
      output: 'if(a);else;\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'if', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // iife
    //----------------------------------------------------------------------

    {
      code: '(function(){\n})()\n\nvar a = 2;',
      output: '(function(){\n})()\nvar a = 2;',
      options: [{ blankLine: 'never', prev: 'iife', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '+(function(){\n})()\n\nvar a = 2;',
      output: '+(function(){\n})()\nvar a = 2;',
      options: [{ blankLine: 'never', prev: 'iife', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: '(function(){\n})()\nvar a = 2;',
      output: '(function(){\n})()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: '+(function(){\n})()\nvar a = 2;',
      output: '+(function(){\n})()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    // Optional chaining
    {
      code: '(function(){\n})?.()\nvar a = 2;',
      output: '(function(){\n})?.()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
      parserOptions: { ecmaVersion: 2020 },
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'void (function(){\n})?.()\nvar a = 2;',
      output: 'void (function(){\n})?.()\n\nvar a = 2;',
      options: [{ blankLine: 'always', prev: 'iife', next: '*' }],
      parserOptions: { ecmaVersion: 2020 },
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // import
    //----------------------------------------------------------------------

    {
      code: "import a from 'a'\n\nfoo()",
      output: "import a from 'a'\nfoo()",
      options: [{ blankLine: 'never', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: "import * as a from 'a'\n\nfoo()",
      output: "import * as a from 'a'\nfoo()",
      options: [{ blankLine: 'never', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: "import {a} from 'a'\n\nfoo()",
      output: "import {a} from 'a'\nfoo()",
      options: [{ blankLine: 'never', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: "import a from 'a'\nfoo()",
      output: "import a from 'a'\n\nfoo()",
      options: [{ blankLine: 'always', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: "import * as a from 'a'\nfoo()",
      output: "import * as a from 'a'\n\nfoo()",
      options: [{ blankLine: 'always', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: "import {a} from 'a'\nfoo()",
      output: "import {a} from 'a'\n\nfoo()",
      options: [{ blankLine: 'always', prev: 'import', next: '*' }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // let
    //----------------------------------------------------------------------

    {
      code: 'let a\n\nfoo()',
      output: 'let a\nfoo()',
      options: [{ blankLine: 'never', prev: 'let', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'let a\nfoo()',
      output: 'let a\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'let', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // return
    //----------------------------------------------------------------------

    {
      code: 'function foo(){return\n\nfoo()}',
      output: 'function foo(){return\nfoo()}',
      options: [{ blankLine: 'never', prev: 'return', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'function foo(){return\nfoo()}',
      output: 'function foo(){return\n\nfoo()}',
      options: [{ blankLine: 'always', prev: 'return', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // switch
    //----------------------------------------------------------------------

    {
      code: 'switch(a){}\n\nfoo()',
      output: 'switch(a){}\nfoo()',
      options: [{ blankLine: 'never', prev: 'switch', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'switch(a){}\nfoo()',
      output: 'switch(a){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'switch', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // throw
    //----------------------------------------------------------------------

    {
      code: 'throw a\n\nfoo()',
      output: 'throw a\nfoo()',
      options: [{ blankLine: 'never', prev: 'throw', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'throw a\nfoo()',
      output: 'throw a\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'throw', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // try
    //----------------------------------------------------------------------

    {
      code: 'try{}catch(e){}\n\nfoo()',
      output: 'try{}catch(e){}\nfoo()',
      options: [{ blankLine: 'never', prev: 'try', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'try{}finally{}\n\nfoo()',
      output: 'try{}finally{}\nfoo()',
      options: [{ blankLine: 'never', prev: 'try', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'try{}catch(e){}finally{}\n\nfoo()',
      output: 'try{}catch(e){}finally{}\nfoo()',
      options: [{ blankLine: 'never', prev: 'try', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'try{}catch(e){}\nfoo()',
      output: 'try{}catch(e){}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'try', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{}finally{}\nfoo()',
      output: 'try{}finally{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'try', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'try{}catch(e){}finally{}\nfoo()',
      output: 'try{}catch(e){}finally{}\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'try', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // var
    //----------------------------------------------------------------------

    {
      code: 'var a\n\nfoo()',
      output: 'var a\nfoo()',
      options: [{ blankLine: 'never', prev: 'var', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a\nfoo()',
      output: 'var a\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'var', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // while
    //----------------------------------------------------------------------

    {
      code: 'while(a);\n\nfoo()',
      output: 'while(a);\nfoo()',
      options: [{ blankLine: 'never', prev: 'while', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'while(a);\nfoo()',
      output: 'while(a);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'while', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // with
    //----------------------------------------------------------------------

    {
      code: 'with(a);\n\nfoo()',
      output: 'with(a);\nfoo()',
      options: [{ blankLine: 'never', prev: 'with', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'with(a);\nfoo()',
      output: 'with(a);\n\nfoo()',
      options: [{ blankLine: 'always', prev: 'with', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // multiline-const
    //----------------------------------------------------------------------

    {
      code: 'const a={\nb:1,\nc:2\n}\n\nconst d=3',
      output: 'const a={\nb:1,\nc:2\n}\nconst d=3',
      options: [{ blankLine: 'never', prev: 'multiline-const', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'const a={\nb:1,\nc:2\n}\nconst d=3',
      output: 'const a={\nb:1,\nc:2\n}\n\nconst d=3',
      options: [{ blankLine: 'always', prev: 'multiline-const', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'const a=1\n\nconst b={\nc:2,\nd:3\n}',
      output: 'const a=1\nconst b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'never', prev: '*', next: 'multiline-const' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'const a=1\nconst b={\nc:2,\nd:3\n}',
      output: 'const a=1\n\nconst b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'always', prev: '*', next: 'multiline-const' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // multiline-let
    //----------------------------------------------------------------------

    {
      code: 'let a={\nb:1,\nc:2\n}\n\nlet d=3',
      output: 'let a={\nb:1,\nc:2\n}\nlet d=3',
      options: [{ blankLine: 'never', prev: 'multiline-let', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'let a={\nb:1,\nc:2\n}\nlet d=3',
      output: 'let a={\nb:1,\nc:2\n}\n\nlet d=3',
      options: [{ blankLine: 'always', prev: 'multiline-let', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'let a=1\n\nlet b={\nc:2,\nd:3\n}',
      output: 'let a=1\nlet b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'never', prev: '*', next: 'multiline-let' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'let a=1\nlet b={\nc:2,\nd:3\n}',
      output: 'let a=1\n\nlet b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'always', prev: '*', next: 'multiline-let' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // multiline-var
    //----------------------------------------------------------------------

    {
      code: 'var a={\nb:1,\nc:2\n}\n\nvar d=3',
      output: 'var a={\nb:1,\nc:2\n}\nvar d=3',
      options: [{ blankLine: 'never', prev: 'multiline-var', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a={\nb:1,\nc:2\n}\nvar d=3',
      output: 'var a={\nb:1,\nc:2\n}\n\nvar d=3',
      options: [{ blankLine: 'always', prev: 'multiline-var', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'var a=1\n\nvar b={\nc:2,\nd:3\n}',
      output: 'var a=1\nvar b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'never', prev: '*', next: 'multiline-var' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a=1\nvar b={\nc:2,\nd:3\n}',
      output: 'var a=1\n\nvar b={\nc:2,\nd:3\n}',
      options: [{ blankLine: 'always', prev: '*', next: 'multiline-var' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // single line const
    //----------------------------------------------------------------------

    {
      code: 'const a=1\n\nconst b=2',
      output: 'const a=1\nconst b=2',
      options: [{ blankLine: 'never', prev: 'singleline-const', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'const a=1\nconst b=2',
      output: 'const a=1\n\nconst b=2',
      options: [{ blankLine: 'always', prev: 'singleline-const', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'const a=1\n\nconst b=2',
      output: 'const a=1\nconst b=2',
      options: [{ blankLine: 'never', prev: '*', next: 'singleline-const' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'const a=1\nconst b=2',
      output: 'const a=1\n\nconst b=2',
      options: [{ blankLine: 'always', prev: '*', next: 'singleline-const' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // single line let
    //----------------------------------------------------------------------

    {
      code: 'let a=1\n\nlet b=2',
      output: 'let a=1\nlet b=2',
      options: [{ blankLine: 'never', prev: 'singleline-let', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'let a=1\nlet b=2',
      output: 'let a=1\n\nlet b=2',
      options: [{ blankLine: 'always', prev: 'singleline-let', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'let a=1\n\nlet b=2',
      output: 'let a=1\nlet b=2',
      options: [{ blankLine: 'never', prev: '*', next: 'singleline-let' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'let a=1\nlet b=2',
      output: 'let a=1\n\nlet b=2',
      options: [{ blankLine: 'always', prev: '*', next: 'singleline-let' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },

    //----------------------------------------------------------------------
    // single line var
    //----------------------------------------------------------------------

    {
      code: 'var a=1\n\nvar b=2',
      output: 'var a=1\nvar b=2',
      options: [{ blankLine: 'never', prev: 'singleline-var', next: '*' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a=1\nvar b=2',
      output: 'var a=1\n\nvar b=2',
      options: [{ blankLine: 'always', prev: 'singleline-var', next: '*' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
    {
      code: 'var a=1\n\nvar b=2',
      output: 'var a=1\nvar b=2',
      options: [{ blankLine: 'never', prev: '*', next: 'singleline-var' }],
      errors: [{ messageId: 'unexpectedBlankLine' }],
    },
    {
      code: 'var a=1\nvar b=2',
      output: 'var a=1\n\nvar b=2',
      options: [{ blankLine: 'always', prev: '*', next: 'singleline-var' }],
      errors: [{ messageId: 'expectedBlankLine' }],
    },
  ],
});
