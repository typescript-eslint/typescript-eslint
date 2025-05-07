import type { TSESTree } from '@typescript-eslint/types';
import type * as ts from 'typescript';

import { getTypeName } from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe(getTypeName, () => {
  function getTypes(code: string): { checker: ts.TypeChecker; type: ts.Type } {
    const { ast, services } = parseCodeForEslint(code);
    const checker = services.program.getTypeChecker();
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    return { checker, type: services.getTypeAtLocation(declaration.id) };
  }
  describe('returns primitive type', () => {
    it.for([
      ['type Test = string;', 'string'],
      ['type Test = "text";', 'string'],
      ['type Test = string | "text";', 'string'],
      ['type Test = "string" | "text";', 'string'],
      ['type Test = string & { foo: number };', 'string'],
      ['type Test<T = number> = T & string;', 'string'],
      ['type Test<T extends string = "text"> = T;', 'string'],
      ['type Test = number;', 'number'],
      ['type Test = boolean;', 'boolean'],
      ['type Test = bigint;', 'bigint'],
      ['type Test = undefined;', 'undefined'],
      ['type Test = null;', 'null'],
      ['type Test = symbol;', 'symbol'],
    ] as const)(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, type } = getTypes(code);
        const result = getTypeName(checker, type);
        expect(result).toBe(expected);
      },
    );
  });

  describe('returns non-primitive type', () => {
    it.for([
      ['type Test = 123;', '123'],
      ['type Test = true;', 'true'],
      ['type Test = false;', 'false'],
      ['type Test = () => void;', 'Test'],
      ['type Test<T = number> = T & boolean;', 'Test<T>'],
      ['type Test = string | number;', 'Test'],
      ['type Test = string | string[];', 'Test'],
    ] as const)(
      'when code is %s, returns %s',
      ([code, expected], { expect }) => {
        const { checker, type } = getTypes(code);
        const result = getTypeName(checker, type);
        expect(result).toBe(expected);
      },
    );
  });
});
