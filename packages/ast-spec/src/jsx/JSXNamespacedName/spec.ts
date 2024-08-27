import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { JSXIdentifier } from '../JSXIdentifier/spec';

export interface JSXNamespacedName extends BaseNode {
  name: JSXIdentifier;
  namespace: JSXIdentifier;
  type: AST_NODE_TYPES.JSXNamespacedName;
}
