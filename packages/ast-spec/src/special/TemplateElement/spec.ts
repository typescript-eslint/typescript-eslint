import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';

export interface TemplateElement extends BaseNode {
  tail: boolean;
  type: AST_NODE_TYPES.TemplateElement;
  value: {
    cooked: string;
    raw: string;
  };
}
