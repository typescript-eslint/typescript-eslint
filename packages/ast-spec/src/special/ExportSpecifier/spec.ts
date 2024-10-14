import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

export interface ExportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  exported: StringLiteral | Identifier;
  exportKind: ExportKind;
  local: Identifier;
}
