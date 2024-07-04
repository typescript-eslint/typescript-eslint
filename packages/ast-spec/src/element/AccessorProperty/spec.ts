import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  PropertyDefinitionComputedNameBase,
  PropertyDefinitionNonComputedNameBase,
} from '../../base/PropertyDefinitionBase';

export interface AccessorPropertyComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
}

export interface AccessorPropertyNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
}

export type AccessorProperty =
  | AccessorPropertyComputedName
  | AccessorPropertyNonComputedName;
