import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassMethodDefinitionNonComputedNameBase,
  MethodDefinitionComputedNameBase,
} from '../../base/MethodDefinitionBase';

export interface MethodDefinitionComputedName
  extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export interface MethodDefinitionNonComputedName
  extends ClassMethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export type MethodDefinition =
  | MethodDefinitionComputedName
  | MethodDefinitionNonComputedName;
