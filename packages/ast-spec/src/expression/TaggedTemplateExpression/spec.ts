import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { Expression } from '../../unions/Expression';
import type { TemplateLiteral } from '../TemplateLiteral/spec';

export interface TaggedTemplateExpression extends BaseNode {
  quasi: TemplateLiteral;
  tag: Expression;
  type: AST_NODE_TYPES.TaggedTemplateExpression;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
