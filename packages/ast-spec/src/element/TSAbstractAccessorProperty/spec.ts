import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  PropertyDefinitionComputedNameBase,
  PropertyDefinitionNonComputedNameBase,
} from '../../base/PropertyDefinitionBase';

export interface TSAbstractAccessorPropertyComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty;
  value: null;
}

export interface TSAbstractAccessorPropertyNonComputedName
  // this does not extend ClassPropertyDefinitionNonComputedNameBase because abstract private names are not allowed
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty;
  value: null;
}

export type TSAbstractAccessorProperty =
  | TSAbstractAccessorPropertyComputedName
  | TSAbstractAccessorPropertyNonComputedName;
