import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { NodeOrTokenData } from '../../base/NodeOrTokenData';
import type { Comment } from '../../unions/Comment';
import type { ProgramStatement } from '../../unions/Statement';
import type { Token } from '../../unions/Token';

export interface Program extends NodeOrTokenData {
  body: ProgramStatement[];
  comments: Comment[] | undefined;
  sourceType: 'module' | 'script';
  tokens: Token[] | undefined;
  type: AST_NODE_TYPES.Program;
}
