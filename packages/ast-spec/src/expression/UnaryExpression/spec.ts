import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { UnaryExpressionBase } from '../../base/UnaryExpressionBase';

interface UnaryExpressionSpecific<
  T extends string,
> extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UnaryExpression;
  operator: T;
}

export type UnaryExpressionNot = UnaryExpressionSpecific<'!'>;

export type UnaryExpressionPlus = UnaryExpressionSpecific<'+'>;

export type UnaryExpressionMinus = UnaryExpressionSpecific<'-'>;

export type UnaryExpressionDelete = UnaryExpressionSpecific<'delete'>;

export type UnaryExpressionTypeof = UnaryExpressionSpecific<'typeof'>;

export type UnaryExpressionVoid = UnaryExpressionSpecific<'void'>;

export type UnaryExpressionBitwiseNot = UnaryExpressionSpecific<'~'>;

export type UnaryExpression =
  | UnaryExpressionBitwiseNot
  | UnaryExpressionDelete
  | UnaryExpressionMinus
  | UnaryExpressionNot
  | UnaryExpressionPlus
  | UnaryExpressionTypeof
  | UnaryExpressionVoid;
