import type { JSXEmptyExpression } from '../jsx/JSXEmptyExpression/spec';
import type { JSXExpressionContainer } from '../jsx/JSXExpressionContainer/spec';
import type { JSXSpreadChild } from '../jsx/JSXSpreadChild/spec';

export type JSXExpression =
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXSpreadChild;
