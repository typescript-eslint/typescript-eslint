import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Statement } from '../../unions/Statement';

export interface LabeledStatement extends BaseNode {
  body: Statement;
  label: Identifier;
  type: AST_NODE_TYPES.LabeledStatement;
}
