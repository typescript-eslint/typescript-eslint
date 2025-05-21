import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface TemplateElement extends BaseNode {
  type: AST_NODE_TYPES.TemplateElement;
  tail: boolean;
  value: {
    cooked: string;
    raw: string;
  };
}
