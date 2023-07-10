import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassBase } from '../../base/ClassBase';

export interface ClassExpression extends ClassBase {
  type: AST_NODE_TYPES.ClassExpression;
  abstract: false;
  declare: false;
  decorators: [];
}
