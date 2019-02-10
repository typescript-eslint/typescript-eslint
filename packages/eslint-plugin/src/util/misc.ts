/**
 * @fileoverview Really small utility functions that didn't deserve their own files
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';

/**
 * Check if the context file name is *.ts or *.tsx
 */
export function isTypeScriptFile(fileName: string) {
  return /\.tsx?$/i.test(fileName || '');
}

/**
 * Check if the context file name is *.d.ts or *.d.tsx
 */
export function isDefinitionFile(fileName: string) {
  return /\.d\.tsx?$/i.test(fileName || '');
}

/**
 * Upper cases the first character or the string
 */
export function upperCaseFirst(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

type InferOptionsTypeFromRuleNever<T> = T extends RuleModule<
  never,
  infer TOptions
>
  ? TOptions
  : unknown;
/**
 * Uses type inference to fetch the TOptions type from the given RuleModule
 */
export type InferOptionsTypeFromRule<T> = T extends RuleModule<
  any,
  infer TOptions
>
  ? TOptions
  : InferOptionsTypeFromRuleNever<T>;

/**
 * Uses type inference to fetch the TMessageIds type from the given RuleModule
 */
export type InferMessageIdsTypeFromRule<T> = T extends RuleModule<
  infer TMessageIds,
  any
>
  ? TMessageIds
  : unknown;

/**
 * Gets a string name representation of the given PropertyName node
 */
export function getNameFromPropertyName(
  propertyName: TSESTree.PropertyName
): string {
  if (propertyName.type === AST_NODE_TYPES.Identifier) {
    return propertyName.name;
  }
  return `${propertyName.value}`;
}
