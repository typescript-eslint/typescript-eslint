import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-invalid-void-type';

const ruleTester = new RuleTester();

ruleTester.run('allowInGenericTypeArguments: false', rule, {
  valid: [
    {
      code: 'type Generic<T> = [T];',
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/1946
      code: `
function foo(): void | never {
  throw new Error('Test');
}
      `,
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'type voidNeverUnion = void | never;',
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'type neverVoidUnion = never | void;',
      options: [{ allowInGenericTypeArguments: false }],
    },
  ],
  invalid: [
    {
      code: 'type GenericVoid = Generic<void>;',
      errors: [
        {
          column: 28,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
      ],
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'function takeVoid(thing: void) {}',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
      ],
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'let voidPromise: Promise<void> = new Promise<void>(() => {});',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
        {
          column: 46,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
      ],
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'let voidMap: Map<string, void> = new Map<string, void>();',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
        {
          column: 50,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
      ],
      options: [{ allowInGenericTypeArguments: false }],
    },
    {
      code: 'type invalidVoidUnion = void | number;',
      errors: [
        {
          column: 25,
          line: 1,
          messageId: 'invalidVoidNotReturn',
        },
      ],
      options: [{ allowInGenericTypeArguments: false }],
    },
  ],
});

ruleTester.run('allowInGenericTypeArguments: true', rule, {
  valid: [
    'function func(): void {}',
    'type NormalType = () => void;',
    'let normalArrow = (): void => {};',
    'let ughThisThing = void 0;',
    'function takeThing(thing: undefined) {}',
    'takeThing(void 0);',
    'let voidPromise: Promise<void> = new Promise<void>(() => {});',
    'let voidMap: Map<string, void> = new Map<string, void>();',
    `
      function returnsVoidPromiseDirectly(): Promise<void> {
        return Promise.resolve();
      }
    `,
    'async function returnsVoidPromiseAsync(): Promise<void> {}',
    'type UnionType = string | number;',
    'type GenericVoid = Generic<void>;',
    'type Generic<T> = [T];',
    'type voidPromiseUnion = void | Promise<void>;',
    'type promiseNeverUnion = Promise<void> | never;',
    'const arrowGeneric1 = <T = void,>(arg: T) => {};',
    'declare function functionDeclaration1<T = void>(arg: T): void;',
    `
      class ClassName {
        accessor propName: number;
      }
    `,
    `
function f(): void;
function f(x: string): string;
function f(x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
    `,
    `
class SomeClass {
  f(): void;
  f(x: string): string;
  f(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
class SomeClass {
  ['f'](): void;
  ['f'](x: string): string;
  ['f'](x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
class SomeClass {
  [Symbol.iterator](): void;
  [Symbol.iterator](x: string): string;
  [Symbol.iterator](x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    noFormat`
class SomeClass {
  'f'(): void;
  'f'(x: string): string;
  'f'(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
class SomeClass {
  1(): void;
  1(x: string): string;
  1(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
const staticSymbol = Symbol.for('static symbol');

class SomeClass {
  [staticSymbol](): void;
  [staticSymbol](x: string): string;
  [staticSymbol](x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
declare module foo {
  function f(): void;
  function f(x: string): string;
  function f(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
{
  function f(): void;
  function f(x: string): string;
  function f(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
function f(): Promise<void>;
function f(x: string): Promise<string>;
async function f(x?: string): Promise<void | string> {
  if (x !== undefined) {
    return x;
  }
}
    `,
    `
class SomeClass {
  f(): Promise<void>;
  f(x: string): Promise<string>;
  async f(x?: string): Promise<void | string> {
    if (x !== undefined) {
      return x;
    }
  }
}
    `,
    `
function f(): void;

const a = 5;

function f(x: string): string;
function f(x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
    `,
    `
export default function (): void;
export default function (x: string): string;
export default function (x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
    `,
    `
export function f(): void;
export function f(x: string): string;
export function f(x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
    `,
    `
export {};

export function f(): void;
export function f(x: string): string;
export function f(x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
    `,
  ],
  invalid: [
    {
      code: 'function takeVoid(thing: void) {}',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'const arrowGeneric = <T extends void>(arg: T) => {};',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'const arrowGeneric2 = <T extends void = void>(arg: T) => {};',
      errors: [
        {
          column: 34,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'function functionGeneric<T extends void>(arg: T) {}',
      errors: [
        {
          column: 36,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'function functionGeneric2<T extends void = void>(arg: T) {}',
      errors: [
        {
          column: 37,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'declare function functionDeclaration<T extends void>(arg: T): void;',
      errors: [
        {
          column: 48,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'declare function functionDeclaration2<T extends void = void>(arg: T): void;',
      errors: [
        {
          column: 49,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'functionGeneric<void>(undefined);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'declare function voidArray(args: void[]): void[];',
      errors: [
        {
          column: 34,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
        {
          column: 43,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'let value = undefined as void;',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'let value = <void>undefined;',
      errors: [
        {
          column: 14,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'function takesThings(...things: void[]): void {}',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'type KeyofVoid = keyof void;',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        interface Interface {
          lambda: () => void;
          voidProp: void;
        }
      `,
      errors: [
        {
          column: 21,
          line: 4,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        class ClassName {
          private readonly propName: void;
        }
      `,
      errors: [
        {
          column: 38,
          line: 3,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        class ClassName {
          accessor propName: void;
        }
      `,
      errors: [
        {
          column: 30,
          line: 3,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'let letVoid: void;',
      errors: [
        {
          column: 14,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        type VoidType = void;
        class OtherClassName {
          private propName: VoidType;
        }
      `,
      errors: [
        {
          column: 25,
          line: 2,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'type UnionType2 = string | number | void;',
      errors: [
        {
          column: 37,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'type UnionType3 = string | ((number & any) | (string | void));',
      errors: [
        {
          column: 56,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'declare function test(): number | void;',
      errors: [
        {
          column: 35,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'declare function test<T extends number | void>(): T;',
      errors: [
        {
          column: 42,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'type IntersectionType = string & number & void;',
      errors: [
        {
          column: 43,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        type MappedType<T> = {
          [K in keyof T]: void;
        };
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: `
        type ConditionalType<T> = {
          [K in keyof T]: T[K] extends string ? void : string;
        };
      `,
      errors: [
        {
          column: 49,
          line: 3,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'type ManyVoid = readonly void[];',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'function foo(arr: readonly void[]) {}',
      errors: [
        {
          column: 28,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
    },
    {
      code: 'type invalidVoidUnion = void | Map<string, number>;',
      errors: [
        {
          column: 25,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'type invalidVoidUnion = void | Map;',
      errors: [
        {
          column: 25,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: `
class SomeClass {
  f(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
      `,
      errors: [
        {
          column: 27,
          line: 3,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'export default function (x?: string): string | void {}',
      errors: [
        {
          column: 48,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: 'export function f(x?: string): string | void {}',
      errors: [
        {
          column: 41,
          line: 1,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: `
function f(): void;
function f(x: string): string | void;
function f(x?: string): string | void {
  if (x !== undefined) {
    return x;
  }
}
      `,
      errors: [
        {
          column: 33,
          line: 3,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
    {
      code: `
class SomeClass {
  f(): void;
  f(x: string): string | void;
  f(x?: string): string | void {
    if (x !== undefined) {
      return x;
    }
  }
}
      `,
      errors: [
        {
          column: 26,
          line: 4,
          messageId: 'invalidVoidUnionConstituent',
        },
      ],
    },
  ],
});

ruleTester.run('allowInGenericTypeArguments: whitelist', rule, {
  valid: [
    'type Allowed<T> = [T];',
    'type Banned<T> = [T];',
    {
      code: 'type AllowedVoid = Allowed<void>;',
      options: [{ allowInGenericTypeArguments: ['Allowed'] }],
    },
    {
      code: 'type AllowedVoid = Ex.Mx.Tx<void>;',
      options: [{ allowInGenericTypeArguments: ['Ex.Mx.Tx'] }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: 'type AllowedVoid = Ex . Mx . Tx<void>;',
      options: [{ allowInGenericTypeArguments: ['Ex.Mx.Tx'] }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: 'type AllowedVoid = Ex . Mx . Tx<void>;',
      options: [{ allowInGenericTypeArguments: ['Ex.Mx . Tx'] }],
    },
    {
      code: 'type AllowedVoid = Ex.Mx.Tx<void>;',
      options: [{ allowInGenericTypeArguments: ['Ex . Mx . Tx'] }],
    },
    {
      code: 'type voidPromiseUnion = void | Promise<void>;',
      options: [{ allowInGenericTypeArguments: ['Promise'] }],
    },
    {
      code: 'type promiseVoidUnion = Promise<void> | void;',
      options: [{ allowInGenericTypeArguments: ['Promise'] }],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/1956
      code: `
async function foo(bar: () => void | Promise<void>) {
  await bar();
}
      `,
      options: [{ allowInGenericTypeArguments: ['Promise'] }],
    },
    {
      code: 'type promiseNeverUnion = Promise<void> | never;',
      options: [{ allowInGenericTypeArguments: ['Promise'] }],
    },
    {
      code: 'type voidPromiseNeverUnion = void | Promise<void> | never;',
      options: [{ allowInGenericTypeArguments: ['Promise'] }],
    },
  ],
  invalid: [
    {
      code: 'type BannedVoid = Banned<void>;',
      errors: [
        {
          column: 26,
          data: { generic: 'Banned' },
          line: 1,
          messageId: 'invalidVoidForGeneric',
        },
      ],
      options: [{ allowInGenericTypeArguments: ['Allowed'] }],
    },
    {
      code: 'type BannedVoid = Ex.Mx.Tx<void>;',
      errors: [
        {
          column: 28,
          data: { generic: 'Ex.Mx.Tx' },
          line: 1,
          messageId: 'invalidVoidForGeneric',
        },
      ],
      options: [{ allowInGenericTypeArguments: ['Tx'] }],
    },
    {
      code: 'function takeVoid(thing: void) {}',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'invalidVoidNotReturnOrGeneric',
        },
      ],
      options: [{ allowInGenericTypeArguments: ['Allowed'] }],
    },
  ],
});

ruleTester.run('allowAsThisParameter: true', rule, {
  valid: [
    {
      code: 'function f(this: void) {}',
      options: [{ allowAsThisParameter: true }],
    },
    {
      code: `
class Test {
  public static helper(this: void) {}
  method(this: void) {}
}
      `,
      options: [{ allowAsThisParameter: true }],
    },
  ],
  invalid: [
    {
      code: 'type alias = void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParamOrGeneric',
        },
      ],
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: true },
      ],
    },
    {
      code: 'type alias = void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParam',
        },
      ],
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: false },
      ],
    },
    {
      code: 'type alias = Array<void>;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParam',
        },
      ],
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: false },
      ],
    },
  ],
});
