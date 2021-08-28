import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  PropertyDefinitionComputedNameBase,
  PropertyDefinitionNonComputedNameBase,
} from '../../base/PropertyDefinitionBase';

export interface PropertyDefinitionComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}

export interface PropertyDefinitionNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}

export type PropertyDefinition =
  | PropertyDefinitionComputedName
  | PropertyDefinitionNonComputedName;
