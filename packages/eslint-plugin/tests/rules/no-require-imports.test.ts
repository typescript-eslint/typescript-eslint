import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-require-imports';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-require-imports', rule, {
  valid: [
    "import { l } from 'lib';",
    "var lib3 = load('not_an_import');",
    'var lib4 = lib2.subImport;',
    'var lib7 = 700;',
    'import lib9 = lib2.anotherSubImport;',
    "import lib10 from 'lib10';",
    "var lib3 = load?.('not_an_import');",
    `
import { createRequire } from 'module';
const require = createRequire();
require('remark-preset-prettier');
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
      code: "import pkg = require('../packages/package.json');",
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "import pkg = require('data.json');",
      options: [{ allow: ['\\.json$'] }],
    },
    {
      code: "import pkg = require('some-package');",
      options: [{ allow: ['^some-package$'] }],
    },
    {
      code: "import foo = require('foo');",
      options: [{ allowAsImport: true }],
    },
    {
      code: 'require(foo);',
      options: [{ allowAsImport: true }],
    },
    {
      code: 'require?.(foo);',
      options: [{ allowAsImport: true }],
    },
    {
      code: `
declare function require(path: string): unknown;
trick(require('foo'));
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
declare function require(path: string): unknown;
const foo = require('./foo.json') as Foo;
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
declare function require(path: string): unknown;
const foo: Foo = require('./foo.json').default;
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
declare function require(path: string): unknown;
const foo = <Foo>require('./foo.json');
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
declare function require(path: string): unknown;
const configValidator = new Validator(require('./a.json'));
configValidator.addSchema(require('./a.json'));
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
import { createRequire } from 'module';
const require = createRequire();
require('remark-preset-prettier');
      `,
      options: [{ allowAsImport: true }],
    },
  ],
  invalid: [
    {
      code: "var lib = require('lib');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let lib2 = require('lib2');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
var lib5 = require('lib5'),
  lib6 = require('lib6');
      `,
      errors: [
        {
          messageId: 'noRequireImports',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noRequireImports',
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: "import lib8 = require('lib8');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: "var lib = require?.('lib');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let lib2 = require?.('lib2');",
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
var lib5 = require?.('lib5'),
  lib6 = require?.('lib6');
      `,
      errors: [
        {
          messageId: 'noRequireImports',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noRequireImports',
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: "const pkg = require('./package.json');",
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "const pkg = require('./package.jsonc');",
      options: [{ allow: ['/package\\.json$'] }],
      errors: [
        {
          line: 1,
          column: 13,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "import pkg = require('./package.json');",
      errors: [
        {
          line: 1,
          column: 14,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "import pkg = require('./package.jsonc');",
      options: [{ allow: ['/package\\.json$'] }],
      errors: [
        {
          line: 1,
          column: 14,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "import pkg = require('./package.json');",
      options: [{ allow: ['^some-package$'] }],
      errors: [
        {
          line: 1,
          column: 14,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "var foo = require?.('foo');",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: "let foo = trick(require?.('foo'));",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: "trick(require('foo'));",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: "const foo = require('./foo.json') as Foo;",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: "const foo: Foo = require('./foo.json').default;",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "const foo = <Foo>require('./foo.json');",
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: `
const configValidator = new Validator(require('./a.json'));
configValidator.addSchema(require('./a.json'));
      `,
      options: [{ allowAsImport: true }],
      errors: [
        {
          messageId: 'noRequireImports',
          line: 2,
          column: 39,
        },
        {
          messageId: 'noRequireImports',
          line: 3,
          column: 27,
        },
      ],
    },
  ],
});
