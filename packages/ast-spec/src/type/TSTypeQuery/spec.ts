import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/spec';
import type { EntityName } from '../../unions/EntityName';
import type { TSImportType } from '../TSImportType/spec';

export interface TSTypeQuery extends BaseNode {
  exprName: EntityName | TSImportType;
  type: AST_NODE_TYPES.TSTypeQuery;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
