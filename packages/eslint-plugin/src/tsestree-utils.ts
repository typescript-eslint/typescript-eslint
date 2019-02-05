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

type InferOptionsTypeFromRuleNever<T> = T extends RuleModule<
  never,
  infer TOptions
>
  ? TOptions
  : unknown;
export type InferOptionsTypeFromRule<T> = T extends RuleModule<
  any,
  infer TOptions
>
  ? TOptions
  : InferOptionsTypeFromRuleNever<T>;

export type InferMessageIdsTypeFromRule<T> = T extends RuleModule<
  infer TMessageIds,
  any
>
  ? TMessageIds
  : unknown;
