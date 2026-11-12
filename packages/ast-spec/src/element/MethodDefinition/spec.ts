import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassMethodDefinitionNonComputedNameBase,
  MethodDefinitionComputedNameBase,
  MethodDefinitionConstructorBase,
} from '../../base/MethodDefinitionBase';

export interface MethodDefinitionComputedName extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export interface MethodDefinitionNonComputedName extends ClassMethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export interface MethodDefinitionConstructor extends MethodDefinitionConstructorBase {
  type: AST_NODE_TYPES.MethodDefinition;
}

export type MethodDefinition =
  | MethodDefinitionComputedName
  | MethodDefinitionConstructor
  | MethodDefinitionNonComputedName;
