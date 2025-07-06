import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { Key, MemberNode } from './types';

import { privateKey, publicKey } from './types';

function extractComputedName(computedName: TSESTree.Expression): Key | null {
  if (computedName.type === AST_NODE_TYPES.Literal) {
    return publicKey(computedName.value?.toString() ?? 'null');
  }
  if (
    computedName.type === AST_NODE_TYPES.TemplateLiteral &&
    computedName.expressions.length === 0
  ) {
    return publicKey(computedName.quasis[0].value.raw);
  }
  return null;
}
function extractNonComputedName(
  nonComputedName: TSESTree.Identifier | TSESTree.PrivateIdentifier,
): Key {
  if (nonComputedName.type === AST_NODE_TYPES.PrivateIdentifier) {
    return privateKey(nonComputedName);
  }
  return publicKey(nonComputedName.name);
}
/**
 * Extracts the string name for a member.
 * @returns `null` if the name cannot be extracted due to it being a computed.
 */
export function extractNameForMember(node: MemberNode): Key | null {
  if (node.computed) {
    return extractComputedName(node.key);
  }

  if (node.key.type === AST_NODE_TYPES.Literal) {
    return extractComputedName(node.key);
  }

  return extractNonComputedName(node.key);
}
/**
 * Extracts the string property name for a member.
 * @returns `null` if the name cannot be extracted due to it being a computed.
 */
export function extractNameForMemberExpression(
  node: TSESTree.MemberExpression,
): Key | null {
  if (node.computed) {
    return extractComputedName(node.property);
  }

  return extractNonComputedName(node.property);
}
