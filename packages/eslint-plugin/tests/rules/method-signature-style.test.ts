import rule from '../../src/rules/method-signature-style';
import { batchedSingleLineTests, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('method-signature-style', rule, {
  valid: [
    ...batchedSingleLineTests({
      code: `
        interface Test { f: (a: string) => number }
        interface Test { ["f"]: (a: boolean) => void }
        interface Test { f: <T>(a: T) => T }
        interface Test { ['f']: <T>(a: T, b: T) => T }
        type Test = { f: (a: string) => number }
        type Test = { ["f"]: (a: boolean) => void }
        type Test = { f: <T>(a: T) => T }
        type Test = { ['f']: <T>(a: T, b: T) => T }
      `,
    }),
    ...batchedSingleLineTests({
      options: ['method'],
      code: `
        interface Test { f(a: string): number }
        interface Test { ["f"](a: boolean): void }
        interface Test { f<T>(a: T): T }
        interface Test { ['f']<T>(a: T, b: T): T }
        type Test = { f(a: string): number }
        type Test = { ["f"](a: boolean): void }
        type Test = { f<T>(a: T): T }
        type Test = { ['f']<T>(a: T, b: T): T }
      `,
    }),
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: `
        interface Test { f(a: string): number }
        interface Test { ["f"](a: boolean): void }
        interface Test { f<T>(a: T): T }
        interface Test { ['f']<T>(a: T, b: T): T }
        type Test = { f(a: string): number }
        type Test = { ["f"](a: boolean): void }
        type Test = { f<T>(a: T): T }
        type Test = { ['f']<T>(a: T, b: T): T }
      `,
      errors: [
        { messageId: 'errorMethod', line: 2 },
        { messageId: 'errorMethod', line: 3 },
        { messageId: 'errorMethod', line: 4 },
        { messageId: 'errorMethod', line: 5 },
        { messageId: 'errorMethod', line: 6 },
        { messageId: 'errorMethod', line: 7 },
        { messageId: 'errorMethod', line: 8 },
        { messageId: 'errorMethod', line: 9 },
      ],
    }),
    ...batchedSingleLineTests({
      options: ['method'],
      code: `
        interface Test { f: (a: string) => number }
        interface Test { ["f"]: (a: boolean) => void }
        interface Test { f: <T>(a: T) => T }
        interface Test { ['f']: <T>(a: T, b: T) => T }
        type Test = { f: (a: string) => number }
        type Test = { ["f"]: (a: boolean) => void }
        type Test = { f: <T>(a: T) => T }
        type Test = { ['f']: <T>(a: T, b: T) => T }
      `,
      errors: [
        { messageId: 'errorProperty', line: 2 },
        { messageId: 'errorProperty', line: 3 },
        { messageId: 'errorProperty', line: 4 },
        { messageId: 'errorProperty', line: 5 },
        { messageId: 'errorProperty', line: 6 },
        { messageId: 'errorProperty', line: 7 },
        { messageId: 'errorProperty', line: 8 },
        { messageId: 'errorProperty', line: 9 },
      ],
    }),
  ],
});
