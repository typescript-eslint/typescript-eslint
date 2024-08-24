import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { JSXTagNameExpression } from '../../unions/JSXTagNameExpression';
import type { JSXIdentifier } from '../JSXIdentifier/spec';

export interface JSXMemberExpression extends BaseNode {
  object: JSXTagNameExpression;
  property: JSXIdentifier;
  type: AST_NODE_TYPES.JSXMemberExpression;
}
