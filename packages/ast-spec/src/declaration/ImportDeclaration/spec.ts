import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { ImportClause } from '../../unions/ImportClause';
import type { ImportKind } from '../ExportAndImportKind';

export interface ImportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ImportDeclaration;
  source: StringLiteral;
  specifiers: ImportClause[];
  importKind: ImportKind;
  assertions: ImportAttribute[];
}
