import rule from '../../src/rules/no-useless-default-assignment';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-useless-default-assignment', rule, {
  valid: [
    `
      function Bar({ foo = '' }: { foo?: string }) {
        return foo;
      }
    `,
    `
      const { foo } = { foo: 'bar' };
    `,
    `
      [1, 2, 3, undefined].map((a = 42) => a + 1);
    `,
    `
      function test(a?: number) {
        return a;
      }
    `,
    `
      const obj: { a?: string } = {};
      const { a = 'default' } = obj;
    `,
    `
      function test(a: string | undefined = 'default') {
        return a;
      }
    `,
    `
      (a: string = 'default') => a;
    `,
    `
      function test(a: string = 'default') {
        return a;
      }
    `,
    `
      class C {
        public test(a: string = 'default') {
          return a;
        }
      }
    `,
    `
      const obj: { a: string | undefined } = { a: undefined };
      const { a = 'default' } = obj;
    `,
    `
      function test(arr: number[] | undefined = []) {
        return arr;
      }
    `,
    `
      function Bar({ nested: { foo = '' } = {} }: { nested?: { foo?: string } }) {
        return foo;
      }
    `,
    `
      function test(a: any = 'default') {
        return a;
      }
    `,
    `
      function test(a: unknown = 'default') {
        return a;
      }
    `,
    `
      function test(a = 5) {
        return a;
      }
    `,
    `
      function createValidator(): () => void {
        return (param = 5) => {};
      }
    `,
    `
      function Bar({ foo = '' }: { foo: any }) {
        return foo;
      }
    `,
    `
      function Bar({ foo = '' }: { foo: unknown }) {
        return foo;
      }
    `,
    `
      function getValue(): undefined;
      function getValue(box: { value: string }): string;
      function getValue({ value = '' }: { value?: string } = {}): string | undefined {
        return value;
      }
    `,
    `
      function getValueObject({ value = '' }: Partial<{ value: string }>) {
        return value;
      }
    `,
    `
      const { value = 'default' } = someUnknownFunction();
    `,
    `
      const [value = 'default'] = someUnknownFunction();
    `,
    `
      for (const { value = 'default' } of []) {
      }
    `,
    `
      for (const [value = 'default'] of []) {
      }
    `,
    `
      declare const x: [[number | undefined]];
      const [[a = 1]] = x;
    `,
    `
      function foo(x: string = '') {}
    `,
    `
      class C {
        method(x: string = '') {}
      }
    `,
    `
      const foo = (x: string = '') => {};
    `,
    `
      const obj = { ab: { x: 1 } };
      const {
        ['a' + 'b']: { x = 1 },
      } = obj;
    `,
    `
      const obj = { ab: 1 };
      const { ['a' + 'b']: x = 1 } = obj;
    `,
    `
      for ([[a = 1]] of []) {
      }
    `,
    {
      code: `
        declare const g: Array<string>;
        const [foo = ''] = g;
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        declare const g: Record<string, string>;
        const { foo = '' } = g;
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    {
      code: `
        declare const h: { [key: string]: string };
        const { bar = '' } = h;
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
    `
      declare const g: Array<string>;
      const [foo = ''] = g;
    `,
    `
      declare const g: Record<string, string>;
      const { foo = '' } = g;
    `,
    `
      declare const h: { [key: string]: string };
      const { bar = '' } = h;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11849
    `
      type Merge = boolean | ((incoming: string[]) => void);

      const policy: { merge: Merge } = {
        merge: (incoming: string[] = []) => {
          incoming;
        },
      };
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11846
    `
      const [a, b = ''] = 'somestr'.split('.');
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11846
    `
      declare const params: string[];
      const [c = '123'] = params;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11846
    `
      declare function useCallback<T>(callback: T);
      useCallback((value: number[] = []) => {});
    `,
    `
      declare const tuple: [string];
      const [a, b = 'default'] = tuple;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11911
    `
      const run = (cb: (...args: unknown[]) => void) => cb();
      const cb = (p: boolean = true) => null;
      run(cb);
      run((p: boolean = true) => null);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11850
    `
      const { a = 'default' } = Math.random() > 0.5 ? { a: 'Hello' } : {};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11850
    `
      const { a = 'default' } =
        Math.random() > 0.5 ? (Math.random() > 0.5 ? { a: 'Hello' } : {}) : {};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11980
    `
      const { a = 'baz' } = cond ? {} : { a: 'bar' };
    `,
    `
      const { a = 'baz' } = cond ? foo : { a: 'bar' };
    `,
    `
      const { a = 'baz' } = foo && { a: 'bar' };
    `,
    `
      const { a = 'baz' } = cond ? { a: 'foo', ...extra } : { a: 'bar' };
    `,
    `
      const { a = 'baz' } = cond ? { ...foo } : { a: 'bar' };
    `,
    `
      const key = Math.random() > 0.5 ? 'a' : 'b';
      const { a = 'baz' } = cond ? { [key]: 'foo' } : { [key]: 'bar' };
    `,
    `
      const { a = 'baz' } = cond ? foo && { a: 'bar' } : { a: 'baz' };
    `,
    `
      const obj: unknown = { a: 'bar' };
      const { a = 'baz' } = cond ? obj : { a: 'bar' };
    `,
    `
      const sym = Symbol('a');
      const { a = 'baz' } = cond ? { [sym]: 'foo' } : { [sym]: 'bar' };
    `,
  ],
  invalid: [
    {
      code: `
        function Bar({ foo = '' }: { foo: string }) {
          return foo;
        }
      `,
      errors: [
        {
          column: 30,
          data: { type: 'property' },
          endColumn: 32,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        function Bar({ foo }: { foo: string }) {
          return foo;
        }
      `,
    },
    {
      code: `
        class C {
          public method({ foo = '' }: { foo: string }) {
            return foo;
          }
        }
      `,
      errors: [
        {
          column: 33,
          data: { type: 'property' },
          endColumn: 35,
          line: 3,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        class C {
          public method({ foo }: { foo: string }) {
            return foo;
          }
        }
      `,
    },
    {
      code: `
        const { 'literal-key': literalKey = 'default' } = { 'literal-key': 'value' };
      `,
      errors: [
        {
          column: 45,
          data: { type: 'property' },
          endColumn: 54,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { 'literal-key': literalKey } = { 'literal-key': 'value' };
      `,
    },
    {
      code: `
        [1, 2, 3].map((a = 42) => a + 1);
      `,
      errors: [
        {
          column: 28,
          data: { type: 'parameter' },
          endColumn: 30,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        [1, 2, 3].map((a) => a + 1);
      `,
    },
    {
      code: `
        function getValue(): undefined;
        function getValue(box: { value: string }): string;
        function getValue({ value = '' }: { value: string } = {}): string | undefined {
          return value;
        }
      `,
      errors: [
        {
          column: 37,
          data: { type: 'property' },
          endColumn: 39,
          line: 4,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        function getValue(): undefined;
        function getValue(box: { value: string }): string;
        function getValue({ value }: { value: string } = {}): string | undefined {
          return value;
        }
      `,
    },
    {
      code: `
        function getValue([value = '']: [string]) {
          return value;
        }
      `,
      errors: [
        {
          column: 36,
          data: { type: 'property' },
          endColumn: 38,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        function getValue([value]: [string]) {
          return value;
        }
      `,
    },
    {
      code: `
        declare const x: { hello: { world: string } };

        const {
          hello: { world = '' },
        } = x;
      `,
      errors: [
        {
          column: 28,
          data: { type: 'property' },
          endColumn: 30,
          line: 5,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        declare const x: { hello: { world: string } };

        const {
          hello: { world },
        } = x;
      `,
    },
    {
      code: `
        declare const x: { hello: Array<{ world: string }> };

        const {
          hello: [{ world = '' }],
        } = x;
      `,
      errors: [
        {
          column: 29,
          data: { type: 'property' },
          endColumn: 31,
          line: 5,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        declare const x: { hello: Array<{ world: string }> };

        const {
          hello: [{ world }],
        } = x;
      `,
    },
    {
      code: `
        interface B {
          foo: (b: boolean | string) => void;
        }

        const h: B = {
          foo: (b = false) => {},
        };
      `,
      errors: [
        {
          column: 21,
          data: { type: 'parameter' },
          endColumn: 26,
          line: 7,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        interface B {
          foo: (b: boolean | string) => void;
        }

        const h: B = {
          foo: (b) => {},
        };
      `,
    },
    {
      code: `
        function foo(a = undefined) {}
      `,
      errors: [
        {
          column: 26,
          data: { type: 'parameter' },
          endColumn: 35,
          line: 2,
          messageId: 'uselessUndefined',
        },
      ],
      output: `
        function foo(a) {}
      `,
    },
    {
      code: `
        const { a = undefined } = {};
      `,
      errors: [
        {
          column: 21,
          data: { type: 'property' },
          endColumn: 30,
          line: 2,
          messageId: 'uselessUndefined',
        },
      ],
      output: `
        const { a } = {};
      `,
    },
    {
      code: `
        const [a = undefined] = [];
      `,
      errors: [
        {
          column: 20,
          data: { type: 'property' },
          endColumn: 29,
          line: 2,
          messageId: 'uselessUndefined',
        },
      ],
      output: `
        const [a] = [];
      `,
    },
    {
      code: `
        function foo({ a = undefined }) {}
      `,
      errors: [
        {
          column: 28,
          data: { type: 'property' },
          endColumn: 37,
          line: 2,
          messageId: 'uselessUndefined',
        },
      ],
      output: `
        function foo({ a }) {}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11847
    {
      code: `
        function myFunction(p1: string, p2: number | undefined = undefined) {
          console.log(p1, p2);
        }
      `,
      errors: [
        {
          column: 66,
          endColumn: 75,
          line: 2,
          messageId: 'preferOptionalSyntax',
        },
      ],
      output: `
        function myFunction(p1: string, p2?: number | undefined) {
          console.log(p1, p2);
        }
      `,
    },
    {
      code: `
        type SomeType = number | undefined;
        function f(
          /* comment */ x /* comment 2 */ : /* comment 3 */ SomeType /* comment 4 */ = /* comment 5 */ undefined,
        ) {}
      `,
      errors: [
        {
          column: 104,
          endColumn: 113,
          line: 4,
          messageId: 'preferOptionalSyntax',
        },
      ],
      output: `
        type SomeType = number | undefined;
        function f(
          /* comment */ x? /* comment 2 */ : /* comment 3 */ SomeType,
        ) {}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11980
    {
      code: `
        const { a = 'baz' } = Math.random() < 0.5 ? { a: 'foo' } : { a: 'bar' };
      `,
      errors: [
        {
          column: 21,
          endColumn: 26,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { a } = Math.random() < 0.5 ? { a: 'foo' } : { a: 'bar' };
      `,
    },
    {
      code: `
        const { a = 'baz' } =
          Math.random() < 0.5
            ? { a: 'foo' }
            : Math.random() > 0.2
              ? { a: 'bar' }
              : { a: 'qux' };
      `,
      errors: [
        {
          column: 21,
          endColumn: 26,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { a } =
          Math.random() < 0.5
            ? { a: 'foo' }
            : Math.random() > 0.2
              ? { a: 'bar' }
              : { a: 'qux' };
      `,
    },
    {
      code: `
        const { a = 'baz' } = cond ? { ['a']: 'foo' } : { ['a']: 'bar' };
      `,
      errors: [
        {
          column: 21,
          endColumn: 26,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { a } = cond ? { ['a']: 'foo' } : { ['a']: 'bar' };
      `,
    },
    {
      code: `
        const { a = 'baz' } = cond ? { a() {} } : { a: 'bar' };
      `,
      errors: [
        {
          column: 21,
          endColumn: 26,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { a } = cond ? { a() {} } : { a: 'bar' };
      `,
    },
    {
      code: `
        const { a2 = 'b' } = Math.random() < 0.5 ? { [\`a2\`]: 'a' } : { a2: 'b' };
      `,
      errors: [
        {
          column: 22,
          endColumn: 25,
          line: 2,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        const { a2 } = Math.random() < 0.5 ? { [\`a2\`]: 'a' } : { a2: 'b' };
      `,
    },
  ],
});
