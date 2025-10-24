import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-object-methods-on-collections';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-object-methods-on-collections', rule, {
  valid: [
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
      code: `
        const test = 123;
        Object.keys(test);
      `,
    },
    {
      code: `
        const obj = {};
        Object.assign(obj, { key: 'value' });
      `,
    },
    {
      code: `
        const arr = [];
        Object.assign(arr, { key: 'value' });
      `,
    },
  ],
  invalid: [
    {
      code: `
        const map = new Map();
        const result = Object.keys(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.entries(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.values(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.keys(set);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.entries(set);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.values(set);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.keys(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.values(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        class ExMap extends Map {}
        const map = new ExMap();
        Object.entries(map);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const test = new WeakMap();
        Object.keys(test);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const test = new WeakSet();
        Object.values(test);
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const map = new Map();
        Object.assign(map, { key: 'value' });
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const set = new Set();
        Object.assign(set, { key: 'value' });
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const map = new WeakMap();
        Object.assign(map, { key: 'value' });
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
    {
      code: `
        const set = new WeakSet();
        Object.assign(set, { key: 'value' });
      `,
      errors: [{ messageId: 'noObjectMethodsOnCollections' }],
    },
  ],
});
