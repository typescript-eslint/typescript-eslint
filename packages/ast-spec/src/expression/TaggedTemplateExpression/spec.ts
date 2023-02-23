import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { LeftHandSideExpression } from '../../unions/LeftHandSideExpression';
import type { TemplateLiteral } from '../TemplateLiteral/spec';

export interface TaggedTemplateExpression extends BaseNode {
  type: AST_NODE_TYPES.TaggedTemplateExpression;
  typeArguments?: TSTypeParameterInstantiation;

  /** @deprecated Use {@link `typeArguments`} instead. */
  typeParameters?: TSTypeParameterInstantiation;

  tag: LeftHandSideExpression;
  quasi: TemplateLiteral;
}
