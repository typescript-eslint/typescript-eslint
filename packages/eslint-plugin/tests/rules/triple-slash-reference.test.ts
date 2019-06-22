import rule from '../../src/rules/triple-slash-reference';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('triple-slash-reference', rule, {
  valid: [
    {
      code: `
      /// <reference path="foo" />
      import * as foo from "foo"
      `,
      options: [{ path: 'always' }],
    },
    {
      code: `
      /// <reference types="foo" />
      import * as foo from "foo"
      `,
      options: [{ types: 'always' }],
    },
    {
      code: `
      /// <reference lib="foo" />
      import * as foo from "foo"
      `,
      options: [{ lib: 'always' }],
    },
    {
      code: `
      import * as foo from "foo"
      `,
      options: [{ path: 'never' }],
    },
    {
      code: `
      import * as foo from "foo"
      `,
      options: [{ types: 'never' }],
    },
    {
      code: `
      import * as foo from "foo"
      `,
      options: [{ lib: 'never' }],
    },
    {
      code: `
      import * as foo from "foo"
      `,
      options: [{ types: 'prefer-import' }],
    },
  ],
  invalid: [
    {
      code: `
/// <reference types="foo" />
import * as foo from "foo"
      `,
      options: [{ types: 'prefer-import' }],
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
/// <reference types="foo" />
import foo = require("foo");
      `,
      options: [{ types: 'prefer-import' }],
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `/// <reference path="foo" />`,
      options: [{ path: 'never' }],
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `/// <reference types="foo" />`,
      options: [{ types: 'never' }],
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `/// <reference lib="foo" />`,
      options: [{ lib: 'never' }],
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});
