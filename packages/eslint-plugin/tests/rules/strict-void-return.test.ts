import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/strict-void-return';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootDir,
      project: './tsconfig.dom.json',
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
      options: [{ allowReturnAny: true }],
      code: `
        declare function foo(cb: () => {}): void;
        foo(() => 1 as any);
      `,
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
      options: [{ considerOtherOverloads: false }],
      code: `
        document.addEventListener('click', async () => {});
      `,
    },
    {
      options: [{ considerOtherOverloads: false }],
      code: `
        declare function foo(x: null, cb: () => void): void;
        declare function foo(x: unknown, cb: () => any): void;
        foo({}, async () => {});
      `,
    },
    {
      options: [{ allowReturnAny: true }],
      code: `
        declare function foo(cb: () => void): void;
        foo(() => 1 as any);
      `,
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
      options: [{ allowReturnNull: false }],
      code: `
        declare function foo(cb: () => void): void;
        foo(() => undefined);
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        declare function foo(cb: () => void): void;
        foo(() => null);
      `,
    },
    {
      options: [{ allowReturnNull: false, allowReturnUndefined: false }],
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
      options: [{ allowReturnNull: false }],
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
          () => null,
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
          () => null,
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
          return null;
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
      filename: 'react.tsx',
      code: `
        declare function Foo(props: { cb: () => void }): unknown;
        return <Foo cb={() => {}} />;
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        type Cb = () => void;
        declare function Foo(props: { cb: Cb; s: string }): unknown;
        return <Foo cb={function () {}} s="asd" />;
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        type Cb = () => void;
        declare function Foo(props: { x: number; cb?: Cb }): unknown;
        return <Foo x={123} />;
      `,
    },
    {
      filename: 'react.tsx',
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
    },
    {
      filename: 'react.tsx',
      code: `
        interface Props {
          cb: ((arg: unknown) => void) | boolean;
        }
        declare function Foo(props: Props): unknown;
        return <Foo cb />;
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        interface Props {
          cb: (() => void) | (() => Promise<void>);
        }
        declare function Foo(props: Props): any;
        const _ = <Foo cb={async () => {}} />;
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        interface Props {
          children: (arg: unknown) => void;
        }
        declare function Foo(props: Props): unknown;
        declare function cb(): void;
        return <Foo>{cb}</Foo>;
      `,
    },
    {
      code: `
        declare function foo(cbs: { arg: number; cb: () => void }): void;
        foo({ arg: 1, cb: () => null });
      `,
    },
    {
      options: [{ allowReturnAny: true }],
      code: `
        declare let foo: { arg?: string; cb: () => void };
        foo = {
          cb: () => {
            return something;
          },
        };
      `,
    },
    {
      options: [{ allowReturnAny: true }],
      code: `
        declare let foo: { cb: () => void };
        foo = {
          cb() {
            return something;
          },
        };
      `,
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
          foo: () => void = () => null;
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
      options: [
        { considerBaseClass: false, considerImplementedInterfaces: false },
      ],
      code: `
        interface Foo {
          cb(): void;
        }
        class Bar {
          cb() {}
        }
        class Baz extends Bar implements Foo {
          cb() {
            return l;
          }
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
            return () => null;
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
        foo(() => false);
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 19,
        },
      ],
      output: `
        declare function foo(cb: () => void): void;
        foo(() => {});
      `,
    },
    {
      code: noFormat`
        declare function foo(cb: () => void): void;
        foo(() => (((true))));
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 22,
        },
      ],
      output: `
        declare function foo(cb: () => void): void;
        foo(() => {});
      `,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 13,
        },
      ],
      output: `
        declare function foo(cb: () => void): void;
        foo(() => {
          if (maybe) {
            return;
          }
        });
      `,
    },
    {
      code: `
        declare function foo(arg: number, cb: () => void): void;
        foo(0, () => 0);
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 22,
        },
      ],
      output: `
        declare function foo(arg: number, cb: () => void): void;
        foo(0, () => {});
      `,
    },
    {
      code: `
        declare function foo(cb?: { (): void }): void;
        foo(() => () => {});
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 19,
        },
      ],
      output: `
        declare function foo(cb?: { (): void }): void;
        foo(() => {});
      `,
    },
    {
      code: `
        declare const obj: { foo(cb: () => void) } | null;
        obj?.foo(() => JSON.parse('{}'));
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'obj?.foo' },
          line: 3,
          column: 24,
        },
      ],
      output: `
        declare const obj: { foo(cb: () => void) } | null;
        obj?.foo(() => void JSON.parse('{}'));
      `,
    },
    {
      code: `
        ((cb: () => void) => cb())!(() => 1);
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'function' },
          line: 2,
          column: 43,
        },
      ],
      output: `
        ((cb: () => void) => cb())!(() => {});
      `,
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        declare function cb(): string;
        foo(cb);
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 4,
          column: 13,
        },
      ],
      output: null,
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
          messageId: 'asyncFuncInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 34,
        },
      ],
      output: `
        type AnyFunc = (...args: unknown[]) => unknown;
        declare function foo<F extends AnyFunc>(cb: F): void;
        foo(async () => ({}));
        foo<() => void>(() => {});
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        function foo<T extends {}>(arg: T, cb: () => T);
        function foo(arg: null, cb: () => void);
        function foo(arg: any, cb: () => any) {}

        foo(null, () => Math.random());
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 6,
          column: 25,
        },
      ],
      output: `
        function foo<T extends {}>(arg: T, cb: () => T);
        function foo(arg: null, cb: () => void);
        function foo(arg: any, cb: () => any) {}

        foo(null, () => { Math.random(); });
      `,
    },
    {
      code: `
        declare function foo<T extends {}>(arg: T, cb: () => T): void;
        declare function foo(arg: any, cb: () => void): void;

        foo(null, async () => {});
      `,
      errors: [
        {
          messageId: 'asyncFuncInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 28,
        },
      ],
      output: `
        declare function foo<T extends {}>(arg: T, cb: () => T): void;
        declare function foo(arg: any, cb: () => void): void;

        foo(null, () => {});
      `,
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
          messageId: 'asyncNoTryCatchFuncInArg',
          data: { funcName: 'foo' },
          line: 4,
          column: 22,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        declare function foo(cb: () => void): void;
        declare function foo(cb: () => any): void;
        foo(async () => { try {
          return Math.random();
        } catch {} });
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        declare function foo(cb: () => void): void;
        declare function foo(cb: () => any): void;
        foo(() => void (async () => {
          return Math.random();
        })());
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        foo(cb);
        async function cb() {}
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 13,
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInArgOverload',
          data: { funcName: 'foo' },
          line: 5,
          column: 11,
        },
      ],
      output: `
        declare function foo<Cb extends (...args: any[]) => void>(cb: Cb): void;
        foo(() => {
          console.log('a');
          \

        });
      `,
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
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 4,
          column: 15,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function foo(cb: { (): void }): void;
        const cb = () => dunno;
        foo!(cb);
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 4,
          column: 14,
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 26,
        },
      ],
      output: `
        declare const foo: {
          (arg: boolean, cb: () => void): void;
        };
        foo(false, () => void Promise.resolve(undefined));
      `,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo.bar' },
          line: 7,
          column: 17,
        },
      ],
      output: `
        declare const foo: {
          bar(cb1: () => any, cb2: () => void): void;
        };
        foo.bar(
          () => Promise.resolve(1),
          () => void Promise.resolve(1),
        );
      `,
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
          messageId: 'asyncFuncInArg',
          data: { funcName: 'Foo' },
          line: 5,
          column: 26,
        },
      ],
      output: `
        declare const Foo: {
          new (cb: () => void): void;
        };
        new Foo(() => {});
      `,
    },
    {
      options: [{ allowReturnNull: false }],
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 6,
          column: 26,
        },
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 7,
          column: 20,
        },
      ],
      output: `
        declare function foo(cb: () => void): void;
        foo(() => {
          label: while (maybe) {
            for (const i of [1, 2, 3]) {
              if (maybe) return;
              else return;
            }
          }
          return void 0;
        });
      `,
    },
    {
      options: [{ allowReturnNull: false }],
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 8,
          column: 15,
        },
      ],
      output: `
        declare function foo(cb: () => void): void;
        foo(() => {
          do {
            try {
              throw 1;
            } catch (e) {
              return;
            } finally {
              console.log('finally');
            }
          } while (maybe);
        });
      `,
    },
    {
      options: [{ allowReturnPromiseIfTryCatch: false }],
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
          messageId: 'asyncFuncInArg',
          data: { funcName: 'foo' },
          line: 3,
          column: 22,
          suggestions: [
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        declare function foo(cb: () => void): void;
        foo(() => void (async () => {
          try {
            await Promise.resolve();
          } catch {
            console.error('fail');
          }
        })());
      `,
            },
          ],
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'Foo' },
          line: 6,
          column: 23,
        },
      ],
      output: `
        declare const Foo: {
          new (cb: () => void): void;
          (cb: () => unknown): void;
        };
        new Foo(() => {});
      `,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'Foo' },
          line: 6,
          column: 19,
        },
      ],
      output: `
        declare const Foo: {
          new (cb: () => any): void;
          (cb: () => void): void;
        };
        Foo(() => {});
      `,
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
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 7,
          column: 13,
        },
      ],
      output: null,
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
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 13,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function foo(cb: (() => void) | null): void;
        declare function cb(): boolean;
        foo(cb);
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInArg',
          data: { funcName: 'foo' },
          line: 4,
          column: 13,
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 17,
        },
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 6,
          column: 17,
        },
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 7,
          column: 17,
        },
      ],
      output: `
        declare function foo(...cbs: Array<() => void>): void;
        foo(
          () => {},
          () => {},
          () => {},
          () => {},
        );
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
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
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 5,
          column: 17,
        },
        {
          messageId: 'nonVoidReturnInArg',
          data: { funcName: 'foo' },
          line: 6,
          column: 17,
        },
      ],
      output: `
        declare function foo(...cbs: [() => void, () => void, (() => void)?]): void;
        foo(
          () => {},
          () => { Math.random(); },
          () => { (1).toString(); },
        );
      `,
    },
    {
      code: `
        document.addEventListener('click', async () => {});
      `,
      errors: [
        {
          messageId: 'asyncFuncInArgOverload',
          data: { funcName: 'document.addEventListener' },
          line: 2,
          column: 53,
        },
      ],
      output: `
        document.addEventListener('click', () => {});
      `,
    },
    {
      code: `
        declare function foo(x: null, cb: () => void): void;
        declare function foo(x: unknown, cb: () => any): void;
        foo({}, async () => {});
      `,
      errors: [
        {
          messageId: 'asyncFuncInArgOverload',
          data: { funcName: 'foo' },
          line: 4,
          column: 26,
        },
      ],
      output: `
        declare function foo(x: null, cb: () => void): void;
        declare function foo(x: unknown, cb: () => any): void;
        foo({}, () => {});
      `,
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
          messageId: 'asyncNoTryCatchFuncInArg',
          data: { funcName: 'arr.forEach' },
          line: 3,
          column: 29,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        const arr = [1, 2];
        arr.forEach(async x => { try {
          console.log(x);
        } catch {} });
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        const arr = [1, 2];
        arr.forEach(x => void (async () => {
          console.log(x);
        })());
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
        [1, 2].forEach(async x => console.log(x));
      `,
      errors: [
        {
          messageId: 'asyncFuncInArg',
          data: { funcName: 'forEach' },
          line: 2,
          column: 32,
        },
      ],
      output: `
        [1, 2].forEach(x => void console.log(x));
      `,
    },
    {
      code: `
        const foo: () => void = () => false;
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 2,
          column: 39,
        },
      ],
      output: `
        const foo: () => void = () => {};
      `,
    },
    {
      code: `
        const { name }: () => void = function foo() {
          return false;
        };
      `,
      errors: [{ messageId: 'nonVoidReturnInOther', line: 3, column: 11 }],
      output: `
        const { name }: () => void = function foo() {
          \

        };
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        const foo: () => void = async () => Promise.resolve(true);
      `,
      errors: [
        {
          messageId: 'asyncFuncInVar',
          data: { varName: 'foo' },
          line: 2,
          column: 42,
        },
      ],
      output: `
        const foo: () => void = () => { Promise.resolve(true); };
      `,
    },
    {
      code: 'const cb: () => void = (): Array<number> => [];',
      errors: [
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'cb' },
          line: 1,
          column: 45,
        },
      ],
      output: 'const cb: () => void = (): void => {};',
    },
    {
      code: `
        const cb: () => void = (): Array<number> => {
          return [];
        };
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'cb' },
          line: 2,
          column: 36,
        },
      ],
      output: `
        const cb: () => void = (): void => {
          return [];
        };
      `,
    },
    {
      code: noFormat`const cb: () => void = function*foo() {}`,
      errors: [
        {
          messageId: 'genFuncInVar',
          data: { varName: 'cb' },
          line: 1,
          column: 24,
        },
      ],
      output: `const cb: () => void = function foo() {}`,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: 'const cb: () => void = (): Promise<number> => Promise.resolve(1);',
      errors: [
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'cb' },
          line: 1,
          column: 47,
        },
      ],
      output: 'const cb: () => void = (): void => { Promise.resolve(1); };',
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        const cb: () => void = async (): Promise<number> => {
          try {
            return Promise.resolve(1);
          } catch {}
        };
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'cb' },
          line: 2,
          column: 42,
        },
      ],
      output: [
        `
        const cb: () => void = async (): Promise<void> => {
          try {
            return Promise.resolve(1);
          } catch {}
        };
      `,
        `
        const cb: () => void = async (): Promise<void> => {
          try {
            Promise.resolve(1); return;
          } catch {}
        };
      `,
      ],
    },
    {
      code: 'const cb: () => void = async (): Promise<number> => Promise.resolve(1);',
      errors: [
        {
          messageId: 'asyncFuncInVar',
          data: { varName: 'cb' },
          line: 1,
          column: 50,
        },
      ],
      output: 'const cb: () => void = (): void => void Promise.resolve(1);',
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
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 13,
        },
      ],
      output: `
        const foo: () => void = async () => {
          try {
            return;
          } catch {}
        };
      `,
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
          messageId: 'asyncNoTryCatchFuncInVar',
          data: { varName: 'foo' },
          line: 2,
          column: 57,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        const foo: () => void = async (): Promise<void> => { try {
          try {
            await Promise.resolve();
          } finally {
          }
        } catch {} };
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        const foo: () => void = (): void => void (async () => {
          try {
            await Promise.resolve();
          } finally {
          }
        })();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      options: [{ allowReturnUndefined: false }],
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
          messageId: 'asyncNoTryCatchFuncInVar',
          data: { varName: 'foo' },
          line: 2,
          column: 42,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        const foo: () => void = async () => { try {
          try {
            await Promise.resolve();
          } catch (err) {
            console.error(err);
          }
          console.log('ok');
        } catch {} };
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        const foo: () => void = () => { (async () => {
          try {
            await Promise.resolve();
          } catch (err) {
            console.error(err);
          }
          console.log('ok');
        })(); };
      `,
            },
          ],
        },
      ],
      output: null,
    },
    // TODO: Check every union type separately
    // {
    //   code: `
    //     declare let foo: (() => void) | (() => boolean);
    //     foo = () => 1;
    //   `,
    //   errors: [{ messageId: 'nonVoidReturnInVar', data: {varName: throw}, line: 3, column: 21 }],
    //   output: `
    //     declare let foo: (() => void) | (() => boolean);
    //     foo = () => {};
    //   `,
    // },
    {
      code: 'const foo: () => void = (): number => {};',
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 1,
          column: 29,
        },
      ],
      output: 'const foo: () => void = (): void => {};',
    },
    {
      code: `
        declare function cb(): boolean;
        const foo: () => void = cb;
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 3,
          column: 33,
        },
      ],
      output: null,
    },
    {
      options: [{ allowReturnNull: false, allowReturnUndefined: false }],
      code: `
        const foo: () => void = function () {
          if (maybe) {
            return null;
          } else {
            return void 0;
          }
        };
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 13,
        },
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 6,
          column: 13,
        },
      ],
      output: `
        const foo: () => void = function () {
          if (maybe) {
            return;
          } else {
            return;
          }
        };
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
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
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 5,
          column: 13,
        },
      ],
      output: `
        const foo: () => void = function () {
          if (maybe) {
            console.log('elo');
            ;({ [1]: Math.random() }); return;
          }
        };
      `,
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
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 6,
          column: 15,
        },
        {
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo' },
          line: 8,
          column: 15,
        },
      ],
      output: `
        const foo: { (arg: number): void; (arg: string): void } = arg => {
          console.log('foo');
          switch (typeof arg) {
            case 'number':
              return;
            case 'string':
              return;
          }
        };
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        const foo: ((arg: number) => void) | ((arg: string) => void) = async () => {
          return 1;
        };
      `,
      errors: [
        {
          messageId: 'asyncNoTryCatchFuncInVar',
          data: { varName: 'foo' },
          line: 2,
          column: 81,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        const foo: ((arg: number) => void) | ((arg: string) => void) = async () => { try {
          return 1;
        } catch {} };
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        const foo: ((arg: number) => void) | ((arg: string) => void) = () => { (async () => {
          return 1;
        })(); };
      `,
            },
          ],
        },
      ],
      output: null,
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
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 3,
          column: 26,
        },
      ],
      output: null,
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
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 5,
          column: 26,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function cb(): unknown;
        declare let foo: () => void;
        foo = cb;
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 15,
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInVar',
          data: { varName: 'foo.cb' },
          line: 4,
          column: 11,
        },
      ],
      output: `
        declare let foo: { arg?: string; cb?: () => void };
        foo.cb = () => {
          return;
          console.log('siema');
        };
      `,
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | null = null;
        foo ??= cb;
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 17,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | boolean = false;
        foo ||= cb;
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 17,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function cb(): unknown;
        let foo: (() => void) | boolean = false;
        foo &&= cb;
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInVar',
          data: { varName: 'foo' },
          line: 4,
          column: 17,
        },
      ],
      output: null,
    },
    {
      filename: 'react.tsx',
      code: `
        declare function Foo(props: { cb: () => void }): unknown;
        return <Foo cb={() => 1} />;
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 3,
          column: 31,
        },
      ],
      output: `
        declare function Foo(props: { cb: () => void }): unknown;
        return <Foo cb={() => {}} />;
      `,
    },
    {
      filename: 'react.tsx',
      options: [{ allowReturnNull: false, allowReturnUndefined: false }],
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
          messageId: 'nonVoidReturnInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 7,
          column: 26,
        },
        {
          messageId: 'nonVoidReturnInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 8,
          column: 20,
        },
      ],
      output: `
        declare function Foo(props: { cb: () => void }): unknown;
        declare function getNull(): null;
        return (
          <Foo
            cb={() => {
              if (maybe) { Math.random(); return; }
              else { getNull(); return; }
            }}
          />
        );
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        type Cb = () => void;
        declare function Foo(props: { cb: Cb; s: string }): unknown;
        return <Foo cb={async function () {}} s="!@#jp2gmd" />;
      `,
      errors: [
        {
          messageId: 'asyncFuncInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 4,
          column: 25,
        },
      ],
      output: `
        type Cb = () => void;
        declare function Foo(props: { cb: Cb; s: string }): unknown;
        return <Foo cb={function () {}} s="!@#jp2gmd" />;
      `,
    },
    {
      filename: 'react.tsx',
      code: `
        type Cb = () => void;
        declare function Foo(props: { n: number; cb?: Cb }): unknown;
        return <Foo n={2137} cb={function* () {}} />;
      `,
      errors: [
        {
          messageId: 'genFuncInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 4,
          column: 34,
        },
      ],
      output: `
        type Cb = () => void;
        declare function Foo(props: { n: number; cb?: Cb }): unknown;
        return <Foo n={2137} cb={function () {}} />;
      `,
    },
    {
      filename: 'react.tsx',
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
          messageId: 'genFuncInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 6,
          column: 17,
        },
      ],
      output: null,
    },
    {
      filename: 'react.tsx',
      code: `
        interface Props {
          cb: ((arg: unknown) => void) | boolean;
        }
        declare function Foo(props: Props): unknown;
        return <Foo cb={x => x} />;
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInAttr',
          data: { attrName: 'cb', elemName: 'Foo' },
          line: 6,
          column: 30,
        },
      ],
      output: `
        interface Props {
          cb: ((arg: unknown) => void) | boolean;
        }
        declare function Foo(props: Props): unknown;
        return <Foo cb={x => {}} />;
      `,
    },
    {
      filename: 'react.tsx',
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
          messageId: 'nonVoidReturnInAttr',
          data: { attrName: 'onClick', elemName: 'Button' },
          line: 8,
          column: 40,
        },
      ],
      output: `
        type EventHandler<E> = { bivarianceHack(event: E): void }['bivarianceHack'];
        interface ButtonProps {
          onClick?: EventHandler<unknown> | undefined;
        }
        declare function Button(props: ButtonProps): unknown;
        function App() {
          return <Button onClick={x => {}} />;
        }
      `,
    },
    {
      code: `
        declare function foo(cbs: { arg: number; cb: () => void }): void;
        foo({ arg: 1, cb: () => 1 });
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInProp',
          data: { propName: 'cb' },
          line: 3,
          column: 33,
        },
      ],
      output: `
        declare function foo(cbs: { arg: number; cb: () => void }): void;
        foo({ arg: 1, cb: () => {} });
      `,
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
          messageId: 'nonVoidReturnInProp',
          data: { propName: 'cb' },
          line: 6,
          column: 13,
        },
      ],
      output: `
        declare let foo: { arg?: string; cb: () => void };
        foo = {
          cb: () => {
            let x = 'siema';
            \

          },
        };
      `,
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
          messageId: 'nonVoidReturnInProp',
          data: { propName: 'cb' },
          line: 5,
          column: 13,
        },
      ],
      output: `
        declare let foo: { cb: (n: number) => void };
        foo = {
          cb(n) {
            \

          },
        };
      `,
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
          messageId: 'nonVoidReturnInProp',
          data: { propName: '1234' },
          line: 5,
          column: 13,
        },
      ],
      output: `
        declare let foo: { 1234: (n: number) => void };
        foo = {
          1234(n) {
            \

          },
        };
      `,
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
          messageId: 'nonVoidReturnInProp',
          data: { propName: '1_000_000_000_000_000_000_000' },
          line: 4,
          column: 48,
        },
      ],
      output: `
        declare let foo: { '1e+21': () => void };
        foo = {
          1_000_000_000_000_000_000_000: () => {},
        };
      `,
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
          messageId: 'asyncNoTryCatchFuncInProp',
          data: { propName: 'cb' },
          line: 4,
          column: 11,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        declare let foo: { cb: (() => void) | number };
        foo = {
          cb: async () => { try {
            if (maybe) {
              return 'asd';
            }
          } catch {} },
        };
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        declare let foo: { cb: (() => void) | number };
        foo = {
          cb: () => void (async () => {
            if (maybe) {
              return 'asd';
            }
          })(),
        };
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
        declare function cb(): number;
        const foo: Record<string, () => void> = {
          cb1: cb,
          cb2: cb,
        };
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInProp',
          data: { propName: 'cb1' },
          line: 4,
          column: 16,
        },
        {
          messageId: 'nonVoidFuncInProp',
          data: { propName: 'cb2' },
          line: 5,
          column: 16,
        },
      ],
      output: null,
    },
    {
      code: `
        declare function cb(): number;
        const foo: Array<(() => void) | false> = [false, cb, () => cb()];
      `,
      errors: [
        { messageId: 'nonVoidFuncInOther', line: 3, column: 58 },
        { messageId: 'nonVoidReturnInOther', line: 3, column: 68 },
      ],
      output: `
        declare function cb(): number;
        const foo: Array<(() => void) | false> = [false, cb, () => void cb()];
      `,
    },
    {
      code: `
        declare function cb(): number;
        const foo: [string, () => void, (() => void)?] = ['asd', cb];
      `,
      errors: [{ messageId: 'nonVoidFuncInOther', line: 3, column: 66 }],
      output: null,
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
        { messageId: 'genFuncInOther', line: 4, column: 13 },
        {
          messageId: 'asyncNoTryCatchFuncInOther',
          line: 7,
          column: 22,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        const foo: { cbs: Array<() => void> | null } = {
          cbs: [
            function* () {
              yield 1;
            },
            async () => { try {
              await 1;
            } catch {} },
            null,
          ],
        };
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        const foo: { cbs: Array<() => void> | null } = {
          cbs: [
            function* () {
              yield 1;
            },
            () => void (async () => {
              await 1;
            })(),
            null,
          ],
        };
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
        const foo: { cb: () => void } = class {
          static cb = () => ({});
        };
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInProp',
          data: { propName: 'cb' },
          line: 3,
          column: 30,
        },
      ],
      output: `
        const foo: { cb: () => void } = class {
          static cb = () => {};
        };
      `,
    },
    {
      code: `
        class Foo {
          foo: () => void = () => [];
        }
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInProp',
          data: { propName: 'foo' },
          line: 3,
          column: 35,
        },
      ],
      output: `
        class Foo {
          foo: () => void = () => {};
        }
      `,
    },
    {
      code: `
        class Foo {
          static foo: () => void = Math.random;
        }
      `,
      errors: [
        {
          messageId: 'nonVoidFuncInProp',
          data: { propName: 'foo' },
          line: 3,
          column: 36,
        },
      ],
      output: null,
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
          messageId: 'nonVoidFuncInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 6,
          column: 16,
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'method', className: 'Bar', baseName: 'Foo' },
          line: 10,
          column: 13,
        },
      ],
      output: `
        class Foo {
          cb() {
            console.log('siema');
          }
        }
        const method = 'cb' as const;
        class Bar extends Foo {
          [method]() {
            \

          }
        }
      `,
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
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'cb', className: 'class', baseName: 'Foo' },
          line: 7,
          column: 13,
        },
      ],
      output: `
        class Foo {
          cb() {}
        }
        void class extends Foo {
          cb() {
            Math.random();
          }
        };
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
          cb1 = () => Math.random();
          cb2() {
            return Math.random();
          }
        }
      `,
      errors: [
        {
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'cb1', className: 'Baz', baseName: 'Bar' },
          line: 9,
          column: 23,
        },
        {
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'cb2', className: 'Baz', baseName: 'Bar' },
          line: 11,
          column: 13,
        },
      ],
      output: `
        class Foo {
          cb1 = () => {};
        }
        class Bar extends Foo {
          cb2() {}
        }
        class Baz extends Bar {
          cb1 = () => void Math.random();
          cb2() {
            Math.random();
          }
        }
      `,
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
          messageId: 'nonVoidFuncInExtMember',
          data: { memberName: 'cb', className: 'Baz', baseName: 'Bar' },
          line: 10,
          column: 28,
        },
        {
          messageId: 'nonVoidFuncInImplMember',
          data: { memberName: 'cb', className: 'Baz', baseName: 'Foo' },
          line: 10,
          column: 28,
        },
        {
          messageId: 'nonVoidFuncInProp',
          data: { propName: 'cb' },
          line: 10,
          column: 28,
        },
      ],
      output: null,
    },
    {
      options: [{ allowReturnUndefined: false }],
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
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 11,
          column: 15,
        },
        {
          messageId: 'nonVoidReturnInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 13,
          column: 15,
        },
      ],
      output: `
        class Foo {
          fn() {
            return 'a';
          }
          cb() {}
        }
        class Bar extends Foo {
          cb() {
            if (maybe) {
              Promise.resolve('siema'); return;
            } else {
              Promise.resolve('nara'); return;
            }
          }
        }
      `,
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
          messageId: 'asyncFuncInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 6,
          column: 11,
        },
      ],
      output: `
        abstract class Foo {
          abstract cb(): void;
        }
        class Bar extends Foo {
          cb() {}
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
        class Bar extends Foo {
          *cb() {}
        }
      `,
      errors: [
        {
          messageId: 'genFuncInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 9,
          column: 11,
        },
      ],
      output: `
        class Foo {
          fn() {
            return 'a';
          }
          cb() {}
        }
        class Bar extends Foo {
          cb() {}
        }
      `,
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
          messageId: 'nonVoidFuncInImplMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 6,
          column: 16,
        },
      ],
      output: null,
    },
    // TODO: Check getters
    // {
    //   code: `
    //     interface Foo {
    //       cb: () => void;
    //     }
    //     class Bar implements Foo {
    //       get cb() {
    //         return () => 1;
    //       }
    //     }
    //   `,
    //   errors: [],
    // },
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
          messageId: 'genFuncInExtMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 6,
          column: 11,
        },
      ],
      output: [
        `
        class Foo {
          cb() {}
        }
        class Bar extends Foo {
          async cb() {}
        }
      `,
        `
        class Foo {
          cb() {}
        }
        class Bar extends Foo {
          cb() {}
        }
      `,
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
          messageId: 'asyncNoTryCatchFuncInImplMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 6,
          column: 11,
          suggestions: [
            {
              messageId: 'suggestWrapInTryCatch',
              output: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          async cb(): Promise<void> { try {
            return Promise.resolve('siema');
          } catch {} }
        }
      `,
            },
            {
              messageId: 'suggestWrapInAsyncIIFE',
              output: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          cb(): void { (async () => {
            return Promise.resolve('siema');
          })(); }
        }
      `,
            },
          ],
        },
      ],
      output: null,
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
          messageId: 'nonVoidReturnInImplMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 8,
          column: 15,
        },
      ],
      output: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          async cb() {
            try {
              return;
            } catch {
              console.error('error');
            }
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
          messageId: 'nonVoidReturnInImplMember',
          data: { memberName: 'cb', className: 'Bar', baseName: 'Foo' },
          line: 8,
          column: 15,
        },
      ],
      output: `
        interface Foo {
          cb(): void;
        }
        class Bar implements Foo {
          cb() {
            if (maybe) {
              return void Promise.resolve(1);
            } else {
              return;
            }
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
          async cb1() {}
          async *cb2() {}
        }
      `,
      errors: [
        {
          messageId: 'asyncFuncInImplMember',
          data: { memberName: 'cb1', className: 'Bar', baseName: 'Foo1' },
          line: 9,
          column: 11,
        },
        {
          messageId: 'genFuncInImplMember',
          data: { memberName: 'cb2', className: 'Bar', baseName: 'Foo2' },
          line: 10,
          column: 11,
        },
      ],
      output: [
        `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 {
          cb2: () => void;
        }
        class Bar implements Foo1, Foo2 {
          cb1() {}
          async cb2() {}
        }
      `,
        `
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
          messageId: 'asyncFuncInImplMember',
          data: { memberName: 'cb1', className: 'Bar', baseName: 'Foo2' },
          line: 9,
          column: 11,
        },
        {
          messageId: 'genFuncInImplMember',
          data: { memberName: 'cb2', className: 'Bar', baseName: 'Foo2' },
          line: 10,
          column: 11,
        },
      ],
      output: [
        `
        interface Foo1 {
          cb1(): void;
        }
        interface Foo2 extends Foo1 {
          cb2: () => void;
        }
        class Bar implements Foo2 {
          cb1() {}
          async cb2() {}
        }
      `,
        `
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
      ],
    },
    {
      code: `
        declare let foo: () => () => void;
        foo = () => () => 1 + 1;
      `,
      errors: [{ messageId: 'nonVoidReturnInReturn', line: 3, column: 27 }],
      output: `
        declare let foo: () => () => void;
        foo = () => () => {};
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      code: `
        declare let foo: () => () => void;
        foo = () => () => Math.random();
      `,
      errors: [{ messageId: 'nonVoidReturnInReturn', line: 3, column: 27 }],
      output: `
        declare let foo: () => () => void;
        foo = () => () => { Math.random(); };
      `,
    },
    {
      code: `
        declare let foo: () => () => void;
        declare const cb: () => null | false;
        foo = () => cb;
      `,
      errors: [{ messageId: 'nonVoidFuncInReturn', line: 4, column: 21 }],
      output: null,
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
      errors: [{ messageId: 'nonVoidReturnInReturn', line: 5, column: 26 }],
      output: `
        declare let foo: { f(): () => void };
        foo = {
          f() {
            return () => {};
          },
        };
        function cb() {}
      `,
    },
    {
      options: [{ allowReturnNull: false }],
      code: `
        declare let foo: { f(): () => void };
        foo.f = function () {
          return () => {
            return null;
          };
        };
      `,
      errors: [{ messageId: 'nonVoidReturnInReturn', line: 5, column: 13 }],
      output: `
        declare let foo: { f(): () => void };
        foo.f = function () {
          return () => {
            \

          };
        };
      `,
    },
    {
      code: `
        declare let foo: () => (() => void) | string;
        foo = () => () => {
          return 'asd' + 'zxc';
        };
      `,
      errors: [{ messageId: 'nonVoidReturnInReturn', line: 4, column: 11 }],
      output: `
        declare let foo: () => (() => void) | string;
        foo = () => () => {
          \

        };
      `,
    },
    {
      code: `
        declare function foo(cb: () => () => void): void;
        foo(function () {
          return async () => {};
        });
      `,
      errors: [{ messageId: 'asyncFuncInReturn', line: 4, column: 27 }],
      output: `
        declare function foo(cb: () => () => void): void;
        foo(function () {
          return () => {};
        });
      `,
    },
    {
      options: [{ allowReturnUndefined: false }],
      filename: 'react.tsx',
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
        { messageId: 'nonVoidReturnInReturn', line: 6, column: 13 },
        { messageId: 'nonVoidReturnInReturn', line: 10, column: 13 },
        { messageId: 'nonVoidReturnInReturn', line: 14, column: 13 },
        { messageId: 'nonVoidReturnInReturn', line: 16, column: 11 },
      ],
      output: `
        declare function foo(cb: () => () => void): void;
        foo(() => () => {
          if (n == 1) {
            console.log('asd')
            ;[1].map(x => x); return;
          }
          if (n == 2) {
            console.log('asd')
            ;-Math.random(); return;
          }
          if (n == 3) {
            console.log('asd')
            ;\`x\`.toUpperCase(); return;
          }
          ;<i>{Math.random()}</i>;
        });
      `,
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
      errors: [{ messageId: 'nonVoidFuncInReturn', line: 5, column: 18 }],
      output: null,
    },
  ],
});
