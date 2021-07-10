import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';
import type { PunctuatorTokenValue } from './PunctuatorTokenValue';

export interface PunctuatorToken extends BaseToken {
  type: AST_TOKEN_TYPES.Punctuator;
  value: PunctuatorTokenValue;
}
