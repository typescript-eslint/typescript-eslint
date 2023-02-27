import type { RuleModule } from '@typescript-eslint/utils/dist/ts-eslint';

import rule from '../../src/rules/prefer-at';
import type { InvalidTestCase, ValidTestCase } from '../RuleTester';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

type TMessageIds = typeof rule extends RuleModule<infer T, unknown[]>
  ? T
  : never;
type TOptions = typeof rule extends RuleModule<string, infer T> ? T : never;

interface Declaration {
  name: string;
  type: string;
}

const declarations: Array<Declaration> = [
  {
    name: 'str',
    type: 'string',
  },
  {
    name: 'str',
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    type: 'String',
  },
  {
    name: 'arr',
    type: 'Array<string>',
  },
  {
    name: 'arr',
    type: 'Int8Array',
  },
  {
    name: 'arr',
    type: 'Uint8Array',
  },
  {
    name: 'arr',
    type: 'Uint8ClampedArray',
  },
  {
    name: 'arr',
    type: 'Int16Array',
  },
  {
    name: 'arr',
    type: 'Uint16Array',
  },
  {
    name: 'arr',
    type: 'Int32Array',
  },
  {
    name: 'arr',
    type: 'Float32Array',
  },
  {
    name: 'arr',
    type: 'Uint32Array',
  },
  {
    name: 'arr',
    type: 'Float64Array',
  },
  {
    name: 'arr',
    type: 'BigInt64Array',
  },
  {
    name: 'arr',
    type: 'BigUint64Array',
  },
];

const additionalDeclarations: Array<Declaration | number> = [
  1,
  2,
  123,
  {
    name: 'i',
    type: 'number',
  },
];

function generateDeclaration(declaration: Declaration): string {
  return `declare const ${declaration.name}: ${declaration.type};`;
}

class VariableDeclarationGenerator {
  public constructor(private name: string, private right: string) {}

  public get valid(): string {
    return `const lastItem = ${this.name}.at(-${this.right});`;
  }

  public get invalid(): string {
    return `const lastItem = ${this.name}[${this.name}.length - ${this.right}];`;
  }
}

abstract class TestCasesGenerator<T extends ValidTestCase<TOptions>> {
  protected abstract generateTestCasesForCode(
    baseCode: string,
    accessor: string,
  ): Generator<T>;

  protected *generateTestCasesForDeclaration(
    declaration: Declaration,
  ): Generator<T> {
    // plain variable
    yield* this.generateTestCasesForCode(
      generateDeclaration(declaration),
      declaration.name,
    );
    // object with array variable
    yield* this.generateTestCasesForCode(
      generateDeclaration({
        name: 'obj',
        type: `Record<string, ${declaration.type}>`,
      }),
      `obj.${declaration.name}`,
    );
    // array with array variable
    yield* this.generateTestCasesForCode(
      generateDeclaration({
        name: 'matrix',
        type: `Array<${declaration.type}>`,
      }),
      `matrix[0]`,
    );
  }

  protected *generateCode(
    baseCode: string,
  ): Generator<[right: string, code: Array<string>]> {
    for (const additionalDeclaration of additionalDeclarations) {
      const code = [baseCode];
      let right: string;
      if (typeof additionalDeclaration === 'number') {
        right = String(additionalDeclaration);
      } else {
        code.push(generateDeclaration(additionalDeclaration));
        right = additionalDeclaration.name;
      }
      yield [right, code];
    }
  }

  public *[Symbol.iterator](): Generator<T> {
    for (const declaration of declarations) {
      yield* this.generateTestCasesForDeclaration(declaration);
    }
  }
}

class ValidTestCasesGenerator extends TestCasesGenerator<
  ValidTestCase<TOptions>
> {
  protected *generateTestCasesForCode(
    baseCode: string,
    accessor: string,
  ): Generator<ValidTestCase<TOptions>> {
    for (const [right, code] of this.generateCode(baseCode)) {
      const variableDeclarationGenerator = new VariableDeclarationGenerator(
        accessor,
        right,
      );
      const validCode = [...code, variableDeclarationGenerator.valid];
      yield {
        code: validCode.join('\n'),
      };
    }
  }
}

class InvalidTestCasesGenerator extends TestCasesGenerator<
  InvalidTestCase<TMessageIds, TOptions>
> {
  protected *generateTestCasesForCode(
    baseCode: string,
    accessor: string,
  ): Generator<InvalidTestCase<TMessageIds, TOptions>> {
    for (const [right, code] of this.generateCode(baseCode)) {
      const variableDeclarationGenerator = new VariableDeclarationGenerator(
        accessor,
        right,
      );
      const invalidCode = [...code, variableDeclarationGenerator.invalid];
      const validCode = [...code, variableDeclarationGenerator.valid];
      yield {
        code: invalidCode.join('\n'),
        errors: [
          {
            messageId: 'preferAt',
            data: {
              name: accessor,
            },
            line: invalidCode.length,
            endLine: invalidCode.length,
            column: 18,
            endColumn: variableDeclarationGenerator.invalid.length,
          },
        ],
        output: validCode.join('\n'),
      };
    }
  }
}

ruleTester.run('prefer-at', rule, {
  valid: [
    ...new ValidTestCasesGenerator(),
    // `
    //   declare const arr: Array<string>;
    //   const a = arr[arr.length + 1];
    // `,
    // `
    //   declare const arr: Array<string>;
    //   declare const i: number;
    //   const a = arr[arr.length - i];
    // `,
    // `
    //   declare const obj: Record<string, Array<string>>;
    //   declare const i: number;
    //   const a = obj.arr[obj.arr.length - i];
    // `,
    // 'const a = this.arr.at(-1);',
    // 'const a = this.#arr.at(-1);',
    // 'const a = this.#prop.arr.at(-1);',
    // 'const a = arr[arr.length + 1];',
    // `
    //   class MyArray {
    //     public length: number;
    //   }
    //
    //   const arr = new MyArray();
    //   const a = arr[arr.length - 1];
    // `,
    // {
    //   code: `
    //     class MyArray extends Array {
    //       public length: number;
    //     }
    //
    //     const arr = new MyArray();
    //     const a = arr[arr.length - 1];
    //   `,
    //   only: true,
    // },
    // 'const a = (arr ? b : c)[arr.length - 1];',
  ],
  invalid: [
    ...new InvalidTestCasesGenerator(),
    // ...generateInvalidTestCasesForDeclaration({
    //   name: 'arr',
    //   type: 'Array<string>',
    // }),
    // {
    //   code: `
    //     declare const str: string;
    //     declare const i: number;
    //     const a = str[str.length - i];
    //   `,
    //   errors: [
    //     {
    //       messageId: 'preferAt',
    //       data: {
    //         name: 'str',
    //       },
    //       line: 4,
    //       column: 19,
    //       endLine: 4,
    //       endColumn: 38,
    //     },
    //   ],
    //   output: `
    //     declare const str: string;
    //     declare const i: number;
    //     const a = str.at(-i);
    //   `,
    // },
    // {
    //   code: 'const a = arr[arr.length - 1];',
    //   errors: [
    //     {
    //       messageId: 'preferAt',
    //       data: {
    //         name: 'arr',
    //       },
    //     },
    //   ],
    //   output: 'const a = arr.at(-1);',
    // },
    // {
    //   code: 'const a = this.arr[this.arr.length - 1];',
    //   errors: [
    //     {
    //       messageId: 'preferAt',
    //       data: {
    //         name: 'this.arr',
    //       },
    //     },
    //   ],
    //   output: 'const a = this.arr.at(-1);',
    // },
    // {
    //   code: 'const a = this.#arr[this.#arr.length - 1];',
    //   errors: [
    //     {
    //       messageId: 'preferAt',
    //       data: {
    //         name: 'this.#arr',
    //       },
    //     },
    //   ],
    //   output: 'const a = this.#arr.at(-1);',
    // },
    // {
    //   code: 'const a = this.#prop.arr[this.#prop.arr.length - 1];',
    //   errors: [
    //     {
    //       messageId: 'preferAt',
    //       data: {
    //         name: 'this.#prop.arr',
    //       },
    //     },
    //   ],
    //   output: 'const a = this.#prop.arr.at(-1);',
    // },
  ],
});
