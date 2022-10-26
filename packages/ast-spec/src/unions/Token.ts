import type { BooleanToken } from '../token/BooleanToken/spec';
import type { IdentifierToken } from '../token/IdentifierToken/spec';
import type { JSXIdentifierToken } from '../token/JSXIdentifierToken/spec';
import type { JSXTextToken } from '../token/JSXTextToken/spec';
import type { KeywordToken } from '../token/KeywordToken/spec';
import type { NullToken } from '../token/NullToken/spec';
import type { NumericToken } from '../token/NumericToken/spec';
import type { PunctuatorToken } from '../token/PunctuatorToken/spec';
import type { RegularExpressionToken } from '../token/RegularExpressionToken/spec';
import type { StringToken } from '../token/StringToken/spec';
import type { TemplateToken } from '../token/TemplateToken/spec';
import type { Comment } from './Comment';

export type Token =
  | BooleanToken
  | Comment
  | IdentifierToken
  | JSXIdentifierToken
  | JSXTextToken
  | KeywordToken
  | NullToken
  | NumericToken
  | PunctuatorToken
  | RegularExpressionToken
  | StringToken
  | TemplateToken;
