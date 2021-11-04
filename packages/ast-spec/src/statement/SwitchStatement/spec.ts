import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { SwitchCase } from '../../special/SwitchCase/spec';
import type { Expression } from '../../unions/Expression';

export interface SwitchStatement extends BaseNode {
  type: AST_NODE_TYPES.SwitchStatement;
  discriminant: Expression;
  cases: SwitchCase[];
}
