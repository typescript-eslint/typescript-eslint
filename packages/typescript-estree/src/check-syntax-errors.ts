import * as ts from 'typescript';

import type { TSNode } from './ts-estree';

import { checkModifiers } from './check-modifiers';
import { isValidAssignmentTarget, createError } from './node-utils';

const SyntaxKind = ts.SyntaxKind;

export function checkSyntaxError(tsNode: ts.Node): void {
  checkModifiers(tsNode);

  const node = tsNode as TSNode;

  switch (node.kind) {
    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement: {
      checkForStatementDeclaration(node);
      break;
    }
    default: {
      break;
    }
  }
}

function checkForStatementDeclaration(
  node: ts.ForInStatement | ts.ForOfStatement,
): void {
  const { initializer, kind } = node;
  const loop = kind === SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
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
  } else if (
    !isValidAssignmentTarget(initializer) &&
    initializer.kind !== SyntaxKind.ObjectLiteralExpression &&
    initializer.kind !== SyntaxKind.ArrayLiteralExpression
  ) {
    throw createError(
      initializer,
      `The left-hand side of a '${loop}' statement must be a variable or a property access.`,
    );
  }
}
