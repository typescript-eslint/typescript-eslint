import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * Returns the identifier or chain of identifiers
 * that refers to the value of the expression,
 * if any.
 */
export function getIdentifierFromExpression(
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
):
  | TSESTree.Literal
  | TSESTree.Identifier
  | TSESTree.PrivateIdentifier
  | TSESTree.Super
  | TSESTree.MemberExpression
  | null {
  if (
    node.type === AST_NODE_TYPES.Literal ||
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.PrivateIdentifier ||
    node.type === AST_NODE_TYPES.Super
  ) {
    return node;
  }
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    const objectNode = getIdentifierFromExpression(node.object);
    const propertyNode = getIdentifierFromExpression(node.property);
    if (objectNode != null && propertyNode != null) {
      return node;
    }
    return propertyNode;
  }
  if (
    node.type === AST_NODE_TYPES.ChainExpression ||
    node.type === AST_NODE_TYPES.TSNonNullExpression
  ) {
    return getIdentifierFromExpression(node.expression);
  }
  return null;
}

/**
 * {@link getIdentifierFromExpression} but returns the name as a string.
 */
export function getNameFromExpression(
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Expression | TSESTree.PrivateIdentifier | null,
): string | null {
  if (node == null) {
    return null;
  }
  const nameNode = getIdentifierFromExpression(node);
  if (nameNode == null) {
    return null;
  }
  if (nameNode.type === AST_NODE_TYPES.Identifier) {
    // Get without type annotation
    return nameNode.name;
  }
  return sourceCode.getText(nameNode);
}
