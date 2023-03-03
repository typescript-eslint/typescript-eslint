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

const additionalDeclarations: Array<
  (Declaration & { type: 'number' }) | number
> = [
  1,
  123,
  {
    name: 'i',
    type: 'number',
  },
];

interface InvalidCodeWithMetadata {
  code: string;

  line: number;

  pos: {
    start: number;
    end: number;
  };
}

interface CodeGenerator {
  valid: string;

  invalid: InvalidCodeWithMetadata;

  name: string;
}

class VariableDeclaration implements CodeGenerator {
  public constructor(public name: string, private right: string) {}

  public get valid(): string {
    return `const lastItem = ${this.name}.at(-${this.right});`;
  }

  public get invalid(): InvalidCodeWithMetadata {
    const code = `const lastItem = ${this.name}[${this.name}.length - ${this.right}];`;
    return {
      code,
      line: 1,
      pos: {
        start: 18,
        end: code.length,
      },
    };
  }
}

abstract class TestCasesGenerator<T extends ValidTestCase<TOptions>> {
  public *[Symbol.iterator](): Generator<T> {
    for (const declaration of declarations) {
      yield* this.generateTestCasesForDeclaration(declaration);
    }
  }

  protected abstract generateTestCases(
    declaration: Declaration,
    accessor: string,
  ): Generator<T>;

  protected *generateCode(
    declaration: Declaration,
    name: string,
  ): Generator<CodeGenerator> {
    for (const additionalDeclaration of additionalDeclarations) {
      let right: string;
      if (typeof additionalDeclaration === 'number') {
        right = String(additionalDeclaration);
      } else {
        right = additionalDeclaration.name;
      }
      {
        const variableDeclaration = new VariableDeclaration(name, right);
        const additionalCode =
          typeof additionalDeclaration === 'number'
            ? ''
            : `\ndeclare const ${additionalDeclaration.name}: number;`;
        const baseCode = `declare const ${declaration.name}: ${declaration.type};${additionalCode}`;
        const invalidDeclaration = variableDeclaration.invalid;
        yield {
          valid: `${baseCode}\n${variableDeclaration.valid}`,
          invalid: {
            code: `${baseCode}\n${invalidDeclaration.code}`,
            line: invalidDeclaration.line + baseCode.split('\n').length,
            pos: invalidDeclaration.pos,
          },
          name: variableDeclaration.name,
        };
      }
      {
        const variableDeclaration = new VariableDeclaration(
          `this.${name}`,
          right,
        );
        const additionalCode =
          typeof additionalDeclaration === 'number'
            ? ''
            : `\n\t\tconst ${additionalDeclaration.name}: number = 0;`;
        const generateCode = (code: string): string =>
          `class A {\n\t${declaration.name}!: ${declaration.type};\n\tmethod() {${additionalCode}\n\t\t${code}\n\t}\n}`;
        const invalidDeclaration = variableDeclaration.invalid;
        const invalidCode = generateCode(invalidDeclaration.code);
        yield {
          valid: generateCode(variableDeclaration.valid),
          invalid: {
            code: invalidCode,
            line: generateCode('').split('\n').length - 2,
            pos: {
              start: invalidDeclaration.pos.start + 2,
              end: invalidDeclaration.pos.end + 2,
            },
          },
          name: variableDeclaration.name,
        };
      }
      {
        const variableDeclaration = new VariableDeclaration(
          `this.#${name}`,
          right,
        );
        const additionalCode =
          typeof additionalDeclaration === 'number'
            ? ''
            : `\n\t\tconst ${additionalDeclaration.name}: number = 0;`;
        const generateCode = (code: string): string =>
          `class A {\n\t#${declaration.name}!: ${declaration.type};\n\tmethod() {${additionalCode}\n\t\t${code}\n\t}\n}`;
        const invalidDeclaration = variableDeclaration.invalid;
        const invalidCode = generateCode(invalidDeclaration.code);
        yield {
          valid: generateCode(variableDeclaration.valid),
          invalid: {
            code: invalidCode,
            line: generateCode('').split('\n').length - 2,
            pos: {
              start: invalidDeclaration.pos.start + 2,
              end: invalidDeclaration.pos.end + 2,
            },
          },
          name: variableDeclaration.name,
        };
      }
    }
  }

  protected *generateTestCasesForDeclaration(
    declaration: Declaration,
  ): Generator<T> {
    // plain variable
    yield* this.generateTestCases(declaration, declaration.name);
    // object variable
    yield* this.generateTestCases(
      {
        name: 'obj',
        type: `Record<string, ${declaration.type}>`,
      },
      `obj.${declaration.name}`,
    );
    // array variable
    yield* this.generateTestCases(
      {
        name: 'matrix',
        type: `Array<${declaration.type}>`,
      },
      `matrix[0]`,
    );
  }
}

class ValidTestCasesGenerator extends TestCasesGenerator<
  ValidTestCase<TOptions>
> {
  public override *generateTestCasesForDeclaration(
    declaration: Declaration,
  ): Generator<ValidTestCase<TOptions>> {
    yield* super.generateTestCasesForDeclaration(declaration);

    // plain variable from function
    yield* this.generateTestCasesWithIgnoreFunctions(
      {
        name: `getValue`,
        type: `() => ${declaration.type}`,
      },
      'getValue()',
    );

    // object from function
    yield* this.generateTestCasesWithIgnoreFunctions(
      {
        name: `getValues`,
        type: `() => Record<string, ${declaration.type}>`,
      },
      'getValues().obj',
    );

    // object with function
    yield* this.generateTestCasesWithIgnoreFunctions(
      {
        name: `getters`,
        type: `Record<string, () => ${declaration.type}>`,
      },
      'getters.getValues()',
    );

    // array from function
    yield* this.generateTestCasesWithIgnoreFunctions(
      {
        name: `getValues`,
        type: `() => Array<${declaration.type}>`,
      },
      'getValues()[0]',
    );

    // array with function
    yield* this.generateTestCasesWithIgnoreFunctions(
      {
        name: `getters`,
        type: `Array<() => ${declaration.type}>`,
      },
      'getters[0]()',
    );
  }

  protected *generateTestCases(
    declaration: Declaration,
    accessor: string,
  ): Generator<ValidTestCase<TOptions>> {
    for (const generator of this.generateCode(declaration, accessor)) {
      yield {
        code: generator.valid,
      };
    }
  }

  protected *generateTestCasesWithIgnoreFunctions(
    declaration: Declaration,
    accessor: string,
  ): Generator<ValidTestCase<TOptions>> {
    for (const generator of this.generateCode(declaration, accessor)) {
      yield {
        code: generator.invalid.code,
        options: [
          {
            ignoreFunctions: true,
          },
        ],
      };
    }
  }
}

class InvalidTestCasesGenerator extends TestCasesGenerator<
  InvalidTestCase<TMessageIds, TOptions>
> {
  public override *generateTestCasesForDeclaration(
    declaration: Declaration,
  ): Generator<InvalidTestCase<TMessageIds, TOptions>> {
    yield* super.generateTestCasesForDeclaration(declaration);

    // plain variable from function
    yield* this.generateTestCases(
      {
        name: `getValue`,
        type: `() => ${declaration.type}`,
      },
      'getValue()',
    );

    // object from function
    yield* this.generateTestCases(
      {
        name: `getValues`,
        type: `() => Record<string, ${declaration.type}>`,
      },
      'getValues().obj',
    );

    // object with function
    yield* this.generateTestCases(
      {
        name: `getters`,
        type: `Record<string, () => ${declaration.type}>`,
      },
      'getters.getValues()',
    );

    // array from function
    yield* this.generateTestCases(
      {
        name: `getValues`,
        type: `() => Array<${declaration.type}>`,
      },
      'getValues()[0]',
    );

    // array with function
    yield* this.generateTestCases(
      {
        name: `getters`,
        type: `Array<() => ${declaration.type}>`,
      },
      'getters[0]()',
    );
  }

  protected *generateTestCases(
    declaration: Declaration,
    name: string,
  ): Generator<InvalidTestCase<TMessageIds, TOptions>> {
    for (const generator of this.generateCode(declaration, name)) {
      yield {
        code: generator.invalid.code,
        errors: [
          {
            messageId: 'preferAt',
            data: {
              name: generator.name,
            },
            line: generator.invalid.line,
            endLine: generator.invalid.line,
            column: generator.invalid.pos.start,
            endColumn: generator.invalid.pos.end,
          },
        ],
        output: generator.valid,
      };
    }
  }
}

ruleTester.run('prefer-at', rule, {
  valid: [...new ValidTestCasesGenerator()],
  invalid: [...new InvalidTestCasesGenerator()],
});
