import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassDeclarationBase } from '../../base/ClassDeclarationBase';

export interface ClassDeclaration extends ClassDeclarationBase {
  type: AST_NODE_TYPES.ClassDeclaration;
}
