import type { JSXIdentifier } from '../jsx/JSXIdentifier/spec';
import type { JSXMemberExpression } from '../jsx/JSXMemberExpression/spec';
import type { JSXNamespacedName } from '../jsx/JSXNamespacedName/spec';

export type JSXTagNameExpression =
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName;
