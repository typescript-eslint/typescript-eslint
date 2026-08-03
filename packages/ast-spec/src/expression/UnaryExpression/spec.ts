import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

interface UnaryExpressionBase extends BaseNode {
  type: AST_NODE_TYPES.UnaryExpression;
  argument: Expression;
  operator: string;
  /**
   * @deprecated The `prefix` property is always `true` and is only present for historical reasons.
   * See https://github.com/estree/estree/pull/118.
   */
  prefix: true;
}

interface UnaryExpressionSpecific<
  T extends string,
> extends UnaryExpressionBase {
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
