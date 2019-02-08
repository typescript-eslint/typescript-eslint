/**
 * @fileoverview Requires any function or method that returns a Promise to be marked async
 * @author Josh Goldberg <https://github.com/joshuakgoldberg>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/promise-function-async'),
  RuleTester = require('eslint').RuleTester,
  path = require('path');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const rootDir = path.join(process.cwd(), 'tests/fixtures/');
const parserOptions = {
  ecmaVersion: 2018,
  tsconfigRootDir: rootDir,
  project: './tsconfig.json'
};

const messageId = 'missingAsync';

const ruleTester = new RuleTester({
  parserOptions,
  parser: '@typescript-eslint/parser'
});

ruleTester.run('promise-function-async', rule, {
  valid: [
    `
const nonAsyncNonPromiseArrowFunction = (n: number) => n;

function nonAsyncNonPromiseFunctionDeclaration(n: number) { return n; }

const asyncPromiseFunctionExpressionA = async function(p: Promise<void>) { return p; };
const asyncPromiseFunctionExpressionB = async function() { return new Promise<void>(); };

class Test {
  public nonAsyncNonPromiseArrowFunction = (n: number) => n;

  public nonAsyncNonPromiseMethod() {
    return 0;
  }

  public async asyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public async asyncPromiseMethodB() {
    return new Promise<void>();
  }
}
`
  ],
  invalid: [
    {
      code: `
const nonAsyncPromiseFunctionExpressionA = function(p: Promise<void>) { return p; };

const nonAsyncPromiseFunctionExpressionB = function() { return new Promise<void>(); };

function nonAsyncPromiseFunctionDeclarationA(p: Promise<void>) { return p; }

function nonAsyncPromiseFunctionDeclarationB() { return new Promise<void>(); }

const nonAsyncPromiseArrowFunctionA = (p: Promise<void>) => p;

const nonAsyncPromiseArrowFunctionB = () => new Promise<void>();

class Test {
  public nonAsyncPromiseMethodA(p: Promise<void>) {
    return p;
  }

  public nonAsyncPromiseMethodB() {
    return new Promise<void>();
  }
}
`,
      errors: [
        {
          line: 2,
          messageId
        },
        {
          line: 4,
          messageId
        },
        {
          line: 6,
          messageId
        },
        {
          line: 8,
          messageId
        },
        {
          line: 10,
          messageId
        },
        {
          line: 12,
          messageId
        },
        {
          line: 15,
          messageId
        },
        {
          line: 19,
          messageId
        }
      ]
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkArrowFunctions: false
        }
      ],
      errors: [
        {
          line: 2,
          messageId
        },
        {
          line: 4,
          messageId
        },
        {
          line: 9,
          messageId
        }
      ]
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkFunctionDeclarations: false
        }
      ],
      errors: [
        {
          line: 2,
          messageId
        },
        {
          line: 6,
          messageId
        },
        {
          line: 9,
          messageId
        }
      ]
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkFunctionExpressions: false
        }
      ],
      errors: [
        {
          line: 4,
          messageId
        },
        {
          line: 6,
          messageId
        },
        {
          line: 9,
          messageId
        }
      ]
    },
    {
      code: `
const nonAsyncPromiseFunctionExpression = function(p: Promise<void>) { return p; };

function nonAsyncPromiseFunctionDeclaration(p: Promise<void>) { return p; }

const nonAsyncPromiseArrowFunction = (p: Promise<void>) => p;

class Test {
  public nonAsyncPromiseMethod(p: Promise<void>) {
    return p;
  }
}
`,
      options: [
        {
          checkMethodDeclarations: false
        }
      ],
      errors: [
        {
          line: 2,
          messageId
        },
        {
          line: 4,
          messageId
        },
        {
          line: 6,
          messageId
        }
      ]
    },
    {
      code: `
class PromiseType { }

const returnAllowedType = () => new PromiseType();
`,
      options: [
        {
          allowedPromiseNames: ['PromiseType']
        }
      ],
      errors: [
        {
          line: 4,
          messageId
        }
      ]
    }
  ]
});
