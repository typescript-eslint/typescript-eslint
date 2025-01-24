import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ImportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

export interface ImportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportSpecifier;
  imported: Identifier | StringLiteral;
  importKind: ImportKind;
  local: Identifier;
}
