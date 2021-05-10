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
  extends MethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}

export type TSAbstractMethodDefinition =
  | TSAbstractMethodDefinitionComputedName
  | TSAbstractMethodDefinitionNonComputedName;
