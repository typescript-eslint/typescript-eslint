import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Literal } from '../../unions/Literal';

export interface ImportAttribute extends BaseNode {
  key: Identifier | Literal;
  type: AST_NODE_TYPES.ImportAttribute;
  value: Literal;
}
