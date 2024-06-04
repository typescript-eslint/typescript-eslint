import { parseForESLint } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import path from 'path';
import type * as ts from 'typescript';

import { getTypeName } from '../src';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe('getTypeName', () => {
  function getTypes(code: string): { checker: ts.TypeChecker; type: ts.Type } {
    const rootDir = path.join(__dirname, 'fixtures');

    const { ast, services } = parseForESLint(code, {
      project: './tsconfig.json',
      filePath: path.join(rootDir, 'file.ts'),
      tsconfigRootDir: rootDir,
    });
    expectToHaveParserServices(services);
    const checker = services.program.getTypeChecker();
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    return { checker, type: services.getTypeAtLocation(declaration.id) };
  }

  function runTest(code: string, expected: string): void {
    const { type, checker } = getTypes(code);
    const result = getTypeName(checker, type);
    expect(result).toBe(expected);
  }

  describe('returns primitive type', () => {
    it.each([
      // string
      ['type Test = string;', 'string'],
      ['type Test = "text";', 'string'],
      ['type Test = string | "text";', 'string'],
      ['type Test = "string" | "text";', 'string'],
      ['type Test = string & { foo: number };', 'string'],
      ['type Test<T = number> = T & string;', 'string'],
      ['type Test<T extends string = "text"> = T;', 'string'],
      // number
      ['type Test = number;', 'number'],
      // boolean
      ['type Test = boolean;', 'boolean'],
      // bigint
      ['type Test = bigint;', 'bigint'],
      // undefined
      ['type Test = undefined;', 'undefined'],
      // null
      ['type Test = null;', 'null'],
      // symbol
      ['type Test = symbol;', 'symbol'],
    ])('when code is %s, returns %s', runTest);
  });

  describe('returns non-primitive type', () => {
    it.each([
      ['type Test = 123;', '123'],
      ['type Test = true;', 'true'],
      ['type Test = false;', 'false'],
      ['type Test = () => void;', 'Test'],
      ['type Test<T = number> = T & boolean;', 'Test<T>'],
      ['type Test = string | number;', 'Test'],
      ['type Test = string | string[];', 'Test'],
    ])('when code is %s, returns %s', runTest);
  });
});
