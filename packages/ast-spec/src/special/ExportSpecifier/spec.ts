import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

export interface ExportSpecifierBase extends BaseNode {
  exportKind: ExportKind;
  type: AST_NODE_TYPES.ExportSpecifier;
}

export interface ExportIdentifierSpecifier extends ExportSpecifierBase {
  exported: Identifier;
  local: Identifier;
}

export interface ExportStringLiteralSpecifier extends ExportSpecifierBase {
  exported: StringLiteral;
  local: StringLiteral;
}

export type ExportSpecifier =
  | ExportIdentifierSpecifier
  | ExportStringLiteralSpecifier;
