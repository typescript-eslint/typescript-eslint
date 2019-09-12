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
    // Exhaustiveness check only works for union types for now.
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
  ],
});
