import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import path from 'path';

import switchExhaustivenessCheck from '../../src/rules/switch-exhaustiveness-check';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('switch-exhaustiveness-check', switchExhaustivenessCheck, {
  valid: [
    // All branches matched
    `
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

const day = 'Monday' as Day;
let result = 0;

switch (day) {
  case 'Monday': {
    result = 1;
    break;
  }
  case 'Tuesday': {
    result = 2;
    break;
  }
  case 'Wednesday': {
    result = 3;
    break;
  }
  case 'Thursday': {
    result = 4;
    break;
  }
  case 'Friday': {
    result = 5;
    break;
  }
  case 'Saturday': {
    result = 6;
    break;
  }
  case 'Sunday': {
    result = 7;
    break;
  }
}
    `,
    // Other primitive literals work too
    `
type Num = 0 | 1 | 2;

function test(value: Num): number {
  switch (value) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 2:
      return 2;
  }
}
    `,
    `
type Bool = true | false;

function test(value: Bool): number {
  switch (value) {
    case true:
      return 1;
    case false:
      return 0;
  }
}
    `,
    `
type Mix = 0 | 1 | 'two' | 'three' | true;

function test(value: Mix): number {
  switch (value) {
    case 0:
      return 0;
    case 1:
      return 1;
    case 'two':
      return 2;
    case 'three':
      return 3;
    case true:
      return 4;
  }
}
    `,
    // Works with type references
    `
type A = 'a';
type B = 'b';
type C = 'c';
type Union = A | B | C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
    case 'b':
      return 2;
    case 'c':
      return 3;
  }
}
    `,
    // Works with `typeof`
    `
const A = 'a';
const B = 1;
const C = true;

type Union = typeof A | typeof B | typeof C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
    case 1:
      return 2;
    case true:
      return 3;
  }
}
    `,
    // Switch contains default clause.
    `
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

const day = 'Monday' as Day;
let result = 0;

switch (day) {
  case 'Monday': {
    result = 1;
    break;
  }
  default: {
    result = 42;
  }
}
    `,
    // Exhaustiveness check only works for union types...
    `
const day = 'Monday' as string;
let result = 0;

switch (day) {
  case 'Monday': {
    result = 1;
    break;
  }
  case 'Tuesday': {
    result = 2;
    break;
  }
}
    `,
    // ... and enums (at least for now).
    `
enum Enum {
  A,
  B,
}

function test(value: Enum): number {
  switch (value) {
    case Enum.A:
      return 1;
    case Enum.B:
      return 2;
  }
}
    `,
    // Object union types won't work either, unless it's a discriminated union
    `
type ObjectUnion = { a: 1 } | { b: 2 };

function test(value: ObjectUnion): number {
  switch (value.a) {
    case 1:
      return 1;
  }
}
    `,
    // switch with default clause on non-union type
    {
      code: `
declare const value: number;
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    // switch with default clause on string type +
    // "allowDefaultCaseForExhaustiveSwitch" option
    {
      code: `
declare const value: string;
switch (value) {
  case 'foo':
    return 0;
  case 'bar':
    return 1;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    // switch with default clause on number type +
    // "allowDefaultCaseForExhaustiveSwitch" option
    {
      code: `
declare const value: number;
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    // switch with default clause on bigint type +
    // "allowDefaultCaseForExhaustiveSwitch" option
    {
      code: `
declare const value: bigint;
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    // switch with default clause on symbol type +
    // "allowDefaultCaseForExhaustiveSwitch" option
    {
      code: `
declare const value: symbol;
const foo = Symbol('foo');
switch (value) {
  case foo:
    return 0;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    // switch with default clause on union with number +
    // "allowDefaultCaseForExhaustiveSwitch" option
    {
      code: `
declare const value: 0 | 1 | number;
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
  default:
    return -1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: 'literal';
switch (value) {
  case 'literal':
    return 0;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: null;
switch (value) {
  case null:
    return 0;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: undefined;
switch (value) {
  case undefined:
    return 0;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: null | undefined;
switch (value) {
  case null:
    return 0;
  case undefined:
    return 0;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: 'literal' & { _brand: true };
switch (value) {
  case 'literal':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: ('literal' & { _brand: true }) | 1;
switch (value) {
  case 'literal':
    break;
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: (1 & { _brand: true }) | 'literal' | null;
switch (value) {
  case 'literal':
    break;
  case 1:
    break;
  case null:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case '2':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case '2':
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case '2':
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | (number & { foo: 'bar' });
switch (value) {
  case '1':
    break;
  case '2':
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case '2':
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: number | null | undefined;
switch (value) {
  case null:
    break;
  case undefined:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: (string & { foo: 'bar' }) | '1';
switch (value) {
  case '1':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
const a = Symbol('a');
declare const value: typeof a | 2;
switch (value) {
  case a:
    break;
  case 2:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: string | number;
switch (value) {
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: string | number;
switch (value) {
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: string | number;
switch (value) {
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: number;
declare const a: number;
switch (value) {
  case a:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: bigint;
switch (value) {
  case 10n:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: symbol;
const a = Symbol('a');
switch (value) {
  case a:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const value: symbol;
const a = Symbol('a');
switch (value) {
  case a:
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
const a = Symbol('a');
declare const value: typeof a | string;
switch (value) {
  case a:
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
const a = Symbol('a');
declare const value: typeof a | string;
switch (value) {
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: boolean | 1;
switch (value) {
  case 1:
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: boolean | 1;
switch (value) {
  case 1:
    break;
  case true:
    break;
  case false:
    break;
  default:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
enum Aaa {
  Foo,
  Bar,
}
declare const value: Aaa | 1;
switch (value) {
  case 1:
    break;
  case Aaa.Foo:
    break;
  case Aaa.Bar:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
declare const value: 'literal';
switch (value) {
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: 'literal';
switch (value) {
case "literal": { throw new Error('Not implemented yet: "literal" case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: 'literal' & { _brand: true };
switch (value) {
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: 'literal' & { _brand: true };
switch (value) {
case "literal": { throw new Error('Not implemented yet: "literal" case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: ('literal' & { _brand: true }) | 1;
switch (value) {
  case 'literal':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: ('literal' & { _brand: true }) | 1;
switch (value) {
  case 'literal':
    break;
  case 1: { throw new Error('Not implemented yet: 1 case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case "2": { throw new Error('Not implemented yet: "2" case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  case "2": { throw new Error('Not implemented yet: "2" case') }
}
      `,
            },
          ],
        },
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: '1' | '2' | number;
switch (value) {
  case '1':
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: (string & { foo: 'bar' }) | '1';
switch (value) {
  case '1':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: (string & { foo: 'bar' }) | '1';
switch (value) {
  case '1':
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: (string & { foo: 'bar' }) | '1' | 1 | null | undefined;
switch (value) {
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: (string & { foo: 'bar' }) | '1' | 1 | null | undefined;
switch (value) {
case undefined: { throw new Error('Not implemented yet: undefined case') }
case null: { throw new Error('Not implemented yet: null case') }
case "1": { throw new Error('Not implemented yet: "1" case') }
case 1: { throw new Error('Not implemented yet: 1 case') }
}
      `,
            },
          ],
        },
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: (string & { foo: 'bar' }) | '1' | 1 | null | undefined;
switch (value) {
default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: string | number;
switch (value) {
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: string | number;
switch (value) {
  case 1:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: number;
declare const a: number;
switch (value) {
  case a:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 4,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: number;
declare const a: number;
switch (value) {
  case a:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: bigint;
switch (value) {
  case 10n:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: bigint;
switch (value) {
  case 10n:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: symbol;
const a = Symbol('a');
switch (value) {
  case a:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 4,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: symbol;
const a = Symbol('a');
switch (value) {
  case a:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const a = Symbol('aa');
const b = Symbol('bb');
declare const value: typeof a | typeof b | 1;
switch (value) {
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 5,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
const a = Symbol('aa');
const b = Symbol('bb');
declare const value: typeof a | typeof b | 1;
switch (value) {
  case 1:
    break;
  case a: { throw new Error('Not implemented yet: a case') }
  case b: { throw new Error('Not implemented yet: b case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const a = Symbol('a');
declare const value: typeof a | string;
switch (value) {
  case a:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 4,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
const a = Symbol('a');
declare const value: typeof a | string;
switch (value) {
  case a:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: boolean;
switch (value) {
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: boolean;
switch (value) {
case false: { throw new Error('Not implemented yet: false case') }
case true: { throw new Error('Not implemented yet: true case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: boolean | 1;
switch (value) {
  case false:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: boolean | 1;
switch (value) {
  case false:
    break;
  case true: { throw new Error('Not implemented yet: true case') }
  case 1: { throw new Error('Not implemented yet: 1 case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: boolean | number;
switch (value) {
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: boolean | number;
switch (value) {
  case 1:
    break;
  case false: { throw new Error('Not implemented yet: false case') }
  case true: { throw new Error('Not implemented yet: true case') }
}
      `,
            },
          ],
        },
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: boolean | number;
switch (value) {
  case 1:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const value: object;
switch (value) {
  case 1:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 3,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: object;
switch (value) {
  case 1:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
enum Aaa {
  Foo,
  Bar,
}
declare const value: Aaa | 1 | string;
switch (value) {
  case 1:
    break;
  case Aaa.Foo:
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 7,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
enum Aaa {
  Foo,
  Bar,
}
declare const value: Aaa | 1 | string;
switch (value) {
  case 1:
    break;
  case Aaa.Foo:
    break;
  case Aaa.Bar: { throw new Error('Not implemented yet: Aaa.Bar case') }
}
      `,
            },
          ],
        },
        {
          messageId: 'switchIsNotExhaustive',
          line: 7,
          column: 9,
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
enum Aaa {
  Foo,
  Bar,
}
declare const value: Aaa | 1 | string;
switch (value) {
  case 1:
    break;
  case Aaa.Foo:
    break;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      // Matched only one branch out of seven.
      code: `
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

const day = 'Monday' as Day;
let result = 0;

switch (day) {
  case 'Monday': {
    result = 1;
    break;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 14,
          column: 9,
          data: {
            missingBranches:
              '"Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"',
          },
        },
      ],
    },
    {
      // Didn't match all enum variants
      code: `
enum Enum {
  A,
  B,
}

function test(value: Enum): number {
  switch (value) {
    case Enum.A:
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 8,
          column: 11,
          data: {
            missingBranches: 'Enum.B',
          },
        },
      ],
    },
    {
      code: `
type A = 'a';
type B = 'b';
type C = 'c';
type Union = A | B | C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 8,
          column: 11,
          data: {
            missingBranches: '"b" | "c"',
          },
        },
      ],
    },
    {
      code: `
const A = 'a';
const B = 1;
const C = true;

type Union = typeof A | typeof B | typeof C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 9,
          column: 11,
          data: {
            missingBranches: 'true | 1',
          },
        },
      ],
    },
    {
      code: `
type DiscriminatedUnion = { type: 'A'; a: 1 } | { type: 'B'; b: 2 };

function test(value: DiscriminatedUnion): number {
  switch (value.type) {
    case 'A':
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 5,
          column: 11,
          data: {
            missingBranches: '"B"',
          },
        },
      ],
    },
    {
      // Still complains with empty switch
      code: `
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

const day = 'Monday' as Day;

switch (day) {
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 13,
          column: 9,
          data: {
            missingBranches:
              '"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"',
          },
        },
      ],
    },
    {
      code: `
const a = Symbol('a');
const b = Symbol('b');
const c = Symbol('c');

type T = typeof a | typeof b | typeof c;

function test(value: T): number {
  switch (value) {
    case a:
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          line: 9,
          column: 11,
          data: {
            missingBranches: 'typeof b | typeof c',
          },
        },
      ],
    },
    // Provides suggestions to add missing cases
    {
      // with existing cases present
      code: `
type T = 1 | 2;

function test(value: T): number {
  switch (value) {
    case 1:
      return 1;
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
type T = 1 | 2;

function test(value: T): number {
  switch (value) {
    case 1:
      return 1;
    case 2: { throw new Error('Not implemented yet: 2 case') }
  }
}
      `,
            },
          ],
        },
      ],
    },
    {
      // without existing cases
      code: `
type T = 1 | 2;

function test(value: T): number {
  switch (value) {
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
type T = 1 | 2;

function test(value: T): number {
  switch (value) {
  case 1: { throw new Error('Not implemented yet: 1 case') }
  case 2: { throw new Error('Not implemented yet: 2 case') }
  }
}
      `,
            },
          ],
        },
      ],
    },
    {
      // keys include special characters
      code: `
export enum Enum {
  'test-test' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
export enum Enum {
  'test-test' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  case Enum['test-test']: { throw new Error('Not implemented yet: Enum[\\'test-test\\'] case') }
  case Enum.test: { throw new Error('Not implemented yet: Enum.test case') }
  }
}
      `,
            },
          ],
        },
      ],
    },
    {
      // keys include empty string
      code: `
export enum Enum {
  '' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
export enum Enum {
  '' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  case Enum['']: { throw new Error('Not implemented yet: Enum[\\'\\'] case') }
  case Enum.test: { throw new Error('Not implemented yet: Enum.test case') }
  }
}
      `,
            },
          ],
        },
      ],
    },
    {
      // keys include number as first character
      code: `
export enum Enum {
  '9test' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  }
}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
export enum Enum {
  '9test' = 'test-test',
  'test' = 'test',
}

function test(arg: Enum): string {
  switch (arg) {
  case Enum['9test']: { throw new Error('Not implemented yet: Enum[\\'9test\\'] case') }
  case Enum.test: { throw new Error('Not implemented yet: Enum.test case') }
  }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const value: number = Math.floor(Math.random() * 3);
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
const value: number = Math.floor(Math.random() * 3);
switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
  default: { throw new Error('default case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        enum Enum {
          'a' = 1,
          [\`key-with

          new-line\`] = 2,
        }

        declare const a: Enum;

        switch (a) {
        }
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
        enum Enum {
          'a' = 1,
          [\`key-with

          new-line\`] = 2,
        }

        declare const a: Enum;

        switch (a) {
        case Enum.a: { throw new Error('Not implemented yet: Enum.a case') }
        case Enum['key-with\\n\\n          new-line']: { throw new Error('Not implemented yet: Enum[\\'key-with\\\\n\\\\n          new-line\\'] case') }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
        enum Enum {
          'a' = 1,
          "'a' \`b\` \\"c\\"" = 2,
        }

        declare const a: Enum;

        switch (a) {}
      `,
      errors: [
        {
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
        enum Enum {
          'a' = 1,
          "'a' \`b\` \\"c\\"" = 2,
        }

        declare const a: Enum;

        switch (a) {
        case Enum.a: { throw new Error('Not implemented yet: Enum.a case') }
        case Enum['\\'a\\' \`b\` "c"']: { throw new Error('Not implemented yet: Enum[\\'\\\\\\'a\\\\\\' \`b\` "c"\\'] case') }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      // superfluous switch with a string-based union
      code: `
type MyUnion = 'foo' | 'bar' | 'baz';

declare const myUnion: MyUnion;

switch (myUnion) {
  case 'foo':
  case 'bar':
  case 'baz': {
    break;
  }
  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with a string-based enum
      code: `
enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
  Baz = 'Baz',
}

declare const myEnum: MyEnum;

switch (myEnum) {
  case MyEnum.Foo:
  case MyEnum.Bar:
  case MyEnum.Baz: {
    break;
  }
  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with a number-based enum
      code: `
enum MyEnum {
  Foo,
  Bar,
  Baz,
}

declare const myEnum: MyEnum;

switch (myEnum) {
  case MyEnum.Foo:
  case MyEnum.Bar:
  case MyEnum.Baz: {
    break;
  }
  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with a boolean
      code: `
declare const myBoolean: boolean;

switch (myBoolean) {
  case true:
  case false: {
    break;
  }
  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with undefined
      code: `
declare const myValue: undefined;

switch (myValue) {
  case undefined: {
    break;
  }

  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with null
      code: `
declare const myValue: null;

switch (myValue) {
  case null: {
    break;
  }

  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
    {
      // superfluous switch with union of various types
      code: `
declare const myValue: 'foo' | boolean | undefined | null;

switch (myValue) {
  case 'foo':
  case true:
  case false:
  case undefined:
  case null: {
    break;
  }

  default: {
    break;
  }
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
    },
  ],
});
