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
  key: PropertyName;
  value: Expression | null;
  computed: boolean;
  static: boolean;
  declare: boolean;
  readonly: boolean;
  decorators: Decorator[];
  accessibility: Accessibility | undefined;
  optional: boolean;
  definite: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
  override: boolean;
}

export interface PropertyDefinitionComputedNameBase
  extends PropertyDefinitionBase {
  key: PropertyNameComputed;
  computed: true;
}

export interface PropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  key: PropertyNameNonComputed;
  computed: false;
}

export interface ClassPropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  key: ClassPropertyNameNonComputed;
  computed: false;
}
