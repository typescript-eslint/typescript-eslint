import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportAllDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportAllDeclaration;
  /**
   * The assertions declared for the export.
   * ```
   * export * from 'mod' assert { type: 'json' };
   * ```
   */
  assertions: ImportAttribute[];
  /**
   * The name for the exported items. `null` if no name is assigned.
   */
  exported: Identifier | null;
  /**
   * The kind of the export.
   */
  // TODO(#1852) - breaking change remove this because it is a semantic error to have it
  exportKind: ExportKind;
  /**
   * The source module being exported from.
   */
  source: StringLiteral;
}
