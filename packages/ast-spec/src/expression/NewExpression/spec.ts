import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { CallExpressionArgument } from '../../unions/CallExpressionArgument';
import type { Expression } from '../../unions/Expression';

export interface NewExpression extends BaseNode {
  type: AST_NODE_TYPES.NewExpression;
  typeArguments: TSTypeParameterInstantiation | undefined;
  arguments: CallExpressionArgument[];
  callee: Expression;
}
