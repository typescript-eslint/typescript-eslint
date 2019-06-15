import rule from '../../src/rules/typedef';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
      code: `const [a]: [number] = [1]`,
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: `const [a, b]: [number, number] = [1, 2]`,
      options: [
        {
          arrayDestructuring: true,
        },
      ],
    },
    {
      code: `const [a] = 1;`,
      options: [
        {
          arrayDestructuring: false,
        },
      ],
    },
    `let a: number;
    [a] = [1];`,
    // Arrow call signatures
    `((): void => {})()`,
    `((): number => 7)()`,
    {
      code: `const returns = () => { }`,
      options: [
        {
          arrowCallSignature: false,
          variableDeclaration: false,
        },
      ],
    },
    // Arrow parameters
    `((a: number): void => {})()`,
    `((a: string, b: string): void => {})()`,
    {
      code: `((a: number): void => { })()`,
      options: [
        {
          arrowCallSignature: false,
          arrowParameter: false,
        },
      ],
    },
    {
      code: `((a: string, b: string): void => { })()`,
      options: [
        {
          arrowCallSignature: false,
          arrowParameter: false,
        },
      ],
    },
    // Call signatures
    `function returns(): void { }`,
    {
      code: `function returns() { }`,
      options: [
        {
          callSignature: false,
        },
      ],
    },
    {
      code: `const returns = function () { }`,
      options: [
        {
          callSignature: false,
          variableDeclaration: false,
        },
      ],
    },
    `const container: any = {
      method(): number {
        return 7;
      }
    };`,
    `const container: any = {
      get propDef(): number {
        return 7;
      }
    };`,
    `const container: any = {
      set propDef(input: number) { }
    };`,
    `const container: any = {
      ["computed"](): boolean {
        return true;
      },
    };`,
    // Member variable declarations
    `class Test {
      state: number;
    }`,
    `class Test {
      state: number = 1;
    }`,
    {
      code: `class Test {
        state = 1;
      }`,
      options: [
        {
          memberVariableDeclaration: false,
        },
      ],
    },
    // Object destructuring
    {
      code: `const { a }: { a: number } = { a: 1 }`,
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: `const { a, b }: { [i: string]: number } = { a: 1, b: 2 }`,
      options: [
        {
          objectDestructuring: true,
        },
      ],
    },
    {
      code: `const { a } = { a: 1 };`,
      options: [
        {
          objectDestructuring: false,
        },
      ],
    },
    // Parameters
    `function receivesNumber(a: number): void { }`,
    `function receivesStrings(a: string, b: string): void { }`,
    `function receivesNumber([a]: [number]): void { }`,
    `function receivesNumbers([a, b]: number[]): void { }`,
    `function receivesString({ a }: { a: string }): void { }`,
    `function receivesStrings({ a, b }: { [i: string ]: string }): void { }`,
    // Property declarations
    `type Test = {
       member: number;
     };`,
    `type Test = {
       [i: string]: number;
     };`,
    `interface Test {
      member: string;
     };`,
    `interface Test {
      [i: number]: string;
     };`,
    {
      code: `type Test = {
        member;
      };`,
      options: [
        {
          propertyDeclaration: false,
        },
      ],
    },
    {
      code: `type Test = {
        [i: string];
      };`,
      options: [
        {
          propertyDeclaration: false,
        },
      ],
    },
    // Variable declarations
    {
      code: `const x: string = "";`,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `let x: string = "";`,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `let x: string;`,
      options: [
        {
          variableDeclaration: true,
        },
      ],
    },
    {
      code: `const a = 1;`,
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
    {
      code: `let a;`,
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
    {
      code: `let a = 1;`,
      options: [
        {
          variableDeclaration: false,
        },
      ],
    },
  ],
  invalid: [
    // Array destructuring
    {
      code: `const [a] = [1]`,
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
      code: `const [a, b] = [1, 2]`,
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
      code: `const { a } = { a: 1 }`,
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
      code: `const { a, b } = { a: 1, b: 2 }`,
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
    // Arrow call signatures
    {
      code: `const returnsVar = () => { }`,
      errors: [
        {
          column: 20,
          messageId: 'expectedTypedef',
        },
      ],
    },
    // Arrow parameters
    {
      code: `const receivesNumber = (a): void => { }`,
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
      options: [
        {
          arrowCallSignature: false,
        },
      ],
    },
    {
      code: `const receivesStrings = (a, b): void => { }`,
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
          arrowCallSignature: false,
        },
      ],
    },
    // Call signatures
    {
      code: `function returns() { }`,
      errors: [
        {
          data: { name: 'returns' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `const returnsVar = function () { }`,
      errors: [
        {
          column: 20,
          messageId: 'expectedTypedef',
        },
      ],
    },
    {
      code: `const returnsVar = function returnsExpression () { }`,
      errors: [
        {
          data: { name: 'returnsExpression' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `const container: any = {
        method() {
          return 7;
        }
      };`,
      errors: [
        {
          data: { name: 'method' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `const container: any = {
        get propDef() {
          return 7;
        }
      };`,
      errors: [
        {
          data: { name: 'propDef' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `const container: any = {
        ["computed"]() {
          return true;
        },
      };`,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
    },
    // Member variable declarations
    {
      code: `class Test {
        state = 1;
      }`,
      errors: [
        {
          data: { name: 'state' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `class Test {
        ["state"] = 1;
      }`,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
    },
    // Parameters
    {
      code: `function receivesNumber(a): void { }`,
      errors: [
        {
          data: { name: 'a' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `function receivesStrings(a, b): void { }`,
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
    },
    {
      code: `function receivesNumber([a]): void { }`,
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedef',
        },
      ],
    },
    {
      code: `function receivesNumbers([a, b]): void { }`,
      errors: [
        {
          column: 26,
          messageId: 'expectedTypedef',
        },
      ],
    },
    {
      code: `function receivesString({ a }): void { }`,
      errors: [
        {
          column: 25,
          messageId: 'expectedTypedef',
        },
      ],
    },
    {
      code: `function receivesStrings({ a, b }): void { }`,
      errors: [
        {
          column: 26,
          messageId: 'expectedTypedef',
        },
      ],
    },
    // Property declarations
    {
      code: `type Test = {
        member;
      };`,
      errors: [
        {
          data: { name: 'member' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `type Test = {
        [i: string];
      };`,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
    },
    {
      code: `interface Test {
        member;
      };`,
      errors: [
        {
          data: { name: 'member' },
          messageId: 'expectedTypedefNamed',
        },
      ],
    },
    {
      code: `interface Test {
        [i: string];
      };`,
      errors: [
        {
          messageId: 'expectedTypedef',
        },
      ],
    },
    // Variable declarations
    {
      code: `const a = 1;`,
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
      code: `const a = 1, b: number = 2, c = 3;`,
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
      code: `let a;`,
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
      code: `let a = 1;`,
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
      code: `let a = 1, b: number, c = 2;`,
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
  ],
});
