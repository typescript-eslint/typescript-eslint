import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { isSymbolFromDefaultLibrary } from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe(isSymbolFromDefaultLibrary, () => {
  function getTypes(code: string): {
    program: ts.Program;
    symbol: ts.Symbol | undefined;
  } {
    const { ast, services } = parseCodeForEslint(code);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
    const type = services.getTypeAtLocation(declaration.id);
    return { program: services.program, symbol: type.getSymbol() };
  }

  describe('is symbol from default library', () => {
    it.for([
      ['type Test = Array<number>;'],
      ['type Test = Map<string,number>;'],
      ['type Test = Promise<void>'],
      ['type Test = Error'],
      ['type Test = Object'],
    ] as const)('when code is %s, returns true', ([code], { expect }) => {
      const { program, symbol } = getTypes(code);
      const result = isSymbolFromDefaultLibrary(program, symbol);
      expect(result).toBe(true);
    });
  });

  describe('is not symbol from default library', () => {
    it.for([
      ['const test: Array<number> = [1,2,3];'],
      ['type Test = number;'],
      ['interface Test { bar: string; };'],
    ] as const)('when code is %s, returns false', ([code], { expect }) => {
      const { program, symbol } = getTypes(code);
      const result = isSymbolFromDefaultLibrary(program, symbol);
      expect(result).toBe(false);
    });
  });
});
