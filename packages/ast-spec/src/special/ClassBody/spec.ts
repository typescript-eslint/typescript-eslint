import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ClassElement } from '../../unions/ClassElement';

export interface ClassBody extends BaseNode {
  body: ClassElement[];
  type: AST_NODE_TYPES.ClassBody;
}
