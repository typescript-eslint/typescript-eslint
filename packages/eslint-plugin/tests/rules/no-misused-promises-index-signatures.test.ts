import rule from '../../src/rules/no-misused-promises';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misused-promises (index signatures)', rule, {
  valid: [
    `
const handlers: Record<string, () => void> = { run() {} };
    `,
    `
const handlers: Record<string, () => void | Promise<void>> = { async run() {} };
    `,
    `
const handlers:
  Record<string, () => void> | Record<string, () => Promise<void>> = {
  async run() {},
};
    `,
    `
const handlers: {
  [key: string]: () => void | Promise<void>;
  [key: number]: () => void;
} = { async run() {} };
    `,
    `
const handlers = { async run() {} };
    `,
    `
const key: string = 'run';
const handlers: Record<number, () => void> = { async [key]() {} };
    `,
    `
interface Handlers extends Record<typeof Symbol.iterator, () => Promise<void>> {
  [key: string]: () => void;
}
    `,
    `
interface Handlers {
  [key: string]: () => void | Promise<void>;
  run(): Promise<void>;
}
    `,
    `
interface Handlers {
  [key: string]: (() => void) | (() => Promise<void>);
  run(): Promise<void>;
}
    `,
    `
interface Handlers {
  [key: string]: Promise<void>;
  run: Promise<void>;
}
    `,
    `
interface Handlers {
  [key: string]: () => void;
  run(): void;
}
    `,
    `
interface Handlers {
  [key: number]: () => void;
  run(): Promise<void>;
}
    `,
    `
interface Handlers {
  [key: number]: () => void;
  '01'(): Promise<void>;
}
    `,
    `
interface Handlers {
  [key: \`on\${string}\`]: () => void;
  run(): Promise<void>;
}
    `,
    `
interface Handlers {
  [key: symbol]: () => void;
  run(): Promise<void>;
}
    `,
    `
class Handlers {
  [key: string]: () => void;
  static async run() {}
}
    `,
    `
class Handlers {
  [key: string]: () => void;
  async #run() {}
}
    `,
    `
class AsyncHandler {
  async run() {}
}
class Handlers extends AsyncHandler {
  static [key: string]: () => void;
}
    `,
    `
interface Handlers {
  [key: string]: () => void;
  (): Promise<void>;
  new (): Promise<void>;
}
    `,
    `
interface AsyncHandlers {
  [key: symbol]: () => Promise<void>;
}
interface SyncHandlers extends AsyncHandlers {
  [key: string]: () => void;
}
    `,
    {
      code: `
const handlers: Record<string, () => void> = { async run() {} };
      `,
      options: [{ checksVoidReturn: { properties: false } }],
    },
    {
      code: `
declare function useHandlers(handlers: Record<string, () => void>): void;
useHandlers({ async run() {} });
      `,
      options: [{ checksVoidReturn: { properties: false } }],
    },
    {
      code: `
function handlers(): Record<string, () => void> {
  return {
    run() {
      return Promise.resolve();
    },
  };
}
      `,
      options: [{ checksVoidReturn: { properties: false } }],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  run(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: false } }],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  [key: \`on\${string}\`]: () => Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: false } }],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
interface AsyncHandlers extends SyncHandlers {
  [key: string]: () => Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: false } }],
    },
    {
      code: `
interface AsyncHandler {
  run(): Promise<void>;
}
interface SyncHandlers extends AsyncHandler {
  [key: string]: () => void;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: false } }],
    },
    {
      code: `
const handlers: Record<string, () => void> = { async run() {} };
      `,
      options: [{ checksVoidReturn: false }],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  run(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: false }],
    },
  ],
  invalid: [
    {
      code: `
interface Handlers extends Record<'run', () => Promise<void>> {
  [key: string]: () => void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers extends Record<0, () => Promise<void>> {
  [key: number]: () => void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
const handlers: Record<string, () => void> = { async run() {} };
      `,
      errors: [
        {
          column: 48,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
declare function useHandlers(handlers: Record<string, () => void>): void;
useHandlers({ async run() {} });
      `,
      errors: [
        {
          column: 15,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
function handlers(): Record<string, () => void> {
  return {
    run() {
      return Promise.resolve();
    },
  };
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<number, () => void> = { async 0() {} };
      `,
      errors: [
        {
          column: 48,
          endColumn: 55,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<number, () => void> = { async '0'() {} };
      `,
      errors: [
        {
          column: 48,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<\`on\${string}\`, () => void> = { async onClick() {} };
      `,
      errors: [
        {
          column: 55,
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<symbol, () => void> = { async [Symbol.iterator]() {} };
      `,
      errors: [
        {
          column: 48,
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const key = 'run';
const handlers: Record<string, () => void> = { async [key]() {} };
      `,
      errors: [
        {
          column: 48,
          endColumn: 59,
          endLine: 3,
          line: 3,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<string, () => void> = {
  run(): Promise<void> {
    return Promise.resolve();
  },
};
      `,
      errors: [
        {
          column: 10,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: Record<string, () => void> | undefined = { async run() {} };
      `,
      errors: [
        {
          column: 60,
          endColumn: 69,
          endLine: 2,
          line: 2,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
const handlers: {
  [key: string]: () => void | Promise<void>;
  [key: number]: () => void;
} = { async '0'() {} };
      `,
      errors: [
        {
          column: 7,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  run: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
type Handlers = {
  [key: string]: () => void;
  run(): Promise<void>;
};
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
class Handlers {
  [key: string]: () => void;
  async run() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
const Handlers = class {
  [key: string]: () => void;
  run = async () => {};
};
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  [key: \`on\${string}\`]: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 45,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: string]: () => void;
  [key: number]: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: number]: () => void;
  [key: \`\${number}\`]: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 43,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: number]: () => void;
  '0'(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: symbol]: () => void;
  [Symbol.iterator](): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers {
  [key: string]: (() => void) | undefined;
  run?(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
interface AsyncHandlers extends SyncHandlers {
  [key: string]: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
interface AsyncHandlers extends SyncHandlers {
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
class AsyncHandlers implements SyncHandlers {
  [key: string]: () => void;
  async run() {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 7,
          line: 7,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
class SyncHandlers {
  [key: string]: () => void;
}
const AsyncHandlers = class extends SyncHandlers {
  run = async () => {};
};
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface Handlers<T> {
  [key: string]: () => T;
}
interface AsyncHandlers extends Handlers<void> {
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface AsyncHandler {
  run(): Promise<void>;
}
interface SyncHandlers extends AsyncHandler {
  [key: string]: () => void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface AsyncHandlers {
  [key: \`on\${string}\`]: () => Promise<void>;
}
interface SyncHandlers extends AsyncHandlers {
  [key: string]: () => void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
type SyncHandlers = Record<string, () => void>;
interface AsyncHandlers extends SyncHandlers {
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string | symbol]: () => void;
}
interface AsyncHandlers extends SyncHandlers {
  [key: symbol]: () => Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
interface Handlers<T> extends SyncHandlers {
  run(): Promise<T>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface AsyncHandlers<T> {
  run(): Promise<T>;
}
interface Handlers extends AsyncHandlers<void> {
  [key: string]: () => void;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 29,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
}
interface AsyncHandlers extends SyncHandlers {
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 6,
          line: 6,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { inheritedMethods: false } }],
    },
    {
      code: `
interface SyncHandlers {
  [key: string]: () => void;
  run(): void;
}
interface AsyncHandlers extends SyncHandlers {
  run(): Promise<void>;
}
      `,
      errors: [
        {
          column: 3,
          data: { heritageTypeName: 'SyncHandlers' },
          endColumn: 24,
          endLine: 7,
          line: 7,
          messageId: 'voidReturnInheritedMethod',
        },
      ],
    },
  ],
});
