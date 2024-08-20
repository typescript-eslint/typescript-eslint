import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-empty-object-type';

const ruleTester = new RuleTester();

ruleTester.run('no-empty-object-type', rule, {
  invalid: [
    {
      code: 'interface Base {}',
      errors: [
        {
          column: 11,
          data: { option: 'allowInterfaces' },
          line: 1,
          messageId: 'noEmptyInterface',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyInterface',
              output: `type Base = object`,
            },
            {
              messageId: 'replaceEmptyInterface',
              output: `type Base = unknown`,
            },
          ],
        },
      ],
    },
    {
      code: 'interface Base {}',
      errors: [
        {
          column: 11,
          data: { option: 'allowInterfaces' },
          line: 1,
          messageId: 'noEmptyInterface',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyInterface',
              output: `type Base = object`,
            },
            {
              messageId: 'replaceEmptyInterface',
              output: `type Base = unknown`,
            },
          ],
        },
      ],
      options: [{ allowInterfaces: 'never' }],
    },
    {
      code: `
interface Base {
  props: string;
}

interface Derived extends Base {}

class Other {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
interface Base {
  props: string;
}

type Derived = Base

class Other {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Base {
  props: string;
}

interface Derived extends Base {}

class Derived {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyInterfaceWithSuper',
        },
      ],
    },
    {
      code: `
interface Base {
  props: string;
}

interface Derived extends Base {}

const derived = class Derived {};
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
interface Base {
  props: string;
}

type Derived = Base

const derived = class Derived {};
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Base {
  name: string;
}

interface Derived extends Base {}
      `,
      errors: [
        {
          column: 11,
          line: 6,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
interface Base {
  name: string;
}

type Derived = Base
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'interface Base extends Array<number> {}',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `type Base = Array<number>`,
            },
          ],
        },
      ],
    },
    {
      code: 'interface Base extends Array<number | {}> {}',
      errors: [
        {
          column: 11,
          endColumn: 15,
          line: 1,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `type Base = Array<number | {}>`,
            },
          ],
        },
        {
          column: 39,
          data: { option: 'allowObjectTypes' },
          endColumn: 41,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: `interface Base extends Array<number | object> {}`,
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: `interface Base extends Array<number | unknown> {}`,
            },
          ],
        },
      ],
    },
    {
      code: `
interface Derived {
  property: string;
}
interface Base extends Array<Derived> {}
      `,
      errors: [
        {
          column: 11,
          line: 5,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
interface Derived {
  property: string;
}
type Base = Array<Derived>
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
type R = Record<string, unknown>;
interface Base extends R {}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
type R = Record<string, unknown>;
type Base = R
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'interface Base<T> extends Derived<T> {}',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `type Base<T> = Derived<T>`,
            },
          ],
        },
      ],
    },
    {
      code: `
declare namespace BaseAndDerived {
  type Base = typeof base;
  export interface Derived extends Base {}
}
      `,
      errors: [
        {
          column: 20,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'noEmptyInterfaceWithSuper',
          suggestions: [
            {
              messageId: 'replaceEmptyInterfaceWithSuper',
              output: `
declare namespace BaseAndDerived {
  type Base = typeof base;
  export type Derived = Base
}
      `,
            },
          ],
        },
      ],
      filename: 'test.d.ts',
    },
    {
      code: 'type Base = {};',
      errors: [
        {
          column: 13,
          data: { option: 'allowObjectTypes' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = unknown;',
            },
          ],
        },
      ],
    },
    {
      code: 'type Base = {};',
      errors: [
        {
          column: 13,
          data: { option: 'allowObjectTypes' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = unknown;',
            },
          ],
        },
      ],
      options: [{ allowObjectTypes: 'never' }],
    },
    {
      code: 'let value: {};',
      errors: [
        {
          column: 12,
          data: { option: 'allowObjectTypes' },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: unknown;',
            },
          ],
        },
      ],
    },
    {
      code: 'let value: {};',
      errors: [
        {
          column: 12,
          data: { option: 'allowObjectTypes' },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'let value: unknown;',
            },
          ],
        },
      ],
      options: [{ allowObjectTypes: 'never' }],
    },
    {
      code: `
let value: {
  /* ... */
};
      `,
      errors: [
        {
          column: 12,
          data: { option: 'allowObjectTypes' },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: `
let value: object;
      `,
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: `
let value: unknown;
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'type MyUnion<T> = T | {};',
      errors: [
        {
          column: 23,
          data: { option: 'allowObjectTypes' },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type MyUnion<T> = T | object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type MyUnion<T> = T | unknown;',
            },
          ],
        },
      ],
    },
    {
      code: 'type Base = {} | null;',
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = object | null;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = unknown | null;',
            },
          ],
        },
      ],
      options: [{ allowWithName: 'Base' }],
    },
    {
      code: 'type Base = {};',
      errors: [
        {
          column: 13,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyObject',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = object;',
            },
            {
              data: { replacement: 'unknown' },
              messageId: 'replaceEmptyObjectType',
              output: 'type Base = unknown;',
            },
          ],
        },
      ],
      options: [{ allowWithName: 'Mismatch' }],
    },
    {
      code: 'interface Base {}',
      errors: [
        {
          column: 11,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noEmptyInterface',
          suggestions: [
            {
              data: { replacement: 'object' },
              messageId: 'replaceEmptyInterface',
              output: `type Base = object`,
            },
            {
              messageId: 'replaceEmptyInterface',
              output: `type Base = unknown`,
            },
          ],
        },
      ],
      options: [{ allowWithName: '.*Props$' }],
    },
  ],
  valid: [
    `
interface Base {
  name: string;
}
    `,
    `
interface Base {
  name: string;
}

interface Derived {
  age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Both extends Base, Derived {}
    `,
    {
      code: 'interface Base {}',
      options: [{ allowInterfaces: 'always' }],
    },
    {
      code: `
interface Base {
  name: string;
}

interface Derived extends Base {}
      `,
      options: [{ allowInterfaces: 'with-single-extends' }],
    },
    {
      code: `
interface Base {
  props: string;
}

interface Derived extends Base {}

class Derived {}
      `,
      options: [{ allowInterfaces: 'with-single-extends' }],
    },
    'let value: object;',
    'let value: Object;',
    'let value: { inner: true };',
    'type MyNonNullable<T> = T & {};',
    {
      code: 'type Base = {};',
      options: [{ allowObjectTypes: 'always' }],
    },
    {
      code: 'type Base = {};',
      options: [{ allowWithName: 'Base' }],
    },
    {
      code: 'type BaseProps = {};',
      options: [{ allowWithName: 'Props$' }],
    },
    {
      code: 'interface Base {}',
      options: [{ allowWithName: 'Base' }],
    },
    {
      code: 'interface BaseProps {}',
      options: [{ allowWithName: 'Props$' }],
    },
  ],
});
