import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEmptyBodyFunctionExpression } from '../../expression/TSEmptyBodyFunctionExpression/spec';
import type { AssignmentPattern } from '../../parameter/AssignmentPattern/spec';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface PropertyBase extends BaseNode {
  type: AST_NODE_TYPES.Property;
  computed: boolean;
  key: PropertyName;
  kind: 'get' | 'init' | 'set';
  method: boolean;
  optional: boolean;
  shorthand: boolean;
  value:
    | AssignmentPattern
    | BindingName
    | Expression
    | TSEmptyBodyFunctionExpression;
}

export interface PropertyComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
}
export interface PropertyNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
}

export type Property = PropertyComputedName | PropertyNonComputedName;
