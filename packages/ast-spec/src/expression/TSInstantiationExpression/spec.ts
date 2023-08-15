import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/spec';
import type { Expression } from '../../unions/Expression';

export interface TSInstantiationExpression extends BaseNode {
  type: AST_NODE_TYPES.TSInstantiationExpression;
  expression: Expression;
  typeArguments: TSTypeParameterInstantiation;

  /** @deprecated Use {@link `typeArguments`} instead. */
  typeParameters?: TSTypeParameterInstantiation;
}
