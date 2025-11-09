import * as ts from 'typescript';

import type { TSESTree } from '../../src/ts-estree';

import { checkForStatementDeclaration } from '../../src/ast-checks';

describe(checkForStatementDeclaration, () => {
  let throwError: (
    node: number | ts.Node | TSESTree.Range,
    message: string,
  ) => never;

  beforeEach(() => {
    throwError = vi.fn((node, message: string) => {
      throw new Error(message);
    }) as unknown as typeof throwError;
  });

  it('allows single variable declaration with no initializer or type', () => {
    const node = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration('x'),
    ]);

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).not.toThrow();
  });

  it('throws when multiple declarations', () => {
    const node = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration('x'),
      ts.factory.createVariableDeclaration('y'),
    ]);

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).toThrow(
      "Only a single variable declaration is allowed in a 'for...of' statement.",
    );
  });
});
