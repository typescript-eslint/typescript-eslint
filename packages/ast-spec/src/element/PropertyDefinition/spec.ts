import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassPropertyDefinitionNonComputedNameBase,
  PropertyDefinitionComputedNameBase,
} from '../../base/PropertyDefinitionBase';

export interface PropertyDefinitionComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}

export interface PropertyDefinitionNonComputedName
  extends ClassPropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}

export type PropertyDefinition =
  | PropertyDefinitionComputedName
  | PropertyDefinitionNonComputedName;
