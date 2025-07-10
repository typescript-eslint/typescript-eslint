import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ChainExpression } from '../../expression/ChainExpression/spec';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { Expression } from '../../unions/Expression';
import type { TemplateLiteral } from '../TemplateLiteral/spec';

export interface TaggedTemplateExpression extends BaseNode {
  type: AST_NODE_TYPES.TaggedTemplateExpression;
  quasi: TemplateLiteral;
  tag: Exclude<Expression, ChainExpression>;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
