import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSExternalModuleReference } from '../../special/TSExternalModuleReference/spec';
import type { EntityName } from '../../unions/EntityName';
import type { ImportKind } from '../ExportAndImportKind';

export interface TSImportEqualsDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSImportEqualsDeclaration;
  /**
   * The locally imported name
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
  moduleReference: EntityName | TSExternalModuleReference;
  // TODO(#1852) - breaking change remove this as it is invalid
  importKind: ImportKind;
  /**
   * Whether this is immediately exported
   * ```
   * export import F = A;
   * ```
   */
  // TODO(#4130) - this should be represented in the AST
  isExport?: true;
}
