import * as ts from 'typescript';

import type { TSESTree } from './ts-estree';

import { isValidAssignmentTarget } from './node-utils';

export function checkForStatementDeclaration(
  initializer: ts.ForInitializer,
  kind: ts.SyntaxKind.ForInStatement | ts.SyntaxKind.ForOfStatement,
  throwError: (
    node: number | ts.Node | TSESTree.Range,
    message: string,
  ) => never,
): void {
  const loop = kind === ts.SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
  if (ts.isVariableDeclarationList(initializer)) {
    if (initializer.declarations.length !== 1) {
      throwError(
        initializer,
        `Only a single variable declaration is allowed in a '${loop}' statement.`,
      );
    }
    const declaration = initializer.declarations[0];
    if (declaration.initializer) {
      throwError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have an initializer.`,
      );
    } else if (declaration.type) {
      throwError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have a type annotation.`,
      );
    }
    if (
      kind === ts.SyntaxKind.ForInStatement &&
      initializer.flags & ts.NodeFlags.Using
    ) {
      throwError(
        initializer,
        "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
      );
    }
  } else if (
    !isValidAssignmentTarget(initializer) &&
    initializer.kind !== ts.SyntaxKind.ObjectLiteralExpression &&
    initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    throwError(
      initializer,
      `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
    );
  }
}
