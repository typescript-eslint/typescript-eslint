import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ExportSpecifier } from '../../special/ExportSpecifier/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { NamedExportDeclarations } from '../../unions/ExportDeclaration';
import type { ExportKind } from '../ExportAndImportKind';

interface ExportNamedDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  /**
   * The assertions declared for the export.
   * ```
   * export { foo } from 'mod' assert { type: 'json' };
   * ```
   * This will be an empty array if `source` is `null`
   */
  assertions: ImportAttribute[];
  /**
   * The exported declaration.
   * ```
   * export const x = 1;
   * ```
   * This will be `null` if `source` is not `null`, or if there are `specifiers`
   */
  declaration: NamedExportDeclarations | null;
  /**
   * The kind of the export.
   */
  exportKind: ExportKind;
  /**
   * The source module being exported from.
   */
  source: StringLiteral | null;
  /**
   * The specifiers being exported.
   * ```
   * export { a, b };
   * ```
   * This will be an empty array if `declaration` is not `null`
   */
  specifiers: ExportSpecifier[];
}

export interface ExportNamedDeclarationWithoutSourceWithMultiple
  extends ExportNamedDeclarationBase {
  // this will always be empty array
  assertions: ImportAttribute[];
  declaration: NamedExportDeclarations;
  source: null;
  specifiers: ExportSpecifier[];
}

export interface ExportNamedDeclarationWithoutSourceWithSingle
  extends ExportNamedDeclarationBase {
  // this will always be empty array
  assertions: ImportAttribute[];
  declaration: null;
  source: null;
  // this will always be empty array
  specifiers: ExportSpecifier[];
}

export interface ExportNamedDeclarationWithSource
  extends ExportNamedDeclarationBase {
  assertions: ImportAttribute[];
  declaration: null;
  source: StringLiteral;
  specifiers: ExportSpecifier[];
}

export type ExportNamedDeclaration =
  | ExportNamedDeclarationWithoutSourceWithMultiple
  | ExportNamedDeclarationWithoutSourceWithSingle
  | ExportNamedDeclarationWithSource;
