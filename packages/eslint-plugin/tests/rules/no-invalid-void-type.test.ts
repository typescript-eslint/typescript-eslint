import rule from '../../src/rules/no-invalid-void-type';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
      options: [{ allowInGenericTypeArguments: false }],
      errors: [
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'function takeVoid(thing: void) {}',
      options: [{ allowInGenericTypeArguments: false }],
      errors: [
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'let voidPromise: Promise<void> = new Promise<void>(() => {});',
      options: [{ allowInGenericTypeArguments: false }],
      errors: [
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 26,
        },
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 46,
        },
      ],
    },
    {
      code: 'let voidMap: Map<string, void> = new Map<string, void>();',
      options: [{ allowInGenericTypeArguments: false }],
      errors: [
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 26,
        },
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 50,
        },
      ],
    },
    {
      code: 'type invalidVoidUnion = void | number;',
      options: [{ allowInGenericTypeArguments: false }],
      errors: [
        {
          messageId: 'invalidVoidNotReturn',
          line: 1,
          column: 25,
        },
      ],
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
  ],
  invalid: [
    {
      code: 'function takeVoid(thing: void) {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'const arrowGeneric = <T extends void>(arg: T) => {};',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'const arrowGeneric1 = <T = void>(arg: T) => {};',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'const arrowGeneric2 = <T extends void = void>(arg: T) => {};',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 34,
        },
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 41,
        },
      ],
    },
    {
      code: 'function functionGeneric<T extends void>(arg: T) {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 36,
        },
      ],
    },
    {
      code: 'function functionGeneric1<T = void>(arg: T) {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 31,
        },
      ],
    },
    {
      code: 'function functionGeneric2<T extends void = void>(arg: T) {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 37,
        },
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 44,
        },
      ],
    },
    {
      code:
        'declare function functionDeclaration<T extends void>(arg: T): void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 48,
        },
      ],
    },
    {
      code: 'declare function functionDeclaration1<T = void>(arg: T): void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 43,
        },
      ],
    },
    {
      code:
        'declare function functionDeclaration2<T extends void = void>(arg: T): void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 49,
        },
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 56,
        },
      ],
    },
    {
      code: 'functionGeneric<void>(undefined);',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'declare function voidArray(args: void[]): void[];',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 34,
        },
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 43,
        },
      ],
    },
    {
      code: 'let value = undefined as void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'let value = <void>undefined;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 14,
        },
      ],
    },
    {
      code: 'function takesThings(...things: void[]): void {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'type KeyofVoid = keyof void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 24,
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
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 4,
          column: 21,
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
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 3,
          column: 38,
        },
      ],
    },
    {
      code: 'let letVoid: void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 14,
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
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 2,
          column: 25,
        },
      ],
    },
    {
      code: 'type UnionType2 = string | number | void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 37,
        },
      ],
    },
    {
      code: 'type UnionType3 = string | ((number & any) | (string | void));',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 56,
        },
      ],
    },
    {
      code: 'type IntersectionType = string & number & void;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 43,
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
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 3,
          column: 27,
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
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 3,
          column: 49,
        },
      ],
    },
    {
      code: 'type ManyVoid = readonly void[];',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'function foo(arr: readonly void[]) {}',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'type invalidVoidUnion = void | Map<string, number>;',
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 25,
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
      options: [{ allowInGenericTypeArguments: ['Allowed'] }],
      errors: [
        {
          messageId: 'invalidVoidForGeneric',
          data: { generic: 'Banned' },
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'type BannedVoid = Ex.Mx.Tx<void>;',
      options: [{ allowInGenericTypeArguments: ['Tx'] }],
      errors: [
        {
          messageId: 'invalidVoidForGeneric',
          data: { generic: 'Ex.Mx.Tx' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'function takeVoid(thing: void) {}',
      options: [{ allowInGenericTypeArguments: ['Allowed'] }],
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrGeneric',
          line: 1,
          column: 26,
        },
      ],
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
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: true },
      ],
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParamOrGeneric',
        },
      ],
    },
    {
      code: 'type alias = void;',
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: false },
      ],
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParam',
        },
      ],
    },
    {
      code: 'type alias = Array<void>;',
      options: [
        { allowAsThisParameter: true, allowInGenericTypeArguments: false },
      ],
      errors: [
        {
          messageId: 'invalidVoidNotReturnOrThisParam',
        },
      ],
    },
  ],
});
