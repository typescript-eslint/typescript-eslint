import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { Key, MemberNode } from './types';

import { privateKey, publicKey } from './types';

export type ExtractedName = {
  key: Key;
  codeName: string;
  nameNode: TSESTree.Node;
};

function extractComputedName(
  computedName: TSESTree.Expression,
): ExtractedName | null {
  if (computedName.type === AST_NODE_TYPES.Literal) {
    const name = computedName.value?.toString() ?? 'null';
    return {
      key: publicKey(name),
      codeName: name,
      nameNode: computedName,
    };
  }
  if (
    computedName.type === AST_NODE_TYPES.TemplateLiteral &&
    computedName.expressions.length === 0
  ) {
    const name = computedName.quasis[0].value.raw;
    return {
      key: publicKey(name),
      codeName: name,
      nameNode: computedName,
    };
  }
  return null;
}
function extractNonComputedName(
  nonComputedName: TSESTree.Identifier | TSESTree.PrivateIdentifier,
): ExtractedName | null {
  const name = nonComputedName.name;
  if (nonComputedName.type === AST_NODE_TYPES.PrivateIdentifier) {
    return {
      key: privateKey(nonComputedName),
      codeName: `#${name}`,
      nameNode: nonComputedName,
    };
  }
  return {
    key: publicKey(name),
    codeName: name,
    nameNode: nonComputedName,
  };
}
/**
 * Extracts the string name for a member.
 * @returns `null` if the name cannot be extracted due to it being a computed.
 */
export function extractNameForMember(node: MemberNode): ExtractedName | null {
  if (node.type === AST_NODE_TYPES.TSParameterProperty) {
    switch (node.parameter.type) {
      case AST_NODE_TYPES.ArrayPattern:
      case AST_NODE_TYPES.ObjectPattern:
      case AST_NODE_TYPES.RestElement:
        // Nonsensical properties -- see https://github.com/typescript-eslint/typescript-eslint/issues/11708
        return null;

      case AST_NODE_TYPES.AssignmentPattern:
        if (node.parameter.left.type !== AST_NODE_TYPES.Identifier) {
          return null;
        }
        return extractNonComputedName(node.parameter.left);

      case AST_NODE_TYPES.Identifier:
        return extractNonComputedName(node.parameter);
    }
  }

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
): ExtractedName | null {
  if (node.computed) {
    return extractComputedName(node.property);
  }

  return extractNonComputedName(node.property);
}
