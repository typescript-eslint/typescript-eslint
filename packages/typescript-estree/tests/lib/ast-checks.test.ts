import * as ts from 'typescript';

import type { TSESTree } from '../../src/ts-estree';

import {
  checkForStatementDeclaration,
  checkTSNode,
} from '../../src/ast-checks';
import { checkModifiers } from '../../src/check-modifiers';

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

  it('throws when declaration has an initializer', () => {
    const node = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration(
        'x',
        undefined,
        undefined,
        ts.factory.createNumericLiteral(5),
      ),
    ]);

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).toThrow(
      "The variable declaration of a 'for...of' statement cannot have an initializer.",
    );
  });

  it('throws when declaration has a type annotation', () => {
    const node = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration(
        'x',
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ),
    ]);

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).toThrow(
      "The variable declaration of a 'for...of' statement cannot have a type annotation.",
    );
  });

  it('throws when "using" declaration in for...in', () => {
    const node = ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration('x')],
      ts.NodeFlags.Using,
    );

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForInStatement,
        throwError,
      ),
    ).toThrow(
      "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
    );
  });

  it('throws when initializer is not a valid assignment target', () => {
    const node = ts.factory.createNumericLiteral(42);

    expect(() =>
      checkForStatementDeclaration(
        node,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).toThrow(
      "The left-hand side of a 'for...of' statement must be a variable or a property access.",
    );
  });

  it('handles both for...in and for...of paths', () => {
    const forInNode = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration('x'),
    ]);
    const forOfNode = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration('x'),
    ]);

    expect(() =>
      checkForStatementDeclaration(
        forInNode,
        ts.SyntaxKind.ForInStatement,
        throwError,
      ),
    ).not.toThrow();

    expect(() =>
      checkForStatementDeclaration(
        forOfNode,
        ts.SyntaxKind.ForOfStatement,
        throwError,
      ),
    ).not.toThrow();
  });
});

describe(checkTSNode, () => {
  let throwError: (
    node: number | ts.Node | TSESTree.Range,
    message: string,
  ) => never;

  beforeEach(() => {
    vi.clearAllMocks();
    throwError = vi.fn((node, message: string) => {
      throw new Error(message);
    }) as unknown as typeof throwError;
  });

  it('calls checkModifiers for a node', () => {
    const node = ts.factory.createIdentifier('x');
    checkTSNode(node, throwError);
    expect(checkModifiers).toHaveBeenCalledWith(node);
  });

  it('calls checkForStatementDeclaration for ForOfStatement', () => {
    const initializer = ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration('x'),
    ]);
    const node = ts.factory.createForOfStatement(
      undefined,
      initializer,
      ts.factory.createIdentifier('arr'),
      ts.factory.createBlock([], true),
    );

    checkTSNode(node, throwError, initializer, ts.SyntaxKind.ForOfStatement);

    expect(checkForStatementDeclaration).toHaveBeenCalledWith(
      initializer,
      ts.SyntaxKind.ForOfStatement,
      throwError,
    );
  });
});
