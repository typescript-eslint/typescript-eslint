import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/sort-type-constituents';

const ruleTester = new RuleTester();

ruleTester.run('sort-type-constituents', rule, {
  valid: [
    {
      code: 'type T = A | B;',
    },
    {
      code: 'type T = A | /* comment */ B;',
    },
    {
      code: "type T = 'A' | 'B';",
    },
    {
      code: 'type T = 1 | 2;',
    },
    {
      code: noFormat`type T = (A) | (B);`,
    },
    {
      code: 'type T = { a: string } | { b: string };',
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 4];',
    },
    {
      code: 'type T = (() => string) | (() => void);',
    },
    {
      code: 'type T = () => string | void;',
    },
    {
      // testing the default ordering
      code: noFormat`
type T =
  | A
  | B
  | C.D
  | D.E
  | intrinsic
  | number[]
  | string[]
  | any
  | string
  | symbol
  | this
  | readonly number[]
  | readonly string[]
  | 'a'
  | 'b'
  | "a"
  | "b"
  | (() => string)
  | (() => void)
  | (new () => string)
  | (new () => void)
  | import('bar')
  | import('foo')
  | (number extends string ? unknown : never)
  | (string extends string ? unknown : never)
  | { [a in string]: string }
  | { [a: string]: string }
  | { [b in string]: string }
  | { [b: string]: string }
  | { a: string }
  | { b: string }
  | [1, 2, 3]
  | [1, 2, 4]
  | (A & B)
  | (B & C)
  | (A | B)
  | (B | C)
  | null
  | undefined
      `,
    },
    {
      code: 'type T = B | A;',
      options: [
        {
          checkUnions: false,
        },
      ],
    },
    {
      code: "type T = 'DeleteForever' | 'DeletedAt';",
      options: [
        {
          caseSensitive: true,
        },
      ],
    },
    {
      code: 'type T = { A: string } | { B: string } | { a: string };',
      options: [
        {
          caseSensitive: true,
        },
      ],
    },

    {
      code: 'type T = A & B;',
    },
    {
      code: 'type T = A & /* comment */ B;',
    },
    {
      code: "type T = 'A' & 'B';",
    },
    {
      code: 'type T = 1 & 2;',
    },
    {
      code: noFormat`type T = (A) & (B);`,
    },
    {
      code: 'type T = { a: string } & { b: string };',
    },
    {
      code: 'type T = [1, 2, 3] & [1, 2, 4];',
    },
    {
      code: 'type T = (() => string) & (() => void);',
    },
    {
      code: 'type T = () => string & void;',
    },
    {
      // testing the default ordering
      code: noFormat`
type T =
  & A
  & B
  & C.D
  & D.E
  & intrinsic
  & number[]
  & string[]
  & any
  & string
  & symbol
  & this
  & readonly number[]
  & readonly string[]
  & 'a'
  & 'b'
  & "a"
  & "b"
  & (() => string)
  & (() => void)
  & (new () => string)
  & (new () => void)
  & import('bar')
  & import('foo')
  & (number extends string ? unknown : never)
  & (string extends string ? unknown : never)
  & { [a in string]: string }
  & { [a: string]: string }
  & { [b in string]: string }
  & { [b: string]: string }
  & { a: string }
  & { b: string }
  & [1, 2, 3]
  & [1, 2, 4]
  & (A & B)
  & (B & C)
  & (A | B)
  & (B | C)
  & null
  & undefined
      `,
    },
    {
      code: 'type T = B & A;',
      options: [
        {
          checkIntersections: false,
        },
      ],
    },
    {
      code: "type T = 'DeleteForever' & 'DeleteForever';",
      options: [
        {
          caseSensitive: true,
        },
      ],
    },

    {
      code: noFormat`
type T = [1] | 'a' | 'b' | "b" | 1 | 2 | {};
      `,
      options: [
        {
          groupOrder: ['tuple', 'literal', 'object'],
        },
      ],
    },
    {
      // if not specified - groups should be placed last
      code: `
type T = 1 | string | {} | A;
      `,
      options: [
        {
          groupOrder: ['literal', 'keyword'],
        },
      ],
    },
    "type A<T> = string | (T extends number ? 'hi' : 'there');",
  ],
  invalid: [
    {
      code: 'type T = B | A;',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A | B;`,
    },
    {
      code: "type T = 'B' | 'A';",
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 'A' | 'B';`,
    },
    {
      code: 'type T = 2 | 1;',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 1 | 2;`,
    },
    {
      code: noFormat`type T = (B) | (A);`,
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A | B;`,
    },
    {
      code: 'type T = { b: string } | { a: string };',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = { a: string } | { b: string };`,
    },
    {
      code: 'type T = [1, 2, 4] | [1, 2, 3];',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = [1, 2, 3] | [1, 2, 4];`,
    },
    {
      code: 'type T = (() => void) | (() => string);',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = (() => string) | (() => void);`,
    },
    {
      code: 'type T = () => void | string;',
      errors: [
        {
          data: { type: 'Union' },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => string | void;`,
    },
    {
      code: 'type T = () => undefined | null;',
      errors: [
        {
          data: { type: 'Union' },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => null | undefined;`,
    },
    {
      code: noFormat`
type T =
  | [1, 2, 4]
  | [1, 2, 3]
  | { b: string }
  | { a: string }
  | (() => void)
  | (() => string)
  | "b"
  | "a"
  | 'b'
  | 'a'
  | readonly string[]
  | readonly number[]
  | string[]
  | number[]
  | D.E
  | C.D
  | B
  | A
  | undefined
  | null
  | string
  | any;
      `,
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `
type T =
  A | B | C.D | D.E | number[] | string[] | any | string | readonly number[] | readonly string[] | 'a' | 'b' | "a" | "b" | (() => string) | (() => void) | { a: string } | { b: string } | [1, 2, 3] | [1, 2, 4] | null | undefined;
      `,
    },
    {
      code: 'type T = B | /* comment */ A;',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
          suggestions: [
            {
              messageId: 'suggestFix',
              output: `type T = A | B;`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'type T = (() => /* comment */ A) | B;',
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
          suggestions: null,
        },
      ],
      output: `type T = B | (() => /* comment */ A);`,
    },
    {
      code: 'type Expected = (new (x: number) => boolean) | string;',
      errors: [
        {
          messageId: 'notSortedNamed',
        },
      ],
      output: `type Expected = string | (new (x: number) => boolean);`,
    },
    {
      code: noFormat`type T = (| A) | B;`,
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B | (| A);`,
    },
    {
      code: noFormat`type T = (& A) | B;`,
      errors: [
        {
          data: { name: 'T', type: 'Union' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B | (& A);`,
    },
    {
      code: 'type T = B & A;',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A & B;`,
    },
    {
      code: "type T = 'B' & 'A';",
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 'A' & 'B';`,
    },
    {
      code: 'type T = 2 & 1;',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = 1 & 2;`,
    },
    {
      code: noFormat`type T = (B) & (A);`,
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A & B;`,
    },
    {
      code: 'type T = { b: string } & { a: string };',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = { a: string } & { b: string };`,
    },
    {
      code: 'type T = [1, 2, 4] & [1, 2, 3];',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = [1, 2, 3] & [1, 2, 4];`,
    },
    {
      code: 'type T = (() => void) & (() => string);',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = (() => string) & (() => void);`,
    },
    {
      code: 'type T = () => void & string;',
      errors: [
        {
          data: { type: 'Intersection' },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => string & void;`,
    },
    {
      code: 'type T = () => undefined & null;',
      errors: [
        {
          data: { type: 'Intersection' },
          messageId: 'notSorted',
        },
      ],
      output: `type T = () => null & undefined;`,
    },
    {
      code: noFormat`
type T =
  & [1, 2, 4]
  & [1, 2, 3]
  & { b: string }
  & { a: string }
  & (() => void)
  & (() => string)
  & "b"
  & "a"
  & 'b'
  & 'a'
  & readonly string[]
  & readonly number[]
  & string[]
  & number[]
  & D.E
  & C.D
  & B
  & A
  & undefined
  & null
  & string
  & any;
      `,
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `
type T =
  A & B & C.D & D.E & number[] & string[] & any & string & readonly number[] & readonly string[] & 'a' & 'b' & "a" & "b" & (() => string) & (() => void) & { a: string } & { b: string } & [1, 2, 3] & [1, 2, 4] & null & undefined;
      `,
    },
    {
      code: 'type T = B & /* comment */ A;',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
          suggestions: [
            {
              messageId: 'suggestFix',
              output: `type T = A & B;`,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: 'type T = (() => /* comment */ A) & B;',
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
          suggestions: null,
        },
      ],
      output: `type T = B & (() => /* comment */ A);`,
    },
    {
      code: 'type Expected = (new (x: number) => boolean) & string;',
      errors: [
        {
          messageId: 'notSortedNamed',
        },
      ],
      output: `type Expected = string & (new (x: number) => boolean);`,
    },
    {
      code: noFormat`type T = (| A) & B;`,
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B & (| A);`,
    },
    {
      code: noFormat`type T = (& A) & B;`,
      errors: [
        {
          data: { name: 'T', type: 'Intersection' },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = B & (& A);`,
    },
    {
      code: 'type T = (B | C) & A;',
      errors: [
        {
          data: {
            name: 'T',
            type: 'Intersection',
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: `type T = A & (B | C);`,
    },
    {
      code: "type A<T> = (T extends number ? 'hi' : 'there') | string;",
      errors: [
        {
          data: {
            name: 'A',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      output: "type A<T> = string | (T extends number ? 'hi' : 'there');",
    },
    {
      code: "type T = 'DeletedAt' | 'DeleteForever';",
      errors: [
        {
          data: {
            name: 'T',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      options: [
        {
          caseSensitive: true,
        },
      ],
      output: "type T = 'DeleteForever' | 'DeletedAt';",
    },
    {
      code: 'type T = { a: string } | { A: string } | { B: string };',
      errors: [
        {
          data: {
            name: 'T',
            type: 'Union',
          },
          messageId: 'notSortedNamed',
        },
      ],
      options: [
        {
          caseSensitive: true,
        },
      ],
      output: 'type T = { A: string } | { B: string } | { a: string };',
    },
  ],
});
