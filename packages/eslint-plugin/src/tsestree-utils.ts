/**
 * @fileoverview Utilities for working with union types exported by the TSESTree types
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';

export function getNameFromPropertyName(
  propertyName: TSESTree.PropertyName
): string {
  if (propertyName.type === 'Identifier') {
    return propertyName.name;
  }
  return propertyName.value;
}
