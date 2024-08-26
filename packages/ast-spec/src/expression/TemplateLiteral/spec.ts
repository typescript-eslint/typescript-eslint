import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TemplateElement } from '../../special/TemplateElement/spec';
import type { Expression } from '../../unions/Expression';

export interface TemplateLiteral extends BaseNode {
  expressions: Expression[];
  quasis: TemplateElement[];
  type: AST_NODE_TYPES.TemplateLiteral;
}
