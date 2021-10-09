import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';

export interface BlockComment extends BaseToken {
  type: AST_TOKEN_TYPES.Block;
}
