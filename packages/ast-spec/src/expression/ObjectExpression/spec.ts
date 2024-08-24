import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ObjectLiteralElement } from '../../unions/ObjectLiteralElement';

export interface ObjectExpression extends BaseNode {
  properties: ObjectLiteralElement[];
  type: AST_NODE_TYPES.ObjectExpression;
}
