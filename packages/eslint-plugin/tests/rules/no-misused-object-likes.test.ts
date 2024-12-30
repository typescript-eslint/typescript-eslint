import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-object-likes';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-misused-object-likes', rule, {
  valid: [
    "Object.keys({ a: 'a' });",
    'Object.keys([1, 2, 3]);',
    'Object.keys([1, 2, 3] as const);',
    `
declare const data: unknown;
Object.keys(data);
    `,
    `
declare const data: any;
Object.keys(data);
    `,
    `
declare const data: [1, 2, 3];
Object.keys(data);
    `,
    `
declare const data: Set<string>;
data.keys();
    `,
    `
declare const data: Map<string, string>;
data.keys();
    `,
    `
declare const data: Set;
Object.keys(data);
    `,
    `
declare const data: Map;
Object.keys(data);
    `,
    `
declare const data: Map<string>;
Object.keys(data);
    `,
    `
function test<T>(data: T) {
  Object.keys(data);
}
    `,
    `
function test<T>(data: string[]) {
  Object.keys(data);
}
    `,
    `
function test<T>(data: Record<string, number>) {
  Object.keys(data);
}
    `,
    `
declare const data: Iterable<string>;
Object.keys(data);
    `,
    // error type
    `
Object.keys(data);
    `,
    `
declare const data: Set<string>;
keys(data);
    `,
    `
declare const data: Set<string>;
Object.create(data);
    `,
    `
declare const data: Set<string>;
Object[Symbol.iterator](data);
    `,
    `
Object.keys();
    `,
  ],
  invalid: [
    {
      code: `
declare const data: Set<string>;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Set<string>;
Object.keys(data, 'extra-arg');
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Set<string> | number;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: number | (boolean | (string & Set<string>));
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
function test<T extends Set<string>>(data: T) {
  Object.keys(data);
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
class ExtendedSet extends Set<string> {}

declare const data: ExtendedSet;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 5,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Set<string>;
Object['keys'](data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Set',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Map<string, string>;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Map<string, string>;
Object.keys(data, 'extra-arg');
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Map<string, string> | string;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: number | (boolean | (string & Map<string, number>));
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
function test<T extends Map<string, string>>(data: T) {
  Object.keys(data);
}
      `,
      errors: [
        {
          column: 3,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
class ExtendedMap extends Map<string, string> {}

declare const data: ExtendedMap;
Object.keys(data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 5,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
    {
      code: `
declare const data: Map<string, string>;
Object['keys'](data);
      `,
      errors: [
        {
          column: 1,
          data: {
            type: 'Map',
          },
          line: 3,
          messageId: 'misusedObjectKeys',
        },
      ],
    },
  ],
});
