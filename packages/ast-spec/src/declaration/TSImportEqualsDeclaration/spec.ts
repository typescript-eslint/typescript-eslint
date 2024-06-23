import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSExternalModuleReference } from '../../special/TSExternalModuleReference/spec';
import type { TSQualifiedName } from '../../type/TSQualifiedName/spec';
import type { ImportKind } from '../ExportAndImportKind';

interface TSImportEqualsDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.TSImportEqualsDeclaration;
  /**
   * The locally imported name.
   */
  id: Identifier;
  /**
   * The value being aliased.
   * ```
   * import F1 = A;
   * import F2 = A.B.C;
   * import F3 = require('mod');
   * ```
   */
  moduleReference: Identifier | TSExternalModuleReference | TSQualifiedName;
  /**
   * The kind of the import. Always `'value'` unless `moduleReference` is a
   * `TSExternalModuleReference`.
   */
  importKind: ImportKind;
}

export interface TSImportEqualsNamespaceDeclaration
  extends TSImportEqualsDeclarationBase {
  /**
   * The value being aliased.
   * ```
   * import F1 = A;
   * import F2 = A.B.C;
   * ```
   */
  moduleReference: Identifier | TSQualifiedName;
  /**
   * The kind of the import.
   */
  importKind: 'value';
}

export interface TSImportEqualsRequireDeclaration
  extends TSImportEqualsDeclarationBase {
  /**
   * The value being aliased.
   * ```
   * import F3 = require('mod');
   * ```
   */
  moduleReference: TSExternalModuleReference;
  /**
   * The kind of the import.
   */
  importKind: ImportKind;
}

export type TSImportEqualsDeclaration =
  | TSImportEqualsNamespaceDeclaration
  | TSImportEqualsRequireDeclaration;
