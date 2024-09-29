import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-deprecated';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      tsconfigRootDir: rootDir,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-deprecated', rule, {
  valid: [
    '/** @deprecated */ var a;',
    '/** @deprecated */ var a = 1;',
    '/** @deprecated */ let a;',
    '/** @deprecated */ let a = 1;',
    '/** @deprecated */ const a = 1;',
    '/** @deprecated */ declare var a: number;',
    '/** @deprecated */ declare let a: number;',
    '/** @deprecated */ declare const a: number;',
    '/** @deprecated */ export var a = 1;',
    '/** @deprecated */ export let a = 1;',
    '/** @deprecated */ export const a = 1;',
    'const [/** @deprecated */ a] = [b];',
    'const [/** @deprecated */ a] = b;',
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      a.b;
    `,
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      a?.b;
    `,
    `
      declare const a: {
        b: 1;
        /** @deprecated */ c: 2;
      };

      a.b;
    `,
    `
      class A {
        b: 1;
        /** @deprecated */ c: 2;
      }

      new A().b;
    `,
    `
      declare class A {
        /** @deprecated */
        static b: string;
        static c: string;
      }

      A.c;
    `,
    `
      namespace A {
        /** @deprecated */
        export const b = '';
        export const c = '';
      }

      A.c;
    `,
    `
      enum A {
        /** @deprecated */
        b = 'b',
        c = 'c',
      }

      A.c;
    `,
    `
      function a(value: 'b' | undefined): void;
      /** @deprecated */
      function a(value: 'c' | undefined): void;
      function a(value: string | undefined): void {
        // ...
      }

      a('b');
    `,
    `
      import { deprecatedFunctionWithOverloads } from './deprecated';

      const foo = deprecatedFunctionWithOverloads();
    `,
    `
      import * as imported from './deprecated';

      const foo = imported.deprecatedFunctionWithOverloads();
    `,
    `
      import { ClassWithDeprecatedConstructor } from './deprecated';

      const foo = new ClassWithDeprecatedConstructor();
    `,
    `
      import * as imported from './deprecated';

      const foo = new imported.ClassWithDeprecatedConstructor();
    `,
    `
      class A {
        a(value: 'b'): void;
        /** @deprecated */
        a(value: 'c'): void;
      }
      declare const foo: A;
      foo.a('b');
    `,
    `
      const A = class {
        /** @deprecated */
        constructor();
        constructor(arg: string);
        constructor(arg?: string) {}
      };

      new A('a');
    `,
    `
      type A = {
        (value: 'b'): void;
        /** @deprecated */
        (value: 'c'): void;
      };
      declare const foo: A;
      foo('b');
    `,
    `
      declare const a: {
        new (value: 'b'): void;
        /** @deprecated */
        new (value: 'c'): void;
      };
      new a('b');
    `,
    `
      namespace assert {
        export function fail(message?: string | Error): never;
        /** @deprecated since v10.0.0 - use fail([message]) or other assert functions instead. */
        export function fail(actual: unknown, expected: unknown): never;
      }

      assert.fail('');
    `,
    `
      import assert from 'node:assert';

      assert.fail('');
    `,
    `
      declare module 'deprecations' {
        /** @deprecated */
        export const value = true;
      }

      import { value } from 'deprecations';
    `,
    `
      /** @deprecated Use ts directly. */
      export * as ts from 'typescript';
    `,
    `
      export {
        /** @deprecated Use ts directly. */
        default as ts,
      } from 'typescript';
    `,

    // TODO: Can anybody figure out how to get this to report on `b`?
    // getContextualType retrieves the union type, but it has no symbol...
    `
      interface AProps {
        /** @deprecated */
        b: number | string;
      }

      function A(props: AProps) {
        return <div />;
      }

      const a = <A b="" />;
    `,
    `
      namespace A {
        /** @deprecated */
        export type B = string;
        export type C = string;
        export type D = string;
      }

      export type D = A.C | A.D;
    `,
    `
      interface Props {
        anchor: 'foo';
      }
      declare const x: Props;
      const { anchor = '' } = x;
    `,
    `
      interface Props {
        anchor: 'foo';
      }
      declare const x: { bar: Props };
      const {
        bar: { anchor = '' },
      } = x;
    `,
    `
      interface Props {
        anchor: 'foo';
      }
      declare const x: [item: Props];
      const [{ anchor = 'bar' }] = x;
    `,
    'function fn(/** @deprecated */ foo = 4) {}',
    {
      code: `
        async function fn() {
          const d = await import('./deprecated.js');
          d.default;
        }
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: rootDir,
          projectService: false,
          project: './tsconfig.moduleResolution-node16.json',
        },
      },
    },
    'call();',

    // this test is to ensure the rule doesn't crash when class implements itself
    // https://github.com/typescript-eslint/typescript-eslint/issues/10031
    `
      class Foo implements Foo {
        get bar(): number {
          return 42;
        }

        baz(): number {
          return this.bar;
        }
      }
    `,
  ],
  invalid: [
    {
      code: `
        /** @deprecated */ var a = undefined;
        a;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ export var a = undefined;
        a;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ let a = undefined;
        a;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ export let a = undefined;
        a;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ let aLongName = undefined;
        aLongName;
      `,
      errors: [
        {
          column: 9,
          endColumn: 18,
          line: 3,
          endLine: 3,
          data: { name: 'aLongName' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const c = a;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const c = a;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: 'Reason.' },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const { c = a } = {};
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const [c = a] = [];
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        console.log(a);
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare function log(...args: unknown): void;

        /** @deprecated */ const a = { b: 1 };

        log(a);
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 6,
          endLine: 6,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        console.log(a.b);
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        console.log(a?.b);
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: { c: 1 } };
        a.b.c;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: { c: 1 } };
        a.b?.c;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: { c: 1 } };
        a?.b?.c;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */ b: { c: 1 },
        };
        a.b.c;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 5,
          endLine: 5,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare const a: {
          /** @deprecated */ b: { c: 1 };
        };
        a.b.c;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 5,
          endLine: 5,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const c = a.b;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const { c } = a.b;
      `,
      errors: [
        {
          column: 23,
          endColumn: 24,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const { c = 'd' } = a.b;
      `,
      errors: [
        {
          column: 29,
          endColumn: 30,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const { c: d } = a.b;
      `,
      errors: [
        {
          column: 26,
          endColumn: 27,
          line: 3,
          endLine: 3,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare const a: string[];
        const [b] = [a];
      `,
      errors: [
        {
          column: 22,
          endColumn: 23,
          line: 4,
          endLine: 4,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        class A {}

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        export class A {}

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        const A = class {};

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare class A {}

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const A = class {
          /** @deprecated */
          constructor() {}
        };

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const A = class {
          /** @deprecated */
          constructor();
          constructor(arg: string);
          constructor(arg?: string) {}
        };

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 9,
          endLine: 9,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare const A: {
          /** @deprecated */
          new (): string;
        };

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare class A {
          constructor();
        }

        new A();
      `,
      errors: [
        {
          column: 13,
          endColumn: 14,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        class A {
          /** @deprecated */
          b: string;
        }

        declare const a: A;

        const { b } = a;
      `,
      errors: [
        {
          column: 17,
          endColumn: 18,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          b(): string;
        }

        declare const a: A;

        a.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          b(): string;
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          b: () => string;
        }

        declare const a: A;

        a.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          b: () => string;
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface A {
          /** @deprecated */
          b: () => string;
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        class A {
          /** @deprecated */
          b(): string {
            return '';
          }
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 11,
          endLine: 11,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated Use b(value). */
          b(): string;
          b(value: string): string;
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 10,
          endLine: 10,
          data: { name: 'b', reason: 'Use b(value).' },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          static b: string;
        }

        A.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare const a: {
          /** @deprecated */
          b: string;
        };

        a.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface A {
          /** @deprecated */
          b: string;
        }

        declare const a: A;

        a.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export interface A {
          /** @deprecated */
          b: string;
        }

        declare const a: A;

        a.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface A {
          /** @deprecated */
          b: string;
        }

        declare const a: A;

        const { b } = a;
      `,
      errors: [
        {
          column: 17,
          endColumn: 18,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        type A = {
          /** @deprecated */
          b: string;
        };

        declare const a: A;

        const { b } = a;
      `,
      errors: [
        {
          column: 17,
          endColumn: 18,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export type A = {
          /** @deprecated */
          b: string;
        };

        declare const a: A;

        const { b } = a;
      `,
      errors: [
        {
          column: 17,
          endColumn: 18,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        type A = () => {
          /** @deprecated */
          b: string;
        };

        declare const a: A;

        const { b } = a();
      `,
      errors: [
        {
          column: 17,
          endColumn: 18,
          line: 9,
          endLine: 9,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        type A = string[];

        declare const a: A;

        const [b] = a;
      `,
      errors: [
        {
          column: 26,
          endColumn: 27,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        namespace A {
          /** @deprecated */
          export const b = '';
        }

        A.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export namespace A {
          /** @deprecated */
          export const b = '';
        }

        A.b;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        namespace A {
          /** @deprecated */
          export function b() {}
        }

        A.b();
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        namespace assert {
          export function fail(message?: string | Error): never;
          /** @deprecated since v10.0.0 - use fail([message]) or other assert functions instead. */
          export function fail(actual: unknown, expected: unknown): never;
        }

        assert.fail({}, {});
      `,
      errors: [
        {
          column: 16,
          endColumn: 20,
          line: 8,
          endLine: 8,
          data: {
            name: 'fail',
            reason:
              'since v10.0.0 - use fail([message]) or other assert functions instead.',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import assert from 'node:assert';

        assert.fail({}, {});
      `,
      errors: [
        {
          column: 16,
          endColumn: 20,
          line: 4,
          endLine: 4,
          data: {
            name: 'fail',
            reason:
              'since v10.0.0 - use fail([message]) or other assert functions instead.',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        enum A {
          a,
        }

        A.a;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        enum A {
          /** @deprecated */
          a,
        }

        A.a;
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          line: 7,
          endLine: 7,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        function a() {}

        a();
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 5,
          endLine: 5,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        function a(): void;
        function a() {}

        a();
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 6,
          endLine: 6,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        function a(): void;
        /** @deprecated */
        function a(value: string): void;
        function a(value?: string) {}

        a('');
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 7,
          endLine: 7,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        type A = {
          (value: 'b'): void;
          /** @deprecated */
          (value: 'c'): void;
        };
        declare const foo: A;
        foo('c');
      `,
      errors: [
        {
          column: 9,
          endColumn: 12,
          line: 8,
          endLine: 8,
          data: { name: 'foo' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        function a(
          /** @deprecated */
          b?: boolean,
        ) {
          return b;
        }
      `,
      errors: [
        {
          column: 18,
          endColumn: 19,
          line: 6,
          endLine: 6,
          data: { name: 'b' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export function isTypeFlagSet(
          type: ts.Type,
          flagsToCheck: ts.TypeFlags,
          /** @deprecated This param is not used and will be removed in the future. */
          isReceiver?: boolean,
        ): boolean {
          const flags = getTypeFlags(type);

          if (isReceiver && flags & ANY_OR_UNKNOWN) {
            return true;
          }

          return (flags & flagsToCheck) !== 0;
        }
      `,
      errors: [
        {
          column: 15,
          endColumn: 25,
          line: 10,
          endLine: 10,
          data: {
            name: 'isReceiver',
            reason: 'This param is not used and will be removed in the future.',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare function a(...args: unknown[]): string;

        a\`\`;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 5,
          endLine: 5,
          data: { name: 'a' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        const A = () => <div />;

        const a = <A />;
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        const A = () => <div />;

        const a = <A></A>;
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 5,
          endLine: 5,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        function A() {
          return <div />;
        }

        const a = <A />;
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        function A() {
          return <div />;
        }

        const a = <A></A>;
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        export type A = string;
        export type B = string;
        export type C = string;

        export type D = A | B | C;
      `,
      errors: [
        {
          column: 25,
          endColumn: 26,
          line: 7,
          endLine: 7,
          data: { name: 'A' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        namespace A {
          /** @deprecated */
          export type B = string;
          export type C = string;
          export type D = string;
        }

        export type D = A.B | A.C | A.D;
      `,
      errors: [
        {
          column: 27,
          endColumn: 28,
          line: 9,
          endLine: 9,
          data: { name: 'B' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface Props {
          /** @deprecated */
          anchor: 'foo';
        }
        declare const x: Props;
        const { anchor = '' } = x;
      `,
      errors: [
        {
          column: 17,
          endColumn: 23,
          line: 7,
          endLine: 7,
          data: { name: 'anchor' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface Props {
          /** @deprecated */
          anchor: 'foo';
        }
        declare const x: { bar: Props };
        const {
          bar: { anchor = '' },
        } = x;
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          line: 8,
          endLine: 8,
          data: { name: 'anchor' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface Props {
          /** @deprecated */
          anchor: 'foo';
        }
        declare const x: [item: Props];
        const [{ anchor = 'bar' }] = x;
      `,
      errors: [
        {
          column: 18,
          endColumn: 24,
          line: 7,
          endLine: 7,
          data: { name: 'anchor' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        interface Props {
          /** @deprecated */
          foo: Props;
        }
        declare const x: Props;
        const { foo = x } = x;
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          line: 7,
          endLine: 7,
          data: { name: 'foo' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { DeprecatedClass } from './deprecated';

        const foo = new DeprecatedClass();
      `,
      errors: [
        {
          column: 25,
          endColumn: 40,
          line: 4,
          endLine: 4,
          data: { name: 'DeprecatedClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { DeprecatedClass } from './deprecated';

        declare function inject(something: new () => unknown): void;

        inject(DeprecatedClass);
      `,
      errors: [
        {
          column: 16,
          endColumn: 31,
          line: 6,
          endLine: 6,
          data: { name: 'DeprecatedClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { deprecatedVariable } from './deprecated';

        const foo = deprecatedVariable;
      `,
      errors: [
        {
          column: 21,
          endColumn: 39,
          line: 4,
          endLine: 4,
          data: { name: 'deprecatedVariable' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { DeprecatedClass } from './deprecated';

        declare const x: DeprecatedClass;

        const { foo } = x;
      `,
      errors: [
        {
          column: 26,
          endColumn: 41,
          line: 4,
          endLine: 4,
          data: { name: 'DeprecatedClass' },
          messageId: 'deprecated',
        },
        {
          column: 17,
          endColumn: 20,
          line: 6,
          endLine: 6,
          data: { name: 'foo' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { deprecatedFunction } from './deprecated';

        deprecatedFunction();
      `,
      errors: [
        {
          column: 9,
          endColumn: 27,
          line: 4,
          endLine: 4,
          data: { name: 'deprecatedFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = new imported.NormalClass();
      `,
      errors: [
        {
          column: 34,
          endColumn: 45,
          line: 4,
          endLine: 4,
          data: { name: 'NormalClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { NormalClass } from './deprecated';

        const foo = new NormalClass();
      `,
      errors: [
        {
          column: 25,
          endColumn: 36,
          line: 4,
          endLine: 4,
          data: { name: 'NormalClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.NormalClass;
      `,
      errors: [
        {
          column: 30,
          endColumn: 41,
          line: 4,
          endLine: 4,
          data: { name: 'NormalClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { NormalClass } from './deprecated';

        const foo = NormalClass;
      `,
      errors: [
        {
          column: 21,
          endColumn: 32,
          line: 4,
          endLine: 4,
          data: { name: 'NormalClass' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { normalVariable } from './deprecated';

        const foo = normalVariable;
      `,
      errors: [
        {
          column: 21,
          endColumn: 35,
          line: 4,
          endLine: 4,
          data: { name: 'normalVariable' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.normalVariable;
      `,
      errors: [
        {
          column: 30,
          endColumn: 44,
          line: 4,
          endLine: 4,
          data: { name: 'normalVariable' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const { normalVariable } = imported;
      `,
      errors: [
        {
          column: 17,
          endColumn: 31,
          line: 4,
          endLine: 4,
          data: { name: 'normalVariable' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { normalFunction } from './deprecated';

        const foo = normalFunction;
      `,
      errors: [
        {
          column: 21,
          endColumn: 35,
          line: 4,
          endLine: 4,
          data: { name: 'normalFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.normalFunction;
      `,
      errors: [
        {
          column: 30,
          endColumn: 44,
          line: 4,
          endLine: 4,
          data: { name: 'normalFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const { normalFunction } = imported;
      `,
      errors: [
        {
          column: 17,
          endColumn: 31,
          line: 4,
          endLine: 4,
          data: { name: 'normalFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { normalFunction } from './deprecated';

        const foo = normalFunction();
      `,
      errors: [
        {
          column: 21,
          endColumn: 35,
          line: 4,
          endLine: 4,
          data: { name: 'normalFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.normalFunction();
      `,
      errors: [
        {
          column: 30,
          endColumn: 44,
          line: 4,
          endLine: 4,
          data: { name: 'normalFunction' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { deprecatedFunctionWithOverloads } from './deprecated';

        const foo = deprecatedFunctionWithOverloads('a');
      `,
      errors: [
        {
          column: 21,
          endColumn: 52,
          line: 4,
          endLine: 4,
          data: { name: 'deprecatedFunctionWithOverloads' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.deprecatedFunctionWithOverloads('a');
      `,
      errors: [
        {
          column: 30,
          endColumn: 61,
          line: 4,
          endLine: 4,
          data: { name: 'deprecatedFunctionWithOverloads' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { reexportedDeprecatedFunctionWithOverloads } from './deprecated';

        const foo = reexportedDeprecatedFunctionWithOverloads;
      `,
      errors: [
        {
          column: 21,
          endColumn: 62,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.reexportedDeprecatedFunctionWithOverloads;
      `,
      errors: [
        {
          column: 30,
          endColumn: 71,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const { reexportedDeprecatedFunctionWithOverloads } = imported;
      `,
      errors: [
        {
          column: 17,
          endColumn: 58,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import { reexportedDeprecatedFunctionWithOverloads } from './deprecated';

        const foo = reexportedDeprecatedFunctionWithOverloads();
      `,
      errors: [
        {
          column: 21,
          endColumn: 62,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.reexportedDeprecatedFunctionWithOverloads();
      `,
      errors: [
        {
          column: 30,
          endColumn: 71,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import { reexportedDeprecatedFunctionWithOverloads } from './deprecated';

        const foo = reexportedDeprecatedFunctionWithOverloads('a');
      `,
      errors: [
        {
          column: 21,
          endColumn: 62,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.reexportedDeprecatedFunctionWithOverloads('a');
      `,
      errors: [
        {
          column: 30,
          endColumn: 71,
          line: 4,
          endLine: 4,
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import { ClassWithDeprecatedConstructor } from './deprecated';

        const foo = new ClassWithDeprecatedConstructor('a');
      `,
      errors: [
        {
          column: 25,
          endColumn: 55,
          line: 4,
          endLine: 4,
          data: { name: 'ClassWithDeprecatedConstructor' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = new imported.ClassWithDeprecatedConstructor('a');
      `,
      errors: [
        {
          column: 34,
          endColumn: 64,
          line: 4,
          endLine: 4,
          data: { name: 'ClassWithDeprecatedConstructor' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { ReexportedClassWithDeprecatedConstructor } from './deprecated';

        const foo = ReexportedClassWithDeprecatedConstructor;
      `,
      errors: [
        {
          column: 21,
          endColumn: 61,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.ReexportedClassWithDeprecatedConstructor;
      `,
      errors: [
        {
          column: 30,
          endColumn: 70,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const { ReexportedClassWithDeprecatedConstructor } = imported;
      `,
      errors: [
        {
          column: 17,
          endColumn: 57,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import { ReexportedClassWithDeprecatedConstructor } from './deprecated';

        const foo = ReexportedClassWithDeprecatedConstructor();
      `,
      errors: [
        {
          column: 21,
          endColumn: 61,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.ReexportedClassWithDeprecatedConstructor();
      `,
      errors: [
        {
          column: 30,
          endColumn: 70,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import { ReexportedClassWithDeprecatedConstructor } from './deprecated';

        const foo = ReexportedClassWithDeprecatedConstructor('a');
      `,
      errors: [
        {
          column: 21,
          endColumn: 61,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import * as imported from './deprecated';

        const foo = imported.ReexportedClassWithDeprecatedConstructor('a');
      `,
      errors: [
        {
          column: 30,
          endColumn: 70,
          line: 4,
          endLine: 4,
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        import imported from './deprecated';

        imported;
      `,
      errors: [
        {
          column: 9,
          endColumn: 17,
          line: 4,
          endLine: 4,
          data: { name: 'imported' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        async function fn() {
          const d = await import('./deprecated.js');
          d.default.default;
        }
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: rootDir,
          projectService: false,
          project: './tsconfig.moduleResolution-node16.json',
        },
      },
      errors: [
        {
          column: 21,
          endColumn: 28,
          line: 4,
          endLine: 4,
          data: { name: 'default' },
          messageId: 'deprecated',
        },
      ],
    },
  ],
});
