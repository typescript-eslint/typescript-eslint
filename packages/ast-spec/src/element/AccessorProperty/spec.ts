import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  PropertyDefinitionComputedNameBase,
  PropertyDefinitionNonComputedNameBase,
} from '../../base/PropertyDefinitionBase';
import type { ClassBody } from '../../special/ClassBody/spec';

export interface AccessorPropertyComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
  parent: ClassBody;
}

export interface AccessorPropertyNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
  parent: ClassBody;
}

export type AccessorProperty =
  | AccessorPropertyComputedName
  | AccessorPropertyNonComputedName;
