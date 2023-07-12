import type { TSTypeParameterInstantiation } from '../special/TSTypeParameterInstantiation/spec';
import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface TSHeritageBase extends BaseNode {
  // TODO(#1852) - this should be restricted to MemberExpression | Identifier
  expression: Expression;
  typeArguments: TSTypeParameterInstantiation | undefined;

  /** @deprecated Use {@link `typeArguments`} instead. */
  typeParameters: TSTypeParameterInstantiation | undefined;
}
