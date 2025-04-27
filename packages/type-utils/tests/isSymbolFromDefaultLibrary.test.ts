import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';
import type { TestContext } from 'vitest';

import { parseForESLint } from '@typescript-eslint/parser';
import path from 'node:path';

import { isSymbolFromDefaultLibrary } from '../src';

describe(isSymbolFromDefaultLibrary, () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getTypes(code: string): {
    program: ts.Program;
    symbol: ts.Symbol | undefined;
  } {
    const { ast, services } = parseForESLint(code, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(rootDir, 'file.ts'),
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    });
    assert.toHaveParserServices(services);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
    const type = services.getTypeAtLocation(declaration.id);
    return { program: services.program, symbol: type.getSymbol() };
  }

  function runTestForAliasDeclaration(
    code: string,
    expected: boolean,
    expect: TestContext['expect'],
  ): void {
    const { program, symbol } = getTypes(code);
    const result = isSymbolFromDefaultLibrary(program, symbol);
    expect(result).toBe(expected);
  }

  describe('is symbol from default library', () => {
    function runTest(
      [code]: readonly [code: string],
      { expect }: TestContext,
    ): void {
      runTestForAliasDeclaration(code, true, expect);
    }

    it.for([
      ['type Test = Array<number>;'],
      ['type Test = Map<string,number>;'],
      ['type Test = Promise<void>'],
      ['type Test = Error'],
      ['type Test = Object'],
    ] as const)('when code is %s, returns true', runTest);
  });

  describe('is not symbol from default library', () => {
    function runTest(
      [code]: readonly [code: string],
      { expect }: TestContext,
    ): void {
      runTestForAliasDeclaration(code, false, expect);
    }

    it.for([
      ['const test: Array<number> = [1,2,3];'],
      ['type Test = number;'],
      ['interface Test { bar: string; };'],
    ] as const)('when code is %s, returns false', runTest);
  });
});
