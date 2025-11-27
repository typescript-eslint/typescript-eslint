import * as ts from 'typescript';

import { checkModifiers } from './check-modifiers';
import { isValidAssignmentTarget, createError } from './node-utils';

export function checkSyntaxError(node: ts.Node): void {
  checkModifiers(node);

  switch (node.kind) {
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement: {
      checkForStatementDeclaration(
        (node as ts.ForInStatement | ts.ForOfStatement).initializer,
        node.kind,
      );
      break;
    }
    default: {
      break;
    }
  }
}

function checkForStatementDeclaration(
  initializer: ts.ForInitializer,
  kind: ts.SyntaxKind,
): void {
  const loop = kind === ts.SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
  if (ts.isVariableDeclarationList(initializer)) {
    if (initializer.declarations.length !== 1) {
      throw createError(
        initializer,
        `Only a single variable declaration is allowed in a '${loop}' statement.`,
      );
    }
    const declaration = initializer.declarations[0];
    if (declaration.initializer) {
      throw createError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have an initializer.`,
      );
    } else if (declaration.type) {
      throw createError(
        declaration,
        `The variable declaration of a '${loop}' statement cannot have a type annotation.`,
      );
    }
    if (
      kind === ts.SyntaxKind.ForInStatement &&
      initializer.flags & ts.NodeFlags.Using
    ) {
      throw createError(
        initializer,
        "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
      );
    }
  } else if (
    !isValidAssignmentTarget(initializer) &&
    initializer.kind !== ts.SyntaxKind.ObjectLiteralExpression &&
    initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    throw createError(
      initializer,
      `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
    );
  }
}
