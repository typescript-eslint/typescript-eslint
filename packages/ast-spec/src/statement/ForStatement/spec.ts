import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { ForInitialiser } from '../../unions/ForInitialiser';
import type { Statement } from '../../unions/Statement';

export interface ForStatement extends BaseNode {
  body: Statement;
  init: Expression | ForInitialiser | null;
  test: Expression | null;
  type: AST_NODE_TYPES.ForStatement;
  update: Expression | null;
}
