import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { UnaryExpression } from '../../expression/UnaryExpression/spec';
import type { UpdateExpression } from '../../expression/UpdateExpression/spec';
import type { LiteralExpression } from '../../unions/LiteralExpression';

export interface TSLiteralType extends BaseNode {
  type: AST_NODE_TYPES.TSLiteralType;
  literal: LiteralExpression | UnaryExpression | UpdateExpression;
}
