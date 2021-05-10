import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { TSEmptyBodyFunctionExpression } from '../expression/TSEmptyBodyFunctionExpression/spec';
import type { Decorator } from '../special/Decorator/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../unions/PropertyName';
import type { Accessibility } from './Accessibility';
import type { BaseNode } from './BaseNode';

/** this should not be directly used - instead use MethodDefinitionComputedNameBase or MethodDefinitionNonComputedNameBase */
interface MethodDefinitionBase extends BaseNode {
  key: PropertyName;
  value: FunctionExpression | TSEmptyBodyFunctionExpression;
  computed: boolean;
  static: boolean;
  kind: 'constructor' | 'get' | 'method' | 'set';
  optional?: boolean;
  decorators?: Decorator[];
  accessibility?: Accessibility;
  typeParameters?: TSTypeParameterDeclaration;
}

export interface MethodDefinitionComputedNameBase extends MethodDefinitionBase {
  key: PropertyNameComputed;
  computed: true;
}

export interface MethodDefinitionNonComputedNameBase
  extends MethodDefinitionBase {
  key: PropertyNameNonComputed;
  computed: false;
}
