import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';

export interface RegularExpressionToken extends BaseToken {
  regex: {
    flags: string;
    pattern: string;
  };
  type: AST_TOKEN_TYPES.RegularExpression;
}
