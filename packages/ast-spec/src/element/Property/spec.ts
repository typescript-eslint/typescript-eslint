import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { FunctionExpression } from '../../expression/FunctionExpression/spec';
import type { Identifier } from '../../expression/Identifier/spec';
import type { AssignmentPattern } from '../../parameter/AssignmentPattern/spec';
import type { RestElement } from '../../parameter/RestElement/spec';
import type { DestructuringPattern } from '../../unions/DestructuringPattern';
import type { Expression } from '../../unions/Expression';
import type {
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface PropertyBase extends BaseNode {
  type: AST_NODE_TYPES.Property;
  optional: false;
}

// Object literal properties

/** `{ a: 1 }` */
export interface ObjectExpressionPropertyNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
  kind: 'init';
  method: false;
  shorthand: false;
  value: Expression;
}

/** `{ [a]: 1 }` */
export interface ObjectExpressionPropertyComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
  kind: 'init';
  method: false;
  shorthand: false;
  value: Expression;
}

/** `{ a }` */
export interface ObjectExpressionPropertyShorthand extends PropertyBase {
  computed: false;
  key: Identifier;
  kind: 'init';
  method: false;
  shorthand: true;
  value: Identifier;
}

/** `{ a() {} }` */
export interface ObjectExpressionMethodNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
  kind: 'init';
  method: true;
  shorthand: false;
  value: FunctionExpression;
}

/** `{ [a]() {} }` */
export interface ObjectExpressionMethodComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
  kind: 'init';
  method: true;
  shorthand: false;
  value: FunctionExpression;
}

/** `{ get a() {} }`, `{ set a(v) {} }` */
export interface ObjectExpressionAccessorNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
  kind: 'get' | 'set';
  method: false;
  shorthand: false;
  value: FunctionExpression;
}

/** `{ get [a]() {} }`, `{ set [a](v) {} }` */
export interface ObjectExpressionAccessorComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
  kind: 'get' | 'set';
  method: false;
  shorthand: false;
  value: FunctionExpression;
}

export type ObjectExpressionProperty =
  | ObjectExpressionAccessorComputedName
  | ObjectExpressionAccessorNonComputedName
  | ObjectExpressionMethodComputedName
  | ObjectExpressionMethodNonComputedName
  | ObjectExpressionPropertyComputedName
  | ObjectExpressionPropertyNonComputedName
  | ObjectExpressionPropertyShorthand;

// Object pattern properties

/** `({ a: b } = x)` */
export interface ObjectPatternPropertyNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
  kind: 'init';
  method: false;
  shorthand: false;
  value: Exclude<DestructuringPattern, RestElement>;
}

/** `({ [a]: b } = x)` */
export interface ObjectPatternPropertyComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
  kind: 'init';
  method: false;
  shorthand: false;
  value: Exclude<DestructuringPattern, RestElement>;
}

/** `({ a } = x)`, `({ a = 1 } = x)` */
export interface ObjectPatternPropertyShorthand extends PropertyBase {
  computed: false;
  key: Identifier;
  kind: 'init';
  method: false;
  shorthand: true;
  value: AssignmentPattern | Identifier;
}

export type ObjectPatternProperty =
  | ObjectPatternPropertyComputedName
  | ObjectPatternPropertyNonComputedName
  | ObjectPatternPropertyShorthand;

export type PropertyComputedName =
  | ObjectExpressionAccessorComputedName
  | ObjectExpressionMethodComputedName
  | ObjectExpressionPropertyComputedName
  | ObjectPatternPropertyComputedName;

export type PropertyNonComputedName =
  | ObjectExpressionAccessorNonComputedName
  | ObjectExpressionMethodNonComputedName
  | ObjectExpressionPropertyNonComputedName
  | ObjectExpressionPropertyShorthand
  | ObjectPatternPropertyNonComputedName
  | ObjectPatternPropertyShorthand;

export type Property = ObjectExpressionProperty | ObjectPatternProperty;
