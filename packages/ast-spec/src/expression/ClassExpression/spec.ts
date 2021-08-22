import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassDeclarationBase } from '../../base/ClassDeclarationBase';

export interface ClassExpression extends ClassDeclarationBase {
  type: AST_NODE_TYPES.ClassExpression;
}
