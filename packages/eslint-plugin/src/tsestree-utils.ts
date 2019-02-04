/**
 * @fileoverview Utilities for working with union types exported by the TSESTree types
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';

export function getNameFromPropertyName(
  propertyName: TSESTree.PropertyName
): string {
  if (propertyName.type === AST_NODE_TYPES.Identifier) {
    return propertyName.name;
  }
  return `${propertyName.value}`;
}

export type InferOptionsTypeFromRule<T> = T extends RuleModule<
  any,
  infer TOptions
>
  ? TOptions
  : unknown;

export type InferMessageIdsTypeFromRule<T> = T extends RuleModule<
  infer TMessageIds,
  any
>
  ? TMessageIds
  : unknown;
