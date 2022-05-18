import type { TSTypeParameterInstantiation } from '../special/TSTypeParameterInstantiation/spec';
import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface TSHeritageBase extends BaseNode {
  // TODO(error handling) - this should be restricted to MemberExpression | Identifier
  expression: Expression;
  typeParameters?: TSTypeParameterInstantiation;
}
