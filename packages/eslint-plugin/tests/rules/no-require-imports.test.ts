import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-require-imports';

const ruleTester = new RuleTester();

ruleTester.run('no-require-imports', rule, {
  invalid: [
    {
      code: "var lib = require('lib');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "let lib2 = require('lib2');",
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'noRequireImports',
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
          column: 12,
          line: 2,
          messageId: 'noRequireImports',
        },
        {
          column: 10,
          line: 3,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "import lib8 = require('lib8');",
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "var lib = require?.('lib');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "let lib2 = require?.('lib2');",
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'noRequireImports',
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
          column: 12,
          line: 2,
          messageId: 'noRequireImports',
        },
        {
          column: 10,
          line: 3,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "const pkg = require('./package.json');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "const pkg = require('./package.jsonc');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: 'const pkg = require(`./package.jsonc`);',
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "import pkg = require('./package.json');",
      errors: [
        {
          column: 14,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
    },
    {
      code: "import pkg = require('./package.jsonc');",
      errors: [
        {
          column: 14,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allow: ['/package\\.json$'] }],
    },
    {
      code: "import pkg = require('./package.json');",
      errors: [
        {
          column: 14,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allow: ['^some-package$'] }],
    },
    {
      code: "var foo = require?.('foo');",
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: "let foo = trick(require?.('foo'));",
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: "trick(require('foo'));",
      errors: [
        {
          column: 7,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: "const foo = require('./foo.json') as Foo;",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: "const foo: Foo = require('./foo.json').default;",
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: "const foo = <Foo>require('./foo.json');",
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: `
const configValidator = new Validator(require('./a.json'));
configValidator.addSchema(require('./a.json'));
      `,
      errors: [
        {
          column: 39,
          line: 2,
          messageId: 'noRequireImports',
        },
        {
          column: 27,
          line: 3,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: 'require(foo);',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
    {
      code: 'require?.(foo);',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noRequireImports',
        },
      ],
      options: [{ allowAsImport: true }],
    },
  ],
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
      code: 'const pkg = require(`./package.json`);',
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
      code: `
let require = bazz;
trick(require('foo'));
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
const foo = require('./foo.json') as Foo;
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
const foo: Foo = require('./foo.json').default;
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
const foo = <Foo>require('./foo.json');
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
const configValidator = new Validator(require('./a.json'));
configValidator.addSchema(require('./a.json'));
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
require('foo');
      `,
      options: [{ allowAsImport: true }],
    },
    {
      code: `
let require = bazz;
require?.('foo');
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
});
