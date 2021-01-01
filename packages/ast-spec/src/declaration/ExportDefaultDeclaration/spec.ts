import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportDeclaration } from '../../unions/ExportDeclaration';
import type { Expression } from '../../unions/Expression';

export interface ExportDefaultDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportDefaultDeclaration;
  declaration: ExportDeclaration | Expression;
  exportKind: 'type' | 'value';
}
