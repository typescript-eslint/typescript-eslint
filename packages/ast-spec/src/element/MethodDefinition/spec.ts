import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  MethodDefinitionComputedNameBase,
  MethodDefinitionNonComputedNameBase,
} from '../../base/MethodDefinitionBase';

export interface MethodDefinitionComputedName
  extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export interface MethodDefinitionNonComputedName
  extends MethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export type MethodDefinition =
  | MethodDefinitionComputedName
  | MethodDefinitionNonComputedName;
