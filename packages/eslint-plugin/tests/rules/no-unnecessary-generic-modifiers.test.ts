import rule from '../../src/rules/no-unnecessary-generic-modifier';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    tsconfigRootDir: getFixturesRootDir(),
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unnecessary-generic-modifier', rule, {
  valid: [
    'const identity = (value: any) => value;',
    'const identity = <T>(value: T) => value;',
    'const identity = <T = {}>(value: T) => value;',
    'const identity = <T extends {}>(value: T) => value;',
    'const identity = <T extends {} = {}>(value: T) => value;',
    'function data() {}',
    'function data<T>() {}',
    'function data<T, U>() {}',
    'function data<T extends number>() {}',
    'function data<T extends number | string>() {}',
    'function data<T extends any | number>() {}',
    `
type TODO = any;
function data<T extends TODO>() {}
    `,
    {
      code: `
const identity = <T = unknown>(value: T) => value;
      `,
      filename: 'react.tsx',
    },
    `
function identity(value: any) {
  return value;
}
    `,
    `
function identity<T>(value: T) {
  return value;
}
    `,
    `
function identity<T = {}>(value: T) {
  return value;
}
    `,
    `
function identity<T extends {}>(value: T) {
  return value;
}
    `,
    `
function identity<T extends {} = {}>(value: T) {
  return value;
}
    `,
    `
interface IdentityValue {
  value: T;
}
    `,
    `
class IdentityValue<T> {
  value: T;
}
    `,
    `
class IdentityValue<T = {}> {
  value: T;
}
    `,
    `
class IdentityValue<T extends {}> {
  value: T;
}
    `,
    `
class IdentityValue<T extends {} = {}> {
  value: T;
}
    `,
    `
interface IdentityValue<T> {
  value: T;
}
    `,
    `
interface IdentityValue<T = {}> {
  value: T;
}
    `,
    `
interface IdentityValue<T extends {}> {
  value: T;
}
    `,
    `
interface IdentityValue<T extends {} = {}> {
  value: T;
}
    `,
    `
type Identity<T> = T;
    `,
    `
type Identity<T extends {}> = T;
    `,
    `
type Identity<T = {}> = T;
    `,
    `
type Identity<T extends {} = {}> = T;
    `,
  ],

  invalid: [
    {
      code: `
function identity<T = unknown>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 23,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
function identity<T>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
function identity<T = unknown>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 23,
          messageId: 'unnecessaryDefault',
        },
      ],
      filename: 'react.tsx',
      output: `
function identity<T>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
function identity<T extends unknown>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
function identity<T>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
function identity<T extends unknown = unknown>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryConstraint',
        },
        {
          line: 2,
          column: 39,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
function identity<T = unknown>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
function identity<T extends {} = unknown>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 34,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
function identity<T extends {}>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
function identity<T extends unknown = {}>(value: any) {
  return value;
}
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
function identity<T = {}>(value: any) {
  return value;
}
      `,
    },
    {
      code: `
const identity = <T extends unknown>(value: T) => value;
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
const identity = <T>(value: T) => value;
      `,
    },
    {
      code: `
const identity = <T extends unknown>(value: T) => value;
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'preferDefault',
        },
      ],
      filename: 'react.tsx',
      output: `
const identity = <T = unknown>(value: T) => value;
      `,
    },
    {
      code: `
class IdentityValue<T extends unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 31,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
class IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
class IdentityValue<T = unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 25,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
class IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
class IdentityValue<T = unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 25,
          messageId: 'unnecessaryDefault',
        },
      ],
      filename: 'react.tsx',
      output: `
class IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
interface IdentityValue<T extends unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 35,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
interface IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
interface IdentityValue<T = unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
interface IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
interface IdentityValue<T = unknown> {
  value: T;
}
      `,
      errors: [
        {
          line: 2,
          column: 29,
          messageId: 'unnecessaryDefault',
        },
      ],
      filename: 'react.tsx',
      output: `
interface IdentityValue<T> {
  value: T;
}
      `,
    },
    {
      code: `
type Identity<T extends unknown> = T;
      `,
      errors: [
        {
          line: 2,
          column: 25,
          messageId: 'unnecessaryConstraint',
        },
      ],
      output: `
type Identity<T> = T;
      `,
    },
    {
      code: `
type Identity<T = unknown> = T;
      `,
      errors: [
        {
          line: 2,
          column: 19,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
type Identity<T> = T;
      `,
    },
    {
      code: `
type Identity<T = unknown> = T;
      `,
      errors: [
        {
          line: 2,
          column: 19,
          messageId: 'unnecessaryDefault',
        },
      ],
      filename: 'react.tsx',
      output: `
type Identity<T> = T;
      `,
    },
    {
      code: `
type Identity<T extends unknown = unknown> = T;
      `,
      errors: [
        {
          line: 2,
          column: 25,
          messageId: 'unnecessaryConstraint',
        },
        {
          line: 2,
          column: 35,
          messageId: 'unnecessaryDefault',
        },
      ],
      output: `
type Identity<T = unknown> = T;
      `,
    },
  ],
});
