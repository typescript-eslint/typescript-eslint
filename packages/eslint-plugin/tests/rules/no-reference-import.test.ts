import rule from '../../src/rules/no-reference-import';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-reference-import', rule, {
  valid: [
    `/// <reference types="foo" />
    var foo = require("foo");`,
    `/// <reference path="foo" />
    import * from "foo"`,
  ],
  invalid: [
    {
      code: `
/// <reference types="foo" />
import * from "foo"
      `,

      parser: '@typescript-eslint/parser',
      errors: [
        {
          messageId: 'noReferenceImport',
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
      parser: '@typescript-eslint/parser',
      errors: [
        {
          messageId: 'noReferenceImport',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
