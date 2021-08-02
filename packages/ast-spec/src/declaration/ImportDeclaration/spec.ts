import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ImportClause } from '../../unions/ImportClause';
import type { Literal } from '../../unions/Literal';
import type { ImportKind } from '../ExportAndImportKind';

export interface ImportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ImportDeclaration;
  source: Literal;
  specifiers: ImportClause[];
  importKind: ImportKind;
}
