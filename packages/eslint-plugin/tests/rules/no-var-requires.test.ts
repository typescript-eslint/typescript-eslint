import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-var-requires';

const ruleTester = new RuleTester();

ruleTester.run('no-var-requires', rule, {
  valid: [
    "import foo = require('foo');",
    "require('foo');",
    "require?.('foo');",
    `
import { createRequire } from 'module';
const require = createRequire('foo');
const json = require('./some.json');
    `,
    {
      code: "const pkg = require('./package.json');",
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "const pkg = require('../package.json');",
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "const pkg = require('../packages/package.json');",
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "const pkg = require('data.json');",
      options: [{ allow: ['\\.json$'] }],
    },
    {
      code: "const pkg = require('some-package');",
      options: [{ allow: ['^some-package$'] }],
    },
    {
      code: 'const pkg = require(`some-package`);',
      options: [{ allow: ['^some-package$'] }],
    },
  ],
  invalid: [
    {
      code: "var foo = require('foo');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const foo = require('foo');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "let foo = require('foo');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "let foo = trick(require('foo'));",
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "var foo = require?.('foo');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const foo = require?.('foo');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "let foo = require?.('foo');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "let foo = trick(require?.('foo'));",
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "let foo = trick?.(require('foo'));",
      errors: [
        {
          column: 19,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const foo = require('./foo.json') as Foo;",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: noFormat`const foo = <Foo>require('./foo.json');`,
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const foo: Foo = require('./foo.json').default;",
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3883
      code: `
const configValidator = new Validator(require('./a.json'));
configValidator.addSchema(require('./a.json'));
      `,
      errors: [
        {
          column: 39,
          line: 2,
          messageId: 'noVarReqs',
        },
        {
          column: 27,
          line: 3,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const pkg = require('./package.json');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
    },
    {
      code: "const pkg = require('./package.jsonc');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "const pkg = require('./package.json');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
      options: [{ allow: ['^some-package$'] }],
    },
    {
      code: 'const pkg = require(`./package.json`);',
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noVarReqs',
        },
      ],
      options: [{ allow: ['^some-package$'] }],
    },
  ],
});
