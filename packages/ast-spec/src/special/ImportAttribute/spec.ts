import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { Literal } from '../../unions/Literal';

export interface ImportAttribute extends BaseNode {
  type: AST_NODE_TYPES.ImportAttribute;
  key: Identifier | StringLiteral;
  value: Literal;
}
