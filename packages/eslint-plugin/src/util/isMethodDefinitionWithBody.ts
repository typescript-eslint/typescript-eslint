import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export type MethodDefinitionWithBody = TSESTree.MethodDefinition & {
  value: TSESTree.FunctionExpression;
};

export function isMethodDefinitionWithBody(
  node: TSESTree.Node,
): node is MethodDefinitionWithBody {
  return (
    node.type === AST_NODE_TYPES.MethodDefinition &&
    node.value.type === AST_NODE_TYPES.FunctionExpression
  );
}
