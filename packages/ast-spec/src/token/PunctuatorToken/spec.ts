import type { AST_TOKEN_TYPES } from '../../ast-token-types';
import type { BaseToken } from '../../base/BaseToken';
import type { PunctuatorTokenToText } from './PunctuatorTokenToText';

export * from './PunctuatorTokenToText';

type ValueOf<T> = T[keyof T];

export interface PunctuatorToken extends BaseToken {
  type: AST_TOKEN_TYPES.Punctuator;
  value: ValueOf<PunctuatorTokenToText>;
}
