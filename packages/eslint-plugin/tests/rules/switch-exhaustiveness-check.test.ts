import path from 'path';
import switchExhaustivenessCheck from '../../src/rules/switch-exhaustiveness-check';
import { RuleTester } from '../RuleTester';

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
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

const day = 'Monday' as Day
let result = 0

switch (day) {
  case 'Monday': {
     result = 1
     break
  }
  case 'Tuesday': {
     result = 2
     break
  }
  case 'Wednesday': {
     result = 3
     break
  }
  case 'Thursday': {
     result = 4
     break
  }
  case 'Friday': {
     result = 5
     break
  }
  case 'Saturday': {
     result = 6
     break
  }
  case 'Sunday': {
     result = 7
     break
  }
} 
`,
    // Other primitive literals work too
    `
type Num = 0 | 1 | 2
type Bool = true | false
type Mix = 0 | 1 | 'two' | 'three' | true

function test1(value: Num): number {
  switch (value) {
    case 0: return 0
    case 1: return 1
    case 2: return 2
  }
}

function test2(value: Bool): number {
  switch (value) {
    case true: return 1
    case false: return 0
  }
}

function test3(value: Mix): number {
  switch (value) {
    case 0: return 0
    case 1: return 1
    case 'two': return 2
    case 'three': return 3
    case true: return 4
  }
}
`,
    // Works with type references
    `
type A = 'a'
type B = 'b'
type C = 'c'
type Union = A | B | C

function test(value: Union): number {
  switch (value) {
    case 'a': return 1
    case 'b': return 2
    case 'c': return 3
  }
}
`,
    // Works with `typeof`
    `
const A = 'a'
const B = 1
const C = true

type Union = typeof A | typeof B | typeof C

function test(value: Union): number {
  switch (value) {
    case 'a': return 1
    case 1: return 2
    case true: return 3
  }
}
`,
    // Switch contains default clause.
    `
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'  

const day = 'Monday' as Day
let result = 0

switch (day) {
  case 'Monday': {
     result = 1
     break
  }
  default: {
     result = 42
  }   
}
  `,
    // Exhaustiveness check only works for union types...
    `
const day = 'Monday' as string
let result = 0

switch (day) {
  case 'Monday': {
    result = 1
    break
  }
  case 'Tuesday': {
    result = 2
    break
  }
} 
  `,
    // ... and enums (at least for now).
    `
enum Enum { A, B }

function test(value: Enum): number {
  switch (value) {
    case Enum.A: return 1
    case Enum.B: return 2
  }
}
`,
    // Object union types won't work either, unless it's a discriminated union
    `
type ObjectUnion = { a: 1 } | { b: 2 }

function test(value: ObjectUnion): number {
  switch (value.a) {
    case 1: return 1
  }
}
`,
  ],
  invalid: [
    {
      // Matched only one branch out of seven.
      code: `
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'  

const day = 'Monday' as Day
let result = 0

switch (day) {
  case 'Monday': {
     result = 1
     break
  }
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 7, column: 9 }],
    },
    {
      // Didn't match all enum variants
      code: `
enum Enum { A, B }

function test(value: Enum): number {
  switch (value) {
    case Enum.A: return 1
  }
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 5, column: 11 }],
    },
    {
      code: `
type A = 'a'
type B = 'b'
type C = 'c'
type Union = A | B | C

function test(value: Union): number {
  switch (value) {
    case 'a': return 1
  }
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 8, column: 11 }],
    },
    {
      code: `
const A = 'a'
const B = 1
const C = true

type Union = typeof A | typeof B | typeof C

function test(value: Union): number {
  switch (value) {
    case 'a': return 1
  }
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 9, column: 11 }],
    },
    {
      code: `
type DiscriminatedUnion = { type: 'A', a: 1 } | { type: 'B', b: 2 }

function test(value: DiscriminatedUnion): number {
  switch (value.type) {
    case 'A': return 1
  }
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 5, column: 11 }],
    },
    {
      // Still complains with empty switch
      code: `
type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'  

const day = 'Monday' as Day

switch (day) {
}
`,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 6, column: 9 }],
    },
    {
      // Still complains with union intersection part
      code: `
type FooBar = string & { foo: void } | 'bar'

const foobar = 'bar' as FooBar
let result = 0

switch (foobar) {
  case 'bar': {
    result = 42
    break
  }
}      
      `,
      errors: [{ messageId: 'switchIsNotExhaustive', line: 7, column: 9 }],
    },
  ],
});
