import { parseForESLint } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import path from 'path';
import * as ts from 'typescript';

import { getTypeFlags, isTypeFlagSet } from '../src';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe('typeFlagUtils', () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getType(code: string): ts.Type {
    const { ast, services } = parseForESLint(code, {
      project: './tsconfig.json',
      filePath: path.join(rootDir, 'file.ts'),
      tsconfigRootDir: rootDir,
    });
    expectToHaveParserServices(services);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    return services.getTypeAtLocation(declaration.id);
  }

  describe('getTypeFlags', () => {
    function runTestForAliasDeclaration(
      code: string,
      expected: ts.TypeFlags,
    ): void {
      const type = getType(code);
      const result = getTypeFlags(type);
      expect(result).toBe(expected);
    }

    it.each([
      ['type Test = any;', 1],
      ['type Test = unknown;', 2],
      ['type Test = string;', 4],
      ['type Test = number;', 8],
      ['type Test = "text";', 128],
      ['type Test = 123;', 256],
      ['type Test = string | number', 12],
      ['type Test = "text" | 123', 384],
    ])('when code is "%s", type flags is %d', runTestForAliasDeclaration);
  });

  describe('isTypeFlagSet', () => {
    function runTestForAliasDeclaration(
      code: string,
      flagsToCheck: ts.TypeFlags,
      expected: boolean,
    ): void {
      const type = getType(code);
      const result = isTypeFlagSet(type, flagsToCheck);
      expect(result).toBe(expected);
    }

    describe('is type flagas set', () => {
      function runTestIsTypeFlagSet(
        code: string,
        flagsToCheck: ts.TypeFlags,
      ): void {
        runTestForAliasDeclaration(code, flagsToCheck, true);
      }

      it.each([
        ['type Test = any;', ts.TypeFlags.Any],
        ['type Test = string;', ts.TypeFlags.String],
        ['type Test = string | number;', ts.TypeFlags.String],
        ['type Test = string & { foo: string };', ts.TypeFlags.Intersection],
      ])(
        'when code is "%s" and flagsToCheck is %d , returns is true',
        runTestIsTypeFlagSet,
      );
    });

    describe('is not type flagas set', () => {
      function runTestIsNotTypeFlagSet(
        code: string,
        flagsToCheck: ts.TypeFlags,
      ): void {
        runTestForAliasDeclaration(code, flagsToCheck, false);
      }

      it.each([
        ['type Test = string', ts.TypeFlags.Any],
        ['type Test = string | number;', ts.TypeFlags.Any],
        ['type Test = string & { foo: string }', ts.TypeFlags.String],
      ])(
        'when code is "%s" and flagsToCheck is %d , returns is false',
        runTestIsNotTypeFlagSet,
      );
    });
  });
});
