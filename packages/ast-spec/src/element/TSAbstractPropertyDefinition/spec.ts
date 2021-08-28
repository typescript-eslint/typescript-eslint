import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  PropertyDefinitionComputedNameBase,
  PropertyDefinitionNonComputedNameBase,
} from '../../base/PropertyDefinitionBase';

export interface TSAbstractPropertyDefinitionComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition;
  value: null;
}

export interface TSAbstractPropertyDefinitionNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition;
  value: null;
}

export type TSAbstractPropertyDefinition =
  | TSAbstractPropertyDefinitionComputedName
  | TSAbstractPropertyDefinitionNonComputedName;
