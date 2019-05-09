/**
 * @fileoverview Really small utility functions that didn't deserve their own files
 */

import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

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

type InferOptionsTypeFromRuleNever<T> = T extends TSESLint.RuleModule<
  never,
  infer TOptions
>
  ? TOptions
  : unknown;
/**
 * Uses type inference to fetch the TOptions type from the given RuleModule
 */
export type InferOptionsTypeFromRule<T> = T extends TSESLint.RuleModule<
  any,
  infer TOptions
>
  ? TOptions
  : InferOptionsTypeFromRuleNever<T>;

/**
 * Uses type inference to fetch the TMessageIds type from the given RuleModule
 */
export type InferMessageIdsTypeFromRule<T> = T extends TSESLint.RuleModule<
  infer TMessageIds,
  any
>
  ? TMessageIds
  : unknown;

/**
 * Gets a string name representation of the given PropertyName node
 */
export function getNameFromPropertyName(
  propertyName: TSESTree.PropertyName,
): string {
  if (propertyName.type === AST_NODE_TYPES.Identifier) {
    return propertyName.name;
  }
  return `${propertyName.value}`;
}

/** Return true if both parameters are equal. */
export type Equal<T> = (a: T, b: T) => boolean;

export function arraysAreEqual<T>(
  a: T[] | undefined,
  b: T[] | undefined,
  eq: (a: T, b: T) => boolean,
): boolean {
  return (
    a === b ||
    (a !== undefined &&
      b !== undefined &&
      a.length === b.length &&
      a.every((x, idx) => eq(x, b[idx])))
  );
}

/**
 * Gets a string name representation of the name of the given MethodDefinition
 * or ClassProperty node, with handling for computed property names.
 */
export function getNameFromClassMember(
  methodDefinition: TSESTree.MethodDefinition | TSESTree.ClassProperty,
  sourceCode: TSESLint.SourceCode,
): string {
  if (keyCanBeReadAsPropertyName(methodDefinition.key)) {
    return getNameFromPropertyName(methodDefinition.key);
  }

  return sourceCode.text.slice(...methodDefinition.key.range);
}

/**
 * This covers both actual property names, as well as computed properties that are either
 * an identifier or a literal at the top level.
 */
function keyCanBeReadAsPropertyName(
  node: TSESTree.Expression,
): node is TSESTree.PropertyName {
  return (
    node.type === AST_NODE_TYPES.Literal ||
    node.type === AST_NODE_TYPES.Identifier
  );
}
