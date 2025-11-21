import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { Key, MemberNode } from './types';

import { privateKey, publicKey } from './types';

export interface ExtractedName {
  key: Key;
  codeName: string;
  nameNode: TSESTree.Node;
}

function extractComputedName(
  computedName: TSESTree.Expression,
): ExtractedName | null {
  if (computedName.type === AST_NODE_TYPES.Literal) {
    const name = computedName.value?.toString() ?? 'null';
    return {
      codeName: name,
      key: publicKey(name),
      nameNode: computedName,
    };
  }
  if (
    computedName.type === AST_NODE_TYPES.TemplateLiteral &&
    computedName.expressions.length === 0
  ) {
    const name = computedName.quasis[0].value.raw;
    return {
      codeName: name,
      key: publicKey(name),
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
      codeName: `#${name}`,
      key: privateKey(nonComputedName),
      nameNode: nonComputedName,
    };
  }
  return {
    codeName: name,
    key: publicKey(name),
    nameNode: nonComputedName,
  };
}
/**
 * Extracts the string name for a member.
 * @returns `null` if the name cannot be extracted due to it being computed.
 */
export function extractNameForMember(node: MemberNode): ExtractedName | null {
  if (node.type === AST_NODE_TYPES.TSParameterProperty) {
    const identifier =
      node.parameter.type === AST_NODE_TYPES.Identifier
        ? node.parameter
        : (node.parameter.left as TSESTree.Identifier);
    return extractNonComputedName(identifier);
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
