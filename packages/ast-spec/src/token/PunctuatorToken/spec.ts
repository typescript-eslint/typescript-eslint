import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';
import type { ValueOf } from '../../utils';
import type { PunctuatorTokenToText } from './PunctuatorTokenToText';

export * from './PunctuatorTokenToText';

export interface PunctuatorToken extends BaseToken {
  type: AST_TOKEN_TYPES.Punctuator;
  value: ValueOf<PunctuatorTokenToText>;
}
