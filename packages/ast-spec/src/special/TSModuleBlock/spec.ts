import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ProgramStatement } from '../../unions/Statement';

export interface TSModuleBlock extends BaseNode {
  body: ProgramStatement[];
  type: AST_NODE_TYPES.TSModuleBlock;
}
