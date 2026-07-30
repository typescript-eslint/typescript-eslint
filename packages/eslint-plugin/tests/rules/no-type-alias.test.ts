import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-type-alias';

const ruleTester = new RuleTester();

ruleTester.run('no-type-alias', rule, {
  valid: [
    {
      code: "type A = 'a' & ('b' | 'c');",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a';",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = 1;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 | 2;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 | 2;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = 1 | 2;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = 1 & 2;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 & 2;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = 1 & 2;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = 1 & 2 & 3;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 & 2 & 3;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = 1 & 2 & 3;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = 1 | (2 & 3);',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = 1 | (2 & 3);',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}`;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}`;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}`;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}`;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}` | `c-${number}`;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}` | `c-${number}`;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}` | `c-${number}`;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}`;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}`;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}`;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}` & `c-${number}`;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}` & `c-${number}`;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}` & `c-${number}`;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = `a-${number}` | (`b-${number}` & `c-${number}`);',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = `a-${number}` | (`b-${number}` & `c-${number}`);',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = true;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = true | false;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = true | false;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = true | false;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = true & false;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = true & false;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = true & false;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | string;
      `,
      options: [{ allowAliases: 'always' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | string;
      `,
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | string;
      `,
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & string;
      `,
      options: [{ allowAliases: 'always' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & string;
      `,
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & string;
      `,
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string | readonly string[];',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = string & string[];',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = string & string[];',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string & string[];',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string & string[] & number;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = string & string[] & number;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string & string[] & number;',
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = () => void;',
      options: [{ allowCallbacks: 'always' }],
    },
    {
      code: 'type Foo = () => void | string;',
      options: [{ allowCallbacks: 'always' }],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'always' }],
    },
    {
      code: 'type Foo = {} | {};',
      options: [{ allowLiterals: 'always' }],
    },
    {
      code: 'type Foo = {} | {};',
      options: [{ allowLiterals: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = {} | {};',
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = {} & {};',
      options: [{ allowLiterals: 'always' }],
    },
    {
      code: 'type Foo = {} & {};',
      options: [{ allowLiterals: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = {} & {};',
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'always' }],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      options: [{ allowMappedTypes: 'always' }],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      options: [{ allowMappedTypes: 'in-unions-and-intersections' }],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      options: [{ allowMappedTypes: 'in-unions' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'always' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'in-unions-and-intersections' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'in-intersections' }],
    },
    {
      code: `
export type ClassValue =
  string | number | ClassDictionary | ClassArray | undefined | null | false;
      `,
      options: [
        {
          allowAliases: 'in-unions-and-intersections',
          allowCallbacks: 'always',
          allowLiterals: 'in-unions-and-intersections',
          allowMappedTypes: 'in-unions-and-intersections',
        },
      ],
    },
    {
      code: 'type Foo = typeof bar;',
      options: [{ allowAliases: 'always' }],
    },
    {
      code: "type Foo = typeof import('foo');",
      options: [{ allowAliases: 'always' }],
    },
    {
      code: `
const WithAKey = { AKey: true };
type KeyNames = keyof typeof SCALARS;
      `,
      options: [{ allowAliases: 'always' }],
    },
    {
      code: 'type Foo = typeof bar | typeof baz;',
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = typeof bar | typeof import('foo');",
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = keyof [string];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = [string] | [number, number];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = [string] | [number, number];',
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [string] & [number, number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = ([string] & [number, number]) | [number, number, number];',
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = readonly [string] | [number, number];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = readonly [string] | readonly [number, number];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = readonly [string] | [number, number];',
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [string] & readonly [number, number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = ([string] & [number, number]) | readonly [number, number, number];',
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = keyof [string] | [number, number];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = keyof [string] | keyof [number, number];',
      options: [{ allowTupleTypes: 'always' }],
    },
    {
      code: 'type Foo = keyof [string] | [number, number];',
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [string] & keyof [number, number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = ([string] & [number, number]) | keyof [number, number, number];',
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
    },
    {
      code: 'type MyType<T> = T extends number ? number : null;',
      options: [{ allowConditionalTypes: 'always' }],
    },
    {
      code: 'type Foo = new (bar: number) => string | null;',
      options: [{ allowConstructors: 'always' }],
    },
    {
      code: 'type Foo = Record<string, number>;',
      options: [{ allowGenerics: 'always' }],
    },
  ],
  invalid: [
    {
      code: "type Foo = 'a';",
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a';",
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = typeof import('foo');",
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' | typeof import('foo');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 24,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 19,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 25,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-intersections',
        },
      ],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 21,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 33,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions', allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      errors: [
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      errors: [
        {
          column: 18,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      errors: [
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      errors: [
        {
          column: 18,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = () => void;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'callbacks',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = () => void;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'callbacks',
          },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowCallbacks: 'never' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowLiterals: 'never' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowAliases: 'in-intersections', allowLiterals: 'never' }],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-intersections',
        },
      ],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          column: 12,
          data: {
            alias: 'literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions-and-intersections',
        },
      ],
    },
    {
      code: 'type Foo = {} | {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = {} | {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'never' }],
    },
    {
      code: 'type Foo = {} | {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'union',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-intersections' }],
    },
    {
      code: 'type Foo = {} & {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = {} & {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'never' }],
    },
    {
      code: 'type Foo = {} & {};',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 17,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = (string & {}) | 'a' | 1;",
      errors: [
        {
          column: 13,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'in-unions', allowLiterals: 'in-unions' }],
    },
    {
      code: "type Foo = (string & {}) | 'a' | 1;",
      errors: [
        {
          column: 22,
          data: {
            compositionType: 'intersection',
            typeName: 'Literals',
          },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 28,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 34,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            alias: 'mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            alias: 'mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowMappedTypes: 'never' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            alias: 'mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowMappedTypes: 'in-unions' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            alias: 'mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowMappedTypes: 'in-intersections' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            alias: 'mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowMappedTypes: 'in-unions-and-intersections' }],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      errors: [
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 5,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 8,
          line: 6,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      errors: [
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 5,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 8,
          line: 6,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowMappedTypes: 'never' }],
    },
    {
      code: `
type Foo<T> =
  | {
      readonly [P in keyof T]: T[P];
    }
  | {
      readonly [P in keyof T]: T[P];
    };
      `,
      errors: [
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 5,
          line: 3,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'union',
            typeName: 'Mapped types',
          },
          endColumn: 6,
          endLine: 8,
          line: 6,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowMappedTypes: 'in-intersections' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 6,
          line: 4,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 6,
          line: 4,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowMappedTypes: 'never' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} & {
  readonly [P in keyof T]: T[P];
};
      `,
      errors: [
        {
          column: 15,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'noCompositionAlias',
        },
        {
          column: 5,
          data: {
            compositionType: 'intersection',
            typeName: 'Mapped types',
          },
          endColumn: 2,
          endLine: 6,
          line: 4,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowMappedTypes: 'in-unions' }],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/270
      code: "export type ButtonProps = JSX.IntrinsicElements['button'];",
      errors: [
        {
          column: 27,
          data: {
            alias: 'aliases',
          },
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = [number] | [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 23,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'never' }],
    },
    {
      code: 'type Foo = [number] & [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 23,
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [number] | [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 23,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = [number];',
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = [number];',
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [number];',
      errors: [
        {
          column: 12,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = readonly [number] | keyof [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 32,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'never' }],
    },
    {
      code: 'type Foo = keyof [number] & [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 29,
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = [number] | readonly [number, number];',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 23,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = readonly [number];',
      errors: [
        {
          column: 12,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-intersections' }],
    },
    {
      code: 'type Foo = keyof [number];',
      errors: [
        {
          column: 12,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions' }],
    },
    {
      code: 'type Foo = readonly [number];',
      errors: [
        {
          column: 12,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
    },
    {
      code: 'type Foo = new (bar: number) => string | null;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'constructors',
          },
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowConstructors: 'never' }],
    },
    {
      code: 'type MyType<T> = T extends number ? number : null;',
      errors: [
        {
          column: 18,
          data: {
            alias: 'conditional types',
          },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type MyType<T> = T extends number ? number : null;',
      errors: [
        {
          column: 18,
          data: {
            alias: 'conditional types',
          },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
      options: [{ allowConditionalTypes: 'never' }],
    },
    {
      // unique symbol is not allowed in this context
      code: 'type Foo = keyof [string] | unique symbol;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 29,
          data: {
            compositionType: 'union',
            typeName: 'Unhandled',
          },
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
    },
    {
      code: 'type Foo = Record<string, number>;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'generics',
          },
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = `foo-${number}`;',
      errors: [
        {
          column: 12,
          data: {
            alias: 'aliases',
          },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = `a-${number}` | `b-${number}`;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 28,
          data: {
            compositionType: 'union',
            typeName: 'Aliases',
          },
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
    {
      code: 'type Foo = `a-${number}` & `b-${number}`;',
      errors: [
        {
          column: 12,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
        {
          column: 28,
          data: {
            compositionType: 'intersection',
            typeName: 'Aliases',
          },
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'noCompositionAlias',
        },
      ],
      options: [{ allowAliases: 'never' }],
    },
  ],
});
