import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/triple-slash-reference';

const ruleTester = new RuleTester();

ruleTester.run('triple-slash-reference', rule, {
  invalid: [
    {
      code: `
/// <reference types="foo" />
import * as foo from 'foo';
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'tripleSlashReference',
        },
      ],
      options: [{ types: 'prefer-import' }],
    },
    {
      code: `
/// <reference types="foo" />
import foo = require('foo');
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'tripleSlashReference',
        },
      ],
      options: [{ types: 'prefer-import' }],
    },
    {
      code: '/// <reference path="foo" />',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'tripleSlashReference',
        },
      ],
      options: [{ path: 'never' }],
    },
    {
      code: '/// <reference types="foo" />',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'tripleSlashReference',
        },
      ],
      options: [{ types: 'never' }],
    },
    {
      code: '/// <reference lib="foo" />',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'tripleSlashReference',
        },
      ],
      options: [{ lib: 'never' }],
    },
  ],
  valid: [
    {
      code: `
        // <reference path="foo" />
        // <reference types="bar" />
        // <reference lib="baz" />
        import * as foo from 'foo';
        import * as bar from 'bar';
        import * as baz from 'baz';
      `,
      options: [{ lib: 'never', path: 'never', types: 'never' }],
    },
    {
      code: `
        // <reference path="foo" />
        // <reference types="bar" />
        // <reference lib="baz" />
        import foo = require('foo');
        import bar = require('bar');
        import baz = require('baz');
      `,
      options: [{ lib: 'never', path: 'never', types: 'never' }],
    },
    {
      code: `
        /// <reference path="foo" />
        /// <reference types="bar" />
        /// <reference lib="baz" />
        import * as foo from 'foo';
        import * as bar from 'bar';
        import * as baz from 'baz';
      `,
      options: [{ lib: 'always', path: 'always', types: 'always' }],
    },
    {
      code: `
        /// <reference path="foo" />
        /// <reference types="bar" />
        /// <reference lib="baz" />
        import foo = require('foo');
        import bar = require('bar');
        import baz = require('baz');
      `,
      options: [{ lib: 'always', path: 'always', types: 'always' }],
    },
    {
      code: `
        /// <reference path="foo" />
        /// <reference types="bar" />
        /// <reference lib="baz" />
        import foo = foo;
        import bar = bar;
        import baz = baz;
      `,
      options: [{ lib: 'always', path: 'always', types: 'always' }],
    },
    {
      code: `
        /// <reference path="foo" />
        /// <reference types="bar" />
        /// <reference lib="baz" />
        import foo = foo.foo;
        import bar = bar.bar.bar.bar;
        import baz = baz.baz;
      `,
      options: [{ lib: 'always', path: 'always', types: 'always' }],
    },
    {
      code: "import * as foo from 'foo';",
      options: [{ path: 'never' }],
    },
    {
      code: "import foo = require('foo');",
      options: [{ path: 'never' }],
    },
    {
      code: "import * as foo from 'foo';",
      options: [{ types: 'never' }],
    },
    {
      code: "import foo = require('foo');",
      options: [{ types: 'never' }],
    },
    {
      code: "import * as foo from 'foo';",
      options: [{ lib: 'never' }],
    },
    {
      code: "import foo = require('foo');",
      options: [{ lib: 'never' }],
    },
    {
      code: "import * as foo from 'foo';",
      options: [{ types: 'prefer-import' }],
    },
    {
      code: "import foo = require('foo');",
      options: [{ types: 'prefer-import' }],
    },
    {
      code: `
        /// <reference types="foo" />
        import * as bar from 'bar';
      `,
      options: [{ types: 'prefer-import' }],
    },
    {
      code: `
        /*
        /// <reference types="foo" />
        */
        import * as foo from 'foo';
      `,
      options: [{ lib: 'never', path: 'never', types: 'never' }],
    },
  ],
});
