/**
 * @fileoverview Enforces triple slash references are not used
 * @author Danny Fritz
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../../src/rules/no-triple-slash-reference';
import { RuleTester } from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
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
*/`
  ],
  invalid: [
    {
      code: '/// <reference path="Animal" />',
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 1,
          column: 1
        }
      ]
    },
    {
      code: `
/// <reference path="Animal" />
let a
            `,
      parser: '@typescript-eslint/parser',
      errors: [
        {
          messageId: 'tripleSlashReference',
          line: 2,
          column: 1
        }
      ]
    }
  ]
});
