import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-object-likes';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-misused-object-likes', rule, {
  valid: [
    `
      class ExMap extends Map {}
      const map = new ExMap();
      Object.keys(map);
    `,
    `
      class ExMap extends Map {}
      const map = new ExMap();
      Object.values(map);
    `,
    `
      class ExMap extends Map {}
      const map = new ExMap();
      Object.entries(map);
    `,
    `
      const test = {};
      Object.entries(test);
    `,
    `
      const test = {};
      Object.keys(test);
    `,
    `
      const test = {};
      Object.values(test);
    `,
    `
      const test = [];
      Object.keys(test);
    `,
    `
      const test = [];
      Object.values(test);
    `,
    `
      const test = [];
      Object.entries(test);
    `,
    `
      const test = 123;
      Object.keys(test);
    `,
  ],
  invalid: [
    {
      code: `
        const map = new Map();
        const result = Object.keys(map);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.entries(map);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const map = new Map();
        const result = Object.values(map);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.keys(set);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.entries(set);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const set = new Set();
        const result = Object.values(set);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    {
      code: `
        const test = new WeakMap();
        Object.keys(test);
      `,
      errors: [{ messageId: 'misusedObjectLike' }],
    },
    { code: '4 in new Set();', errors: [{ messageId: 'misusedObjectLike' }] },
  ],
});
