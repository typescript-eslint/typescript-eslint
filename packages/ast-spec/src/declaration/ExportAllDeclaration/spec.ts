import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Expression } from '../../unions/Expression';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportAllDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportAllDeclaration;
  source: Expression | null;
  exportKind: ExportKind;
  exported: Identifier | null;
}
