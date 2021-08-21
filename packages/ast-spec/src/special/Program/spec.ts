import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Comment } from '../../unions/Comment';
import type { ProgramStatement } from '../../unions/Statement';
import type { Token } from '../../unions/Token';
import type { Directive } from '../Directive/spec';

export interface Program extends BaseNode {
  type: AST_NODE_TYPES.Program;
  body: Array<Directive | ProgramStatement>;
  sourceType: 'module' | 'script';
  comments?: Comment[];
  tokens?: Token[];
}
