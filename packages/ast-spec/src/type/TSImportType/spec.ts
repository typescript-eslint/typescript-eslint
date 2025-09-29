import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ObjectExpression } from '../../expression/ObjectExpression/spec';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { EntityName } from '../../unions/EntityName';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSImportType extends BaseNode {
  type: AST_NODE_TYPES.TSImportType;
  argument: TypeNode;
  options: ObjectExpression | null;
  qualifier: EntityName | null;
  typeArguments: TSTypeParameterInstantiation | null;
}
