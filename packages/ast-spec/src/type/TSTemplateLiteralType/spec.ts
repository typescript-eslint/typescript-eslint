import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TemplateElement } from '../../special/TemplateElement/spec';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSTemplateLiteralType extends BaseNode {
  quasis: TemplateElement[];
  type: AST_NODE_TYPES.TSTemplateLiteralType;
  types: TypeNode[];
}
