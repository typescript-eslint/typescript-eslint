import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { TestContext } from 'vitest';

import { parseForESLint } from '@typescript-eslint/parser';
import path from 'node:path';

import { AnyType, discriminateAnyType } from '../src';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

type GetNode = (ast: TSESTree.Program) => TSESTree.Node;

describe(discriminateAnyType, () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getDeclarationId(ast: TSESTree.Program): TSESTree.Node {
    const declaration = ast.body.at(-1) as TSESTree.VariableDeclaration;
    const id = declaration.declarations[0].id;
    return id;
  }

  function getTypes(code: string, getNode: GetNode) {
    const { ast, services } = parseForESLint(code, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(rootDir, 'file.ts'),
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    });
    expectToHaveParserServices(services);
    const node = getNode(ast);
    const type = services.getTypeAtLocation(getNode(ast));
    return {
      checker: services.program.getTypeChecker(),
      program: services.program,
      tsNode: services.esTreeNodeToTSNodeMap.get(node),
      type,
    };
  }

  function runTest(
    [code, expected, getNode = getDeclarationId]: readonly [
      code: string,
      expected: AnyType,
      getNode?: GetNode,
    ],
    { expect }: TestContext,
  ): void {
    const { checker, program, tsNode, type } = getTypes(code, getNode);
    const result = discriminateAnyType(type, checker, program, tsNode);
    expect(result).toBe(expected);
  }

  describe('returns Safe', () => {
    it.for([
      ['const foo = "foo";', AnyType.Safe],
      ['const foo = 1;', AnyType.Safe],
      ['const foo = [1, 2];', AnyType.Safe],
    ] as const)('when code is %s, returns %s', runTest);

    it('should returns Safe for a recursive thenable.', testContext => {
      const code = `
class Foo {
  foo() {
    return this;
  }
  protected then(resolve: () => void): void {
    resolve();
  }
};
        `;
      runTest(
        [
          code,
          AnyType.Safe,
          ast => {
            const classDeclration = ast.body[0] as TSESTree.ClassDeclaration;
            const method = classDeclration.body
              .body[0] as TSESTree.MethodDefinition;
            const returnStatement = method.value.body?.body.at(
              -1,
            ) as TSESTree.ReturnStatement;
            return returnStatement.argument!;
          },
        ],
        testContext,
      );
    });
  });

  describe('returns Any', () => {
    it.for([
      ['const foo = 1 as any;', AnyType.Any],
      ['let foo;', AnyType.Any],
    ] as const)('when code is %s, returns %s', runTest);
  });

  describe('returns PromiseAny', () => {
    it.for([
      ['const foo = Promise.resolve({} as any);', AnyType.PromiseAny],
      [
        'const foo = Promise.resolve(Promise.resolve({} as any));',
        AnyType.PromiseAny,
      ],
    ] as const)('when code is %s, returns %s', runTest);
  });

  describe('returns AnyArray', () => {
    it.for([
      ['const foo = [{} as any];', AnyType.AnyArray],
      ['const foo = [{} as any, 2];', AnyType.AnyArray],
    ] as const)('when code is %s, returns %s', runTest);
  });
});
