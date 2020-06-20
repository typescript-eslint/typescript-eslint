import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { parseForESLint } from '@typescript-eslint/parser';
import path from 'path';
import { getFixturesRootDir } from '../RuleTester';
import { isUnsafeAssignment } from '../../src/util/types';

describe('isUnsafeAssignment', () => {
  const rootDir = getFixturesRootDir();

  function getTypes(
    code: string,
  ): { sender: ts.Type; receiver: ts.Type; checker: ts.TypeChecker } {
    const { ast, services } = parseForESLint(code, {
      project: './tsconfig.json',
      filePath: path.join(rootDir, 'file.ts'),
      tsconfigRootDir: rootDir,
    });
    const checker = services.program.getTypeChecker();
    const esTreeNodeToTSNodeMap = services.esTreeNodeToTSNodeMap;

    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const declarator = declaration.declarations[0];
    return {
      receiver: checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(declarator.id),
      ),
      sender: checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(declarator.init!),
      ),
      checker,
    };
  }

  describe('unsafe', () => {
    function expectTypesAre(
      result: ReturnType<typeof isUnsafeAssignment>,
      checker: ts.TypeChecker,
      senderStr: string,
      receiverStr: string,
    ): void {
      expect(result).toBeTruthy();
      const { sender, receiver } = result as Exclude<typeof result, false>;

      expect(checker.typeToString(sender)).toBe(senderStr);
      expect(checker.typeToString(receiver)).toBe(receiverStr);
    }

    it('any to a non-any', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: string = (1 as any);',
      );

      expectTypesAre(
        isUnsafeAssignment(sender, receiver, checker),
        checker,
        'any',
        'string',
      );
    });

    it('any in a generic position to a non-any', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<string> = new Set<any>();',
      );

      expectTypesAre(
        isUnsafeAssignment(sender, receiver, checker),
        checker,
        'Set<any>',
        'Set<string>',
      );
    });

    it('any in a generic position to a non-any (multiple generics)', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Map<string, string> = new Map<string, any>();',
      );

      expectTypesAre(
        isUnsafeAssignment(sender, receiver, checker),
        checker,
        'Map<string, any>',
        'Map<string, string>',
      );
    });

    it('any[] in a generic position to a non-any[]', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<string[]> = new Set<any[]>();',
      );

      expectTypesAre(
        isUnsafeAssignment(sender, receiver, checker),
        checker,
        'Set<any[]>',
        'Set<string[]>',
      );
    });

    it('any in a generic position to a non-any (nested)', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<Set<Set<string>>> = new Set<Set<Set<any>>>();',
      );

      expectTypesAre(
        isUnsafeAssignment(sender, receiver, checker),
        checker,
        'Set<Set<Set<any>>>',
        'Set<Set<Set<string>>>',
      );
    });
  });

  describe('safe', () => {
    it('non-any to a non-any', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: string = "";',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any to a any', () => {
      const { sender, receiver, checker } = getTypes('const test: any = "";');

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any in a generic position to a non-any', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<string> = new Set<string>();',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any in a generic position to a non-any (multiple generics)', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Map<string, string> = new Map<string, string>();',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any[] in a generic position to a non-any[]', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<string[]> = new Set<string[]>();',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any in a generic position to a non-any (nested)', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<Set<Set<string>>> = new Set<Set<Set<string>>>();',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });

    it('non-any in a generic position to a any (nested)', () => {
      const { sender, receiver, checker } = getTypes(
        'const test: Set<Set<Set<any>>> = new Set<Set<Set<string>>>();',
      );

      expect(isUnsafeAssignment(sender, receiver, checker)).toBeFalsy();
    });
  });
});
