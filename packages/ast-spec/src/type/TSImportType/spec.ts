import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { EntityName } from '../../unions/EntityName';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSImportType extends BaseNode {
  type: AST_NODE_TYPES.TSImportType;
  /** @deprecated Use {@link `source`} instead. */
  argument: TypeNode;
  options: ImportAttribute[];
  qualifier: EntityName | null;
  source: StringLiteral;
  typeArguments: TSTypeParameterInstantiation | null;
}
