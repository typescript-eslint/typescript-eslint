import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/spec';
import type { EntityName } from '../../unions/EntityName';
import type { TSImportType } from '../TSImportType/spec';

export interface TSTypeQuery extends BaseNode {
  type: AST_NODE_TYPES.TSTypeQuery;
  exprName: EntityName | TSImportType;
  typeArguments?: TSTypeParameterInstantiation;

  /** @deprecated Use {@link `typeArguments`} instead. */
  typeParameters?: TSTypeParameterInstantiation;
}
