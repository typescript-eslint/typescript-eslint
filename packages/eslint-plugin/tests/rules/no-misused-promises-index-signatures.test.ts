import rule from '../../src/rules/no-misused-promises';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misused-promises (index signatures)', rule, {
  valid: [
    // Sync method in a class with a string index signature expecting void — no error
    {
      code: `
interface Base {
  [key: string]: () => void;
}

class Impl implements Base {
  [key: string]: () => void;
  doSync(): void {
    return;
  }
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Index signature with void return matching another index signature — no error
    {
      code: `
interface AllSync {
  [key: string]: () => void;
  [key: number]: () => void;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Async method OK when index signature itself is thenable
    {
      code: `
interface AsyncIndex {
  [key: string]: () => Promise<void>;
  doAsync(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // When indexSignatures option is disabled, no errors reported
    {
      code: `
interface Bad {
  [key: string]: () => void;
  asyncMethod(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: false } }],
    },
    // Non-function index signature — not applicable
    {
      code: `
interface Data {
  [key: string]: number;
  asyncMethod(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Number index signature should not apply to non-numeric member names
    {
      code: `
interface NumIndexed {
  [key: number]: () => void;
  namedMethod(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Static members should be skipped
    {
      code: `
class WithStatic {
  [key: string]: (() => void) | string;
  static async staticMethod(): Promise<void> {
    await Promise.resolve();
  }
}
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Type literal with no index signature — no check needed
    {
      code: `
type Obj = {
  asyncMethod(): Promise<void>;
};
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Record type with sync property — valid
    {
      code: `
let value: Record<string, () => void>;
value.sync = () => {};
      `,
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // checksVoidReturn: false disables all checks including indexSignatures
    {
      code: `
interface ShouldBeIgnored {
  [key: string]: () => void;
  asyncMethod(): Promise<void>;
}
      `,
      options: [{ checksVoidReturn: false }],
    },
  ],
  invalid: [
    // Interface: async method declared alongside void-returning index signature
    {
      code: `
interface InvalidInterface {
  [syncKey: string]: () => void;
  asyncMethod(): Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Interface: async property alongside void-returning index signature
    {
      code: `
interface InvalidInterface {
  [syncKey: string]: () => void;
  asyncProperty: () => Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Subinterface inheriting void-returning index signature
    {
      code: `
interface Parent {
  [key: string]: () => void;
}

interface Child extends Parent {
  asyncMethod(): Promise<void>;
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Class extending abstract class with void index signature
    {
      code: `
abstract class AbstractBase {
  [key: string]: (() => void) | string;
}

class Derived extends AbstractBase {
  async doAsync(): Promise<void> {
    await Promise.resolve();
  }
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Type literal with async method vs void index signature
    {
      code: `
type SyncActions = {
  [key: string]: () => void;
  runAsync(): Promise<void>;
};
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Type literal with async property vs void index signature
    {
      code: `
type SyncActions = {
  [key: string]: () => void;
  runAsync: () => Promise<void>;
};
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Multiple members violating index signature constraint
    {
      code: `
interface MultiViolation {
  [key: string]: () => void;
  asyncOne(): Promise<void>;
  asyncTwo(): Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
        {
          line: 5,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Class: async method with index signature from own class (no inheritance)
    {
      code: `
class SelfContained {
  [key: string]: (() => void) | string;
  async doAsync(): Promise<void> {
    await Promise.resolve();
  }
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Default behavior (indexSignatures defaults to true when checksVoidReturn options omitted)
    {
      code: `
interface DefaultCheck {
  [key: string]: () => void;
  asyncMethod(): Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
    },
    // Class implements interface with void index (no own index sig — single source)
    {
      code: `
interface EventMap {
  [event: string]: () => void;
}

class Emitter implements EventMap {
  async onReady(): Promise<void> {
    await Promise.resolve();
  }
}
      `,
      errors: [
        {
          line: 7,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Numeric index with numeric-keyed member returning Promise
    {
      code: `
interface NumericIndex {
  [key: number]: () => void;
  0: () => Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { indexSignatures: true } }],
    },
    // Partial options: indexSignatures defaults to true even when other options are set
    {
      code: `
interface PartialOpts {
  [key: string]: () => void;
  asyncMethod(): Promise<void>;
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnIndexSignature',
        },
      ],
      options: [{ checksVoidReturn: { arguments: false } }],
    },
  ],
});
