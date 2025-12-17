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
    {
      code: `
const { hmm = 'default' } = Math.random() < 0.5 ? { hmm: 'foo' } : {};
      `,
    },
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
    {
      code: `
        declare const g: Record<string, string>;
        const { hello = '' } = g;
      `,
      errors: [
        {
          column: 25,
          data: { type: 'property' },
          endColumn: 27,
          line: 3,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        declare const g: Record<string, string>;
        const { hello } = g;
      `,
    },
    {
      code: `
        declare const h: { [key: string]: string };
        const { world = '' } = h;
      `,
      errors: [
        {
          column: 25,
          data: { type: 'property' },
          endColumn: 27,
          line: 3,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        declare const h: { [key: string]: string };
        const { world } = h;
      `,
    },
    {
      code: `
        declare const g: Array<string>;
        const [foo = ''] = g;
      `,
      errors: [
        {
          column: 22,
          data: { type: 'property' },
          endColumn: 24,
          line: 3,
          messageId: 'uselessDefaultAssignment',
        },
      ],
      output: `
        declare const g: Array<string>;
        const [foo] = g;
      `,
    },
  ],
});
