import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type {
  ExportSpecifier,
  ExportSpecifierWithIdentifierLocal,
} from '../../special/ExportSpecifier/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { NamedExportDeclarations } from '../../unions/ExportDeclaration';
import type { ExportKind } from '../ExportAndImportKind';

interface ExportNamedDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' assert \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' with \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   */
  attributes: ImportAttribute[];
  /**
   * The exported declaration.
   * @example
   * ```ts
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
   * @example
   * ```ts
   * export { a, b };
   * ```
   * This will be an empty array if `declaration` is not `null`
   */
  specifiers: ExportSpecifier[];
}

/**
 * Exporting names from the current module.
 * ```
 * export {};
 * export { a, b };
 * ```
 */
export interface ExportNamedDeclarationWithoutSourceWithMultiple extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[];
  declaration: null;
  source: null;
  // Cannot have literal local without a source
  specifiers: ExportSpecifierWithIdentifierLocal[];
}

/**
 * Exporting a single named declaration.
 * ```
 * export const x = 1;
 * ```
 */
export interface ExportNamedDeclarationWithoutSourceWithSingle extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[];
  declaration: NamedExportDeclarations;
  source: null;
  /**
   * This will always be an empty array.
   */
  specifiers: ExportSpecifierWithIdentifierLocal[];
}

/**
 * Export names from another module.
 * ```
 * export { a, b } from 'mod';
 * ```
 */
export interface ExportNamedDeclarationWithSource extends ExportNamedDeclarationBase {
  declaration: null;
  source: StringLiteral;
}

export type ExportNamedDeclarationWithoutSource =
  | ExportNamedDeclarationWithoutSourceWithMultiple
  | ExportNamedDeclarationWithoutSourceWithSingle;

export type ExportNamedDeclaration =
  | ExportNamedDeclarationWithoutSourceWithMultiple
  | ExportNamedDeclarationWithoutSourceWithSingle
  | ExportNamedDeclarationWithSource;
