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
        `Only a single variable declaration is allowed in a '${loop}' statement.`,
        initializer.getSourceFile(),
        initializer.getStart(),
        initializer.getEnd(),
      );
    }
    const declaration = initializer.declarations[0];
    if (declaration.initializer) {
      throw createError(
        `The variable declaration of a '${loop}' statement cannot have an initializer.`,
        declaration.getSourceFile(),
        declaration.getStart(),
        declaration.getEnd(),
      );
    } else if (declaration.type) {
      throw createError(
        `The variable declaration of a '${loop}' statement cannot have a type annotation.`,
        declaration.getSourceFile(),
        declaration.getStart(),
        declaration.getEnd(),
      );
    }
    if (
      kind === ts.SyntaxKind.ForInStatement &&
      initializer.flags & ts.NodeFlags.Using
    ) {
      throw createError(
        "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.",
        initializer.getSourceFile(),
        initializer.getStart(),
        initializer.getEnd(),
      );
    }
  } else if (
    !isValidAssignmentTarget(initializer) &&
    initializer.kind !== ts.SyntaxKind.ObjectLiteralExpression &&
    initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    throw createError(
      `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
      initializer.getSourceFile(),
      initializer.getStart(),
      initializer.getEnd(),
    );
  }
}
