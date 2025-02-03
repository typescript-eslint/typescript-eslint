import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { parseForESLint } from '@typescript-eslint/parser';
import path from 'node:path';

import { containsAllTypesByName } from '../src';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe(containsAllTypesByName, () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getType(code: string): ts.Type {
    const { ast, services } = parseForESLint(code, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(rootDir, 'file.ts'),
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    });
    expectToHaveParserServices(services);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
    return services.getTypeAtLocation(declaration.id);
  }

  describe('allowAny', () => {
    function runTestForAliasDeclaration(
      code: string,
      allowAny: boolean,
      expected: boolean,
    ): void {
      const type = getType(code);
      const result = containsAllTypesByName(type, allowAny, new Set());
      expect(result).toBe(expected);
    }

    describe('is true', () => {
      function runTest(code: string, expected: boolean): void {
        runTestForAliasDeclaration(code, true, expected);
      }

      it.each([
        ['type Test = unknown;', false],
        ['type Test = any;', false],
        ['type Test = string;', false],
      ] as const)('when code is "%s" expected is %s', runTest);
    });

    describe('is false', () => {
      function runTest(code: string, expected: boolean): void {
        runTestForAliasDeclaration(code, false, expected);
      }

      it.each([
        ['type Test = unknown;', true],
        ['type Test = any;', true],
        ['type Test = string;', false],
      ] as const)('when code is "%s" expected is %s', runTest);
    });
  });

  describe('matchAnyInstead', () => {
    function runTestForAliasDeclaration(
      code: string,
      matchAnyInstead: boolean,
      expected: boolean,
    ): void {
      const type = getType(code);
      const result = containsAllTypesByName(
        type,
        false,
        new Set(['Object', 'Promise']),
        matchAnyInstead,
      );
      expect(result).toBe(expected);
    }

    describe('is true', () => {
      function runTest(code: string, expected: boolean): void {
        runTestForAliasDeclaration(code, true, expected);
      }

      it.each([
        [`type Test = Promise<void> & string`, true],
        ['type Test = Promise<void> | string', true],
        ['type Test = Promise<void> | Object', true],
      ] as const)('when code is "%s" expected is %s', runTest);
    });

    describe('is false', () => {
      function runTest(code: string, expected: boolean): void {
        runTestForAliasDeclaration(code, false, expected);
      }

      it.each([
        ['type Test = Promise<void> & string', false],
        ['type Test = Promise<void> | string', false],
        ['type Test = Promise<void> | Object', true],
      ] as const)('when code is "%s" expected is %s', runTest);
    });
  });
});
