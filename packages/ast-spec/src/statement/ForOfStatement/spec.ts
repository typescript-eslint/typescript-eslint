import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { ForOfInitialiser } from '../../unions/ForOfInitialiser';
import type { Statement } from '../../unions/Statement';

export interface ForOfStatement extends BaseNode {
  type: AST_NODE_TYPES.ForOfStatement;
  left: ForOfInitialiser;
  right: Expression;
  body: Statement;
  await: boolean;
}
