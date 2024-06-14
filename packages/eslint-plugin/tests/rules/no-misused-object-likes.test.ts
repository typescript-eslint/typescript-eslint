import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-object-likes';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-misused-object-likes', rule, {
  valid: [
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.keys(map);
      `,
    },
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.values(map);
      `,
    },
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.entries(map);
      `,
    },
    {
      code: `
        const test = {};
        Object.entries(test);
      `,
    },
    {
      code: `
        const test = {};
        Object.keys(test);
      `,
    },
    {
      code: `
        const test = {};
        Object.values(test);
      `,
    },
    {
      code: `
        const test = [];
        Object.keys(test);
      `,
    },
    {
      code: `
        const test = [];
        Object.values(test);
      `,
    },
    {
      code: `
        const test = [];
        Object.entries(test);
      `,
    },
    {
      options: [{ checkObjectKeysForMap: false }],
      code: `
        const map = new Map();
        const result = Object.keys(map);
      `,
    },
    {
      options: [{ checkObjectEntriesForMap: false }],
      code: `
        const map = new Map();
        const result = Object.entries(map);
      `,
    },
    {
      options: [{ checkObjectValuesForMap: false }],
      code: `
        const map = new Map();
        const result = Object.values(map);
      `,
    },
    {
      options: [{ checkObjectKeysForSet: false }],
      code: `
        const set = new Set();
        const result = Object.keys(set);
      `,
    },
    {
      options: [{ checkObjectEntriesForSet: false }],
      code: `
        const set = new Set();
        const result = Object.entries(set);
      `,
    },
    {
      options: [{ checkObjectValuesForSet: false }],
      code: `
        const set = new Set();
        const result = Object.values(set);
      `,
    },
    {
      code: `
        const test = 123;
        Object.keys(test);
      `,
    },
    {
      code: `
        const test = new WeakMap();
        Object.keys(test);
      `,
    },
  ],
  invalid: [
    {
      code: `
        const map = new Map();
        const result = Object.keys(map);
      `,
      errors: [{ messageId: 'objectKeysForMap' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.entries(map);
      `,
      errors: [{ messageId: 'objectEntriesForMap' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.values(map);
      `,
      errors: [{ messageId: 'objectValuesForMap' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.keys(set);
      `,
      errors: [{ messageId: 'objectKeysForSet' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.entries(set);
      `,
      errors: [{ messageId: 'objectEntriesForSet' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.values(set);
      `,
      errors: [{ messageId: 'objectValuesForSet' }],
    },
  ],
});
