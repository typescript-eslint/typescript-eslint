import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

export interface ExportSpecifierBase extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  exportKind: ExportKind;
  local: Identifier;
}

export interface ExportIdentifierSpecifier extends ExportSpecifierBase {
  exported: Identifier;
}

export interface ExportSourceSpecifier extends ExportSpecifierBase {
  exported: Identifier | StringLiteral;
}

export type ExportSpecifier = ExportIdentifierSpecifier | ExportSourceSpecifier;
