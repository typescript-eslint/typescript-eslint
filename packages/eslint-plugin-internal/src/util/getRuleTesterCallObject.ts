import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function getRuleTesterCallObject(
  node: TSESTree.Node,
): TSESTree.ObjectExpression | undefined {
  return node.type === AST_NODE_TYPES.CallExpression &&
    node.arguments.length >= 3 &&
    node.arguments[2].type === AST_NODE_TYPES.ObjectExpression &&
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    node.callee.object.type === AST_NODE_TYPES.Identifier &&
    node.callee.object.name === 'ruleTester' &&
    node.callee.property.type === AST_NODE_TYPES.Identifier &&
    node.callee.property.name === 'run'
    ? node.arguments[2]
    : undefined;
}
