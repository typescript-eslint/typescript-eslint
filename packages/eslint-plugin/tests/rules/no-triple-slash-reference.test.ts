import rule from '../../src/rules/no-triple-slash-reference';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-triple-slash-reference', rule, {
  valid: [
    `/// <reference types="foo" />`,
    `/// <reference lib="es2017.string" />`,
    `/// <reference no-default-lib="true"/>`,
    '/// Non-reference triple-slash comment',
    "// <reference path='Animal' />",
    `/*
/// <reference path="Animal" />
let a
*/`,
  ],
  invalid: [
    {
      code: '/// <reference path="Animal" />',
      errors: [
        {
          messageId: 'noTripleSlashReference',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
/// <reference path="Animal" />
let a
            `,
      errors: [
        {
          messageId: 'noTripleSlashReference',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
