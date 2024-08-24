import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { ForInitialiser } from '../../unions/ForInitialiser';
import type { Statement } from '../../unions/Statement';

export interface ForInStatement extends BaseNode {
  body: Statement;
  left: ForInitialiser;
  right: Expression;
  type: AST_NODE_TYPES.ForInStatement;
}
