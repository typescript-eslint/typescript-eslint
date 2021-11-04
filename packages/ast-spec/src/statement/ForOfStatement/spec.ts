import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { ForInitialiser } from '../../unions/ForInitialiser';
import type { Statement } from '../../unions/Statement';

export interface ForOfStatement extends BaseNode {
  type: AST_NODE_TYPES.ForOfStatement;
  left: ForInitialiser;
  right: Expression;
  body: Statement;
  await: boolean;
}
