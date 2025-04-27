import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { TestContext } from 'vitest';

import { parseForESLint } from '@typescript-eslint/parser';
import path from 'node:path';
import * as ts from 'typescript';

import { getTypeFlags, isTypeFlagSet } from '../src';

describe('typeFlagUtils', () => {
  const rootDir = path.join(__dirname, 'fixtures');

  function getType(code: string): ts.Type {
    const { ast, services } = parseForESLint(code, {
      disallowAutomaticSingleRunInference: true,
      filePath: path.join(rootDir, 'file.ts'),
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    });
    assert.toHaveParserServices(services);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    return services.getTypeAtLocation(declaration.id);
  }

  describe(getTypeFlags, () => {
    function runTestForAliasDeclaration(
      [code, expected]: readonly [code: string, expected: ts.TypeFlags],
      { expect }: TestContext,
    ): void {
      const type = getType(code);
      const result = getTypeFlags(type);
      expect(result).toBe(expected);
    }

    it.for([
      ['type Test = any;', 1],
      ['type Test = unknown;', 2],
      ['type Test = string;', 4],
      ['type Test = number;', 8],
      ['type Test = "text";', 128],
      ['type Test = 123;', 256],
      [
        'type Test = string | number',
        ts.TypeFlags.String | ts.TypeFlags.Number,
      ],
      ['type Test = "text" | 123', 384],
    ] as const)(
      'when code is "%s", type flags is %d',
      runTestForAliasDeclaration,
    );
  });

  describe(isTypeFlagSet, () => {
    function runTestForAliasDeclaration(
      code: string,
      flagsToCheck: ts.TypeFlags,
      expected: boolean,
      { expect }: TestContext,
    ): void {
      const type = getType(code);
      const result = isTypeFlagSet(type, flagsToCheck);
      expect(result).toBe(expected);
    }

    describe('is type flags set', () => {
      function runTestIsTypeFlagSet(
        [code, flagsToCheck]: readonly [
          code: string,
          flagsToCheck: ts.TypeFlags,
        ],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, flagsToCheck, true, testContext);
      }

      it.for([
        ['type Test = any;', ts.TypeFlags.Any],
        ['type Test = string;', ts.TypeFlags.String],
        ['type Test = string | number;', ts.TypeFlags.String],
        ['type Test = string & { foo: string };', ts.TypeFlags.Intersection],
      ] as const)(
        'when code is "%s" and flagsToCheck is %d , returns true',
        runTestIsTypeFlagSet,
      );
    });

    describe('is not type flags set', () => {
      function runTestIsNotTypeFlagSet(
        [code, flagsToCheck]: readonly [
          code: string,
          flagsToCheck: ts.TypeFlags,
        ],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, flagsToCheck, false, testContext);
      }

      it.for([
        ['type Test = string', ts.TypeFlags.Any],
        ['type Test = string | number;', ts.TypeFlags.Any],
        ['type Test = string & { foo: string }', ts.TypeFlags.String],
      ] as const)(
        'when code is "%s" and flagsToCheck is %d , returns false',
        runTestIsNotTypeFlagSet,
      );
    });
  });
});
