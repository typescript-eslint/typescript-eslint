import rule from '../../src/rules/no-type-alias';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      options: [{ allowMappedTypes: 'always' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      options: [{ allowMappedTypes: 'in-unions-and-intersections' }],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      options: [{ allowMappedTypes: 'in-intersections' }],
    },
    {
      code: `
export type ClassValue =
  | string
  | number
  | ClassDictionary
  | ClassArray
  | undefined
  | null
  | false;
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
      code: 'type Foo = typeof bar | typeof baz;',
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
      code:
        'type Foo = ([string] & [number, number]) | [number, number, number];',
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
      code:
        'type Foo = ([string] & [number, number]) | readonly [number, number, number];',
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
      code:
        'type Foo = ([string] & [number, number]) | keyof [number, number, number];',
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
  ],
  invalid: [
    {
      code: "type Foo = 'a';",
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "type Foo = 'a';",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b';",
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | 'b' | 'c';",
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b';",
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' & 'b' & 'c';",
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 18,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'never', allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [
        {
          allowAliases: 'in-unions',
          allowLiterals: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 19,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "type Foo = 'a' | ('b' & 'c');",
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string;',
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string;',
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string;',
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string;',
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string;',
      options: [{ allowAliases: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[];',
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | string[] | number;',
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 21,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowAliases: 'never', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowAliases: 'in-unions', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = string | (string[] & number);',
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
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
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar;
      `,
      options: [{ allowAliases: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 3,
          column: 12,
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
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar | {};
      `,
      options: [{ allowAliases: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 3,
          column: 18,
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
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      options: [{ allowAliases: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      options: [{ allowAliases: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 3,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
interface Bar {}
type Foo = Bar & {};
      `,
      options: [{ allowAliases: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = () => void;',
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'callbacks',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = () => void;',
      options: [{ allowCallbacks: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'callbacks',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [{ allowLiterals: 'never', allowAliases: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [
        {
          allowLiterals: 'in-unions',
          allowAliases: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [
        {
          allowLiterals: 'in-intersections',
          allowAliases: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {};',
      options: [
        {
          allowLiterals: 'in-unions-and-intersections',
          allowAliases: 'in-intersections',
        },
      ],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'literals',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = {} | {};',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type Foo = {} | {};',
      options: [{ allowLiterals: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type Foo = {} | {};',
      options: [{ allowLiterals: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'union',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type Foo = {} & {};',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type Foo = {} & {};',
      options: [{ allowLiterals: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type Foo = {} & {};',
      options: [{ allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: "type Foo = (string & {}) | 'a' | 1;",
      options: [{ allowAliases: 'in-unions', allowLiterals: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'intersection',
          },
          line: 1,
          column: 13,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
      ],
    },
    {
      code: "type Foo = (string & {}) | 'a' | 1;",
      options: [
        {
          allowAliases: 'in-intersections',
          allowLiterals: 'in-unions',
        },
      ],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Literals',
            compositionType: 'intersection',
          },
          line: 1,
          column: 22,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 28,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Aliases',
            compositionType: 'union',
          },
          line: 1,
          column: 34,
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
          messageId: 'noTypeAlias',
          data: {
            alias: 'mapped types',
          },
          line: 2,
          column: 15,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'mapped types',
          },
          line: 2,
          column: 15,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'mapped types',
          },
          line: 2,
          column: 15,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'mapped types',
          },
          line: 2,
          column: 15,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
};
      `,
      options: [{ allowMappedTypes: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'mapped types',
          },
          line: 2,
          column: 15,
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
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 3,
          column: 5,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 6,
          column: 5,
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
      options: [{ allowMappedTypes: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 3,
          column: 5,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 6,
          column: 5,
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
      options: [{ allowMappedTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 3,
          column: 5,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'union',
          },
          line: 6,
          column: 5,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 2,
          column: 15,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      options: [{ allowMappedTypes: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 2,
          column: 15,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
type Foo<T> = {
  readonly [P in keyof T]: T[P];
} &
  {
    readonly [P in keyof T]: T[P];
  };
      `,
      options: [{ allowMappedTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 2,
          column: 15,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            typeName: 'Mapped types',
            compositionType: 'intersection',
          },
          line: 5,
          column: 3,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/270
      code: "export type ButtonProps = JSX.IntrinsicElements['button'];",
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'aliases',
          },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = [number] | [number, number];',
      options: [{ allowTupleTypes: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = [number] & [number, number];',
      options: [{ allowTupleTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = [number] | [number, number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = [number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = [number];',
      options: [{ allowTupleTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = [number];',
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = readonly [number] | keyof [number, number];',
      options: [{ allowTupleTypes: 'never' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 32,
        },
      ],
    },
    {
      code: 'type Foo = keyof [number] & [number, number];',
      options: [{ allowTupleTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'intersection',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 29,
        },
      ],
    },
    {
      code: 'type Foo = [number] | readonly [number, number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = readonly [number];',
      options: [{ allowTupleTypes: 'in-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = keyof [number];',
      options: [{ allowTupleTypes: 'in-unions' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = readonly [number];',
      options: [{ allowTupleTypes: 'in-unions-and-intersections' }],
      errors: [
        {
          messageId: 'noTypeAlias',
        },
      ],
    },
    {
      code: 'type Foo = new (bar: number) => string | null;',
      options: [{ allowConstructors: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'constructors',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type MyType<T> = T extends number ? number : null;',
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'conditional types',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'type MyType<T> = T extends number ? number : null;',
      options: [{ allowConditionalTypes: 'never' }],
      errors: [
        {
          messageId: 'noTypeAlias',
          data: {
            alias: 'conditional types',
          },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      // unique symbol is not allowed in this context
      code: 'type Foo = keyof [string] | unique symbol;',
      errors: [
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Tuple Types',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noCompositionAlias',
          data: {
            compositionType: 'union',
            typeName: 'Unhandled',
          },
          line: 1,
          column: 29,
        },
      ],
    },
  ],
});
