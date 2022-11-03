import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator, PrivateIdentifier } from '../../special/spec';
import type { Expression } from '../../unions/Expression';

export interface AccessorProperty extends BaseNode {
  type: AST_NODE_TYPES.AccessorProperty;
  key: Expression | PrivateIdentifier;
  value: Expression | null;
  computed: boolean;
  static: boolean;
  decorators: Decorator[];
}
