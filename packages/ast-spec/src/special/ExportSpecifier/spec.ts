import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

interface ExportSpecifierBase extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  exported: Identifier | StringLiteral;
  exportKind: ExportKind;
  local: Identifier | StringLiteral;
}

export interface ExportSpecifierWithIdentifierLocal
  extends ExportSpecifierBase {
  local: Identifier;
}

export interface ExportSpecifierWithStringOrLiteralLocal
  extends ExportSpecifierBase {
  local: Identifier | StringLiteral;
}

export type ExportSpecifier =
  | ExportSpecifierWithIdentifierLocal
  | ExportSpecifierWithStringOrLiteralLocal;
