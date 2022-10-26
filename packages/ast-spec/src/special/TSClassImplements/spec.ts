import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { TSHeritageBase } from '../../base/TSHeritageBase';

export interface TSClassImplements extends TSHeritageBase {
  type: AST_NODE_TYPES.TSClassImplements;
}
