import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Comment } from '../../unions/Comment';
import type { ProgramStatement } from '../../unions/Statement';
import type { Token } from '../../unions/Token';

export interface Program extends BaseNode {
  type: AST_NODE_TYPES.Program;
  body: ProgramStatement[];
  sourceType: 'module' | 'script';
  comments?: Comment[];
  tokens?: Token[];
}
