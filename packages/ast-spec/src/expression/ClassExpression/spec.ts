import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassBase } from '../../base/ClassBase';

export interface ClassExpression extends ClassBase {
  abstract: false;
  declare: false;
  type: AST_NODE_TYPES.ClassExpression;
}
