import rule from '../../src/rules/restrict-template-expressions';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('restrict-template-expressions', rule, {
  valid: [
    // Base case
    `
      const msg = \`arg = \${'foo'}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg || 'default'}\`;
    `,
    `
      function test<T extends string>(arg: T) {
        return \`arg = \${arg}\`;
      }
    `,
    // Base case - intersection type
    `
      function test<T extends string & { _kind: 'MyBrandedString' }>(arg: T) {
        return \`arg = \${arg}\`;
      }
    `,
    // Base case - don't check tagged templates
    `
      tag\`arg = \${null}\`;
    `,
    `
      const arg = {};
      tag\`arg = \${arg}\`;
    `,
    // allowNumber
    {
      code: `
        const arg = 123;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        const arg = 123;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        const arg = 123n;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        function test<T extends number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        function test<T extends number & { _kind: 'MyBrandedNumber' }>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        function test<T extends bigint>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNumber: true }],
    },
    {
      code: `
        function test<T extends string | number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNumber: true }],
    },
    // allowBoolean
    {
      code: `
        const arg = true;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowBoolean: true }],
    },
    {
      code: `
        const arg = true;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
      options: [{ allowBoolean: true }],
    },
    {
      code: `
        function test<T extends boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowBoolean: true }],
    },
    {
      code: `
        function test<T extends string | boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowBoolean: true }],
    },
    // allowArray
    {
      code: `
        const arg = [];
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        const arg = [];
        const msg = \`arg = \${arg || 'default'}\`;
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        function test<T extends string[]>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        declare const arg: [number, string];
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        const arg = [1, 'a'] as const;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        function test<T extends [string, string]>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowArray: true }],
    },
    {
      code: `
        declare const arg: [number | undefined, string];
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowArray: true, allowNullish: true }],
    },
    // allowAny
    {
      code: `
        const arg: any = 123;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        const arg: any = undefined;
        const msg = \`arg = \${arg || 'some-default'}\`;
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        const user = JSON.parse('{ "name": "foo" }');
        const msg = \`arg = \${user.name}\`;
      `,
      options: [{ allowAny: true }],
    },
    {
      code: `
        const user = JSON.parse('{ "name": "foo" }');
        const msg = \`arg = \${user.name || 'the user with no name'}\`;
      `,
      options: [{ allowAny: true }],
    },
    // allowNullish
    {
      code: `
        const arg = null;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowNullish: true }],
    },
    {
      code: `
        declare const arg: string | null | undefined;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowNullish: true }],
    },
    {
      code: `
        function test<T extends null | undefined>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNullish: true }],
    },
    {
      code: `
        function test<T extends string | null>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowNullish: true }],
    },
    // allowRegExp
    {
      code: `
        const arg = new RegExp('foo');
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowRegExp: true }],
    },
    {
      code: `
        const arg = /foo/;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowRegExp: true }],
    },
    {
      code: `
        declare const arg: string | RegExp;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowRegExp: true }],
    },
    {
      code: `
        function test<T extends RegExp>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowRegExp: true }],
    },
    {
      code: `
        function test<T extends string | RegExp>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [{ allowRegExp: true }],
    },
    // allowNever
    {
      code: `
        declare const value: never;
        const stringy = \`\${value}\`;
      `,
      options: [{ allowNever: true }],
    },
    {
      code: `
        const arg = 'hello';
        const msg = typeof arg === 'string' ? arg : \`arg = \${arg}\`;
      `,
      options: [{ allowNever: true }],
    },
    {
      code: `
        function test(arg: 'one' | 'two') {
          switch (arg) {
            case 'one':
              return 1;
            case 'two':
              return 2;
            default:
              throw new Error(\`Unrecognised arg: \${arg}\`);
          }
        }
      `,
      options: [{ allowNever: true }],
    },
    {
      code: `
        // more variants may be added to Foo in the future
        type Foo = { type: 'a'; value: number };

        function checkFoosAreMatching(foo1: Foo, foo2: Foo) {
          if (foo1.type !== foo2.type) {
            // since Foo currently only has one variant, this code is never run, and \`foo1.type\` has type \`never\`.
            throw new Error(\`expected \${foo1.type}, found \${foo2.type}\`);
          }
        }
      `,
      options: [{ allowNever: true }],
    },
    // allow ALL
    {
      code: `
        type All = string | number | boolean | null | undefined | RegExp | never;
        function test<T extends All>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      options: [
        {
          allowBoolean: true,
          allowNever: true,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
        },
      ],
    },
    // allow
    {
      code: 'const msg = `arg = ${Promise.resolve()}`;',
      options: [{ allow: [{ from: 'lib', name: 'Promise' }] }],
    },
    'const msg = `arg = ${new Error()}`;',
    'const msg = `arg = ${false}`;',
    'const msg = `arg = ${null}`;',
    'const msg = `arg = ${undefined}`;',
    'const msg = `arg = ${123}`;',
    "const msg = `arg = ${'abc'}`;",
    // https://github.com/typescript-eslint/typescript-eslint/issues/11759
    // allow should check base types
    {
      code: `
        class Base {}
        class Derived extends Base {}
        const foo = new Base();
        const bar = new Derived();
        \`\${foo}\${bar}\`;
      `,
      options: [{ allow: [{ from: 'file', name: 'Base' }] }],
    },
    // allow should check base types - multi-level inheritance
    {
      code: `
        class Base {}
        class Derived extends Base {}
        class DerivedTwice extends Derived {}
        const value = new DerivedTwice();
        \`\${value}\`;
      `,
      options: [{ allow: [{ from: 'file', name: 'Base' }] }],
    },
    // allow should check base types - interface inheritance
    {
      code: `
        interface Base {
          value: string;
        }
        interface Derived extends Base {
          extra: number;
        }
        declare const obj: Derived;
        \`\${obj}\`;
      `,
      options: [{ allow: [{ from: 'file', name: 'Base' }] }],
    },
    // allow list with type alias without base types
    {
      code: `
        type Custom = { value: string };
        declare const obj: Custom;
        \`\${obj}\`;
      `,
      options: [{ allow: [{ from: 'file', name: 'Custom' }] }],
    },
  ],

  invalid: [
    {
      code: `
        const msg = \`arg = \${123}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: '123' },
          line: 2,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
        const msg = \`arg = \${false}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'false' },
          line: 2,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowBoolean: false }],
    },
    {
      code: `
        const msg = \`arg = \${null}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'null' },
          line: 2,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowNullish: false }],
    },
    {
      code: `
        declare const arg: number[];
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'number[]' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
    },
    {
      code: `
        const msg = \`arg = \${[, 2]}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: '(number | undefined)[]' },
          line: 2,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowArray: true, allowNullish: false }],
    },
    {
      code: 'const msg = `arg = ${Promise.resolve()}`;',
      errors: [{ messageId: 'invalidType' }],
    },
    {
      code: 'const msg = `arg = ${new Error()}`;',
      errors: [{ messageId: 'invalidType' }],
      options: [{ allow: [] }],
    },
    {
      code: `
        declare const arg: [number | undefined, string];
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: '[number | undefined, string]' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowArray: true, allowNullish: false }],
    },
    {
      code: `
        declare const arg: number;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'number' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowNumber: false }],
    },
    {
      code: `
        declare const arg: boolean;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'boolean' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowBoolean: false }],
    },
    {
      code: `
        const arg = {};
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        { column: 30, data: { type: '{}' }, line: 3, messageId: 'invalidType' },
      ],
      options: [{ allowBoolean: true, allowNullish: true, allowNumber: true }],
    },
    {
      code: `
        declare const arg: { a: string } & { b: string };
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: '{ a: string; } & { b: string; }' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
    },
    {
      code: `
        function test<T extends {}>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        { column: 27, data: { type: '{}' }, line: 3, messageId: 'invalidType' },
      ],
      options: [{ allowBoolean: true, allowNullish: true, allowNumber: true }],
    },
    {
      code: `
        function test<TWithNoConstraint>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          column: 27,
          data: { type: 'T' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
    },
    {
      code: `
        function test(arg: any) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          column: 27,
          data: { type: 'any' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [
        {
          allowAny: false,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
    },
    {
      code: `
        const arg = new RegExp('foo');
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'RegExp' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowRegExp: false }],
    },
    {
      code: `
        const arg = /foo/;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          column: 30,
          data: { type: 'RegExp' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowRegExp: false }],
    },
    {
      code: `
        declare const value: never;
        const stringy = \`\${value}\`;
      `,
      errors: [
        {
          column: 28,
          data: { type: 'never' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowNever: false }],
    },
    // TS 3.9 change
    {
      code: `
        function test<T extends any>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          column: 27,
          data: { type: 'unknown' },
          line: 3,
          messageId: 'invalidType',
        },
      ],
      options: [{ allowAny: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11759
    // derived type should error when base type is not in allow list
    {
      code: `
        class Base {}
        class Derived extends Base {}
        const bar = new Derived();
        \`\${bar}\`;
      `,
      errors: [
        {
          data: { type: 'Derived' },
          messageId: 'invalidType',
        },
      ],
      options: [{ allow: [] }],
    },
    // derived interface should error when base type is not in allow list
    {
      code: `
        interface Base {
          value: string;
        }
        interface Derived extends Base {
          extra: number;
        }
        declare const obj: Derived;
        \`\${obj}\`;
      `,
      errors: [
        {
          data: { type: 'Derived' },
          messageId: 'invalidType',
        },
      ],
      options: [{ allow: [] }],
    },
  ],
});
