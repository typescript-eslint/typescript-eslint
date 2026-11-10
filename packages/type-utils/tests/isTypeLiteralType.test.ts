import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { isTypeLiteralType } from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe(isTypeLiteralType, () => {
  function getType(code: string): ts.Type {
    const { ast, services } = parseCodeForEslint(code);
    const declaration = ast.body.at(-1) as TSESTree.TSTypeAliasDeclaration;

    return services.getTypeAtLocation(declaration.id);
  }

  it.for([
    ['type Test = "a";', true],
    ['type Test = 1;', true],
    ['type Test = 1n;', true],
    ['type Test = `a`;', true],
    ['enum E { A = 1 } type Test = E.A;', true],
    ['enum E { A = "a" } type Test = E.A;', true],
    ['type Test = `a${string}`;', false],
    ['type Test = true;', false],
    ['type Test = string;', false],
    ['type Test = number;', false],
    ['type Test = bigint;', false],
    ['type Test = "a" | 1;', false],
    ['type Test = null;', false],
  ] as const)('when code is %s, returns %s', ([code, expected], { expect }) => {
    const type = getType(code);

    expect(isTypeLiteralType(type)).toBe(expected);
    // Should match TS >= 5.0's `type.isLiteral()`
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(isTypeLiteralType(type)).toBe(type.isLiteral());
  });
});
