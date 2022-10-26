import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';

export interface VariableDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  id: BindingName;
  init: Expression | null;
  definite?: boolean;
}
