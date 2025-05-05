import type { Decorator } from '../special/Decorator/spec';
import type { TSTypeAnnotation } from '../special/TSTypeAnnotation/spec';
import type { Expression } from '../unions/Expression';
import type {
  ClassPropertyNameNonComputed,
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../unions/PropertyName';
import type { Accessibility } from './Accessibility';
import type { BaseNode } from './BaseNode';

interface PropertyDefinitionBase extends BaseNode {
  typeAnnotation: TSTypeAnnotation | undefined;
  accessibility: Accessibility | undefined;
  computed: boolean;
  declare: boolean;
  decorators: Decorator[];
  definite: boolean;
  key: PropertyName;
  optional: boolean;
  override: boolean;
  readonly: boolean;
  static: boolean;
  value: Expression | null;
}

export interface PropertyDefinitionComputedNameBase
  extends PropertyDefinitionBase {
  computed: true;
  key: PropertyNameComputed;
}

export interface PropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  computed: false;
  key: PropertyNameNonComputed;
}

export interface ClassPropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  computed: false;
  key: ClassPropertyNameNonComputed;
}
