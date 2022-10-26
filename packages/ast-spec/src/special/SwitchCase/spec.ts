import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { Statement } from '../../unions/Statement';

export interface SwitchCase extends BaseNode {
  type: AST_NODE_TYPES.SwitchCase;
  test: Expression | null;
  consequent: Statement[];
}
