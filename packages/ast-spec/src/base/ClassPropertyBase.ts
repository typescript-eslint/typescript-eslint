import type { Decorator } from '../special/Decorator/spec';
import type { TSTypeAnnotation } from '../special/TSTypeAnnotation/spec';
import type { Expression } from '../unions/Expression';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../unions/PropertyName';
import type { Accessibility } from './Accessibility';
import type { BaseNode } from './BaseNode';

interface ClassPropertyBase extends BaseNode {
  key: PropertyName;
  value: Expression | null;
  computed: boolean;
  static: boolean;
  declare: boolean;
  readonly?: boolean;
  decorators?: Decorator[];
  accessibility?: Accessibility;
  optional?: boolean;
  definite?: boolean;
  typeAnnotation?: TSTypeAnnotation;
}

export interface ClassPropertyComputedNameBase extends ClassPropertyBase {
  key: PropertyNameComputed;
  computed: true;
}

export interface ClassPropertyNonComputedNameBase extends ClassPropertyBase {
  key: PropertyNameNonComputed;
  computed: false;
}
