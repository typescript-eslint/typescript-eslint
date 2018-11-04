import { Node, Expression, MethodDefinition, Property, Class } from './spec';

/**
 * Decorator
 */
export interface Decorator extends Node {
  type: 'Decorator';
  expression: Expression;
}

/**
 * MethodDefinition
 */
export interface ExtendedMethodDefinition extends MethodDefinition {
  decorators: Decorator[];
}

/**
 * Property
 */
export interface ExtendedProperty extends Property {
  decorators: Decorator[];
}

/**
 * Class
 */
export interface ExtendedClass extends Class {
  decorators: Decorator[];
}
