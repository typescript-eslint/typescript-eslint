import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../Identifier/spec';

export interface MetaProperty extends BaseNode {
  meta: Identifier;
  property: Identifier;
  type: AST_NODE_TYPES.MetaProperty;
}
