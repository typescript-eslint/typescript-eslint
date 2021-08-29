import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';

export interface NumericToken extends BaseToken {
  type: AST_TOKEN_TYPES.Numeric;
}
