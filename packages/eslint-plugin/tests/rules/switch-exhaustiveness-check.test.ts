import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import path from 'node:path';

import switchExhaustivenessCheck from '../../src/rules/switch-exhaustiveness-check';

const rootPath = path.join(__dirname, '..', 'fixtures');

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('switch-exhaustiveness-check', switchExhaustivenessCheck, {
  invalid: [
    {
      code: `
declare const value: 'literal';
switch (value) {
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: (string & { foo: 'bar' }) | '1' | 1 | null | undefined;
switch (value) {
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 5,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
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
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: boolean;
switch (value) {
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          column: 9,
          line: 7,
          messageId: 'switchIsNotExhaustive',
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
          column: 9,
          line: 7,
          messageId: 'switchIsNotExhaustive',
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
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
          column: 9,
          data: {
            missingBranches:
              '"Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"',
          },
          line: 14,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
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
  case "Tuesday": { throw new Error('Not implemented yet: "Tuesday" case') }
  case "Wednesday": { throw new Error('Not implemented yet: "Wednesday" case') }
  case "Thursday": { throw new Error('Not implemented yet: "Thursday" case') }
  case "Friday": { throw new Error('Not implemented yet: "Friday" case') }
  case "Saturday": { throw new Error('Not implemented yet: "Saturday" case') }
  case "Sunday": { throw new Error('Not implemented yet: "Sunday" case') }
}
      `,
            },
          ],
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
          column: 11,
          data: {
            missingBranches: 'Enum.B',
          },
          line: 8,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
enum Enum {
  A,
  B,
}

function test(value: Enum): number {
  switch (value) {
    case Enum.A:
      return 1;
    case Enum.B: { throw new Error('Not implemented yet: Enum.B case') }
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
          column: 11,
          data: {
            missingBranches: '"b" | "c"',
          },
          line: 8,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
type A = 'a';
type B = 'b';
type C = 'c';
type Union = A | B | C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
    case "b": { throw new Error('Not implemented yet: "b" case') }
    case "c": { throw new Error('Not implemented yet: "c" case') }
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
          column: 11,
          data: {
            missingBranches: 'true | 1',
          },
          line: 9,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
const A = 'a';
const B = 1;
const C = true;

type Union = typeof A | typeof B | typeof C;

function test(value: Union): number {
  switch (value) {
    case 'a':
      return 1;
    case true: { throw new Error('Not implemented yet: true case') }
    case 1: { throw new Error('Not implemented yet: 1 case') }
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
          column: 11,
          data: {
            missingBranches: '"B"',
          },
          line: 5,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
type DiscriminatedUnion = { type: 'A'; a: 1 } | { type: 'B'; b: 2 };

function test(value: DiscriminatedUnion): number {
  switch (value.type) {
    case 'A':
      return 1;
    case "B": { throw new Error('Not implemented yet: "B" case') }
  }
}
      `,
            },
          ],
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
          column: 9,
          data: {
            missingBranches:
              '"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"',
          },
          line: 13,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
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
case "Monday": { throw new Error('Not implemented yet: "Monday" case') }
case "Tuesday": { throw new Error('Not implemented yet: "Tuesday" case') }
case "Wednesday": { throw new Error('Not implemented yet: "Wednesday" case') }
case "Thursday": { throw new Error('Not implemented yet: "Thursday" case') }
case "Friday": { throw new Error('Not implemented yet: "Friday" case') }
case "Saturday": { throw new Error('Not implemented yet: "Saturday" case') }
case "Sunday": { throw new Error('Not implemented yet: "Sunday" case') }
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
          column: 11,
          data: {
            missingBranches: 'typeof b | typeof c',
          },
          line: 9,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
const a = Symbol('a');
const b = Symbol('b');
const c = Symbol('c');

type T = typeof a | typeof b | typeof c;

function test(value: T): number {
  switch (value) {
    case a:
      return 1;
    case b: { throw new Error('Not implemented yet: b case') }
    case c: { throw new Error('Not implemented yet: c case') }
  }
}
      `,
            },
          ],
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
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: true,
          requireDefaultForNonUnion: true,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
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
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b';

switch (literal) {
  case 'a':
    break;
  default:
    break;
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b';

switch (literal) {
  case 'a':
    break;
  case "b": { throw new Error('Not implemented yet: "b" case') }
  default:
    break;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b';

switch (literal) {
  case 'a':
    break;
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b';

switch (literal) {
  case 'a':
    break;
  case "b": { throw new Error('Not implemented yet: "b" case') }
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b';

switch (literal) {
  default:
  case 'a':
    break;
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b';

switch (literal) {
  case "b": { throw new Error('Not implemented yet: "b" case') }
  default:
  case 'a':
    break;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  default:
    break;
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  case "b": { throw new Error('Not implemented yet: "b" case') }
  case "c": { throw new Error('Not implemented yet: "c" case') }
  default:
    break;
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
  Baz = 'Baz',
}

declare const myEnum: MyEnum;

switch (myEnum) {
  case MyEnum.Foo:
    break;
  default: {
    break;
  }
}
      `,
      errors: [
        {
          column: 9,
          line: 10,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
  Baz = 'Baz',
}

declare const myEnum: MyEnum;

switch (myEnum) {
  case MyEnum.Foo:
    break;
  case MyEnum.Bar: { throw new Error('Not implemented yet: MyEnum.Bar case') }
  case MyEnum.Baz: { throw new Error('Not implemented yet: MyEnum.Baz case') }
  default: {
    break;
  }
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
declare const value: boolean;
switch (value) {
  default: {
    break;
  }
}
      `,
      errors: [
        {
          column: 9,
          line: 3,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const value: boolean;
switch (value) {
  case false: { throw new Error('Not implemented yet: false case') }
  case true: { throw new Error('Not implemented yet: true case') }
  default: {
    break;
  }
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
function foo(x: string[]) {
  switch (x[0]) {
    case 'hi':
      break;
  }
}
      `,
      errors: [
        {
          column: 11,
          line: 3,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
function foo(x: string[]) {
  switch (x[0]) {
    case 'hi':
      break;
    case undefined: { throw new Error('Not implemented yet: undefined case') }
  }
}
      `,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootPath,
        },
      },
    },
    {
      code: `
declare const myValue: 'a' | 'b';
switch (myValue) {
  case 'a':
    return 'a';
  case 'b':
    return 'b';
  // no default
}
      `,
      errors: [
        {
          messageId: 'dangerousDefaultCase',
        },
      ],
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  // no default
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  case "b": { throw new Error('Not implemented yet: "b" case') }
  case "c": { throw new Error('Not implemented yet: "c" case') }
  // no default
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  // skip default
}
      `,
      errors: [
        {
          column: 9,
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
declare const literal: 'a' | 'b' | 'c';

switch (literal) {
  case 'a':
    break;
  case "b": { throw new Error('Not implemented yet: "b" case') }
  case "c": { throw new Error('Not implemented yet: "c" case') }
  // skip default
}
      `,
            },
          ],
        },
      ],
      options: [
        {
          considerDefaultExhaustiveForUnions: false,
          defaultCaseCommentPattern: '^skip\\sdefault',
        },
      ],
    },
    {
      code: `
        export namespace A {
          export enum B {
            C,
            D,
          }
        }
        declare const foo: A.B;
        switch (foo) {
          case A.B.C: {
            break;
          }
        }
      `,
      errors: [
        {
          column: 17,
          data: {
            missingBranches: 'A.B.D',
          },
          line: 9,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
        export namespace A {
          export enum B {
            C,
            D,
          }
        }
        declare const foo: A.B;
        switch (foo) {
          case A.B.C: {
            break;
          }
          case A.B.D: { throw new Error('Not implemented yet: A.B.D case') }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { A } from './switch-exhaustiveness-check';
        declare const foo: A.B;
        switch (foo) {
          case A.B.C: {
            break;
          }
        }
      `,
      errors: [
        {
          column: 17,
          data: {
            missingBranches: 'A.B.D',
          },
          line: 4,
          messageId: 'switchIsNotExhaustive',
          suggestions: [
            {
              messageId: 'addMissingCases',
              output: `
        import { A } from './switch-exhaustiveness-check';
        declare const foo: A.B;
        switch (foo) {
          case A.B.C: {
            break;
          }
          case A.B.D: { throw new Error('Not implemented yet: A.B.D case') }
        }
      `,
            },
          ],
        },
      ],
    },
  ],
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
    {
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
  default: {
    result = 42;
  }
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
    },
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
          considerDefaultExhaustiveForUnions: true,
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
          considerDefaultExhaustiveForUnions: true,
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
          considerDefaultExhaustiveForUnions: true,
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
          considerDefaultExhaustiveForUnions: true,
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
    {
      code: `
declare const literal: 'a' | 'b';
switch (literal) {
  case 'a':
    break;
  case 'b':
    break;
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b';
switch (literal) {
  case 'a':
    break;
  default:
    break;
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
    },
    {
      code: `
declare const literal: 'a' | 'b';
switch (literal) {
  case 'a':
    break;
  case 'b':
    break;
}
      `,
      options: [
        {
          allowDefaultCaseForExhaustiveSwitch: false,
        },
      ],
    },
    {
      code: `
enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
  Baz = 'Baz',
}

declare const myEnum: MyEnum;

switch (myEnum) {
  case MyEnum.Foo:
    break;
  case MyEnum.Bar:
    break;
  default: {
    break;
  }
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
    },
    {
      code: `
declare const value: boolean;
switch (value) {
  case false:
    break;
  default: {
    break;
  }
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
    },
    {
      code: `
function foo(x: string[]) {
  switch (x[0]) {
    case 'hi':
      break;
    case undefined:
      break;
  }
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootPath,
        },
      },
    },
    {
      code: `
function foo(x: string[], y: string | undefined) {
  const a = x[0];
  if (typeof a === 'string') {
    return;
  }
  switch (y) {
    case 'hi':
      break;
    case a:
      break;
  }
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootPath,
        },
      },
    },
    {
      code: `
declare const value: number;
switch (value) {
  case 0:
    break;
  case 1:
    break;
  // no default
}
      `,
      options: [
        {
          requireDefaultForNonUnion: true,
        },
      ],
    },
    {
      code: `
declare const value: 'a' | 'b';
switch (value) {
  case 'a':
    break;
  // no default
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
    },
    {
      code: `
declare const value: 'a' | 'b';
switch (value) {
  case 'a':
    break;
  // skip default
}
      `,
      options: [
        {
          considerDefaultExhaustiveForUnions: true,
          defaultCaseCommentPattern: '^skip\\sdefault',
        },
      ],
    },
  ],
});
