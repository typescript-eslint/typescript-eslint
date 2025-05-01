import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { AnyType, discriminateAnyType } from '../src';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

type GetNode = (ast: TSESTree.Program) => TSESTree.Node;

describe(discriminateAnyType, () => {
  function getDeclarationId(ast: TSESTree.Program): TSESTree.Node {
    const declaration = ast.body.at(-1) as TSESTree.VariableDeclaration;
    const { id } = declaration.declarations[0];
    return id;
  }

  function getTypes(code: string, getNode: GetNode) {
    const { ast, services } = parseCodeForEslint(code);
    const node = getNode(ast);
    const type = services.getTypeAtLocation(getNode(ast));
    return {
      checker: services.program.getTypeChecker(),
      program: services.program,
      tsNode: services.esTreeNodeToTSNodeMap.get(node),
      type,
    };
  }

  describe('returns Safe', () => {
    it.for([
      ['const foo = "foo";', AnyType.Safe],
      ['const foo = 1;', AnyType.Safe],
      ['const foo = [1, 2];', AnyType.Safe],
    ] as const satisfies [string, AnyType.Safe][])(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, program, tsNode, type } = getTypes(
          code,
          getDeclarationId,
        );
        const result = discriminateAnyType(type, checker, program, tsNode);
        expect(result).toBe(expected);
      },
    );

    it('should returns Safe for a recursive thenable.', () => {
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

      const { checker, program, tsNode, type } = getTypes(code, ast => {
        const classDeclration = ast.body[0] as TSESTree.ClassDeclaration;
        const method = classDeclration.body
          .body[0] as TSESTree.MethodDefinition;
        const returnStatement = method.value.body?.body.at(
          -1,
        ) as TSESTree.ReturnStatement;
        return returnStatement.argument!;
      });
      const result = discriminateAnyType(type, checker, program, tsNode);
      expect(result).toBe(AnyType.Safe);
    });
  });

  describe('returns Any', () => {
    it.for([
      ['const foo = 1 as any;', AnyType.Any],
      ['let foo;', AnyType.Any],
    ] as const satisfies [string, AnyType.Any][])(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, program, tsNode, type } = getTypes(
          code,
          getDeclarationId,
        );
        const result = discriminateAnyType(type, checker, program, tsNode);
        expect(result).toBe(expected);
      },
    );
  });

  describe('returns PromiseAny', () => {
    it.for([
      ['const foo = Promise.resolve({} as any);', AnyType.PromiseAny],
      [
        'const foo = Promise.resolve(Promise.resolve({} as any));',
        AnyType.PromiseAny,
      ],
    ] as const satisfies [string, AnyType.PromiseAny][])(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, program, tsNode, type } = getTypes(
          code,
          getDeclarationId,
        );
        const result = discriminateAnyType(type, checker, program, tsNode);
        expect(result).toBe(expected);
      },
    );
  });

  describe('returns AnyArray', () => {
    it.for([
      ['const foo = [{} as any];', AnyType.AnyArray],
      ['const foo = [{} as any, 2];', AnyType.AnyArray],
    ] as const satisfies [string, AnyType.AnyArray][])(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, program, tsNode, type } = getTypes(
          code,
          getDeclarationId,
        );
        const result = discriminateAnyType(type, checker, program, tsNode);
        expect(result).toBe(expected);
      },
    );
  });
});
