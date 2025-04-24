import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/strict-void-return';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('strict-void-return', rule, {
  valid: [
    {
      code: `
        declare function foo(cb: {}): void;
        foo(() => () => []);
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        type Void = void;
        foo((): Void => {
          return;
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo((): ReturnType<typeof foo> => {
          return;
        });
      `,
    },
    {
      code: `
        declare function foo(cb: any): void;
        foo(() => () => []);
      `,
    },
    {
      code: `
        declare class Foo {
          constructor(cb: unknown): void;
        }
        new Foo(() => ({}));
      `,
    },
    {
      code: `
        declare function foo(cb: () => {}): void;
        foo(() => 1 as any);
      `,
      options: [{ allowReturnAny: true }],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => {
          throw new Error('boom');
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        declare function boom(): never;
        foo(() => boom());
        foo(boom);
      `,
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => any): void;
        };
        new Foo(function () {
          return 1;
        });
      `,
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => unknown): void;
        };
        new Foo(function () {
          return 1;
        });
      `,
    },
    {
      code: `
        declare const foo: {
          bar(cb1: () => unknown, cb2: () => void): void;
        };
        foo.bar(
          function () {
            return 1;
          },
          function () {
            return;
          },
        );
      `,
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => string | void): void;
        };
        new Foo(() => {
          if (maybe) {
            return 'a';
          } else {
            return 'b';
          }
        });
      `,
    },
    {
      code: `
        declare function foo<Cb extends (...args: any[]) => void>(cb: Cb): void;
        foo(() => {
          console.log('a');
        });
      `,
    },
    {
      code: `
        declare function foo(cb: (() => void) | (() => string)): void;
        foo(() => {
          label: while (maybe) {
            for (let i = 0; i < 10; i++) {
              switch (i) {
                case 0:
                  continue;
                case 1:
                  return 'a';
              }
            }
          }
        });
      `,
    },
    {
      code: `
        declare function foo(cb: (() => void) | null): void;
        foo(null);
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(async () => {
          try {
            await Promise.resolve();
          } catch (err) {
            console.error(err);
          }
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(async () => {
          try {
            await Promise.resolve();
          } catch {
            console.error('fail');
          }
        });
      `,
    },
    {
      code: `
        interface Cb {
          (): void;
          (): string;
        }
        declare const Foo: {
          new (cb: Cb): void;
        };
        new Foo(() => {
          do {
            try {
              throw 1;
            } catch {
              return 'a';
            }
          } while (maybe);
        });
      `,
    },
    {
      code: `
        declare const foo: ((cb: () => boolean) => void) | ((cb: () => void) => void);
        foo(() => false);
      `,
    },
    {
      code: `
        declare const foo: {
          (cb: () => boolean): void;
          (cb: () => void): void;
        };
        foo(function () {
          with ({}) {
            return false;
          }
        });
      `,
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => void): void;
          (cb: () => unknown): void;
        };
        Foo(() => false);
      `,
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => any): void;
          (cb: () => void): void;
        };
        new Foo(() => false);
      `,
    },
    {
      code: `
        declare function foo(cb: () => boolean): void;
        declare function foo(cb: () => void): void;
        foo(() => false);
      `,
    },
    {
      code: `
        declare function foo(cb: () => Promise<void>): void;
        declare function foo(cb: () => void): void;
        foo(async () => {});
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => 1 as any);
      `,
      options: [{ allowReturnAny: true }],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => {});
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        const cb = () => {};
        foo(cb);
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(function () {});
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(cb);
        function cb() {}
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => undefined);
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(function () {
          return;
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(function () {
          return void 0;
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => {
          return;
        });
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        declare function cb(): never;
        foo(cb);
      `,
    },
    {
      code: `
        declare class Foo {
          constructor(cb: () => void): any;
        }
        declare function cb(): void;
        new Foo(cb);
      `,
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(cb);
        function cb() {
          throw new Error('boom');
        }
      `,
    },
    {
      code: `
        declare function foo(arg: string, cb: () => void): void;
        declare function cb(): undefined;
        foo('arg', cb);
      `,
    },
    {
      code: `
        declare function foo(cb?: () => void): void;
        foo();
      `,
    },
    {
      code: `
        declare class Foo {
          constructor(cb?: () => void): void;
        }
        declare function cb(): void;
        new Foo(cb);
      `,
    },
    {
      code: `
        declare function foo(...cbs: Array<() => void>): void;
        foo(
          () => {},
          () => void null,
          () => undefined,
        );
      `,
    },
    {
      code: `
        declare function foo(...cbs: Array<() => void>): void;
        declare const cbs: Array<() => void>;
        foo(...cbs);
      `,
    },
    {
      code: `
        declare function foo(...cbs: [() => any, () => void, (() => void)?]): void;
        foo(
          async () => {},
          () => void null,
          () => undefined,
        );
      `,
    },
    {
      code: `
        let cb;
        cb = async () => 10;
      `,
    },
    {
      code: `
        const foo: () => void = () => {};
      `,
    },
    {
      code: `
        declare function cb(): void;
        const foo: () => void = cb;
      `,
    },
    {
      code: `
        const foo: () => void = function () {
          throw new Error('boom');
        };
      `,
    },
    {
      code: `
        const foo: { (): string; (): void } = () => {
          return 'a';
        };
      `,
    },
    {
      code: `
        const foo: (() => void) | (() => number) = () => {
          return 1;
        };
      `,
    },
    {
      code: `
        type Foo = () => void;
        const foo: Foo = cb;
        function cb() {
          return void null;
        }
      `,
    },
    {
      code: `
        interface Foo {
          (): void;
        }
        const foo: Foo = cb;
        function cb() {
          return undefined;
        }
      `,
    },
    {
      code: `
        declare function cb(): void;
        declare let foo: () => void;
        foo = cb;
      `,
    },
    {
      code: `
        declare function defaultCb(): object;
        declare let foo: { cb?: () => void };
        // default doesn't have to be void
        const { cb = defaultCb } = foo;
      `,
    },
    {
      code: `
        let foo: (() => void) | null = null;
        foo &&= null;
      `,
    },
    {
      code: `
        declare function cb(): void;
        let foo: (() => void) | boolean = false;
        foo ||= cb;
      `,
    },
    {
      code: `
        declare function Foo(props: { cb: () => void }): unknown;
        return <Foo cb={() => {}} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = () => void;
        declare function Foo(props: { cb: Cb; s: string }): unknown;
        return <Foo cb={function () {}} s="asd" />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = () => void;
        declare function Foo(props: { x: number; cb?: Cb }): unknown;
        return <Foo x={123} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = (() => void) | (() => number);
        declare function Foo(props: { cb?: Cb }): unknown;
        return (
          <Foo
            cb={function (arg) {
              return 123;
            }}
          />
        );
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        interface Props {
          cb: ((arg: unknown) => void) | boolean;
        }
        declare function Foo(props: Props): unknown;
        return <Foo cb />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        interface Props {
          cb: (() => void) | (() => Promise<void>);
        }
        declare function Foo(props: Props): any;
        const _ = <Foo cb={async () => {}} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        interface Props {
          children: (arg: unknown) => void;
        }
        declare function Foo(props: Props): unknown;
        declare function cb(): void;
        return <Foo>{cb}</Foo>;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
        declare function foo(cbs: { arg: number; cb: () => void }): void;
        foo({ arg: 1, cb: () => undefined });
      `,
    },
    {
      code: `
        declare let foo: { arg?: string; cb: () => void };
        foo = {
          cb: () => {
            return something;
          },
        };
      `,
      options: [{ allowReturnAny: true }],
    },
    {
      code: `
        declare let foo: { cb: () => void };
        foo = {
          cb() {
            return something;
          },
        };
      `,
      options: [{ allowReturnAny: true }],
    },
    {
      code: `
        declare let foo: { cb: () => void };
        foo = {
          // don't check this thing
          cb = () => 1,
        };
      `,
    },
    {
      code: `
        declare let foo: { cb: (n: number) => void };
        let method = 'cb';
        foo = {
          // don't check computed methods
          [method](n) {
            return n;
          },
        };
      `,
    },
    {
      code: `
        // no contextual type for object
        let foo = {
          cb(n) {
            return n;
          },
        };
      `,
    },
    {
      code: `
        interface Foo {
          fn(): void;
        }
        // no symbol for method cb
        let foo: Foo = {
          cb(n) {
            return n;
          },
        };
      `,
    },
    {
      code: `
        declare let foo: { cb: (() => void) | number };
        foo = {
          cb: 0,
        };
      `,
    },
    {
      code: `
        declare function cb(): void;
        const foo: Record<string, () => void> = {
          cb1: cb,
          cb2: cb,
        };
      `,
    },
    {
      code: `
        declare function cb(): string;
        const foo: Record<string, () => void> = {
          ...cb,
        };
      `,
    },
    {
      code: `
        declare function cb(): void;
        const foo: Array<(() => void) | false> = [false, cb, () => cb()];
      `,
    },
    {
      code: `
        declare function cb(): void;
        const foo: [string, () => void, (() => void)?] = ['asd', cb];
      `,
    },
    {
      code: `
        const foo: { cbs: Array<() => void> | null } = {
          cbs: [
            function () {
              return undefined;
            },
            () => {
              return void 0;
            },
            null,
          ],
        };
      `,
    },
    {
      code: `
        const foo: { cb: () => void } = class {
          static cb = () => {};
        };
      `,
    },
    {
      code: `
        class Foo {
          foo;
        }
      `,
    },
    {
      code: `
        class Foo {
          foo: () => void = () => undefined;
        }
      `,
    },
    {
      code: `
        class Bar {}
        class Foo extends Bar {
          foo = () => 1;
        }
      `,
    },
    {
      code: `
        class Foo extends Wtf {
          foo = () => 1;
        }
      `,
    },
    {
      code: `
        class Foo extends Wtf {
          [unknown] = () => 1;
        }
      `,
    },
    {
      code: `
        class Foo {
          cb = () => {
            console.log('siema');
          };
        }
        class Bar extends Foo {
          cb = () => {
            console.log('nara');
          };
        }
      `,
    },
    {
      code: `
        class Foo {
          cb1 = () => {};
        }
        class Bar extends Foo {
          cb2() {}
        }
        class Baz extends Bar {
          cb1 = () => {
            console.log('siema');
          };
          cb2() {
            console.log('nara');
          }
        }
      `,
    },
    {
      code: `
        class Foo {
          fn() {
            return 'a';
          }
          cb() {}
        }
        void class extends Foo {
          cb() {
            if (maybe) {
              console.log('siema');
            } else {
              console.log('nara');
            }
          }
        };
      `,
    },
    {
      code: `
        abstract class Foo {
          abstract cb(): void;
        }
        class Bar extends Foo {
          cb() {
            console.log('a');
          }
        }
      `,
    },
    {
      code: `
        class Bar implements Foo {
          cb = () => 1;
        }
      `,
    },
    {
      code: `
        interface Foo {
          cb: () => void;
        }
        class Bar implements Foo {
          cb = () => {};
        }
      `,
    },
    {
      code: `
        interface Foo {
          cb: () => void;
        }
        class Bar implements Foo {
          get cb() {
            return () => {};
          }
        }
      `,
    },
    {
      code: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          cb() {
            return undefined;
          }
        }
      `,
    },
    {
      code: `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 {
          cb2: () => void;
        }
        class Bar implements Foo1, Foo2 {
          cb1() {}
          cb2() {}
        }
      `,
    },
    {
      code: `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 extends Foo1 {
          cb2: () => void;
        }
        class Bar implements Foo2 {
          cb1() {}
          cb2() {}
        }
      `,
    },
    {
      code: `
        declare let foo: () => () => void;
        foo = () => () => {};
      `,
    },
    {
      code: `
        declare let foo: { f(): () => void };
        foo = {
          f() {
            return () => undefined;
          },
        };
        function cb() {}
      `,
    },
    {
      code: `
        declare let foo: { f(): () => void };
        foo.f = function () {
          return () => {};
        };
      `,
    },
    {
      code: `
        declare let foo: () => (() => void) | string;
        foo = () => 'asd' + 'zxc';
      `,
    },
    {
      code: `
        declare function foo(cb: () => () => void): void;
        foo(function () {
          return () => {};
        });
      `,
    },
    {
      code: `
        declare function foo(cb: (arg: string) => () => void): void;
        declare function foo(cb: (arg: number) => () => boolean): void;
        foo((arg: number) => {
          return cb;
        });
        function cb() {
          return true;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => null);
      `,
      errors: [
        {
          column: 19,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: noFormat`
        declare function foo(cb: () => void): void;
        foo(() => (((true))));
      `,
      errors: [
        {
          column: 22,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: noFormat`
        declare function foo(cb: () => void): void;
        foo(() => {
          if (maybe) {
            return (((1) + 1));
          }
        });
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(arg: number, cb: () => void): void;
        foo(0, () => 0);
      `,
      errors: [
        {
          column: 22,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb?: { (): void }): void;
        foo(() => () => {});
      `,
      errors: [
        {
          column: 19,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare const obj: { foo(cb: () => void) } | null;
        obj?.foo(() => JSON.parse('{}'));
      `,
      errors: [
        {
          column: 24,
          data: { funcName: 'obj?.foo' },
          line: 3,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        ((cb: () => void) => cb())!(() => 1);
      `,
      errors: [
        {
          column: 43,
          data: { funcName: 'function' },
          line: 2,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        declare function cb(): string;
        foo(cb);
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        type AnyFunc = (...args: unknown[]) => unknown;
        declare function foo<F extends AnyFunc>(cb: F): void;
        foo(async () => ({}));
        foo<() => void>(async () => ({}));
      `,
      errors: [
        {
          column: 34,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        function foo<T extends {}>(arg: T, cb: () => T);
        function foo(arg: null, cb: () => void);
        function foo(arg: any, cb: () => any) {}

        foo(null, () => Math.random());
      `,
      errors: [
        {
          column: 25,
          data: { funcName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo<T extends {}>(arg: T, cb: () => T): void;
        declare function foo(arg: any, cb: () => void): void;

        foo(null, async () => {});
      `,
      errors: [
        {
          column: 28,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        declare function foo(cb: () => any): void;
        foo(async () => {
          return Math.random();
        });
      `,
      errors: [
        {
          column: 22,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        foo(cb);
        async function cb() {}
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo<Cb extends (...args: any[]) => void>(cb: Cb): void;
        foo(() => {
          console.log('a');
          return 1;
        });
      `,
      errors: [
        {
          column: 11,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        function bar<Cb extends () => number>(cb: Cb) {
          foo(cb);
        }
      `,
      errors: [
        {
          column: 15,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        const cb = () => dunno;
        foo!(cb);
      `,
      errors: [
        {
          column: 14,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare const foo: {
          (arg: boolean, cb: () => void): void;
        };
        foo(false, () => Promise.resolve(undefined));
      `,
      errors: [
        {
          column: 26,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare const foo: {
          bar(cb1: () => any, cb2: () => void): void;
        };
        foo.bar(
          () => Promise.resolve(1),
          () => Promise.resolve(1),
        );
      `,
      errors: [
        {
          column: 17,
          data: { funcName: 'foo.bar' },
          line: 7,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => void): void;
        };
        new Foo(async () => {});
      `,
      errors: [
        {
          column: 26,
          data: { funcName: 'Foo' },
          line: 5,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => {
          label: while (maybe) {
            for (const i of [1, 2, 3]) {
              if (maybe) return null;
              else return null;
            }
          }
          return void 0;
        });
      `,
      errors: [
        {
          column: 26,
          data: { funcName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
        {
          column: 20,
          data: { funcName: 'foo' },
          line: 7,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(() => {
          do {
            try {
              throw 1;
            } catch (e) {
              return null;
            } finally {
              console.log('finally');
            }
          } while (maybe);
        });
      `,
      errors: [
        {
          column: 15,
          data: { funcName: 'foo' },
          line: 8,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: () => void): void;
        foo(async () => {
          try {
            await Promise.resolve();
          } catch {
            console.error('fail');
          }
        });
      `,
      errors: [
        {
          column: 22,
          data: { funcName: 'foo' },
          line: 3,
          messageId: 'asyncFuncInArg',
        },
      ],
      options: [{ allowReturnPromiseIfTryCatch: false }],
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => void): void;
          (cb: () => unknown): void;
        };
        new Foo(() => false);
      `,
      errors: [
        {
          column: 23,
          data: { funcName: 'Foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare const Foo: {
          new (cb: () => any): void;
          (cb: () => void): void;
        };
        Foo(() => false);
      `,
      errors: [
        {
          column: 19,
          data: { funcName: 'Foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        interface Cb {
          (arg: string): void;
          (arg: number): void;
        }
        declare function foo(cb: Cb): void;
        foo(cb);
        function cb() {
          return true;
        }
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 7,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(
          cb: ((arg: number) => void) | ((arg: string) => void),
        ): void;
        foo(cb);
        function cb() {
          return 1 + 1;
        }
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(cb: (() => void) | null): void;
        declare function cb(): boolean;
        foo(cb);
      `,
      errors: [
        {
          column: 13,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(...cbs: Array<() => void>): void;
        foo(
          () => {},
          () => false,
          () => 0,
          () => '',
        );
      `,
      errors: [
        {
          column: 17,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInArg',
        },
        {
          column: 17,
          data: { funcName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
        {
          column: 17,
          data: { funcName: 'foo' },
          line: 7,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(...cbs: [() => void, () => void, (() => void)?]): void;
        foo(
          () => {},
          () => Math.random(),
          () => (1).toString(),
        );
      `,
      errors: [
        {
          column: 17,
          data: { funcName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInArg',
        },
        {
          column: 17,
          data: { funcName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        interface Ev {}
        interface EvMap {
          DOMContentLoaded: Ev;
        }
        type EvListOrEvListObj = EvList | EvListObj;
        interface EvList {
          (evt: Event): void;
        }
        interface EvListObj {
          handleEvent(object: Ev): void;
        }
        interface Win {
          addEventListener<K extends keyof EvMap>(
            type: K,
            listener: (ev: EvMap[K]) => any,
          ): void;
          addEventListener(type: string, listener: EvListOrEvListObj): void;
        }
        declare const win: Win;
        win.addEventListener('DOMContentLoaded', ev => ev);
        win.addEventListener('custom', ev => ev);
      `,
      errors: [
        {
          column: 56,
          data: { funcName: 'win.addEventListener' },
          line: 21,
          messageId: 'nonVoidReturnInArg',
        },
        {
          column: 46,
          data: { funcName: 'win.addEventListener' },
          line: 22,
          messageId: 'nonVoidReturnInArg',
        },
      ],
    },
    {
      code: `
        declare function foo(x: null, cb: () => void): void;
        declare function foo(x: unknown, cb: () => any): void;
        foo({}, async () => {});
      `,
      errors: [
        {
          column: 26,
          data: { funcName: 'foo' },
          line: 4,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        const arr = [1, 2];
        arr.forEach(async x => {
          console.log(x);
        });
      `,
      errors: [
        {
          column: 29,
          data: { funcName: 'arr.forEach' },
          line: 3,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        [1, 2].forEach(async x => console.log(x));
      `,
      errors: [
        {
          column: 32,
          data: { funcName: 'forEach' },
          line: 2,
          messageId: 'asyncFuncInArg',
        },
      ],
    },
    {
      code: `
        const foo: () => void = () => false;
      `,
      errors: [
        {
          column: 39,
          data: { varName: 'foo' },
          line: 2,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const { name }: () => void = function foo() {
          return false;
        };
      `,
      errors: [{ column: 11, line: 3, messageId: 'nonVoidReturnInOther' }],
    },
    {
      code: `
        declare const foo: Record<string, () => void>;
        foo['a' + 'b'] = () => true;
      `,
      errors: [{ column: 32, line: 3, messageId: 'nonVoidReturnInOther' }],
    },
    {
      code: `
        const foo: () => void = async () => Promise.resolve(true);
      `,
      errors: [
        {
          column: 42,
          data: { varName: 'foo' },
          line: 2,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: 'const cb: () => void = (): Array<number> => [];',
      errors: [
        {
          column: 45,
          data: { varName: 'cb' },
          line: 1,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const cb: () => void = (): Array<number> => {
          return [];
        };
      `,
      errors: [
        {
          column: 36,
          data: { varName: 'cb' },
          line: 2,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: noFormat`const cb: () => void = function*foo() {}`,
      errors: [
        {
          column: 24,
          data: { varName: 'cb' },
          line: 1,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: 'const cb: () => void = (): Promise<number> => Promise.resolve(1);',
      errors: [
        {
          column: 47,
          data: { varName: 'cb' },
          line: 1,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const cb: () => void = async (): Promise<number> => {
          try {
            return Promise.resolve(1);
          } catch {}
        };
      `,
      errors: [
        {
          column: 42,
          data: { varName: 'cb' },
          line: 2,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: 'const cb: () => void = async (): Promise<number> => Promise.resolve(1);',
      errors: [
        {
          column: 50,
          data: { varName: 'cb' },
          line: 1,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: `
        const foo: () => void = async () => {
          try {
            return 1;
          } catch {}
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const foo: () => void = async (): Promise<void> => {
          try {
            await Promise.resolve();
          } finally {
          }
        };
      `,
      errors: [
        {
          column: 57,
          data: { varName: 'foo' },
          line: 2,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: `
        const foo: () => void = async () => {
          try {
            await Promise.resolve();
          } catch (err) {
            console.error(err);
          }
          console.log('ok');
        };
      `,
      errors: [
        {
          column: 42,
          data: { varName: 'foo' },
          line: 2,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: 'const foo: () => void = (): number => {};',
      errors: [
        {
          column: 29,
          data: { varName: 'foo' },
          line: 1,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): boolean;
        const foo: () => void = cb;
      `,
      errors: [
        {
          column: 33,
          data: { varName: 'foo' },
          line: 3,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        const foo: () => void = function () {
          if (maybe) {
            return null;
          } else {
            return null;
          }
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidReturnInVar',
        },
        {
          column: 13,
          data: { varName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const foo: () => void = function () {
          if (maybe) {
            console.log('elo');
            return { [1]: Math.random() };
          }
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: 'foo' },
          line: 5,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const foo: { (arg: number): void; (arg: string): void } = arg => {
          console.log('foo');
          switch (typeof arg) {
            case 'number':
              return 0;
            case 'string':
              return '';
          }
        };
      `,
      errors: [
        {
          column: 15,
          data: { varName: 'foo' },
          line: 6,
          messageId: 'nonVoidReturnInVar',
        },
        {
          column: 15,
          data: { varName: 'foo' },
          line: 8,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        const foo: ((arg: number) => void) | ((arg: string) => void) = async () => {
          return 1;
        };
      `,
      errors: [
        {
          column: 81,
          data: { varName: 'foo' },
          line: 2,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: `
        type Foo = () => void;
        const foo: Foo = cb;
        function cb() {
          return [1, 2, 3];
        }
      `,
      errors: [
        {
          column: 26,
          data: { varName: 'foo' },
          line: 3,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        interface Foo {
          (): void;
        }
        const foo: Foo = cb;
        function cb() {
          return { a: 1 };
        }
      `,
      errors: [
        {
          column: 26,
          data: { varName: 'foo' },
          line: 5,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): unknown;
        declare let foo: () => void;
        foo = cb;
      `,
      errors: [
        {
          column: 15,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { arg?: string; cb?: () => void };
        foo.cb = () => {
          return 'siema';
          console.log('siema');
        };
      `,
      errors: [
        {
          column: 11,
          data: { varName: 'foo.cb' },
          line: 4,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | null = null;
        foo ??= cb;
      `,
      errors: [
        {
          column: 17,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | boolean = false;
        foo ||= cb;
      `,
      errors: [
        {
          column: 17,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | boolean = false;
        foo &&= cb;
      `,
      errors: [
        {
          column: 17,
          data: { varName: 'foo' },
          line: 4,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function Foo(props: { cb: () => void }): unknown;
        return <Foo cb={() => 1} />;
      `,
      errors: [
        {
          column: 31,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 3,
          messageId: 'nonVoidReturnInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        declare function Foo(props: { cb: () => void }): unknown;
        declare function getNull(): null;
        return (
          <Foo
            cb={() => {
              if (maybe) return Math.random();
              else return getNull();
            }}
          />
        );
      `,
      errors: [
        {
          column: 26,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 7,
          messageId: 'nonVoidReturnInAttr',
        },
        {
          column: 20,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 8,
          messageId: 'nonVoidReturnInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = () => void;
        declare function Foo(props: { cb: Cb; s: string }): unknown;
        return <Foo cb={async function () {}} s="!@#jp2gmd" />;
      `,
      errors: [
        {
          column: 25,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 4,
          messageId: 'asyncFuncInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = () => void;
        declare function Foo(props: { n: number; cb?: Cb }): unknown;
        return <Foo n={2137} cb={function* () {}} />;
      `,
      errors: [
        {
          column: 34,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 4,
          messageId: 'nonVoidFuncInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        type Cb = ((arg: string) => void) | ((arg: number) => void);
        declare function Foo(props: { cb?: Cb }): unknown;
        return (
          <Foo
            cb={async function* (arg) {
              await arg;
              yield arg;
            }}
          />
        );
      `,
      errors: [
        {
          column: 17,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 6,
          messageId: 'nonVoidFuncInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        interface Props {
          cb: ((arg: unknown) => void) | boolean;
        }
        declare function Foo(props: Props): unknown;
        return <Foo cb={x => x} />;
      `,
      errors: [
        {
          column: 30,
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 6,
          messageId: 'nonVoidReturnInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        type EventHandler<E> = { bivarianceHack(event: E): void }['bivarianceHack'];
        interface ButtonProps {
          onClick?: EventHandler<unknown> | undefined;
        }
        declare function Button(props: ButtonProps): unknown;
        function App() {
          return <Button onClick={x => x} />;
        }
      `,
      errors: [
        {
          column: 40,
          data: { attrName: 'onClick', elemName: 'Button' },
          line: 8,
          messageId: 'nonVoidReturnInAttr',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        declare function foo(cbs: { arg: number; cb: () => void }): void;
        foo({ arg: 1, cb: () => 1 });
      `,
      errors: [
        {
          column: 33,
          data: { varName: 'cb' },
          line: 3,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { arg?: string; cb: () => void };
        foo = {
          cb: () => {
            let x = 'siema';
            return x;
          },
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: 'cb' },
          line: 6,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { cb: (n: number) => void };
        foo = {
          cb(n) {
            return n;
          },
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: 'cb' },
          line: 5,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { 1234: (n: number) => void };
        foo = {
          1234(n) {
            return n;
          },
        };
      `,
      errors: [
        {
          column: 13,
          data: { varName: '1234' },
          line: 5,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { '1e+21': () => void };
        foo = {
          1_000_000_000_000_000_000_000: () => 1,
        };
      `,
      errors: [
        {
          column: 48,
          data: { varName: '1_000_000_000_000_000_000_000' },
          line: 4,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        declare let foo: { cb: (() => void) | number };
        foo = {
          cb: async () => {
            if (maybe) {
              return 'asd';
            }
          },
        };
      `,
      errors: [
        {
          column: 11,
          data: { varName: 'cb' },
          line: 4,
          messageId: 'asyncFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): number;
        const foo: Record<string, () => void> = {
          cb1: cb,
          cb2: cb,
          ...cb,
        };
      `,
      errors: [
        {
          column: 16,
          data: { varName: 'cb1' },
          line: 4,
          messageId: 'nonVoidFuncInVar',
        },
        {
          column: 16,
          data: { varName: 'cb2' },
          line: 5,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        declare function cb(): number;
        const foo: Array<(() => void) | false> = [false, cb, () => cb()];
      `,
      errors: [
        { column: 58, line: 3, messageId: 'nonVoidFuncInOther' },
        { column: 68, line: 3, messageId: 'nonVoidReturnInOther' },
      ],
    },
    {
      code: `
        declare function cb(): number;
        const foo: [string, () => void, (() => void)?] = ['asd', cb];
      `,
      errors: [{ column: 66, line: 3, messageId: 'nonVoidFuncInOther' }],
    },
    {
      code: `
        const foo: { cbs: Array<() => void> | null } = {
          cbs: [
            function* () {
              yield 1;
            },
            async () => {
              await 1;
            },
            null,
          ],
        };
      `,
      errors: [
        { column: 13, line: 4, messageId: 'nonVoidFuncInOther' },
        {
          column: 22,
          line: 7,
          messageId: 'asyncFuncInOther',
        },
      ],
    },
    {
      code: `
        const foo: { cb: () => void } = class {
          static cb = () => ({});
        };
      `,
      errors: [
        {
          column: 30,
          data: { varName: 'cb' },
          line: 3,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        class Foo {
          foo: () => void = () => [];
        }
      `,
      errors: [
        {
          column: 35,
          data: { varName: 'foo' },
          line: 3,
          messageId: 'nonVoidReturnInVar',
        },
      ],
    },
    {
      code: `
        class Foo {
          static foo: () => void = Math.random;
        }
      `,
      errors: [
        {
          column: 36,
          data: { varName: 'foo' },
          line: 3,
          messageId: 'nonVoidFuncInVar',
        },
      ],
    },
    {
      code: `
        class Foo {
          cb = () => {};
        }
        class Bar extends Foo {
          cb = Math.random;
        }
      `,
      errors: [
        {
          column: 16,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 6,
          messageId: 'nonVoidFuncInExtMember',
        },
      ],
    },
    {
      code: `
        const foo = () =>
          class {
            cb = () => {};
          };
        class Bar extends foo() {
          cb = Math.random;
        }
      `,
      errors: [
        {
          column: 16,
          data: { baseName: '__class', className: 'Bar', memberName: 'cb' },
          line: 7,
          messageId: 'nonVoidFuncInExtMember',
        },
      ],
    },
    {
      code: `
        class Foo {
          cb() {
            console.log('siema');
          }
        }
        const method = 'cb' as const;
        class Bar extends Foo {
          [method]() {
            return 'nara';
          }
        }
      `,
      errors: [
        {
          column: 13,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'method' },
          line: 10,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        class Foo {
          cb() {}
        }
        void class extends Foo {
          cb() {
            return Math.random();
          }
        };
      `,
      errors: [
        {
          column: 13,
          data: { baseName: 'Foo', className: 'class', memberName: 'cb' },
          line: 7,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        class Foo {
          cb1 = () => {};
        }
        class Bar extends Foo {
          cb2() {}
        }
        class Baz extends Bar {
          cb1 = () => Math.random();
          cb2() {
            return Math.random();
          }
        }
      `,
      errors: [
        {
          column: 23,
          data: { baseName: 'Bar', className: 'Baz', memberName: 'cb1' },
          line: 9,
          messageId: 'nonVoidReturnInExtMember',
        },
        {
          column: 13,
          data: { baseName: 'Bar', className: 'Baz', memberName: 'cb2' },
          line: 11,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        declare function f(): Promise<void>;
        interface Foo {
          cb: () => void;
        }
        class Bar {
          cb = () => {};
        }
        class Baz extends Bar implements Foo {
          cb: () => void = f;
        }
      `,
      errors: [
        {
          column: 28,
          data: { baseName: 'Bar', className: 'Baz', memberName: 'cb' },
          line: 10,
          messageId: 'nonVoidFuncInExtMember',
        },
      ],
    },
    {
      code: `
        class Foo {
          fn() {
            return 'a';
          }
          cb() {}
        }
        class Bar extends Foo {
          cb() {
            if (maybe) {
              return Promise.resolve('siema');
            } else {
              return Promise.resolve('nara');
            }
          }
        }
      `,
      errors: [
        {
          column: 15,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 11,
          messageId: 'nonVoidReturnInExtMember',
        },
        {
          column: 15,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 13,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        abstract class Foo {
          abstract cb(): void;
        }
        class Bar extends Foo {
          async cb() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 6,
          messageId: 'asyncFuncInExtMember',
        },
      ],
    },
    {
      code: `
        class Foo {
          fn() {
            return 'a';
          }
          cb() {}
        }
        class Bar extends Foo {
          *cb() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 9,
          messageId: 'nonVoidFuncInExtMember',
        },
      ],
    },
    {
      code: `
        interface Foo {
          cb: () => void;
        }
        class Bar implements Foo {
          cb = Math.random;
        }
      `,
      errors: [
        {
          column: 16,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 6,
          messageId: 'nonVoidFuncInImplMember',
        },
      ],
    },
    {
      code: `
        const o = { cb() {} };
        type O = typeof o;
        class Bar implements O {
          cb = Math.random;
        }
      `,
      errors: [
        {
          column: 16,
          data: { baseName: '__object', className: 'Bar', memberName: 'cb' },
          line: 5,
          messageId: 'nonVoidFuncInImplMember',
        },
      ],
    },
    {
      code: noFormat`
        class Foo {
          cb() {}
        }
        class Bar extends Foo {
          async*cb() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 6,
          messageId: 'nonVoidFuncInExtMember',
        },
      ],
    },
    {
      code: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          async cb(): Promise<string> {
            return Promise.resolve('siema');
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 6,
          messageId: 'asyncFuncInImplMember',
        },
      ],
    },
    {
      code: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          async cb() {
            try {
              return { a: ['asdf', 1234] };
            } catch {
              console.error('error');
            }
          }
        }
      `,
      errors: [
        {
          column: 15,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 8,
          messageId: 'nonVoidReturnInImplMember',
        },
      ],
    },
    {
      code: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          cb() {
            if (maybe) {
              return Promise.resolve(1);
            } else {
              return;
            }
          }
        }
      `,
      errors: [
        {
          column: 15,
          data: { baseName: 'Foo', className: 'Bar', memberName: 'cb' },
          line: 8,
          messageId: 'nonVoidReturnInImplMember',
        },
      ],
    },
    {
      code: `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 {
          cb2: () => void;
        }
        class Bar implements Foo1, Foo2 {
          async cb1() {}
          async *cb2() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo1', className: 'Bar', memberName: 'cb1' },
          line: 9,
          messageId: 'asyncFuncInImplMember',
        },
        {
          column: 11,
          data: { baseName: 'Foo2', className: 'Bar', memberName: 'cb2' },
          line: 10,
          messageId: 'nonVoidFuncInImplMember',
        },
      ],
    },
    {
      code: `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 {
          cb2: () => void;
        }
        class Baz {
          cb3() {}
        }
        class Bar extends Baz implements Foo1, Foo2 {
          async cb1() {}
          async *cb2() {}
          cb3() {
            return Math.random();
          }
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo1', className: 'Bar', memberName: 'cb1' },
          line: 12,
          messageId: 'asyncFuncInImplMember',
        },
        {
          column: 11,
          data: { baseName: 'Foo2', className: 'Bar', memberName: 'cb2' },
          line: 13,
          messageId: 'nonVoidFuncInImplMember',
        },
        {
          column: 13,
          data: { baseName: 'Baz', className: 'Bar', memberName: 'cb3' },
          line: 15,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        class A extends class {
          cb() {}
        } {
          cb() {
            return Math.random();
          }
        }
      `,
      errors: [
        {
          column: 13,
          data: { baseName: '__class', className: 'A', memberName: 'cb' },
          line: 6,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        class A extends class B {
          cb() {}
        } {
          cb() {
            return Math.random();
          }
        }
      `,
      errors: [
        {
          column: 13,
          data: { baseName: 'B', className: 'A', memberName: 'cb' },
          line: 6,
          messageId: 'nonVoidReturnInExtMember',
        },
      ],
    },
    {
      code: `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 extends Foo1 {
          cb2: () => void;
        }
        class Bar implements Foo2 {
          async cb1() {}
          async *cb2() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: { baseName: 'Foo2', className: 'Bar', memberName: 'cb1' },
          line: 9,
          messageId: 'asyncFuncInImplMember',
        },
        {
          column: 11,
          data: { baseName: 'Foo2', className: 'Bar', memberName: 'cb2' },
          line: 10,
          messageId: 'nonVoidFuncInImplMember',
        },
      ],
    },
    {
      code: `
        declare let foo: () => () => void;
        foo = () => () => 1 + 1;
      `,
      errors: [{ column: 27, line: 3, messageId: 'nonVoidReturnInReturn' }],
    },
    {
      code: `
        declare let foo: () => () => void;
        foo = () => () => Math.random();
      `,
      errors: [{ column: 27, line: 3, messageId: 'nonVoidReturnInReturn' }],
    },
    {
      code: `
        declare let foo: () => () => void;
        declare const cb: () => null | false;
        foo = () => cb;
      `,
      errors: [{ column: 21, line: 4, messageId: 'nonVoidFuncInReturn' }],
    },
    {
      code: `
        declare let foo: { f(): () => void };
        foo = {
          f() {
            return () => cb;
          },
        };
        function cb() {}
      `,
      errors: [{ column: 26, line: 5, messageId: 'nonVoidReturnInReturn' }],
    },
    {
      code: `
        declare let foo: { f(): () => void };
        foo.f = function () {
          return () => {
            return null;
          };
        };
      `,
      errors: [{ column: 13, line: 5, messageId: 'nonVoidReturnInReturn' }],
    },
    {
      code: `
        declare let foo: () => (() => void) | string;
        foo = () => () => {
          return 'asd' + 'zxc';
        };
      `,
      errors: [{ column: 11, line: 4, messageId: 'nonVoidReturnInReturn' }],
    },
    {
      code: `
        declare function foo(cb: () => () => void): void;
        foo(function () {
          return async () => {};
        });
      `,
      errors: [{ column: 27, line: 4, messageId: 'asyncFuncInReturn' }],
    },
    {
      code: noFormat`
        declare function foo(cb: () => () => void): void;
        foo(() => () => {
          if (n == 1) {
            console.log('asd')
            return [1].map(x => x)
          }
          if (n == 2) {
            console.log('asd')
            return -Math.random()
          }
          if (n == 3) {
            console.log('asd')
            return \`x\`.toUpperCase()
          }
          return <i>{Math.random()}</i>
        });
      `,
      errors: [
        { column: 13, line: 6, messageId: 'nonVoidReturnInReturn' },
        { column: 13, line: 10, messageId: 'nonVoidReturnInReturn' },
        { column: 13, line: 14, messageId: 'nonVoidReturnInReturn' },
        { column: 11, line: 16, messageId: 'nonVoidReturnInReturn' },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
        declare function foo(cb: (arg: string) => () => void): void;
        declare function foo(cb: (arg: number) => () => boolean): void;
        foo((arg: string) => {
          return cb;
        });
        async function* cb() {
          yield true;
        }
      `,
      errors: [{ column: 18, line: 5, messageId: 'nonVoidFuncInReturn' }],
    },
  ],
});
