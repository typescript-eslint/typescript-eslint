import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { DefaultExportDeclarations } from '../../unions/ExportDeclaration';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportDefaultDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportDefaultDeclaration;
  /**
   * The declaration being exported.
   */
  declaration: DefaultExportDeclarations;
  /**
   * The kind of the export.
   */
  exportKind: ExportKind;
}
