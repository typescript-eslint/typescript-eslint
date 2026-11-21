import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { Identifier } from '../expression/Identifier/spec';
import type { StringLiteral } from '../expression/literal/StringLiteral/spec';
import type { TSEmptyBodyFunctionExpression } from '../expression/TSEmptyBodyFunctionExpression/spec';
import type { Decorator } from '../special/Decorator/spec';
import type {
  ClassPropertyNameNonComputed,
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../unions/PropertyName';
import type { Accessibility } from './Accessibility';
import type { BaseNode } from './BaseNode';

/** this should not be directly used - instead use MethodDefinitionComputedNameBase or MethodDefinitionNonComputedNameBase */
interface MethodDefinitionBase extends BaseNode {
  accessibility: Accessibility | undefined;
  computed: boolean;
  decorators: Decorator[];
  key: PropertyName;
  kind: 'constructor' | 'get' | 'method' | 'set';
  optional: boolean;
  override: boolean;
  static: boolean;
  value: FunctionExpression | TSEmptyBodyFunctionExpression;
}

export interface MethodDefinitionComputedNameBase extends MethodDefinitionBase {
  computed: true;
  key: PropertyNameComputed;
  kind: 'get' | 'method' | 'set';
}

export interface MethodDefinitionNonComputedNameBase extends MethodDefinitionBase {
  computed: false;
  key: PropertyNameNonComputed;
  kind: 'get' | 'method' | 'set';
}

export interface ClassMethodDefinitionNonComputedNameBase extends MethodDefinitionBase {
  computed: false;
  key: ClassPropertyNameNonComputed;
  kind: 'get' | 'method' | 'set';
}

export interface MethodDefinitionConstructorBase extends MethodDefinitionBase {
  computed: false;
  key: Identifier | StringLiteral;
  kind: 'constructor';
  static: false;
}
