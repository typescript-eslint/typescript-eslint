import rule from '../../src/rules/typedef';
import { RuleTester, getFixturesRootDir, noFormat } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('typedef', rule, {
  valid: [
    // Array destructuring
    {
      code: 'function foo(...[a]: string[]) {}',
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: 'const foo = (...[a]: string[]) => {};',
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: 'const [a]: [number] = [1];',
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: 'const [a, b]: [number, number] = [1, 2];',
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: 'const [a] = 1;',
      options: [
        {
          arrayDestructuring: false,
        },
      ],
    },
    {
      code: `
        for (const [key, val] of new Map([['key', 1]])) {
        }
      `,
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: `
        for (const [[key]] of [[['key']]]) {
        }
      `,
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: `
        for (const [[{ key }]] of [[[{ key: 'value' }]]]) {
        }
      `,
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    `
      let a: number;
      [a] = [1];
    `,
    // Arrow parameters
    '((a: number): void => {})();',
    '((a: string, b: string): void => {})();',
    {
      code: '((a: number): void => {})();',
      options: [
        {
          arrowParameter: false,
        },
      ],
    },
    {
      code: '((a: string, b: string): void => {})();',
      options: [
        {
          arrowParameter: false,
        },
      ],
    },
    // Member variable declarations
    `
      class Test {
        state: number;
      }
    `,
    `
      class Test {
        state: number = 1;
      }
    `,
    {
      code: `
        class Test {
          state = 1;
        }
      `,
      options: [
        {
          memberVariableDeclaration: false,
        },
      ],
    },
    // Object destructuring
    {
      code: 'const { a }: { a: number } = { a: 1 };',
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: 'const { a, b }: { [i: string]: number } = { a: 1, b: 2 };',
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: `
        for (const {
          p1: {
            p2: { p3 },
          },
        } of [{ p1: { p2: { p3: 'value' } } }]) {
        }
      `,
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: `
        for (const {
          p1: {
            p2: {
              p3: [key],
            },
          },
        } of [{ p1: { p2: { p3: ['value'] } } }]) {
        }
      `,
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: 'const { a } = { a: 1 };',
      options: [
        {
          objectDestructuring: false,
        },
      ],
    },
    {
      code: `
        for (const { key, val } of [{ key: 'key', val: 1 }]) {
        }
      `,
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    // Function parameters
    'function receivesNumber(a: number): void {}',
    'function receivesStrings(a: string, b: string): void {}',
    'function receivesNumber([a]: [number]): void {}',
    'function receivesNumbers([a, b]: number[]): void {}',
    'function receivesString({ a }: { a: string }): void {}',
    'function receivesStrings({ a, b }: { [i: string]: string }): void {}',
    'function receivesNumber(a: number = 123): void {}',
    // Constructor parameters
    `
      class Test {
        constructor() {}
      }
    `,
    `
      class Test {
        constructor(param: string) {}
      }
    `,
    `
      class Test {
        constructor(param: string = 'something') {}
      }
    `,
    `
      class Test {
        constructor(private param: string = 'something') {}
      }
    `,
    // Method parameters
    `
      class Test {
        public method(x: number): number {
          return x;
        }
      }
    `,
    `
      class Test {
        public method(x: number = 123): number {
          return x;
        }
      }
    `,
    // Property declarations
    `
      type Test = {
        member: number;
      };
    `,
    `
      type Test = {
        [i: string]: number;
      };
    `,
    `
      interface Test {
        member: string;
      }
    `,
    `
      interface Test {
        [i: number]: string;
      }
    `,
    {
      code: `
        type Test = {
          member;
        };
      `,
      options: [
        {
          propertyDeclaration: false,
        },
      ],
    },
    {
      code: noFormat`
        type Test = {
          [i: string];
        };
      `,
      options: [
        {
          propertyDeclaration: false,
        },
      ],
    },
    // Variable declarations
    {
      code: "const x: string = '';",
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: "let x: string = '';",
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: 'let x: string;',
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: 'const a = 1;',
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
    {
      code: 'let a;',
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
    {
      code: 'let a = 1;',
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
    {
      code: 'const [a, b] = [1, 2];',
      options: [
        {
          objectDestructuring: false,
          variableDeclaration: true,
        },
      ],
    },
    {
      code: "const { a, b } = { a: '', b: '' };",
      options: [
        {
          objectDestructuring: false,
          variableDeclaration: true,
        },
      ],
    },
    // Contexts where TypeScript doesn't allow annotations
    {
      code: `
        for (x of [1, 2, 3]) {
        }
      `,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `
        for (const x in {}) {
        }
      `,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `
        try {
        } catch (e) {}
      `,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    // variable declaration ignore function
    {
      code: 'const foo = function (): void {};',
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
    {
      code: 'const foo = (): void => {};',
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
    {
      code: 'const foo: () => void = (): void => {};',
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
    {
      code: 'const foo: () => void = function (): void {};',
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
    {
      code: `
class Foo {
  a = (): void => {};
  b = function (): void {};
}
      `,
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
  ],
  invalid: [
    // Array destructuring
    {
      code: 'const [a] = [1];',
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: 'const [a, b] = [1, 2];',
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    // Object destructuring
    {
      code: 'const { a } = { a: 1 };',
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: 'const { a, b } = { a: 1, b: 2 };',
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    // Arrow parameters
    {
      code: 'const receivesNumber = (a): void => {};',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          arrowParameter: true,
        },
      ],
    },
    {
      code: 'const receivesStrings = (a, b): void => {};',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
        {
          data: { name: 'b' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          arrowParameter: true,
        },
      ],
    },
    // Member variable declarations
    {
      code: `
        class Test {
          state = 1;
        }
      `,
      errors: [
        {
          data: { name: 'state' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          memberVariableDeclaration: true,
        },
      ],
    },
    {
      code: `
        class Test {
          ['state'] = 1;
        }
      `,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          memberVariableDeclaration: true,
        },
      ],
    },
    // Function parameters
    {
      code: 'function receivesNumber(a): void {}',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: 'function receivesStrings(a, b): void {}',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
        {
          data: { name: 'b' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: 'function receivesNumber([a]): void {}',
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: 'function receivesNumbers([a, b]): void {}',
      errors: [
        {
          column: 26,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: 'function receivesString({ a }): void {}',
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: 'function receivesStrings({ a, b }): void {}',
      errors: [
        {
          column: 26,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    // Constructor parameters
    {
      code: `
        class Test {
          constructor(param) {}
        }
      `,
      errors: [
        {
          column: 23,
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: `
        class Test {
          constructor(param = 'something') {}
        }
      `,
      errors: [
        {
          column: 23,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: `
        class Test {
          constructor(private param = 'something') {}
        }
      `,
      errors: [
        {
          column: 23,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    // Method parameters
    {
      code: `
        class Test {
          public method(x): number {
            return x;
          }
        }
      `,
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: `
        class Test {
          public method(x = 123): number {
            return x;
          }
        }
      `,
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    {
      code: `
        class Test {
          public constructor(public x) {}
        }
      `,
      errors: [
        {
          column: 30,
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          parameter: true,
        },
      ],
    },
    // Property declarations
    {
      code: `
        type Test = {
          member;
        };
      `,
      errors: [
        {
          data: { name: 'member' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          propertyDeclaration: true,
        },
      ],
    },
    {
      code: noFormat`
        type Test = {
          [i: string];
        };
      `,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          propertyDeclaration: true,
        },
      ],
    },
    {
      code: `
        interface Test {
          member;
        }
      `,
      errors: [
        {
          data: { name: 'member' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          propertyDeclaration: true,
        },
      ],
    },
    {
      code: noFormat`
        interface Test {
          [i: string];
        }
      `,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
      options: [
        {
          propertyDeclaration: true,
        },
      ],
    },
    // Variable declarations
    {
      code: 'const a = 1;',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `
        const a = 1,
          b: number = 2,
          c = 3;
      `,
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
        {
          data: { name: 'c' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: 'let a;',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: 'let a = 1;',
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `
        let a = 1,
          b: number,
          c = 2;
      `,
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
        {
          data: { name: 'c' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: "const foo = 'foo';",
      errors: [
        {
          messageId: 'expectedTypedefNamed',
          data: { name: 'foo' },
        },
      ],
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
    {
      code: 'const foo = function (): void {};',
      errors: [
        {
          messageId: 'expectedTypedefNamed',
          data: { name: 'foo' },
        },
      ],
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: false,
        },
      ],
    },
    {
      code: 'const foo = (): void => {};',
      errors: [
        {
          messageId: 'expectedTypedefNamed',
          data: { name: 'foo' },
        },
      ],
      options: [
        {
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: false,
        },
      ],
    },
    {
      code: `
class Foo {
  a = (): void => {};
  b = function (): void {};
}
      `,
      errors: [
        {
          messageId: 'expectedTypedefNamed',
          data: { name: 'a' },
        },
        {
          messageId: 'expectedTypedefNamed',
          data: { name: 'b' },
        },
      ],
      options: [
        {
          memberVariableDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: false,
        },
      ],
    },
  ],
});
