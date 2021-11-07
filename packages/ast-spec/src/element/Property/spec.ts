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
  key: PropertyName;
  value:
    | AssignmentPattern
    | BindingName
    | Expression
    | TSEmptyBodyFunctionExpression;
  computed: boolean;
  method: boolean;
  shorthand: boolean;
  optional?: boolean;
  kind: 'get' | 'init' | 'set';
}

export interface PropertyComputedName extends PropertyBase {
  key: PropertyNameComputed;
  computed: true;
}
export interface PropertyNonComputedName extends PropertyBase {
  key: PropertyNameNonComputed;
  computed: false;
}

export type Property = PropertyComputedName | PropertyNonComputedName;
