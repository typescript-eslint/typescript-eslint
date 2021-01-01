import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';

export interface NullToken extends BaseToken {
  type: AST_TOKEN_TYPES.Null;
}
