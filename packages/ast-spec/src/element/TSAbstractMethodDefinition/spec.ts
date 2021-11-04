import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  MethodDefinitionComputedNameBase,
  MethodDefinitionNonComputedNameBase,
} from '../../base/MethodDefinitionBase';

export interface TSAbstractMethodDefinitionComputedName
  extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}

export interface TSAbstractMethodDefinitionNonComputedName
  // this does not extend ClassMethodDefinitionNonComputedNameBase because abstract private names are not allowed
  extends MethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}

export type TSAbstractMethodDefinition =
  | TSAbstractMethodDefinitionComputedName
  | TSAbstractMethodDefinitionNonComputedName;
