/**
 * Based on https://github.com/estree/estree/blob/master/extensions/type-annotations.md
 */

import {
  Identifier,
  Function,
  ObjectPattern,
  ArrayPattern,
  RestElement
} from './spec';

/**
 * Type Annotations
 */

/**
 * Any type annotation.
 */
export interface TypeAnnotation extends Node {}

/**
 * Identifier
 *
 * The `typeAnnotation` property is used only in the case of variable declarations with type annotations or function arguments with type annotations.
 */
export interface ExtendedIdentifier extends Identifier {
  typeAnnotation: TypeAnnotation | null;
}

/**
 * Functions
 *
 * The `returnType` property is used to specify the type annotation for the return value of the function.
 */
export interface ExtendedFunction extends Function {
  returnType: TypeAnnotation | null;
}

/**
 * Patterns
 */

/**
 * ObjectPattern
 */
export interface ExtendedObjectPattern extends ObjectPattern {
  typeAnnotation: TypeAnnotation | null;
}

/**
 * ArrayPattern
 */
export interface ExtendedArrayPattern extends ArrayPattern {
  typeAnnotation: TypeAnnotation | null;
}

/**
 * RestElement
 */
export interface ExtendedRestElement extends RestElement {
  typeAnnotation: TypeAnnotation | null;
}
