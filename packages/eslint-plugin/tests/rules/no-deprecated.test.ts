import rule from '../../src/rules/no-deprecated';
import { getFixturesRootDir, createRuleTesterWithTypes } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes({
  ecmaFeatures: {
    jsx: true,
  },
  project: './tsconfig.json',
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

      a['b'];
    `,
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      a['b' + 'c'];
    `,
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      const key = 'b';

      a[key];
    `,
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      a?.b;
    `,
    `
      const a = {
        b: 1,
        /** @deprecated */ c: 2,
      };

      a?.['b'];
    `,
    `
      declare const a: {
        b: 1;
        /** @deprecated */ c: 2;
      };

      a.b;
    `,
    `
      declare const a: {
        b: 1;
        /** @deprecated */ c: 2;
      };

      a['b'];
    `,
    `
      declare const a: {
        b: 1;
        /** @deprecated */ c: 2;
      };

      a[\`\${'b'}\`];
    `,
    `
      declare const a: {
        b: 1;
        /** @deprecated */ c: 2;
      };

      const key = 'b';

      a[\`\${key}\`];
    `,
    `
      declare const a: {
        /** @deprecated */ c: 1;
        cc: 2;
      };

      const key = 'c';

      a[\`\${key + key}\`];
    `,
    `
      declare const a: {
        /** @deprecated */ c: 1;
        cc: 2;
      };

      const key = 'c';

      a[\`\${key}\${key}\`];
    `,
    `
      class A {
        b: 1;
        /** @deprecated */ c: 2;
      }

      new A().b;
    `,
    `
      class A {
        b: 1;
        /** @deprecated */ c: 2;
      }

      new A()['b'];
    `,
    `
      class A {
        b: 1;
        /** @deprecated */ c: 2;
      }
      const key = 'b';

      new A()[b];
    `,
    `
      class A {
        c: 1;
      }
      class B {
        /** @deprecated */ c: 2;
      }

      new A()['c'];
    `,
    `
      class A {
        b: () => {};
        /** @deprecated */ c: () => {};
      }

      new A()['b']();
    `,
    `
      class A {
        accessor b: 1;
        /** @deprecated */ accessor c: 2;
      }

      new A().b;
    `,
    `
      class A {
        accessor b: 1;
        /** @deprecated */ accessor c: 2;
      }

      new A()['b'];
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
      declare class A {
        /** @deprecated */
        static b: string;
        static c: string;
      }

      A['c'];
    `,
    `
      declare class A {
        /** @deprecated */
        static accessor b: string;
        static accessor c: string;
      }

      A.c;
    `,
    `
      declare class A {
        /** @deprecated */
        static accessor b: string;
        static accessor c: string;
      }

      A['c'];
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
      namespace A {
        /** @deprecated */
        export const b = '';
        export const c = '';
      }

      A['c'];
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
      enum A {
        /** @deprecated */
        b = 'b',
        c = 'c',
      }

      A['c'];
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
      function a(value: 'b' | undefined): void;
      /** @deprecated */
      function a(value: 'c' | undefined): void;
      function a(value: string | undefined): void {
        // ...
      }

      export default a('b');
    `,
    `
      function notDeprecated(): object {
        return {};
      }

      export default notDeprecated();
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
    `
      export { deprecatedFunction as 'bur' } from './deprecated';
    `,
    `
      export { 'deprecatedFunction' } from './deprecated';
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
      namespace Foo {}

      /**
       * @deprecated
       */
      export import Bar = Foo;
    `,
    `
      /**
       * @deprecated
       */
      export import Bar = require('./deprecated');
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
          project: './tsconfig.moduleResolution-node16.json',
          projectService: false,
          tsconfigRootDir: rootDir,
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
    `
      declare namespace JSX {}

      <foo bar={1} />;
    `,
    `
      declare namespace JSX {
        interface IntrinsicElements {
          foo: any;
        }
      }

      <foo bar={1} />;
    `,
    `
      declare namespace JSX {
        interface IntrinsicElements {
          foo: unknown;
        }
      }

      <foo bar={1} />;
    `,
    `
      declare namespace JSX {
        interface IntrinsicElements {
          foo: {
            bar: any;
          };
        }
      }
      <foo bar={1} />;
    `,
    `
      declare namespace JSX {
        interface IntrinsicElements {
          foo: {
            bar: unknown;
          };
        }
      }
      <foo bar={1} />;
    `,
    `
      export {
        /** @deprecated */
        foo,
      };
    `,
    {
      code: `
/** @deprecated */
function A() {
  return <div />;
}

const a = <A></A>;
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'A' }],
        },
      ],
    },
    {
      code: `
/** @deprecated */
declare class A {}

new A();
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'A' }],
        },
      ],
    },
    {
      code: `
/** @deprecated */
const deprecatedValue = 45;
const bar = deprecatedValue;
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'deprecatedValue' }],
        },
      ],
    },
    {
      code: `
class MyClass {
  /** @deprecated */
  #privateProp = 42;
  value = this.#privateProp;
}
      `,
      options: [
        {
          allow: [{ from: 'file', name: 'privateProp' }],
        },
      ],
    },
    {
      code: `
/** @deprecated */
const deprecatedValue = 45;
const bar = deprecatedValue;
      `,
      options: [
        {
          allow: ['deprecatedValue'],
        },
      ],
    },
    {
      code: `
import { exists } from 'fs';
exists('/foo');
      `,
      options: [
        {
          allow: [
            {
              from: 'package',
              name: 'exists',
              package: 'fs',
            },
          ],
        },
      ],
    },
    {
      code: `
const { exists } = import('fs');
exists('/foo');
      `,
      options: [
        {
          allow: [
            {
              from: 'package',
              name: 'exists',
              package: 'fs',
            },
          ],
        },
      ],
    },
    `
      declare const test: string;
      const bar = { test };
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const complex = Symbol() as any;
      const c = a[complex];
    `,
    `
      const a = {
        b: 'string',
      };

      const c = a['b'];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = {};
      const c = a[key as any];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = Symbol();
      const c = a[key as any];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = undefined;
      const c = a[key as any];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const c = a['nonExistentProperty'];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      function getKey() {
        return 'c';
      }

      const c = a[getKey()];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = {};
      const c = a[key];
    `,
    `
      const stringObj = new String('b');
      const a = {
        /** @deprecated */
        b: 'string',
      };
      const c = a[stringObj];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = Symbol('key');
      const c = a[key];
    `,
    `
      const a = {
        /** @deprecated */
        b: 'string',
      };

      const key = null;
      const c = a[key as any];
    `,
  ],
  invalid: [
    {
      code: `
        interface AProps {
          /** @deprecated */
          b: number | string;
        }

        function A(props: AProps) {
          return <div />;
        }

        const a = <A b="" />;
      `,
      errors: [
        {
          column: 22,
          data: { name: 'b' },
          endColumn: 23,
          endLine: 11,
          line: 11,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ var a = undefined;
        a;
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'aLongName' },
          endColumn: 18,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 20,
          endLine: 3,
          line: 3,
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
          data: { name: 'a', reason: 'Reason.' },
          endColumn: 20,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 22,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        a;
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = 'foo';
        import(\`./path/\${a}.js\`);
      `,
      errors: [
        {
          column: 26,
          data: { name: 'a' },
          endColumn: 27,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 14,
          endLine: 6,
          line: 6,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        a.b;
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        a['b'];
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        a?.b;
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        a?.['b'];
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */ const a = { b: { c: 1 } };
        a?.['b']?.['c'];
      `,
      errors: [
        {
          column: 9,
          data: { name: 'a' },
          endColumn: 10,
          endLine: 3,
          line: 3,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */ b: 1,
        };
        const key = 'b';
        a[key];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 6,
          line: 6,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */ b: { c: 1 },
        };
        a['b']['c'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 5,
          line: 5,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 5,
          line: 5,
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
          data: { name: 'a' },
          endColumn: 20,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare const test: string;
        const myObj = {
          prop: test,
          deep: {
            prop: test,
          },
        };
      `,
      errors: [
        {
          column: 17,
          data: { name: 'test' },
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
        {
          column: 19,
          data: { name: 'test' },
          endColumn: 23,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare const test: string;
        const bar = {
          test,
        };
      `,
      errors: [
        {
          column: 11,
          data: { name: 'test' },
          endColumn: 15,
          endLine: 5,
          line: 5,
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
          data: { name: 'a' },
          endColumn: 30,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 27,
          endLine: 3,
          line: 3,
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
          data: { name: 'a' },
          endColumn: 23,
          endLine: 4,
          line: 4,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 9,
          line: 9,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'A' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'b' },
          endColumn: 18,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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
        const key = 'b';

        a[key];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 10,
          line: 10,
          messageId: 'deprecated',
        },
      ],
    },
    {
      // only: true,
      code: `
        declare class A {
          /** @deprecated */
          b(): string;
        }

        declare const a: A;
        const key = 'b';

        a[key]();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 10,
          line: 10,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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

        a['b'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 9,
          line: 9,
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
        const key = 'b';

        a[\`\${key}\`];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 19,
          endLine: 10,
          line: 10,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          computed(): string;
        }

        declare const a: A;
        const k1 = 'comp';
        const k2 = 'uted';

        a[\`\${k1}\${k2}\`];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'computed' },
          endColumn: 23,
          endLine: 11,
          line: 11,
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
        const c = \`\${a.b}\`;
      `,
      errors: [
        {
          column: 24,
          data: { name: 'b' },
          endColumn: 25,
          endLine: 8,
          line: 8,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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

        a['b']();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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
        const key = 'b';

        a[key];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 10,
          line: 10,
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
        const key = 'b';

        a[key]();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 10,
          line: 10,
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

        a['b']();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 11,
          line: 11,
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
          data: { name: 'b', reason: 'Use b(value).' },
          endColumn: 12,
          endLine: 10,
          line: 10,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          static b: string;
        }

        A['b'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
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

        a['b'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 18,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 18,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 18,
          endLine: 9,
          line: 9,
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
          data: { name: 'b' },
          endColumn: 18,
          endLine: 9,
          line: 9,
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
          data: { name: 'A' },
          endColumn: 27,
          endLine: 5,
          line: 5,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
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

        A['b'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
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
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
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

        A['b']();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: {
            name: 'fail',
            reason:
              'since v10.0.0 - use fail([message]) or other assert functions instead.',
          },
          endColumn: 20,
          endLine: 8,
          line: 8,
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
          data: {
            name: 'fail',
            reason:
              'since v10.0.0 - use fail([message]) or other assert functions instead.',
          },
          endColumn: 20,
          endLine: 4,
          line: 4,
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
          data: { name: 'A' },
          endColumn: 10,
          endLine: 7,
          line: 7,
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
          data: { name: 'a' },
          endColumn: 12,
          endLine: 7,
          line: 7,
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

        const key = 'a';

        A[key];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'a' },
          endColumn: 14,
          endLine: 9,
          line: 9,
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

        A['a'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'a' },
          endColumn: 14,
          endLine: 7,
          line: 7,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 5,
          line: 5,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 6,
          line: 6,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 7,
          line: 7,
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
          data: { name: 'foo' },
          endColumn: 12,
          endLine: 8,
          line: 8,
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
          data: { name: 'b' },
          endColumn: 19,
          endLine: 6,
          line: 6,
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
          data: {
            name: 'isReceiver',
            reason: 'This param is not used and will be removed in the future.',
          },
          endColumn: 25,
          endLine: 10,
          line: 10,
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
          data: { name: 'a' },
          endColumn: 10,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 21,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 21,
          endLine: 5,
          line: 5,
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
          data: { name: 'A' },
          endColumn: 21,
          endLine: 7,
          line: 7,
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
          data: { name: 'A' },
          endColumn: 21,
          endLine: 7,
          line: 7,
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
          data: { name: 'A' },
          endColumn: 26,
          endLine: 7,
          line: 7,
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
          data: { name: 'B' },
          endColumn: 28,
          endLine: 9,
          line: 9,
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
          data: { name: 'anchor' },
          endColumn: 23,
          endLine: 7,
          line: 7,
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
          data: { name: 'anchor' },
          endColumn: 24,
          endLine: 8,
          line: 8,
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
          data: { name: 'anchor' },
          endColumn: 24,
          endLine: 7,
          line: 7,
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
          data: { name: 'foo' },
          endColumn: 20,
          endLine: 7,
          line: 7,
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
          data: { name: 'DeprecatedClass' },
          endColumn: 40,
          endLine: 4,
          line: 4,
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
          data: { name: 'DeprecatedClass' },
          endColumn: 31,
          endLine: 6,
          line: 6,
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
          data: { name: 'deprecatedVariable' },
          endColumn: 39,
          endLine: 4,
          line: 4,
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
          data: { name: 'DeprecatedClass' },
          endColumn: 41,
          endLine: 4,
          line: 4,
          messageId: 'deprecated',
        },
        {
          column: 17,
          data: { name: 'foo' },
          endColumn: 20,
          endLine: 6,
          line: 6,
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
          data: { name: 'deprecatedFunction' },
          endColumn: 27,
          endLine: 4,
          line: 4,
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
          data: { name: 'NormalClass' },
          endColumn: 45,
          endLine: 4,
          line: 4,
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
          data: { name: 'NormalClass' },
          endColumn: 36,
          endLine: 4,
          line: 4,
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
          data: { name: 'NormalClass' },
          endColumn: 41,
          endLine: 4,
          line: 4,
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
          data: { name: 'NormalClass' },
          endColumn: 32,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalVariable' },
          endColumn: 35,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalVariable' },
          endColumn: 44,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalVariable' },
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { deprecatedVariable } from './deprecated';

        const test = {
          someField: deprecatedVariable,
        };
      `,
      errors: [
        {
          column: 22,
          data: { name: 'deprecatedVariable' },
          endColumn: 40,
          endLine: 5,
          line: 5,
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
          data: { name: 'normalFunction' },
          endColumn: 35,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalFunction' },
          endColumn: 44,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalFunction' },
          endColumn: 31,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalFunction' },
          endColumn: 35,
          endLine: 4,
          line: 4,
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
          data: { name: 'normalFunction' },
          endColumn: 44,
          endLine: 4,
          line: 4,
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
          data: { name: 'deprecatedFunctionWithOverloads' },
          endColumn: 52,
          endLine: 4,
          line: 4,
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
          data: { name: 'deprecatedFunctionWithOverloads' },
          endColumn: 61,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 62,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 71,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 58,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 62,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 71,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 62,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'reexportedDeprecatedFunctionWithOverloads',
            reason: 'Reason',
          },
          endColumn: 71,
          endLine: 4,
          line: 4,
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
          data: { name: 'ClassWithDeprecatedConstructor' },
          endColumn: 55,
          endLine: 4,
          line: 4,
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
          data: { name: 'ClassWithDeprecatedConstructor' },
          endColumn: 64,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 61,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 70,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 57,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 61,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 70,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 61,
          endLine: 4,
          line: 4,
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
          data: {
            name: 'ReexportedClassWithDeprecatedConstructor',
            reason: 'Reason',
          },
          endColumn: 70,
          endLine: 4,
          line: 4,
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
          data: { name: 'imported' },
          endColumn: 17,
          endLine: 4,
          line: 4,
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
      errors: [
        {
          column: 21,
          data: { name: 'default' },
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'deprecated',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.moduleResolution-node16.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        /** @deprecated */
        interface Foo {}

        class Bar implements Foo {}
      `,
      errors: [
        {
          column: 30,
          data: { name: 'Foo' },
          endColumn: 33,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        interface Foo {}

        export class Bar implements Foo {}
      `,
      errors: [
        {
          column: 37,
          data: { name: 'Foo' },
          endColumn: 40,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        interface Foo {}

        interface Baz {}

        export class Bar implements Baz, Foo {}
      `,
      errors: [
        {
          column: 42,
          data: { name: 'Foo' },
          endColumn: 45,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        class Foo {}

        export class Bar extends Foo {}
      `,
      errors: [
        {
          column: 34,
          data: { name: 'Foo' },
          endColumn: 37,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        declare function decorator(constructor: Function);

        @decorator
        export class Foo {}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'decorator' },
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated */
        function a(): object {
          return {};
        }

        export default a();
      `,
      errors: [
        {
          column: 24,
          data: { name: 'a' },
          endColumn: 25,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
class A {
  /** @deprecated */
  constructor() {}
}

class B extends A {
  constructor() {
    /** should report but does not */
    super();
  }
}
      `,
      errors: [
        {
          column: 5,
          data: { name: 'super' },
          endColumn: 10,
          endLine: 10,
          line: 10,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
class A {
  /** @deprecated test reason*/
  constructor() {}
}

class B extends A {
  constructor() {
    /** should report but does not */
    super();
  }
}
      `,
      errors: [
        {
          column: 5,
          data: { name: 'super', reason: 'test reason' },
          endColumn: 10,
          endLine: 10,
          line: 10,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: 'const a = <div aria-grabbed></div>;',
      errors: [
        {
          column: 16,
          data: { name: 'aria-grabbed', reason: 'in ARIA 1.1' },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        declare namespace JSX {
          interface IntrinsicElements {
            'foo-bar:baz-bam': {
              name: string;
              /**
               * @deprecated
               */
              deprecatedProp: string;
            };
          }
        }

        const componentDashed = <foo-bar:baz-bam name="e" deprecatedProp="oh no" />;
      `,
      errors: [
        {
          column: 59,
          data: { name: 'deprecatedProp' },
          endColumn: 73,
          endLine: 14,
          line: 14,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import * as React from 'react';

        interface Props {
          /**
           * @deprecated
           */
          deprecatedProp: string;
        }

        interface Tab {
          List: React.FC<Props>;
        }

        const Tab: Tab = {
          List: () => <div>Hi</div>,
        };

        const anotherExample = <Tab.List deprecatedProp="oh no" />;
      `,
      errors: [
        {
          column: 42,
          data: { name: 'deprecatedProp' },
          endColumn: 56,
          endLine: 19,
          line: 19,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
import { exists } from 'fs';
exists('/foo');
      `,
      errors: [
        {
          column: 1,
          data: {
            name: 'exists',
            reason:
              'Since v1.0.0 - Use {@link stat} or {@link access} instead.',
          },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'deprecatedWithReason',
        },
      ],
      options: [
        {
          allow: [
            {
              from: 'package',
              name: 'exists',
              package: 'hoge',
            },
          ],
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          accessor b: () => string;
        }

        declare const a: A;

        a.b;
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          accessor b: () => string;
        }

        declare const a: A;

        a['b'];
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          accessor b: () => string;
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 12,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          accessor b: () => string;
        }

        declare const a: A;

        a['b']();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 14,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        class A {
          /** @deprecated */
          accessor b = (): string => {
            return '';
          };
        }

        declare const a: A;

        a.b();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 12,
          endLine: 11,
          line: 11,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare class A {
          /** @deprecated */
          static accessor b: () => string;
        }

        A.b();
      `,
      errors: [
        {
          column: 11,
          data: { name: 'b' },
          endColumn: 12,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        class A {
          /** @deprecated */
          #b = () => {};

          c() {
            this.#b();
          }
        }
      `,
      errors: [
        {
          column: 18,
          data: { name: '#b' },
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */
          b: 'string',
        };

        const c = a['b'];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 24,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */
          b: 'string',
        };
        const x = 'b';
        const c = a[x];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 22,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */
          [2]: 'string',
        };
        const x = 'b';
        const c = a[2];
      `,
      errors: [
        {
          column: 21,
          data: { name: '2' },
          endColumn: 22,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated reason for deprecation */
          b: 'string',
        };

        const key = 'b';
        const stringKey = key as const;
        const c = a[stringKey];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b', reason: 'reason for deprecation' },
          endColumn: 30,
          endLine: 9,
          line: 9,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        enum Keys {
          B = 'b',
        }

        const a = {
          /** @deprecated reason for deprecation */
          b: 'string',
        };

        const key = Keys.B;
        const c = a[key];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b', reason: 'reason for deprecation' },
          endColumn: 24,
          endLine: 12,
          line: 12,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        declare const Keys: {
          a: 1;
        };

        const a = {
          /** @deprecated reason for deprecation */
          [1]: 'string',
        };

        const key = Keys.a;
        const c = a[key];
      `,
      errors: [
        {
          column: 21,
          data: { name: '1', reason: 'reason for deprecation' },
          endColumn: 24,
          endLine: 12,
          line: 12,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        const a = {
          /** @deprecated */
          b: 'string',
        };

        const key = \`b\`;
        const c = a[key];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 24,
          endLine: 8,
          line: 8,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        const stringObj = 'b';
        const a = {
          /** @deprecated */
          b: 'string',
        };
        const c = a[stringObj];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 30,
          endLine: 7,
          line: 7,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare function x(): 'b';

        const a = {
          /** @deprecated */
          b: 'string',
        };

        const c = a[x()];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 24,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        declare const x: { y: 'b' };

        const a = {
          /** @deprecated */
          b: 'string',
        };

        const c = a[x.y];
      `,
      errors: [
        {
          column: 21,
          data: { name: 'b' },
          endColumn: 24,
          endLine: 9,
          line: 9,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        import { deprecatedFunction } from './deprecated';

        export { deprecatedFunction };
      `,
      errors: [
        {
          column: 18,
          endColumn: 36,
          endLine: 4,
          line: 4,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export { deprecatedFunction } from './deprecated';
      `,
      errors: [
        {
          column: 18,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export type { T, U } from './deprecated';
      `,
      errors: [
        {
          column: 23,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'deprecatedWithReason',
        },
      ],
    },
    {
      code: `
        export { default as foo } from './deprecated';
      `,
      errors: [
        {
          column: 29,
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        export { deprecatedFunction as bar } from './deprecated';
      `,
      errors: [
        {
          column: 40,
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'deprecated',
        },
      ],
    },
  ],
});
