import rule from '../../src/rules/lines-around-comment';
import { unIndent } from './indent/utils';
import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('lines-around-comment', rule, {
  valid: [
    // default rules
    `
bar();

/** block block block
 * block
 */

var a = 1;
    `,
    `
bar();

/** block block block
 * block
 */
var a = 1;
    `,
    `
bar();
// line line line
var a = 1;
    `,
    `
bar();

// line line line
var a = 1;
    `,
    `
bar();
// line line line

var a = 1;
    `,

    // line comments
    {
      code: `
bar();
// line line line

var a = 1;
      `,
      options: [{ afterLineComment: true }],
    },
    {
      code: `
foo();

// line line line
var a = 1;
      `,
      options: [{ beforeLineComment: true }],
    },
    {
      code: `
foo();

// line line line

var a = 1;
      `,
      options: [{ beforeLineComment: true, afterLineComment: true }],
    },
    {
      code: `
foo();

// line line line
// line line

var a = 1;
      `,
      options: [{ beforeLineComment: true, afterLineComment: true }],
    },
    {
      code: '// line line line\n// line line',
      options: [{ beforeLineComment: true, afterLineComment: true }],
    },

    // block comments
    {
      code: `
bar();

/** A Block comment with a an empty line after
 *
 */
var a = 1;
      `,
      options: [{ afterBlockComment: false, beforeBlockComment: true }],
    },
    {
      code: `
bar();

/** block block block
 * block
 */
var a = 1;
      `,
      options: [{ afterBlockComment: false }],
    },
    {
      code: '/** \nblock \nblock block\n */\n/* block \n block \n */',
      options: [{ afterBlockComment: true, beforeBlockComment: true }],
    },
    {
      code: `
bar();

/** block block block
 * block
 */

var a = 1;
      `,
      options: [{ afterBlockComment: true, beforeBlockComment: true }],
    },

    // inline comments (should not ever warn)
    {
      code: `
foo(); // An inline comment with a an empty line after
var a = 1;
      `,
      options: [{ afterLineComment: true, beforeLineComment: true }],
    },
    {
      code: noFormat`
foo();
bar(); /* An inline block comment with a an empty line after
 *
 */
var a = 1;
      `,
      options: [{ beforeBlockComment: true }],
    },

    // mixed comment (some block & some line)
    {
      code: `
bar();

/** block block block
 * block
 */
//line line line
var a = 1;
      `,
      options: [{ afterBlockComment: true }],
    },
    {
      code: `
bar();

/** block block block
 * block
 */
//line line line
var a = 1;
      `,
      options: [{ beforeLineComment: true }],
    },

    // check for block start comments
    {
      code: unIndent`
var a,

// line
b;
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
function foo() {
  // line at block start
  var g = 1;
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
var foo = function () {
  // line at block start
  var g = 1;
};
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
var foo = function () {
  // line at block start
};
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
if (true) {
  // line at block start
  var g = 1;
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
if (true) {
  // line at block start
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
if (true) {
  bar();
} else {
  // line at block start
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    // line at switch case start
    break;
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    break;

  default:
    // line at switch case start
    break;
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
function foo() {
  /* block comment at block start */
  var g = 1;
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
var foo = function () {
  /* block comment at block start */
  var g = 1;
};
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
if (true) {
  /* block comment at block start */
  var g = 1;
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
while (true) {
  /*
block comment at block start
 */
  var g = 1;
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
class A {
  /**
   * hi
   */
  constructor() {}
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
class A {
  /**
   * hi
   */
  constructor() {}
}
      `,
      options: [
        {
          allowClassStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
class A {
  /**
   * hi
   */
  constructor() {}
}
      `,
      options: [
        {
          allowBlockStart: false,
          allowClassStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    /* block comment at switch case start */
    break;
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    break;

  default:
    /* block comment at switch case start */
    break;
}
      `,
      options: [
        {
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
class C {
  static {
    // line comment
  }

  static {
    // line comment
    foo();
  }
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
    },
    {
      code: `
class C {
  static {
    /* block comment */
  }

  static {
    /* block
       comment */
  }

  static {
    /* block comment */
    foo();
  }

  static {
    /* block
       comment */
    foo();
  }
}
      `,
      options: [
        {
          beforeBlockComment: true,
          allowBlockStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
    },

    // check for block end comments
    {
      code: `
var a,
  // line

  b;
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
function foo() {
  var g = 91;
  // line at block end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
function foo() {
  var g = 61;

  // line at block end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
var foo = function () {
  var g = 1;

  // line at block end
};
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
if (true) {
  var g = 1;
  // line at block end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
if (true) {
  var g = 1;

  // line at block end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    var g = 1;

  // line at switch case end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    break;

  default:
    var g = 1;

  // line at switch case end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  // line at block start and end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  // line at block start and end
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  // line at block start and end
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  // line at block start and end
}
      `,
      options: [
        {
          afterLineComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  // line at block start and end
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
    },
    {
      code: `
function foo() {
  var g = 1;
  /* block comment at block end */
}
      `,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
var foo = function () {
  var g = 1;
  /* block comment at block end */
};
      `,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
if (true) {
  var g = 1;
  /* block comment at block end */
}
      `,
      options: [
        {
          beforeBlockComment: false,
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
if (true) {
  var g = 1;

  /* block comment at block end */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
while (true) {
  var g = 1;

  /*
block comment at block end
 */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
class B {
  constructor() {}

  /**
   * hi
   */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
class B {
  constructor() {}

  /**
   * hi
   */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
class B {
  constructor() {}

  /**
   * hi
   */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: false,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    var g = 1;

  /* block comment at switch case end */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
switch ('foo') {
  case 'foo':
    break;

  default:
    var g = 1;

  /* block comment at switch case end */
}
      `,
      options: [
        {
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
    },
    {
      code: `
class C {
  static {
    // line comment
  }

  static {
    foo();
    // line comment
  }
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
    },
    {
      code: `
class C {
  static {
    /* block comment */
  }

  static {
    /* block
       comment */
  }

  static {
    foo();
    /* block comment */
  }

  static {
    foo();
    /* block
       comment */
  }
}
      `,
      options: [
        {
          beforeBlockComment: false, // default is `true`
          afterBlockComment: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
    },

    // check for object start comments
    {
      code: 'var a,\n\n' + '// line\n' + 'b;',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
    },
    {
      code: 'var obj = {\n' + '  // line at object start\n' + '  g: 1\n' + '};',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    // hi\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
    },
    {
      code:
        'var obj = {\n' +
        '  /* block comment at object start*/\n' +
        '  g: 1\n' +
        '};',
      options: [
        {
          beforeBlockComment: true,
          allowObjectStart: true,
        },
      ],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
    },
    {
      code:
        'const {\n' + '  // line at object start\n' + '  g: a\n' + '} = {};',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'const {\n' + '  // line at object start\n' + '  g\n' + '} = {};',
      options: [
        {
          beforeLineComment: true,
          allowObjectStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const {\n' +
        '  /* block comment at object-like start*/\n' +
        '  g: a\n' +
        '} = {};',
      options: [
        {
          beforeBlockComment: true,
          allowObjectStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const {\n' +
        '  /* block comment at object-like start*/\n' +
        '  g\n' +
        '} = {};',
      options: [
        {
          beforeBlockComment: true,
          allowObjectStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },

    // check for object end comments
    {
      code: 'var a,\n' + '// line\n\n' + 'b;',
      options: [
        {
          afterLineComment: true,
          allowObjectEnd: true,
        },
      ],
    },
    {
      code: 'var obj = {\n' + '  g: 1\n' + '  // line at object end\n' + '};',
      options: [
        {
          afterLineComment: true,
          allowObjectEnd: true,
        },
      ],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    // hi\n' +
        '  }\n' +
        '}',
      options: [
        {
          afterLineComment: true,
          allowObjectEnd: true,
        },
      ],
    },
    {
      code:
        'var obj = {\n' +
        '  g: 1\n' +
        '  \n' +
        '  /* block comment at object end*/\n' +
        '};',
      options: [
        {
          afterBlockComment: true,
          allowObjectEnd: true,
        },
      ],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    \n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '  }\n' +
        '}',
      options: [
        {
          afterBlockComment: true,
          allowObjectEnd: true,
        },
      ],
    },
    {
      code: 'const {\n' + '  g: a\n' + '  // line at object end\n' + '} = {};',
      options: [
        {
          afterLineComment: true,
          allowObjectEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'const {\n' + '  g\n' + '  // line at object end\n' + '} = {};',
      options: [
        {
          afterLineComment: true,
          allowObjectEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const {\n' +
        '  g: a\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '} = {};',
      options: [
        {
          afterBlockComment: true,
          allowObjectEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const {\n' +
        '  g\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '} = {};',
      options: [
        {
          afterBlockComment: true,
          allowObjectEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },

    // check for array start comments
    {
      code: 'var a,\n\n' + '// line\n' + 'b;',
      options: [
        {
          beforeLineComment: true,
          allowArrayStart: true,
        },
      ],
    },
    {
      code: 'var arr = [\n' + '  // line at array start\n' + '  1\n' + '];',
      options: [
        {
          beforeLineComment: true,
          allowArrayStart: true,
        },
      ],
    },
    {
      code:
        'var arr = [\n' +
        '  /* block comment at array start*/\n' +
        '  1\n' +
        '];',
      options: [
        {
          beforeBlockComment: true,
          allowArrayStart: true,
        },
      ],
    },
    {
      code: 'const [\n' + '  // line at array start\n' + '  a\n' + '] = [];',
      options: [
        {
          beforeLineComment: true,
          allowArrayStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const [\n' +
        '  /* block comment at array start*/\n' +
        '  a\n' +
        '] = [];',
      options: [
        {
          beforeBlockComment: true,
          allowArrayStart: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },

    // check for array end comments
    {
      code: 'var a,\n' + '// line\n\n' + 'b;',
      options: [
        {
          afterLineComment: true,
          allowArrayEnd: true,
        },
      ],
    },
    {
      code: 'var arr = [\n' + '  1\n' + '  // line at array end\n' + '];',
      options: [
        {
          afterLineComment: true,
          allowArrayEnd: true,
        },
      ],
    },
    {
      code:
        'var arr = [\n' +
        '  1\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '];',
      options: [
        {
          afterBlockComment: true,
          allowArrayEnd: true,
        },
      ],
    },
    {
      code: 'const [\n' + '  a\n' + '  // line at array end\n' + '] = [];',
      options: [
        {
          afterLineComment: true,
          allowArrayEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code:
        'const [\n' +
        '  a\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '] = [];',
      options: [
        {
          afterBlockComment: true,
          allowArrayEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
    },

    // ignorePattern
    {
      code:
        'foo;\n\n' +
        '/* eslint-disable no-underscore-dangle */\n\n' +
        'this._values = values;\n' +
        'this._values2 = true;\n' +
        '/* eslint-enable no-underscore-dangle */\n' +
        'bar',
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
        },
      ],
    },
    'foo;\n/* eslint */',
    'foo;\n/* jshint */',
    'foo;\n/* jslint */',
    'foo;\n/* istanbul */',
    'foo;\n/* global */',
    'foo;\n/* globals */',
    'foo;\n/* exported */',
    'foo;\n/* jscs */',
    {
      code: `
foo;
/* this is pragmatic */
      `,
      options: [{ ignorePattern: 'pragma' }],
    },
    {
      code: `
foo;
/* this is pragmatic */
      `,
      options: [{ applyDefaultIgnorePatterns: false, ignorePattern: 'pragma' }],
    },
  ],
  invalid: [
    // default rules
    {
      code: `
bar();
/** block block block
 * block
 */
var a = 1;
      `,
      output: `
bar();

/** block block block
 * block
 */
var a = 1;
      `,
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },

    // line comments
    {
      code: `
baz();
// A line comment with no empty line after
var a = 1;
      `,
      output: `
baz();
// A line comment with no empty line after

var a = 1;
      `,
      options: [{ afterLineComment: true }],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line }],
    },
    {
      code: `
baz();
// A line comment with no empty line after
var a = 1;
      `,
      output: `
baz();

// A line comment with no empty line after
var a = 1;
      `,
      options: [{ beforeLineComment: true, afterLineComment: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line }],
    },
    {
      code: '// A line comment with no empty line after\nvar a = 1;',
      output: '// A line comment with no empty line after\n\nvar a = 1;',
      options: [{ beforeLineComment: true, afterLineComment: true }],
      errors: [
        { messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 1, column: 1 },
      ],
    },
    {
      code: unIndent`
baz();
// A line comment with no empty line after
var a = 1;
      `,
      output: unIndent`
baz();

// A line comment with no empty line after

var a = 1;
      `,
      options: [{ beforeLineComment: true, afterLineComment: true }],
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 2 },
      ],
    },

    // block comments
    {
      code: unIndent`
bar();
/**
 * block block block
 */
var a = 1;
      `,
      output: unIndent`
bar();

/**
 * block block block
 */

var a = 1;
      `,
      options: [{ afterBlockComment: true, beforeBlockComment: true }],
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 },
      ],
    },
    {
      code: unIndent`
bar();
/* first block comment */ /* second block comment */
var a = 1;
      `,
      output: unIndent`
bar();

/* first block comment */ /* second block comment */

var a = 1;
      `,
      options: [{ afterBlockComment: true, beforeBlockComment: true }],
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 },
      ],
    },
    {
      code: unIndent`
bar();
/* first block comment */ /* second block
 comment */
var a = 1;
      `,
      output: unIndent`
bar();

/* first block comment */ /* second block
 comment */

var a = 1;
      `,
      options: [{ afterBlockComment: true, beforeBlockComment: true }],
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 },
      ],
    },
    {
      code: unIndent`
bar();
/**
 * block block block
 */
var a = 1;
      `,
      output: unIndent`
bar();
/**
 * block block block
 */

var a = 1;
      `,
      options: [{ afterBlockComment: true, beforeBlockComment: false }],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
bar();
/**
 * block block block
 */
var a = 1;
      `,
      output: unIndent`
bar();

/**
 * block block block
 */
var a = 1;
      `,
      options: [{ afterBlockComment: false, beforeBlockComment: true }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
var a,
// line
b;
      `,
      output: unIndent`
var a,

// line
b;
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
function foo() {
  var a = 1;
  // line at block start
  var g = 1;
}
      `,
      output: unIndent`
function foo() {
  var a = 1;

  // line at block start
  var g = 1;
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockStart: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
var a,
// line
b;
      `,
      output: unIndent`
var a,
// line

b;
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
function foo() {
  var a = 1;

  // line at block start
  var g = 1;
}
      `,
      output: unIndent`
function foo() {
  var a = 1;

  // line at block start

  var g = 1;
}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 4 }],
    },
    {
      code: unIndent`
switch ('foo') {
  case 'foo':
    // line at switch case start
    break;
}
      `,
      output: unIndent`
switch ('foo') {
  case 'foo':

    // line at switch case start
    break;
}
      `,
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
switch ('foo') {
  case 'foo':
    break;

  default:
    // line at switch case start
    break;
}
      `,
      output: unIndent`
switch ('foo') {
  case 'foo':
    break;

  default:

    // line at switch case start
    break;
}
      `,
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 6 }],
    },
    {
      code: unIndent`
while (true) {
  // line at block start and end
}
      `,
      output: unIndent`
while (true) {
  // line at block start and end

}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockStart: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
while (true) {
  // line at block start and end
}
      `,
      output: unIndent`
while (true) {

  // line at block start and end
}
      `,
      options: [
        {
          beforeLineComment: true,
          allowBlockEnd: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
class A {
  // line at class start
  constructor() {}
}
      `,
      output: unIndent`
class A {

  // line at class start
  constructor() {}
}
      `,
      options: [
        {
          beforeLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
class A {
  // line at class start
  constructor() {}
}
      `,
      output: unIndent`
class A {

  // line at class start
  constructor() {}
}
      `,
      options: [
        {
          allowBlockStart: true,
          allowClassStart: false,
          beforeLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
class B {
  constructor() {}

  // line at class end
}
      `,
      output: unIndent`
class B {
  constructor() {}

  // line at class end

}
      `,
      options: [
        {
          afterLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 4 }],
    },
    {
      code: unIndent`
class B {
  constructor() {}

  // line at class end
}
      `,
      output: unIndent`
class B {
  constructor() {}

  // line at class end

}
      `,
      options: [
        {
          afterLineComment: true,
          allowBlockEnd: true,
          allowClassEnd: false,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 4 }],
    },
    {
      code: unIndent`
switch ('foo') {
  case 'foo':
    var g = 1;

  // line at switch case end
}
      `,
      output: unIndent`
switch ('foo') {
  case 'foo':
    var g = 1;

  // line at switch case end

}
      `,
      options: [
        {
          afterLineComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 5 }],
    },
    {
      code: unIndent`
switch ('foo') {
  case 'foo':
    break;

  default:
    var g = 1;

  // line at switch case end
}
      `,
      output: unIndent`
switch ('foo') {
  case 'foo':
    break;

  default:
    var g = 1;

  // line at switch case end

}
      `,
      options: [
        {
          afterLineComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 8 }],
    },
    {
      code: unIndent`
class C {
  // line comment
  static {}
}
      `,
      output: unIndent`
class C {
  // line comment

  static {}
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: unIndent`
class C {
  /* block
     comment */
  static {}
}
      `,
      output: unIndent`
class C {
  /* block
     comment */

  static {}
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: unIndent`
class C {
  static
  // line comment
  {}
}
      `,
      output: unIndent`
class C {
  static

  // line comment

  {}
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 },
      ],
    },
    {
      code: unIndent`
class C {
  static
    /* block
       comment */
  {}
}
      `,
      output: unIndent`
class C {
  static

    /* block
       comment */

  {}
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 },
      ],
    },
    {
      code: unIndent`
class C {
  static {
    // line comment
    foo();
  }
}
      `,
      output: unIndent`
class C {
  static {
    // line comment

    foo();
  }
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
class C {
  static {
    /* block
       comment */
    foo();
  }
}
      `,
      output: unIndent`
class C {
  static {
    /* block
       comment */

    foo();
  }
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code: unIndent`
class C {
  static {
    foo();
    // line comment
  }
}
      `,
      output: unIndent`
class C {
  static {
    foo();

    // line comment
  }
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 4 }],
    },
    {
      code: unIndent`
class C {
  static {
    foo();
    /* block
       comment */
  }
}
      `,
      output: unIndent`
class C {
  static {
    foo();

    /* block
       comment */
  }
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },
    {
      code: unIndent`
class C {
  static {
    foo();
    // line comment
    bar();
  }
}
      `,
      output: unIndent`
class C {
  static {
    foo();

    // line comment

    bar();
  }
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 4 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 4 },
      ],
    },
    {
      code: unIndent`
class C {
  static {
    foo();
    /* block
       comment */
    bar();
  }
}
      `,
      output: unIndent`
class C {
  static {
    foo();

    /* block
       comment */

    bar();
  }
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 4 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 },
      ],
    },
    {
      code: unIndent`
class C {
  static {}
  // line comment
}
      `,
      output: unIndent`
class C {
  static {}

  // line comment
}
      `,
      options: [
        {
          beforeLineComment: true,
          afterLineComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: unIndent`
class C {
  static {}
  /* block
     comment */
}
      `,
      output: unIndent`
class C {
  static {}

  /* block
     comment */
}
      `,
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowClassStart: true,
          allowClassEnd: true,
        },
      ],
      parserOptions: { ecmaVersion: 2022 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },

    // object start comments
    {
      code: 'var obj = {\n' + '  // line at object start\n' + '  g: 1\n' + '};',
      output:
        'var obj = {\n' +
        '\n' +
        '  // line at object start\n' +
        '  g: 1\n' +
        '};',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    // hi\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      output:
        'function hi() {\n' +
        '  return {\n' +
        '\n' +
        '    // hi\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code:
        'var obj = {\n' +
        '  /* block comment at object start*/\n' +
        '  g: 1\n' +
        '};',
      output:
        'var obj = {\n' +
        '\n' +
        '  /* block comment at object start*/\n' +
        '  g: 1\n' +
        '};',
      options: [
        {
          beforeBlockComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      output:
        'function hi() {\n' +
        '  return {\n' +
        '\n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '    test: function() {\n' +
        '    }\n' +
        '  }\n' +
        '}',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 3 }],
    },
    {
      code:
        'const {\n' + '  // line at object start\n' + '  g: a\n' + '} = {};',
      output:
        'const {\n' +
        '\n' +
        '  // line at object start\n' +
        '  g: a\n' +
        '} = {};',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code: 'const {\n' + '  // line at object start\n' + '  g\n' + '} = {};',
      output:
        'const {\n' +
        '\n' +
        '  // line at object start\n' +
        '  g\n' +
        '} = {};',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code:
        'const {\n' +
        '  /* block comment at object-like start*/\n' +
        '  g: a\n' +
        '} = {};',
      output:
        'const {\n' +
        '\n' +
        '  /* block comment at object-like start*/\n' +
        '  g: a\n' +
        '} = {};',
      options: [
        {
          beforeBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code:
        'const {\n' +
        '  /* block comment at object-like start*/\n' +
        '  g\n' +
        '} = {};',
      output:
        'const {\n' +
        '\n' +
        '  /* block comment at object-like start*/\n' +
        '  g\n' +
        '} = {};',
      options: [
        {
          beforeBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },

    // object end comments
    {
      code: 'var obj = {\n' + '  g: 1\n' + '  // line at object end\n' + '};',
      output:
        'var obj = {\n' +
        '  g: 1\n' +
        '  // line at object end\n' +
        '\n' +
        '};',
      options: [
        {
          afterLineComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    // hi\n' +
        '  }\n' +
        '}',
      output:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    // hi\n' +
        '\n' +
        '  }\n' +
        '}',
      options: [
        {
          afterLineComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 5 }],
    },
    {
      code:
        'var obj = {\n' +
        '  g: 1\n' +
        '  \n' +
        '  /* block comment at object end*/\n' +
        '};',
      output:
        'var obj = {\n' +
        '  g: 1\n' +
        '  \n' +
        '  /* block comment at object end*/\n' +
        '\n' +
        '};',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },
    {
      code:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    \n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '  }\n' +
        '}',
      output:
        'function hi() {\n' +
        '  return {\n' +
        '    test: function() {\n' +
        '    }\n' +
        '    \n' +
        '    /**\n' +
        '    * hi\n' +
        '    */\n' +
        '\n' +
        '  }\n' +
        '}',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 6 }],
    },
    {
      code: 'const {\n' + '  g: a\n' + '  // line at object end\n' + '} = {};',
      output:
        'const {\n' +
        '  g: a\n' +
        '  // line at object end\n' +
        '\n' +
        '} = {};',
      options: [
        {
          afterLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code: 'const {\n' + '  g\n' + '  // line at object end\n' + '} = {};',
      output:
        'const {\n' + '  g\n' + '  // line at object end\n' + '\n' + '} = {};',
      options: [
        {
          afterLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code:
        'const {\n' +
        '  g: a\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '} = {};',
      output:
        'const {\n' +
        '  g: a\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '\n' +
        '} = {};',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },
    {
      code:
        'const {\n' +
        '  g\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '} = {};',
      output:
        'const {\n' +
        '  g\n' +
        '  \n' +
        '  /* block comment at object-like end*/\n' +
        '\n' +
        '} = {};',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },

    // array start comments
    {
      code: 'var arr = [\n' + '  // line at array start\n' + '  1\n' + '];',
      output:
        'var arr = [\n' + '\n' + '  // line at array start\n' + '  1\n' + '];',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code:
        'var arr = [\n' +
        '  /* block comment at array start*/\n' +
        '  1\n' +
        '];',
      output:
        'var arr = [\n' +
        '\n' +
        '  /* block comment at array start*/\n' +
        '  1\n' +
        '];',
      options: [
        {
          beforeBlockComment: true,
        },
      ],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },
    {
      code: 'const [\n' + '  // line at array start\n' + '  a\n' + '] = [];',
      output:
        'const [\n' + '\n' + '  // line at array start\n' + '  a\n' + '] = [];',
      options: [
        {
          beforeLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Line, line: 2 }],
    },
    {
      code:
        'const [\n' +
        '  /* block comment at array start*/\n' +
        '  a\n' +
        '] = [];',
      output:
        'const [\n' +
        '\n' +
        '  /* block comment at array start*/\n' +
        '  a\n' +
        '] = [];',
      options: [
        {
          beforeBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 2 }],
    },

    // array end comments
    {
      code: 'var arr = [\n' + '  1\n' + '  // line at array end\n' + '];',
      output:
        'var arr = [\n' + '  1\n' + '  // line at array end\n' + '\n' + '];',
      options: [
        {
          afterLineComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code:
        'var arr = [\n' +
        '  1\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '];',
      output:
        'var arr = [\n' +
        '  1\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '\n' +
        '];',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },
    {
      code: 'const [\n' + '  a\n' + '  // line at array end\n' + '] = [];',
      output:
        'const [\n' + '  a\n' + '  // line at array end\n' + '\n' + '] = [];',
      options: [
        {
          afterLineComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Line, line: 3 }],
    },
    {
      code:
        'const [\n' +
        '  a\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '] = [];',
      output:
        'const [\n' +
        '  a\n' +
        '  \n' +
        '  /* block comment at array end*/\n' +
        '\n' +
        '] = [];',
      options: [
        {
          afterBlockComment: true,
        },
      ],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 4 }],
    },

    // ignorePattern
    {
      code:
        'foo;\n\n' +
        '/* eslint-disable no-underscore-dangle */\n\n' +
        'this._values = values;\n' +
        'this._values2 = true;\n' +
        '/* eslint-enable no-underscore-dangle */\n' +
        'bar',
      output:
        'foo;\n\n' +
        '/* eslint-disable no-underscore-dangle */\n\n' +
        'this._values = values;\n' +
        'this._values2 = true;\n' +
        '\n' +
        '/* eslint-enable no-underscore-dangle */\n' +
        '\n' +
        'bar',
      options: [
        {
          beforeBlockComment: true,
          afterBlockComment: true,
          applyDefaultIgnorePatterns: false,
        },
      ],
      errors: [
        { messageId: 'before', type: AST_TOKEN_TYPES.Block, line: 7 },
        { messageId: 'after', type: AST_TOKEN_TYPES.Block, line: 7 },
      ],
    },
    {
      code: 'foo;\n/* eslint */',
      output: 'foo;\n\n/* eslint */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* jshint */',
      output: 'foo;\n\n/* jshint */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* jslint */',
      output: 'foo;\n\n/* jslint */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* istanbul */',
      output: 'foo;\n\n/* istanbul */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* global */',
      output: 'foo;\n\n/* global */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* globals */',
      output: 'foo;\n\n/* globals */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* exported */',
      output: 'foo;\n\n/* exported */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: 'foo;\n/* jscs */',
      output: 'foo;\n\n/* jscs */',
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: `
foo;
/* something else */
      `,
      output: `
foo;

/* something else */
      `,
      options: [{ ignorePattern: 'pragma' }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
    {
      code: `
foo;
/* eslint */
      `,
      output: `
foo;

/* eslint */
      `,
      options: [{ applyDefaultIgnorePatterns: false }],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },

    // "fallthrough" patterns are not ignored by default
    {
      code: 'foo;\n/* fallthrough */',
      output: 'foo;\n\n/* fallthrough */',
      options: [],
      errors: [{ messageId: 'before', type: AST_TOKEN_TYPES.Block }],
    },
  ],
});
