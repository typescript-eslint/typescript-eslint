import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ImportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';

export interface ImportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportSpecifier;
  local: Identifier;
  imported: Identifier;
  importKind: ImportKind;
}
