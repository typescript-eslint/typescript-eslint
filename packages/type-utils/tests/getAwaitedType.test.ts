import { parseForESLint } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/utils';
import path from 'path';
import type * as ts from 'typescript';

import { getAwaitedType } from '../src/getAwaitedType';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe('getAwaitedType', () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getTypes(
    code: string,
    declarationIndex = 0,
  ): {
    program: ts.Program;
    type: ts.Type;
    checker: ts.TypeChecker;
    node: ts.Node;
  } {
    const { ast, services } = parseForESLint(code, {
      project: './tsconfig.json',
      filePath: path.join(rootDir, 'file.ts'),
      tsconfigRootDir: rootDir,
    });
    expectToHaveParserServices(services);
    const checker = services.program.getTypeChecker();

    const declaration = ast.body[
      declarationIndex
    ] as TSESTree.VariableDeclaration;
    const declarator = declaration.declarations[0];
    return {
      program: services.program,
      type: services.getTypeAtLocation(declarator.id),
      node: services.esTreeNodeToTSNodeMap.get(declarator.id),
      checker,
    };
  }

  function expectTypesAre(
    result: ts.Type,
    checker: ts.TypeChecker,
    typeStr: string,
  ): void {
    expect(result).toBeTruthy();
    expect(checker.typeToString(result)).toBe(typeStr);
  }

  it('non-promise', () => {
    const { type, checker, node } = getTypes('const test: number = 1');
    expectTypesAre(getAwaitedType(checker, type, node), checker, 'number');
  });

  it('Promise<{{type}}> to {{type}}', () => {
    const { type, checker, node } = getTypes('const test = Promise.resolve(1)');
    expectTypesAre(getAwaitedType(checker, type, node), checker, 'number');
  });

  it('Promise<Promise<{{type}}>> to {{type}}', () => {
    const { type, checker, node } = getTypes(
      'const test: Promise<Promise<number>> = Promise.resolve(Promise.resolve(1))',
    );
    expectTypesAre(getAwaitedType(checker, type, node), checker, 'number');
  });
});
