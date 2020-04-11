/* eslint-disable eslint-comments/no-use */
// this rule tests the position of braces, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/object-curly-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('object-curly-spacing', rule, {
  valid: [
    {
      code: 'const x:{}',
    },
    {
      code: 'const x:{ }',
    },
    {
      code: 'const x:{f: number}',
    },
    {
      code: 'const x:{ // line-comment\nf: number\n}',
    },
    {
      code: 'const x:{// line-comment\nf: number\n}',
    },
    {
      code: 'const x:{/* inline-comment */f: number/* inline-comment */}',
    },
    {
      code: 'const x:{\nf: number\n}',
    },
    {
      code: 'const x:{f: {g: number}}',
    },
    {
      code: 'const x:{f: [number]}',
    },
    {
      code: 'const x:{[key: string]: value}',
    },
    {
      code: 'const x:{[key: string]: [number]}',
    },
    {
      code: 'const x:{f: {g: number} }',
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: 'const x:{f: {g: number}}',
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: 'const x:{f: () => {g: number} }',
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: 'const x:{f: () => {g: number}}',
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: 'const x:{f: [number] }',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{f: [ number ]}',
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: value}',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: value}',
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: [number] }',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: [number]}',
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: 'const x:{}',
      options: ['always'],
    },
    {
      code: 'const x:{ }',
      options: ['always'],
    },
    {
      code: 'const x:{ f: number }',
      options: ['always'],
    },
    {
      code: 'const x:{ // line-comment\nf: number\n}',
      options: ['always'],
    },
    {
      code: 'const x:{ /* inline-comment */ f: number /* inline-comment */ }',
      options: ['always'],
    },
    {
      code: 'const x:{\nf: number\n}',
      options: ['always'],
    },
    {
      code: 'const x:{ f: [number] }',
      options: ['always'],
    },
    {
      code: 'const x:{ f: { g: number } }',
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: 'const x:{ f: { g: number }}',
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: 'const x:{ f: () => { g: number } }',
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: 'const x:{ f: () => { g: number }}',
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: 'const x:{ f: [number] }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{ f: [ number ]}',
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: value }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: value }',
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: [number] }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: [number]}',
      options: ['always', { arraysInObjects: false }],
    },
  ],

  invalid: [
    {
      code: 'type x = { f: number }',
      output: 'type x = {f: number}',
      errors: [
        { messageId: 'unexpectedSpaceAfter' },
        { messageId: 'unexpectedSpaceBefore' },
      ],
    },
    {
      code: 'type x = { f: number}',
      output: 'type x = {f: number}',
      errors: [{ messageId: 'unexpectedSpaceAfter' }],
    },
    {
      code: 'type x = {f: number }',
      output: 'type x = {f: number}',
      errors: [{ messageId: 'unexpectedSpaceBefore' }],
    },
    {
      code: 'type x = {f: number}',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [
        { messageId: 'requireSpaceAfter' },
        { messageId: 'requireSpaceBefore' },
      ],
    },
    {
      code: 'type x = {f: number }',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [{ messageId: 'requireSpaceAfter' }],
    },
    {
      code: 'type x = { f: number}',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [{ messageId: 'requireSpaceBefore' }],
    },
  ],
});
